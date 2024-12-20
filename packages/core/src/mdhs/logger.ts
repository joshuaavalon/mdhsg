import { pino } from "pino";
import pinoStd from "pino-std-serializers";
import type { Logger, LoggerOptions } from "pino";

export type CreateLoggerOptions = LoggerOptions;

export function createLogger(opts?: LoggerOptions): Logger {
  const defaultOpts: LoggerOptions = {
    level: "info",
    redact: ["result.*[*].data"],
    serializers: { err: pinoStd.errWithCause },
    transport: {
      options: { colorize: true },
      target: "pino-pretty"
    }
  };
  return pino({ ...defaultOpts, ...opts });
}
