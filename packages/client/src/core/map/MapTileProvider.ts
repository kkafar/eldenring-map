import mapImage from '../assets/maps/m0-overworld.png';

const AVAILABLE_TILINGS = [8, 16]

function assertAllValues<T>(array: Array<T>, element: T | undefined) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] !== undefined) {
      throw new Error(`Expected ${element}, got: ${array[i]} at index ${i}`);
    }
  }
}

type ImageRepr = ImageBitmap;

class MapTileProvider {
  selectedTiling: number;
  cachedTileImages: Array<ImageRepr> | undefined;

  constructor(requestedTileCount: number) {
    if (!AVAILABLE_TILINGS.includes(requestedTileCount)) {
      throw new Error(`${requestedTileCount}x${requestedTileCount} is not available. Available are following tilings: ${AVAILABLE_TILINGS}`);
    }

    this.cachedTileImages = Array.from({ length: requestedTileCount * requestedTileCount })
    this.selectedTiling = requestedTileCount;

    assertAllValues(this.cachedTileImages, undefined);
  }

  public async getTileAt(rowIndex: number, columnIndex: number): Promise<ImageRepr> {
    if (rowIndex >= this.selectedTiling || columnIndex >= this.selectedTiling) {
      throw new Error(`Row index: ${rowIndex} or column index: ${columnIndex} out of bounds: ${this.selectedTiling}`);
    }

    return undefined;
  }

  private getUrlForTileAt(rowIndex: number, columnIndex: number): string {
    return `../../assets/maps/m0-overworld-tile-${this.selectedTiling}/m0-overworld-${rowIndex}-${columnIndex}.png`
  }
}
