import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

export const scrapeEpisodeInputSchema = Type.Object({
  fromNum: Type.Integer({ minimum: 1 }),
  toNum: Type.Integer({ minimum: 1 })
});

export type ScrapeEpisodeInput = Static<typeof scrapeEpisodeInputSchema>;
