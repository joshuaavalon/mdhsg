import { LoggableError } from "@mdhsg/core/error";
import { Duration } from "luxon";
import sharp from "sharp";
import type { Logger } from "pino";
import type { Locator, Page } from "playwright";

export type ResourceType =
  | "document"
  | "eventsource"
  | "fetch"
  | "font"
  | "image"
  | "manifest"
  | "media"
  | "other"
  | "script"
  | "stylesheet"
  | "texttrack"
  | "websocket"
  | "xhr";

export type MdhsPageOptions = {
  blockTypes?: ResourceType[];
  headers?: Record<string, string>;
  logger: Logger;
  page: Page;
  rootLocator?: Locator;
  timeout?: Duration;
  viewportSize?: {
    height: number;
    width: number;
  };
};

export class MdhsPage {
  private readonly page: Page;
  private readonly logger: Logger;
  private rootLocator: Locator;

  public get root(): Locator {
    return this.rootLocator;
  }

  public set root(rootLocator: Locator) {
    this.rootLocator = rootLocator;
  }

  public constructor(logger: Logger, page: Page, rootLocator: Locator) {
    this.logger = logger;
    this.page = page;
    this.rootLocator = rootLocator;
  }

  public get raw(): Page {
    return this.page;
  }

  public static async create(opts: MdhsPageOptions): Promise<MdhsPage> {
    const {
      blockTypes = ["image", "font", "media"],
      headers,
      logger,
      page,
      rootLocator = page.locator("body"),
      timeout = Duration.fromObject({ second: 30 }),
      viewportSize = { height: 1080, width: 1920 }
    } = opts;
    logger.info("Start creating page");
    if (headers) {
      page.setExtraHTTPHeaders(headers);
    }
    page.setDefaultTimeout(timeout.as("millisecond"));
    await page.setViewportSize(viewportSize);
    if (blockTypes.length > 0) {
      page.route("**/*", (route, req) => {
        if (blockTypes.includes(req.resourceType() as ResourceType)) {
          logger.debug({ resourceType: req.resourceType(), url: route.request().url() }, "Blocked request");
          route.abort();
        } else {
          route.continue();
        }
      });
    }
    return new MdhsPage(logger, page, rootLocator);
  }

  public async removeSelectorAll(selectors: string): Promise<void> {
    this.logger.debug({ selectors }, "Remove all elements");
    await this.page.evaluate(selectors => {
      const list = document.querySelectorAll(selectors);
      [...list].forEach(e => {
        e.remove();
      });
    }, selectors);
  }

  public async selectBackgroundImage(selector: string): Promise<string> {
    this.logger.debug({ selector }, "Select background image");
    const selected = await this.page.evaluate(selector => {
      const img = document.querySelector<HTMLElement>(selector);
      if (!img) {
        return null;
      }
      const style = window.getComputedStyle(img);
      return style.backgroundImage.slice(4, -1).replace(/"/ug, "");
    }, selector);
    if (!selected) {
      throw await this.createError({ selector }, "Cannot select background image");
    }
    return selected;
  }

  public async selectYoutubeThumbnail(locator: Locator = this.page.locator(".c-youtubeWrap iframe").first()): Promise<string> {
    const url = await locator.getAttribute("src");
    if (!url) {
      throw await this.createError({ locator }, "Cannot select Youtube thumbnail");
    }
    const regexResult = /https:\/\/www\.youtube\.com\/embed\/(?<id>.+)/ug.exec(url);
    const youtubeId = regexResult?.groups?.id;
    if (!youtubeId) {
      throw await this.createError({ url }, "Cannot extract Youtube Id");
    }
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }

  public async resolveUrl(relativeUrl: string): Promise<string> {
    return new URL(relativeUrl, this.page.url()).href;
  }

  public async createError(...[logObj, opts]: ConstructorParameters<typeof LoggableError>): Promise<Error> {
    const error = new LoggableError({ ...logObj, url: this.page.url() }, opts);
    const screenshot = await this.page.screenshot({ fullPage: true });
    error.setScreenshot(await sharp(screenshot)
      .resize({
        fit: sharp.fit.inside,
        width: 720,
        withoutEnlargement: true
      })
      .webp()
      .toBuffer());
    return error;
  }
}
