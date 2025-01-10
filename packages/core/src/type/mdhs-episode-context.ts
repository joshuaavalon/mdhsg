import type { MdhsContext } from "./mdhs-context.js";
import type { MdhsEpisode } from "./mdhs-episode.js";
import type { ScrapeEpisodeInput } from "./scrape-episode-input.js";

export interface MdhsEpisodeContext extends MdhsContext<ScrapeEpisodeInput, MdhsEpisode> {
  episodeNum: number;
}
