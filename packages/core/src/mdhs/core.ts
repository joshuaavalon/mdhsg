import { createLogger } from "./logger.js";
import type { MdhsContext } from "./context.js";
import type { CreateLoggerOptions } from "./logger.js";

export interface CreateMdhsCoreOptions {
  logger?: CreateLoggerOptions;
}

export class MdhsCore<Context extends MdhsContext = MdhsContext> {
  private readonly ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  public create(opts: CreateMdhsCoreOptions): MdhsCore {
    return new MdhsCore({ logger: createLogger(opts.logger) });
  }
}
