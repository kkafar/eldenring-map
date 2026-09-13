import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const CONTENT_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
} as const;

// Multipart image upload for marker pictures. The file type is sniffed from its
// bytes, and the stored name is a content hash, so the served URL is immutable.
export function registerUploadRoute(app: Hono, dataDir: string) {
  const uploadsDir = path.join(dataDir, "uploads");
  app.post(
    "/api/upload",
    bodyLimit({ maxSize: MAX_UPLOAD_BYTES }),
    async (c) => {
      const body = await c.req.parseBody();
      const file = body["file"];
      if (!(file instanceof File))
        return c.json({ error: 'multipart field "file" is required' }, 400);
      const bytes = Buffer.from(await file.arrayBuffer());
      const kind = sniffImage(bytes);
      if (!kind)
        return c.json(
          { error: "only PNG, JPEG or WebP images are accepted" },
          415,
        );
      const filename = `${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}.${kind}`;
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, filename), bytes);
      return c.json({ filename, url: `/uploads/${filename}` });
    },
  );
}

export function contentTypeFor(filename: string): string | undefined {
  const ext = filename.split(".").pop() as
    keyof typeof CONTENT_TYPES | undefined;
  return ext ? CONTENT_TYPES[ext] : undefined;
}

export function sniffImage(bytes: Buffer): keyof typeof CONTENT_TYPES | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(PNG_MAGIC)) return "png";
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "jpg";
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
