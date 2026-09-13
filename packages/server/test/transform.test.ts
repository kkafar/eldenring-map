import { describe, expect, it } from "vitest";
import {
  cleanName,
  iconBasename,
  parseCoordinate,
  toPixels,
} from "../src/lib/transform.js";
import { classify } from "../src/lib/taxonomy.js";

const calibration = {
  mapId: "overworld",
  a: 9728 / 235,
  b: -11 * (9728 / 235),
  c: -9216 / 220,
  d: -19 * (9216 / 220),
};

describe("transform", () => {
  it("parses coordinates with stray whitespace and bare integers", () => {
    expect(parseCoordinate("150 ")).toBe(150);
    expect(parseCoordinate("-71.117187")).toBeCloseTo(-71.117187);
    expect(() => parseCoordinate("abc")).toThrow();
  });

  it("maps Castle Morne near the southern tip of the map", () => {
    const { x, y } = toPixels(calibration, -224.820312, 110.551353);
    expect(x).toBeCloseTo(4121, 0);
    expect(y).toBeCloseTo(8622, 0);
  });

  it("cleans names and extracts icon basenames", () => {
    expect(cleanName("  Effigy   of the Martyr ")).toBe("Effigy of the Martyr");
    expect(
      iconBasename("/file/x/maps-icons/locations/summoning-pool.png"),
    ).toBe("summoning-pool");
  });
});

describe("classify", () => {
  it("splits categories by icon and falls back per category", () => {
    expect(classify("Bosses", "miniboss")).toMatchObject({
      root: "enemy",
      subcategory: "Field Boss",
    });
    expect(classify("Bosses", "mainboss")).toMatchObject({
      root: "enemy",
      subcategory: "Boss",
    });
    expect(classify("Locations", "castlemourne")).toMatchObject({
      subcategory: "Landmark",
      markerIcon: "location-castle-morne.png",
    });
    expect(classify("Locations", "location_41").subcategory).toBe("Landmark");
    expect(classify("Never Seen", "x")).toMatchObject({
      root: "item",
      subcategory: "Never Seen",
    });
  });
});
