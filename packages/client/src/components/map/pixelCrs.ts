import * as L from "leaflet";

// Marker coordinates are native pixels of the full-resolution map (zoom 6 in the
// tile pyramid), y downward. This CRS makes Leaflet's LatLng(lat = y, lng = x)
// equal to those pixels at zoom 6 and halves per zoom level below it, which is
// exactly how the {z}/{y}/{x} tile pyramid was cut.
export const NATIVE_ZOOM = 6;

export const PixelCRS: L.CRS = L.Util.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
  scale: (zoom: number) => Math.pow(2, zoom - NATIVE_ZOOM),
  zoom: (scale: number) => Math.log2(scale) + NATIVE_ZOOM,
});

export interface Px {
  x: number;
  y: number;
}

export const toLatLng = (p: Px): L.LatLng => L.latLng(p.y, p.x);
export const fromLatLng = (ll: L.LatLng): Px => ({ x: ll.lng, y: ll.lat });
