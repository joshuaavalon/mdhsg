import { opendir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "node:process";
import { summary } from "@actions/core";
import type { SummaryTableRow } from "@actions/core/lib/summary.js";
import type { TaskResult } from "@mdhsg/task/type";

const baseDir = join(env.GITHUB_WORKSPACE ?? "", "output");

async function readResultJson(): Promise<TaskResult[]> {
  const result: TaskResult[] = [];
  const dir = await opendir(baseDir);
  for await (const dirent of dir) {
    if (!/\d+.json/gu.test(dirent.name) || !dirent.isFile()) {
      continue;
    }
    const fileContent = await readFile(join(baseDir, dirent.name), { encoding: "utf-8" });
    result.push(JSON.parse(fileContent) as TaskResult);
  }
  return result.toSorted((a, b) => a.episodeNum - b.episodeNum);
}

async function main(): Promise<void> {
  summary.addHeading("Result", 1);
  const resultTable: SummaryTableRow[] = [[
    { data: "Episode", header: true },
    { data: "Result", header: true },
    { data: "Screenshot", header: true }
  ]];
  for (const result of await readResultJson()) {
    const { episodeNum, screenshot, success } = result;
    const image = screenshot
      ? `<img src=${screenshot}" />`
      : "N/A";
    resultTable.push([
      { data: `${episodeNum}` },
      { data: `${success}` },
      { data: image }
    ]);
  }
  summary.addTable(resultTable);
  await summary.write();
}


main();
