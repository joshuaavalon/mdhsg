import pinoStd from "pino-std-serializers";
import type { LoggerOptions } from "pino";

export const defaultLoggerOpts: LoggerOptions = {
  base: undefined,
  level: "info",
  serializers: { err: pinoStd.errWithCause },
  transport: {
    options: { colorize: true },
    target: "pino-pretty"
  }
};
