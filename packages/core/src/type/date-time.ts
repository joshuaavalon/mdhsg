import { Kind, Type, TypeRegistry } from "@sinclair/typebox";
import { DateTime } from "luxon";

TypeRegistry.Set("DateTime", (_schema, value) => value instanceof DateTime);
export const dateTimeSchema = Type.Transform(Type.Unsafe<DateTime>({ [Kind]: "DateTime" }))
  .Decode(v => {
    const result = v.toUTC().toISO();
    if (!result) {
      throw new Error("Fail to decode DateTime");
    }
    return result;
  })
  .Encode(v => DateTime.fromISO(v));
