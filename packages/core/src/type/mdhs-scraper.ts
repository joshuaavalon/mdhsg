import type { MdhsContext, MdhsContextData } from "./mdhs-context.js";

// export interface MdhsScraper<Input, Data, Context extends MdhsContext<Input, Data>> {
//   scrape(ctx: Context): Promise<Partial<Data>>;
// }

export interface MdhsScraper<Context extends MdhsContext<any, any>> {
  scrape(ctx: Context): Promise<Partial<MdhsContextData<Context>>>;
}
