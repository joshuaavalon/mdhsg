import { opendir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "node:process";
import { summary } from "@actions/core";
import { logger } from "@mdhsg/log";
import type { SummaryTableRow } from "@actions/core/lib/summary.js";
import type { TaskResult } from "@mdhsg/task/type";

const baseDir = join(env.GITHUB_WORKSPACE ?? "", "output");

async function readResultJson(): Promise<TaskResult[]> {
  const result: TaskResult[] = [];
  const dir = await opendir(baseDir);
  for await (const dirent of dir) {
    logger.info({ fileName: dirent.name }, "Found file");
    if (!/\d+.json/gu.test(dirent.name) || !dirent.isFile()) {
      continue;
    }
    const fileContent = await readFile(join(baseDir, dirent.name), { encoding: "utf-8" });
    const json = JSON.parse(fileContent);
    logger.info({ fileName: dirent.name, json }, "Found result");
    result.push(json as TaskResult);
  }
  return result.toSorted((a, b) => a.episodeNum - b.episodeNum);
}

async function main(): Promise<void> {
  summary.addHeading("Result", 1);
  const resultTable: SummaryTableRow[] = [[
    { data: "Episode", header: true },
    { data: "Result", header: true }
  ]];
  const resultList = await readResultJson();
  logger.info({ resultList }, "Start process result");
  for (const result of resultList) {
    const { episodeNum, success } = result;
    resultTable.push([
      { data: `${episodeNum}` },
      { data: `${success}` }
    ]);
    logger.info({ episodeNum, success }, "result");
  }
  summary.addTable(resultTable);
  await summary.write();
}


main();
