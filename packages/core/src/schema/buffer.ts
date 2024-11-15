import { Kind, Type, TypeRegistry } from "@sinclair/typebox";

TypeRegistry.Set("Buffer", (_schema, value) => Buffer.isBuffer(value));
export const bufferSchema = Type.Unsafe<Buffer>({ [Kind]: "Buffer" });
