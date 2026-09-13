import Flatbush from "flatbush";
import * as L from "leaflet";
import { IconCache } from "./IconCache";
import { NATIVE_ZOOM, type Px } from "./pixelCrs";

export interface LayerMarker {
  id: number;
  x: number;
  y: number;
  icon: string;
  name: string;
}

export interface CanvasMarkerLayerOptions extends L.LayerOptions {
  iconBaseUrl: string;
  onMarkerClick?: (id: number) => void;
  onMarkerHover?: (id: number | null) => void;
  onMapClick?: (p: Px) => void;
}

const MAX_ICON_PX = 32;
const MIN_ICON_PX = 12;
// Below this zoom, at most one marker is drawn per screen cell to keep dense areas readable.
const THIN_BELOW_ZOOM = 4;
const THIN_CELL_PX = 12;

interface DrawState {
  originX: number;
  originY: number;
  scale: number;
  iconPx: number;
}

// One viewport-sized canvas (plus an overlay for hover) redrawn from a spatial
// index on every move; zoom animations are handled by CSS-transforming the
// container, the same way Leaflet's own canvas renderer does it.
export class CanvasMarkerLayer extends L.Layer {
  declare options: CanvasMarkerLayerOptions;

  private container!: HTMLDivElement;
  private base!: HTMLCanvasElement;
  private overlay!: HTMLCanvasElement;
  private markers: LayerMarker[] = [];
  private index: Flatbush | null = null;
  private visible: ReadonlySet<number> | null = null;
  private done: ReadonlySet<number> = new Set();
  private selectedId: number | null = null;
  private hoverIndex = -1;
  private frame = 0;
  private zooming = false;
  private placing = false;
  private center: L.LatLng | null = null;
  private zoom = 0;
  private drawState: DrawState | null = null;
  private readonly icons: IconCache;

  constructor(options: CanvasMarkerLayerOptions) {
    super(options);
    L.Util.setOptions(this, options);
    this.icons = new IconCache(options.iconBaseUrl, () => this.scheduleDraw());
  }

  onAdd(map: L.Map): this {
    this.container = L.DomUtil.create(
      "div",
      "leaflet-layer leaflet-zoom-animated",
    );
    this.container.style.pointerEvents = "none";
    this.base = this.createCanvas();
    this.overlay = this.createCanvas();
    map.getPanes().overlayPane.appendChild(this.container);
    this.resize();
    this.update();
    return this;
  }

  onRemove(): this {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.container.remove();
    return this;
  }

  getEvents(): { [name: string]: L.LeafletEventHandlerFn } {
    return {
      move: this.onMove,
      moveend: this.scheduleDraw,
      viewreset: this.scheduleDraw,
      resize: this.onResize,
      zoomstart: this.onZoomStart,
      zoomanim: this.onZoomAnim as L.LeafletEventHandlerFn,
      zoomend: this.onZoomEnd,
      mousemove: this.onMouseMove as L.LeafletEventHandlerFn,
      mouseout: this.onMouseOut,
      click: this.onClick as L.LeafletEventHandlerFn,
    };
  }

  setMarkers(markers: LayerMarker[]) {
    this.markers = markers;
    this.hoverIndex = -1;
    this.index = null;
    if (markers.length > 0) {
      const index = new Flatbush(markers.length);
      for (const m of markers) index.add(m.x, m.y, m.x, m.y);
      index.finish();
      this.index = index;
    }
    this.scheduleDraw();
  }

  setVisible(ids: ReadonlySet<number> | null) {
    this.visible = ids;
    this.scheduleDraw();
  }

  setDone(ids: ReadonlySet<number>) {
    this.done = ids;
    this.scheduleDraw();
  }

  setSelected(id: number | null) {
    this.selectedId = id;
    this.scheduleDraw();
  }

  setPlacing(placing: boolean) {
    this.placing = placing;
    this.setHover(-1);
    if (this._map)
      this._map.getContainer().style.cursor = placing ? "crosshair" : "";
  }

  private createCanvas(): HTMLCanvasElement {
    const canvas = L.DomUtil.create("canvas", "", this.container);
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    return canvas;
  }

  private resize() {
    const size = this._map.getSize();
    const dpr = window.devicePixelRatio || 1;
    for (const canvas of [this.base, this.overlay]) {
      canvas.width = Math.round(size.x * dpr);
      canvas.height = Math.round(size.y * dpr);
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
    }
  }

