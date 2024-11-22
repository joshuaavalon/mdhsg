import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "node:process";
import { BrowserScraper } from "@mdhsg/browser";
import { mdhsEpisodeSchema } from "@mdhsg/core";
import { LoggableError } from "@mdhsg/core/error";
import { logger } from "@mdhsg/log";
import { Value } from "@sinclair/typebox/value";
import imageType from "image-type";
import type { Task, TaskResult } from "./type.js";

const baseDir = join(env.GITHUB_WORKSPACE ?? "", "output");

async function writeTaskResult(result: TaskResult): Promise<void> {
  const filePath = join(baseDir, `${result.episodeNum}.json`);
  logger.info({ filePath }, "Writing task result");
  await writeFile(filePath, JSON.stringify(result), { encoding: "utf-8" });
}

async function writeScreenshot(result: TaskResult, image: Buffer | null): Promise<void> {
  if (!image) {
    return;
  }
  const imageTypeResult = await imageType(image);
  if (!imageTypeResult) {
    return;
  }
  const filePath = join(baseDir, `${result.episodeNum}.${imageTypeResult.ext}`);
  logger.info({ filePath }, "Writing screenshot");
  await writeFile(filePath, image);
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
  let taskResult: TaskResult;
  try {
    logger.info({ episodeNum }, "Start task");
    const data = await task({ browser, episodeNum });
    taskResult = {
      data: Value.Decode(mdhsEpisodeSchema, data),
      episodeNum,
      success: true
    };
    await writeTaskResult(taskResult);
  } catch (err) {
    logger.error({ episodeNum, err }, "Failed to scrape episode");
    taskResult = {
      episodeNum,
      success: false
    };
    await writeTaskResult(taskResult);
    if (err instanceof LoggableError) {
      await writeScreenshot(taskResult, err.getScreenshot());
    }
  } finally {
    await browser.close();
    logger.info({ episodeNum }, "End task");
  }
}

main(process.argv.slice(2));
