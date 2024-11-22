import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "node:process";
import { BrowserScraper } from "@mdhsg/browser";
import { LoggableError } from "@mdhsg/core/error";
import { logger } from "@mdhsg/log";
import type { Task, TaskResult } from "./type.js";

const baseDir = join(env.GITHUB_WORKSPACE ?? "", "output");

async function writeTaskResult(result: TaskResult): Promise<void> {
  await writeFile(join(baseDir, "result.json"), JSON.stringify(result), { encoding: "utf-8" });
}

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
  await mkdir(baseDir);
  const module = await import(`./task/${series}.js`);
  const task = module.default as Task;
  const browser = await BrowserScraper.chromium();
  try {
    logger.info({ episodeNum }, "Start task");
    await task.main({ browser, episodeNum });
  } catch (err) {
    logger.error({ episodeNum, err }, "Failed to scrape episode");
    await writeTaskResult({
      episodeNum,
      screenshot: err instanceof LoggableError ? await err.getScreenshotDataUrl() : null,
      success: false
    });
  } finally {
    await browser.close();
    logger.info({ episodeNum }, "End task");
  }
}

main(process.argv.slice(2));
