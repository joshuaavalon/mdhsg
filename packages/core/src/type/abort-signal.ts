import { Kind, Type, TypeRegistry } from "@sinclair/typebox";

TypeRegistry.Set("AbortSignal", (_schema, value) => value instanceof AbortSignal);
export const abortSignalSchema = Type.Unsafe<AbortSignal>({ [Kind]: "AbortSignal" });
