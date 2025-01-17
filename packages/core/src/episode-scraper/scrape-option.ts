import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { abortSignalSchema } from "#type";
import type { Static } from "@sinclair/typebox";


const schema = Type.Object({
  concurrency: Type.Optional(Type.Integer({ minimum: 1 })),
  fromNum: Type.Integer({ minimum: 1 }),
  signal: Type.Optional(abortSignalSchema),
  toNum: Type.Integer({ minimum: 1 })
});

const validator = TypeCompiler.Compile(schema);

export type MdhsgEpisodeScraperScrapeOptions = Static<typeof schema>;

export function assertScrapeOption(value: unknown): asserts value is MdhsgEpisodeScraperScrapeOptions {
  validator.Check(value);
}
