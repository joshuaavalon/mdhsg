import imageType from "image-type";
import sharp from "sharp";

export async function compressImage(input: Buffer): Promise<Buffer> {
  const type = await imageType(input);
  if (!type) {
    throw new Error("Input is not a image");
  }
  if (type.mime === "image/webp" || type.mime === "image/jpeg") {
    return input;
  }
  return await sharp(input)
    .webp({ effort: 6, force: true, lossless: true })
    .toBuffer();
}
