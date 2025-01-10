import type { MdhsEpisode, MdhsScraper } from "@mdhsg/core";
import type { MdhsContext } from "@mdhsg/core/schema";
import type { Logger } from "pino";

export type MdhsBrowserScraperOptions = {
  logger: Logger;
};

export class MdhsBrowserScraper implements MdhsScraper {
  private readonly logger: Logger;

  public constructor(opts: MdhsBrowserScraperOptions) {
    const { logger } = opts;
    this.logger = logger;
  }

  public async scrape(ctx: MdhsContext): Promise<Partial<MdhsEpisode>> {
    throw new Error("Method not implemented.");
  }
}

interface A {
  url();
}
