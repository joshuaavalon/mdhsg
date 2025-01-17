import { pino } from "pino";
import pinoStd from "pino-std-serializers";
import type { Logger, LoggerOptions } from "pino";
import type { MdhsgEpisode } from "#type";

export interface MdhsgScraperOptions {
  logger?: LoggerOptions;
}

const defaultLoggerOpts: LoggerOptions = {
  level: "info",
  redact: ["err.screenshot", "err.*.screenshot"],
  serializers: { err: pinoStd.errWithCause },
  transport: {
    options: { colorize: true },
    target: "pino-pretty"
  }
};

export abstract class MdhsgScraper {
  protected readonly logger: Logger;

  public constructor(opts: MdhsgScraperOptions) {
    const { logger: loggerOpts = defaultLoggerOpts } = opts;
    this.logger = pino({ ...defaultLoggerOpts, ...loggerOpts });
  }

  public abstract scrape(): Promise<MdhsgEpisode>;
}
