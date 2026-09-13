// Loads marker icons once, decoded to ImageBitmaps, plus a greyed "done" variant.
export class IconCache {
  private readonly loaded = new Map<string, ImageBitmap | null>();
  private readonly done = new Map<string, ImageBitmap>();
  private readonly pending = new Set<string>();

  constructor(
    private readonly baseUrl: string,
    private readonly onLoad: () => void,
  ) {}

  get(file: string, done: boolean): ImageBitmap | null {
    if (!this.loaded.has(file)) {
      void this.load(file);
      return null;
    }
    return done
      ? (this.done.get(file) ?? null)
      : (this.loaded.get(file) ?? null);
  }

  private async load(file: string) {
    if (this.pending.has(file)) return;
    this.pending.add(file);
    try {
      const response = await fetch(this.baseUrl + file);
      if (!response.ok) throw new Error(`${response.status} for ${file}`);
      const bitmap = await createImageBitmap(await response.blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.filter = "grayscale(1) opacity(0.45)";
        ctx.drawImage(bitmap, 0, 0);
        this.done.set(file, await createImageBitmap(canvas));
      }
      this.loaded.set(file, bitmap);
    } catch (error) {
      console.warn("icon failed to load", file, error);
      this.loaded.set(file, null);
    } finally {
      this.pending.delete(file);
      this.onLoad();
    }
  }
}
