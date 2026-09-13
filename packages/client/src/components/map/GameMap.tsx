import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo, type Ref } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { MarkerLayer, type MarkerLayerProps } from "./MarkerLayer";
import { PixelCRS } from "./pixelCrs";

export interface MapMeta {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  minZoom: number;
  maxZoom: number;
}

export interface GameMapProps extends MarkerLayerProps {
  map: MapMeta;
  mapRef?: Ref<L.Map | null>;
}

const MIN_ZOOM = 2;
const OVERZOOM = 2;

export function GameMap({ map, mapRef, ...layerProps }: GameMapProps) {
  const bounds = useMemo(
    () => L.latLngBounds([0, 0], [map.height, map.width]),
    [map.height, map.width],
  );

  return (
    <MapContainer
      ref={mapRef}
      crs={PixelCRS}
      bounds={bounds}
      maxBounds={bounds.pad(0.1)}
      maxBoundsViscosity={1}
      minZoom={MIN_ZOOM}
      maxZoom={map.maxZoom + OVERZOOM}
      zoomSnap={0.5}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: "#000" }}
    >
      <TileLayer
        url={`/tiles/${map.id}/{z}/{y}/{x}.jpg`}
        tileSize={map.tileSize}
        minNativeZoom={map.minZoom}
        maxNativeZoom={map.maxZoom}
        maxZoom={map.maxZoom + OVERZOOM}
        bounds={bounds}
        noWrap
        errorTileUrl="/tiles/blank.png"
      />
      <MarkerLayer {...layerProps} />
    </MapContainer>
  );
}
