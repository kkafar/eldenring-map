// Source marker coordinates are Leaflet CRS.Simple lat/lng strings; `x` is lat
// (north-south, more negative = further south) and `y` is lng (west-east).
// The calibration is a per-axis affine map into native map pixels.
export interface Calibration {
  mapId: string;
  a: number;
  b: number;
  c: number;
  d: number;
}

export function parseCoordinate(raw: unknown): number {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n))
    throw new Error(`bad coordinate: ${JSON.stringify(raw)}`);
  return n;
}

export function toPixels(cal: Calibration, lat: number, lng: number) {
  return { x: cal.a * lng + cal.b, y: cal.c * lat + cal.d };
}

export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

// "/file/x/maps-icons/locations/summoning-pool.png" -> "summoning-pool"
export function iconBasename(imagePath: string): string {
  return (imagePath.split("/").pop() ?? "")
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase();
}
