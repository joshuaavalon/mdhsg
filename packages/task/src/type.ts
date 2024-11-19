import type { MdhsContext, MdhsEpisodeSchema } from "@mdhsg/core";

export interface Task {
  main: (ctx: MdhsContext) => Promise<MdhsEpisodeSchema>;
}
