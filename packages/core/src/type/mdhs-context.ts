import type { Logger } from "pino";

export interface MdhsContext<Input, Data> {
  data: Partial<Data>;
  input: Input;
  logger: Logger;
}

export type MdhsContextInput<T> = T extends MdhsContext<infer Input, any> ? Input : never;
export type MdhsContextData<T> = T extends MdhsContext<any, infer Data> ? Data : never;
