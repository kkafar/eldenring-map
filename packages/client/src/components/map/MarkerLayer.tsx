import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { CanvasMarkerLayer, type LayerMarker } from "./CanvasMarkerLayer";
import type { Px } from "./pixelCrs";

export interface MarkerLayerProps {
  markers: LayerMarker[];
  visibleIds?: ReadonlySet<number> | null;
  doneIds: ReadonlySet<number>;
  selectedId: number | null;
  // Placement mode: crosshair cursor, clicks go to onMapClick even over markers.
  placing?: boolean;
  onMarkerClick: (id: number) => void;
  onMarkerHover?: (id: number | null) => void;
  onMapClick?: (p: Px) => void;
}

// React glue: one imperative layer per mounted map; props are forwarded as setters.
export function MarkerLayer(props: MarkerLayerProps) {
  const map = useMap();
  const layerRef = useRef<CanvasMarkerLayer | null>(null);
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const layer = new CanvasMarkerLayer({
      iconBaseUrl: "/icons/",
      onMarkerClick: (id) => latest.current.onMarkerClick(id),
      onMarkerHover: (id) => latest.current.onMarkerHover?.(id),
      onMapClick: (p) => latest.current.onMapClick?.(p),
    });
    layer.addTo(map);
    layerRef.current = layer;
    // Dev-only handle for profiling from the browser console.
    if (import.meta.env.DEV)
      (window as unknown as { __eldenMap?: unknown }).__eldenMap = {
        map,
        layer,
      };
    return () => {
      layer.remove();
      layerRef.current = null;
    };
  }, [map]);

  useEffect(() => layerRef.current?.setMarkers(props.markers), [props.markers]);
  useEffect(
    () => layerRef.current?.setVisible(props.visibleIds ?? null),
    [props.visibleIds],
  );
  useEffect(() => layerRef.current?.setDone(props.doneIds), [props.doneIds]);
  useEffect(
    () => layerRef.current?.setSelected(props.selectedId),
    [props.selectedId],
  );

  return null;
}
