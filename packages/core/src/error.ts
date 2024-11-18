import type { ValueErrorIterator } from "@sinclair/typebox/value";

export class LoggableError extends Error {
  private readonly logObj: Record<string, unknown>;
  private screenshot?: Buffer;

  public constructor(logObj: Record<string, unknown>, message: string, options?: ErrorOptions) {
    super(message, options);
    this.logObj = logObj;
  }

  public createLogObject(): Record<string, unknown> {
    return { ...this.logObj };
  }

  public setScreenshot(screenshot?: Buffer): void {
    this.screenshot = screenshot;
  }

  public getScreenshotString(): string | undefined {
    return this.screenshot?.toString("base64");
  }

  public static fromValidation(errors: ValueErrorIterator): LoggableError {
    const causes = [...errors].map(e => {
      const { message, path, type } = e;
      return { message, path, type };
    });
    return new LoggableError({ causes }, "Fail to validate");
  }
}
