import { CategoryMapping, Frame, ItemCategory, MarkerDescription, MarkerDescriptionRaw, Position } from "../types";

export function preprocessItemData(data: MarkerDescriptionRaw[]): MarkerDescription[] {
  // TODO: We need to preprocess image data here also

  return data.map(marker => {
    return {
      ...marker,
      // For some reason coordinates are swapped in input data
      x: Math.abs(Number(marker.y)),
      y: Math.abs(Number(marker.x)),
    }
  });
}

export function preprocessCategoryData(data: ItemCategory[]): CategoryMapping {
  let result = {};

  data.forEach(category => {
    Object.defineProperty(result, category.id, {
      enumerable: true,
      value: category,
      writable: false,
    });
  });

  return result as CategoryMapping;
}

export function getViewportPosition(): Position {
  return {
    x: window.scrollX,
    y: window.scrollY,
  }
}

/**
 * Returns viewport frame in window coordinate space
 */
export function getViewportFrame(): Frame {
  return {
    origin: getViewportPosition(),
    size: {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }
}