  private scheduleDraw() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  }

  private onMove() {
    if (!this.zooming) this.scheduleDraw();
  }

  private onResize() {
    this.resize();
    this.scheduleDraw();
  }

  private onZoomStart() {
    this.zooming = true;
  }

  private onZoomEnd() {
    this.zooming = false;
    this.update();
  }

  // Ported from L.Renderer._updateTransform (padding 0).
  private onZoomAnim(event: L.ZoomAnimEvent) {
    if (!this.center) return;
    const map = this._map as L.Map & {
      _getNewPixelOrigin(center: L.LatLng, zoom: number): L.Point;
    };
    const scale = map.getZoomScale(event.zoom, this.zoom);
    const viewHalf = map.getSize().multiplyBy(0.5);
    const currentCenterPoint = map.project(this.center, event.zoom);
    const topLeftOffset = viewHalf
      .multiplyBy(-scale)
      .add(currentCenterPoint)
      .subtract(map._getNewPixelOrigin(event.center, event.zoom));
    L.DomUtil.setTransform(this.container, topLeftOffset, scale);
  }

  // Anchors the container to the current viewport and redraws everything.
  private update() {
    if (!this._map || this.zooming) return;
    const map = this._map;
    L.DomUtil.setTransform(
      this.container,
      map.containerPointToLayerPoint([0, 0]),
      1,
    );
    this.center = map.getCenter();
    this.zoom = map.getZoom();
    this.draw();
  }

  private draw() {
    const map = this._map;
    const ctx = this.base.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = map.getSize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.x, size.y);

    const zoom = map.getZoom();
    const scale = Math.pow(2, zoom - NATIVE_ZOOM);
    const iconPx = Math.min(
      MAX_ICON_PX,
      Math.max(MIN_ICON_PX, MAX_ICON_PX * scale),
    );
    const origin = map.containerPointToLatLng([0, 0]);
    this.drawState = {
      originX: origin.lng,
      originY: origin.lat,
      scale,
      iconPx,
    };

    if (this.index) {
      const pad = iconPx / scale;
      const hits = this.index.search(
        origin.lng - pad,
        origin.lat - pad,
        origin.lng + size.x / scale + pad,
        origin.lat + size.y / scale + pad,
      );
      const occupied = zoom < THIN_BELOW_ZOOM ? new Set<number>() : null;
      for (const i of hits) {
        const m = this.markers[i];
        if (this.visible && !this.visible.has(m.id)) continue;
        const cx = (m.x - origin.lng) * scale;
        const cy = (m.y - origin.lat) * scale;
        if (occupied && m.id !== this.selectedId) {
          const cell =
            Math.floor(cx / THIN_CELL_PX) * 100_000 +
            Math.floor(cy / THIN_CELL_PX);
          if (occupied.has(cell)) continue;
          occupied.add(cell);
        }
        this.drawIcon(ctx, m, cx, cy, iconPx);
      }
    }
    this.drawOverlay();
  }

  private drawIcon(
    ctx: CanvasRenderingContext2D,
    m: LayerMarker,
    cx: number,
    cy: number,
    iconPx: number,
  ) {
    const isDone = this.done.has(m.id);
    const bitmap = this.icons.get(m.icon, isDone);
    if (bitmap) {
      const h = iconPx;
      const w = (bitmap.width / bitmap.height) * h;
      ctx.drawImage(bitmap, cx - w / 2, cy - h / 2, w, h);
    } else {
      ctx.fillStyle = isDone ? "rgba(255, 255, 255, 0.35)" : "#ffd54a";
      ctx.beginPath();
      ctx.arc(cx, cy, iconPx / 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (m.id === this.selectedId) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, iconPx / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawOverlay() {
    const ctx = this.overlay.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = this._map.getSize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.x, size.y);
    const m = this.markers[this.hoverIndex];
    if (!m || !this.drawState) return;
    const { originX, originY, scale, iconPx } = this.drawState;
    const cx = (m.x - originX) * scale;
    const cy = (m.y - originY) * scale;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, iconPx / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "13px system-ui, sans-serif";
    const width = ctx.measureText(m.name).width;
    const boxX = Math.round(cx - width / 2 - 6);
    const boxY = Math.round(cy - iconPx / 2 - 28);
    ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
    ctx.fillRect(boxX, boxY, width + 12, 22);
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(m.name, boxX + 6, boxY + 11);
  }

  // Nearest visible marker within half an icon of the pointer, or -1.
  private hitTest(point: L.Point): number {
    if (!this.index || !this.drawState) return -1;
    const { originX, originY, scale, iconPx } = this.drawState;
    const px = originX + point.x / scale;
    const py = originY + point.y / scale;
    const radius = iconPx / 2 / scale;
    let best = -1;
    let bestDistance = Infinity;
    for (const i of this.index.search(
      px - radius,
      py - radius,
      px + radius,
      py + radius,
    )) {
      const m = this.markers[i];
      if (this.visible && !this.visible.has(m.id)) continue;
      const dx = (m.x - px) * scale;
      const dy = (m.y - py) * scale;
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    return best;
  }

  private setHover(index: number) {
    if (index === this.hoverIndex) return;
    this.hoverIndex = index;
    if (!this.placing)
      this._map.getContainer().style.cursor = index >= 0 ? "pointer" : "";
    this.drawOverlay();
    this.options.onMarkerHover?.(index >= 0 ? this.markers[index].id : null);
  }

  private onMouseMove(event: L.LeafletMouseEvent) {
    if (!this.zooming && !this.placing)
      this.setHover(this.hitTest(event.containerPoint));
  }

  private onMouseOut() {
    this.setHover(-1);
  }

  private onClick(event: L.LeafletMouseEvent) {
    const index = this.placing ? -1 : this.hitTest(event.containerPoint);
    if (index >= 0) this.options.onMarkerClick?.(this.markers[index].id);
    else
      this.options.onMapClick?.({ x: event.latlng.lng, y: event.latlng.lat });
  }
}
