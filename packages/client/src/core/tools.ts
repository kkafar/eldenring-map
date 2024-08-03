import { CategoryMapping, ItemCategory, MarkerDescription, MarkerDescriptionRaw } from "../types";

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

