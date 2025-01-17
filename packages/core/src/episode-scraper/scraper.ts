import PQueue from "p-queue";
import { assertScrapeOption } from "./scrape-option.js";
import type { Logger } from "pino";
import type { MdhsgEpisode } from "#type";
import type { MdhsgEpisodeScraperScrapeOptions } from "./scrape-option.js";

/**
 * Inclusive range
 */
function range(start: number, stop: number, step = 1): number[] {
  const array: number[] = Array(Math.ceil((stop - start + 1) / step)).fill(start);
  return array.map((x: number, y: number) => x + (y * step));
}

export interface MdhsgEpisodeScraperOptions {
  logger: Logger;
}

export interface MdhsgEpisodeScraperScrapeEpisodeOptions {
  signal?: AbortSignal;
}

export abstract class MdhsgEpisodeScraper {
  protected readonly logger: Logger;

  public constructor(opts: MdhsgEpisodeScraperOptions) {
    const { logger } = opts;
    this.logger = logger;
  }

  protected abstract scrapeEpisode(episodeNum: number, opts: MdhsgEpisodeScraperScrapeEpisodeOptions): Promise<MdhsgEpisode>;

  public async scrape(opts: MdhsgEpisodeScraperScrapeOptions): Promise<MdhsgEpisode[]> {
    assertScrapeOption(opts);
    const { concurrency, fromNum, signal, toNum } = opts;
    this.logger.info({ concurrency, fromNum, toNum }, "Start scraping episodes");
    const queue = new PQueue({ concurrency });
    const tasks = range(fromNum, toNum)
      .map(episodeNum => (opts: MdhsgEpisodeScraperScrapeEpisodeOptions) => this.scrapeEpisode(episodeNum, opts));
    const episodes: MdhsgEpisode[] = await queue.addAll(tasks, { signal, throwOnTimeout: true });
    await queue.onIdle();
    return episodes;
  }
}
