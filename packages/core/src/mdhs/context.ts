export interface MdhsContext {
  episodeNum: number;
}

export function createMdhsContext(episodeNum: number): MdhsContext {
  return { episodeNum };
}
