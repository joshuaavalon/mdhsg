import { writeFile } from "node:fs/promises";
import { LoggableError } from "@mdhsg/core/error";
import { logger } from "@mdhsg/log";
import type { Task } from "./type.js";

async function main(args: string[]): Promise<void> {
  if (!Array.isArray(args) || args.length !== 2) {
    throw new Error(`Invalid args: ${JSON.stringify(args)}`);
  }
  const series = args[0];
  if (!series) {
    throw new Error(`Invalid series: ${series}`);
  }
  const episodeNumStr = args[1];
  const episodeNum = Number.parseInt(episodeNumStr ?? "");
  if (Number.isNaN(episodeNum)) {
    throw new Error(`Invalid episodeNum: ${series}`);
  }
  const module = await import(`./task/${series}.js`);
  const task = module.default as Task;
  try {
    await task.main({ episodeNum });
  } catch (err) {
    logger.error({ episodeNum, err }, "Failed to scrape episode");
    const json = { screenshot: null, success: false };
    if (err instanceof LoggableError) {
      const screenshot = err.getScreenshot();
      if (screenshot) {
        await writeFile("error.webp", screenshot);
      }
    }
    await writeFile("output.json", JSON.stringify(json), { encoding: "utf-8" });
  }
}

main(process.argv.slice(2));
