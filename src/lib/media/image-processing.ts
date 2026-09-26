import "server-only";
import sharp, { type Metadata } from "sharp";
import { IMAGE_MAX_BYTES, IMAGE_MAX_EDGE, IMAGE_MIN_EDGE, imageTypes, type ImageMime } from "./types";

/*
 * Server-side check and preparation of an uploaded photo. Nothing about the
 * file is trusted: the type comes from its bytes, not its name or the
 * browser's MIME type, and the whole image must decode. The stored copy is
 * re-encoded once: orientation applied, metadata (EXIF / GPS location)
 * removed, and very large photos scaled down to IMAGE_MAX_EDGE.
 */

export type ProcessedImage =
  | { ok: true; data: Buffer; mime: ImageMime; ext: string; width: number; height: number; size: number }
  | { ok: false; error: string };

/** The real format, from the file's signature. */
export function sniffImage(buf: Buffer): ImageMime | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  return null;
}

const sharpFormat: Record<ImageMime, string> = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" };
const NOT_AN_IMAGE = "This file isn't a JPEG, PNG or WebP photo. Choose a photo file.";

export async function processUpload(buf: Buffer): Promise<ProcessedImage> {
  if (buf.length === 0) return { ok: false, error: "The file is empty." };
  if (buf.length > IMAGE_MAX_BYTES) return { ok: false, error: "The photo is larger than 10 MB. Choose a smaller file." };

  const mime = sniffImage(buf);
  if (!mime) return { ok: false, error: NOT_AN_IMAGE };

  // Bounded decode: rejects decompression bombs and corrupt files.
  const options = { failOn: "error" as const, limitInputPixels: 50_000_000 };
  let meta: Metadata;
  try {
    meta = await sharp(buf, options).metadata();
  } catch {
    return { ok: false, error: "This photo couldn't be read. It may be damaged; try exporting it again." };
  }
  if (meta.format !== sharpFormat[mime]) return { ok: false, error: NOT_AN_IMAGE };
  if ((meta.pages ?? 1) > 1) return { ok: false, error: "Animated images aren't supported. Choose a still photo." };
  if (!meta.width || !meta.height || meta.width < IMAGE_MIN_EDGE || meta.height < IMAGE_MIN_EDGE) {
    return { ok: false, error: "This image is too small to use on the website." };
  }

  try {
    let pipeline = sharp(buf, options)
      .rotate() // apply the camera orientation, then drop it with the rest of the metadata
      .resize({ width: IMAGE_MAX_EDGE, height: IMAGE_MAX_EDGE, fit: "inside", withoutEnlargement: true });
    pipeline =
      mime === "image/jpeg"
        ? pipeline.jpeg({ quality: 86, mozjpeg: true })
        : mime === "image/png"
          ? pipeline.png({ compressionLevel: 9 })
          : pipeline.webp({ quality: 86 });
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    if (!info.width || !info.height) return { ok: false, error: "This photo couldn't be read." };
    return {
      ok: true,
      data,
      mime,
      ext: imageTypes[mime].ext,
      width: info.width,
      height: info.height,
      size: data.length,
    };
  } catch {
    return { ok: false, error: "This photo couldn't be processed. It may be damaged; try exporting it again." };
  }
}
