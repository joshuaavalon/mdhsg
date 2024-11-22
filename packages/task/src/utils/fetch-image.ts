import { LoggableError } from "@mdhsg/core/error";
import imageType from "image-type";


export async function fetchImage(url: string, referer?: string): Promise<Buffer> {
  const headers = referer ? { referer } : { referer: url };
  try {
    const res = await fetch(url, { headers });
    const body = await res.arrayBuffer();
    const data = Buffer.from(body);
    const type = await imageType(data);
    if (!type) {
      throw new Error("Input is not a image");
    }
    return data;
  } catch (cause) {
    throw new LoggableError({ headers, url }, "Fail to fetch image via fetch", { cause });
  }
}
