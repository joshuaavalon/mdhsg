import type { MdhsContext, MdhsEpisode } from "#schema";

export interface MdhsScraper {
  scrape(ctx: MdhsContext): Promise<Partial<MdhsEpisode>>;
}
