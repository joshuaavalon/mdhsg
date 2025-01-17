import { errWithCause } from "pino-std-serializers";
import { LoggableError } from "#error";
import type { SerializerFn } from "pino";


export const errorSerializer: SerializerFn = function (value) {
  if (value instanceof LoggableError) {
    return {
      ...value.createLogObject(),
      error: errWithCause(value)
    };
  }
  return errWithCause(value);
};
