const logObjectSymbol = Symbol("logObject");

export class LoggableError extends Error {
  private readonly [logObjectSymbol]: Record<string, unknown>;

  public constructor(logObject: Record<string, unknown>, message: string, options?: ErrorOptions) {
    super(message, options);
    this[logObjectSymbol] = logObject;
  }

  public createLogObject(): Record<string, unknown> {
    return { ...this[logObjectSymbol] };
  }
}
