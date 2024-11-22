import { LoggableError } from "@mdhsg/core/error";

/* eslint-disable @typescript-eslint/naming-convention */
export interface TmdbEpisode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  season_number: number;
  still_path: string;
}
/* eslint-enable @typescript-eslint/naming-convention */


function getDefault<T extends keyof V, V extends Record<T, unknown>>(record: V, key: T, defaultValue: V[T]): V[T] {
  if (typeof record[key] !== "undefined") {
    return record[key];
  }
  record[key] = defaultValue;
  return record[key];
}

export interface TmdbScraperOptions {
  apiToken: string;
  language: string;
}

export interface TmdbMeta {
  episodeNum: number;
  seasonNum: number;
  seriesId: string;
}

export class TmdbScraper {
  private readonly apiToken: string;
  private readonly dataCache: Record<string, Record<number, Record<number, TmdbEpisode>>>;
  private readonly language: string;

  public constructor(opts: TmdbScraperOptions) {
    this.apiToken = opts.apiToken;
    this.language = opts.language;
    this.dataCache = {};
  }

  public async scrapeName(meta: TmdbMeta): Promise<string> {
    const data = await this.fetchData(meta);
    return data.name;
  }

  public async scrapeDescription(meta: TmdbMeta): Promise<string> {
    const data = await this.fetchData(meta);
    return data.overview;
  }

  public async scrapePoster(meta: TmdbMeta, fetchImage: (url: string) => Promise<Buffer>): Promise<Buffer[]> {
    const data = await this.fetchData(meta);
    return [await fetchImage(`https://image.tmdb.org/t/p/original${data.still_path}`)];
  }

  private async fetchData(meta: TmdbMeta): Promise<TmdbEpisode> {
    const { episodeNum, seasonNum, seriesId } = meta;
    const seriesCache = getDefault(this.dataCache, seriesId, {});
    const seasonCache = getDefault(seriesCache, seasonNum, {});
    if (seasonCache[episodeNum]) {
      return seasonCache[episodeNum];
    }
    const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNum}/episode/${episodeNum}?language=${this.language}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiToken}`
      }
    });
    if (res.status !== 200) {
      throw new LoggableError({ json: await res.json(), status: res.status }, "");
    }
    const json = await res.json() as TmdbEpisode;
    seasonCache[episodeNum] = json;
    return json;
  }
}
