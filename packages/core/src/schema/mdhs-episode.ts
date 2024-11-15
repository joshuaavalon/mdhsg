import { Type } from "@sinclair/typebox";
import { bufferSchema } from "./buffer.js";
import { dateTimeSchema } from "./date-time.js";

export const mdhsEpisodeSchema = Type.Object({
  airDate: dateTimeSchema,
  backdrop: Type.Optional(Type.Array(bufferSchema)),
  banners: Type.Optional(Type.Array(bufferSchema)),
  country: Type.String(),
  description: Type.Optional(Type.String()),
  language: Type.String(),
  logos: Type.Optional(Type.Array(bufferSchema)),
  name: Type.String(),
  order: Type.Optional(Type.Number()),
  posters: Type.Optional(Type.Array(bufferSchema)),
  rating: Type.Optional(Type.Number()),
  sortName: Type.String(),
  thumbnails: Type.Optional(Type.Array(bufferSchema)),
  tvSeason: Type.String()
});
