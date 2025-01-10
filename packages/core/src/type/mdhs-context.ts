import type { Logger } from "pino";

export interface MdhsContext<Input, Data> {
  data: Partial<Data>;
  input: Input;
  logger: Logger;
}
