import { Kind, Type, TypeRegistry } from "@sinclair/typebox";

TypeRegistry.Set("Buffer", (_schema, value) => Buffer.isBuffer(value));
export const bufferSchema = Type.Transform(Type.Unsafe<Buffer>({ [Kind]: "Buffer" }))
  .Decode(v => v.toString("base64"))
  .Encode(v => Buffer.from(v, "base64"));
