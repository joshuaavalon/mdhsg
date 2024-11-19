import { LoggableError } from "@mdhsg/core/error";
import { logger } from "@mdhsg/log";
import { Duration } from "luxon";
import sharp from "sharp";
import type { Browser, Locator, Page } from "playwright";

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

interface PageScraperOptions {
  page: Page;
  root: Locator;
}

export interface CreatePageScraperOptions {
  blockTypes?: ResourceType[];
  browser: Browser;
  initialUrl?: string;
  rootSelector?: string;
  timeout?: Duration;
  viewportSize?: {
    height: number;
    width: number;
  };
}

export type PageCallback<T> = {
  (root: Locator, page: Page): T;
};

const defaultOpts = {
  blockTypes: ["image", "font", "media"],
  rootSelector: "body",
  timeout: Duration.fromObject({ second: 30 }),
  viewportSize: { height: 1080, width: 1920 }
} satisfies Partial<CreatePageScraperOptions>;

export class PageScraper {
  private readonly page: Page;
  private root: Locator;

  public constructor(opts: PageScraperOptions) {
    const { page, root } = opts;
    this.page = page;
    this.root = root;
  }

  public setRoot(callback: PageCallback<Locator>): void {
    this.root = callback(this.root, this.page);
  }

  public async run(callback: PageCallback<Promise<void>>): Promise<void> {
    await callback(this.root, this.page);
  }

  public async resolveUrl(callback: PageCallback<Promise<string>>): Promise<string> {
    const relativeUrl = await callback(this.root, this.page);
    return new URL(relativeUrl, this.page.url()).href;
  }

  public async removeSelectorAll(selectors: string): Promise<void> {
    await this.page.evaluate(selectors => {
      const list = document.querySelectorAll(selectors);
      [...list].forEach(e => {
        e.remove();
      });
    }, selectors);
  }

  public async scrapeName(callback: PageCallback<Locator>): Promise<string> {
    try {
      const value = await callback(this.root, this.page).textContent();
      if (!value) {
        throw new Error("Empty name scraped");
      }
      return value;
    } catch (err) {
      throw await this.createError({ err }, "Cannot scrape name");
    }
  }

  public static async create(opts: CreatePageScraperOptions): Promise<PageScraper> {
    const {
      blockTypes = defaultOpts.blockTypes,
      browser,
      initialUrl,
      rootSelector = defaultOpts.rootSelector,
      timeout = defaultOpts.timeout,
      viewportSize = defaultOpts.viewportSize
    } = opts;
    logger.info("Start creating page");
    const page = await browser.newPage();
    page.setDefaultTimeout(timeout.milliseconds);
    await page.setViewportSize(viewportSize);
    if (blockTypes.length > 0) {
      page.route("**/*", (route, req) => {
        if (blockTypes.includes(req.resourceType() as ResourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });
    }
    if (initialUrl) {
      logger.info(`Going to ${initialUrl}`);
      await page.goto(initialUrl);
    }
    logger.info("End creating page");
    const root = page.locator(rootSelector);
    return new PageScraper({ page, root });
  }

  private async createError(...[logObj, opts]: ConstructorParameters<typeof LoggableError>): Promise<Error> {
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
