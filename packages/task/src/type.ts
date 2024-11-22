import type { BrowserScraper } from "@mdhsg/browser";
import type { MdhsEpisodeSchema } from "@mdhsg/core";

export interface Task {
  main: (ctx: TaskContext) => Promise<MdhsEpisodeSchema>;
}

export interface TaskContext {
  browser: BrowserScraper;
  episodeNum: number;
}

export interface TaskFailureResult {
  episodeNum: number;
  success: false;
}

export interface TaskSuccessResult {
  episodeNum: number;
  success: true;
}

export type TaskResult = TaskFailureResult | TaskSuccessResult;
