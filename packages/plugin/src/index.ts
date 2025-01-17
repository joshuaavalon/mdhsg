export interface MdhsgPluginContext {

}

export interface MdhsgPlugin<Options extends Record<string, unknown>> {
  dependencies(): Promise<string[]>;
  initialize(opts: Options): Promise<void>;
  name(): Promise<string>;
}
