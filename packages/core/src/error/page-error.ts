import imageType from "image-type";
import type { ValueErrorIterator } from "@sinclair/typebox/value";

export class LoggableError extends Error {
  private readonly logObj: Record<string, unknown>;
  private screenshot: Buffer | null;

  public constructor(logObj: Record<string, unknown>, message: string, options?: ErrorOptions) {
    super(message, options);
    this.logObj = logObj;
    this.screenshot = null;
  }

  public createLogObject(): Record<string, unknown> {
    return { ...this.logObj };
  }

  public setScreenshot(screenshot: Buffer | null): void {
    this.screenshot = screenshot;
  }

  public getScreenshot(): Buffer | null {
    return this.screenshot;
  }

  public async getScreenshotDataUrl(): Promise<null | string> {
    if (!this.screenshot) {
      return null;
    }
    const mimeType = await imageType(this.screenshot);
    return `data:${mimeType?.mime};base64,${this.screenshot.toString("base64")}`;
  }

  public static fromValidation(errors: ValueErrorIterator): LoggableError {
    const causes = [...errors].map(e => {
      const { message, path, type } = e;
      return { message, path, type };
    });
    return new LoggableError({ causes }, "Fail to validate");
  }
}
