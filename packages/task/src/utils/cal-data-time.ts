import { LoggableError } from "@mdhsg/core/error";
import type { DateTime } from "luxon";
import type { TaskContext } from "#type";

export interface DateTimePluginOptions {
  mapping: Record<number, DateTime>;
  span?: number;
}

export function calDateTime(opts: DateTimePluginOptions, ctx: TaskContext): DateTime {
  const { mapping, span = 7 } = opts;
  const episodeNumbers = Object.keys(mapping)
    .map(ep => Number.parseInt(ep))
    .filter(ep => Number.isSafeInteger(ep))
    .toSorted((a, b) => a - b);
  const { episodeNum } = ctx;
  if (mapping[episodeNum]) {
    return mapping[episodeNum];
  }
  const nearestEp = episodeNumbers.findLast(epNo => epNo <= episodeNum) ?? -1;
  if (nearestEp <= 0 || !mapping[nearestEp]) {
    throw new LoggableError({ episodeNum }, "Failed to calculate dataTime");
  }
  return mapping[nearestEp].plus({ days: (episodeNum - nearestEp) * span });
}
