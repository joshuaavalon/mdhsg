import { LoggableError } from "@mdhsg/core/error";
import { logger } from "@mdhsg/log";
import imageType from "image-type";
import { chromium, firefox } from "playwright";
import { PageScraper } from "./page-scraper.js";
import type { Browser, LaunchOptions } from "playwright";
import type { CreatePageScraperOptions } from "./page-scraper.js";


const defaultOpts = { args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"] } satisfies LaunchOptions;

export class BrowserScraper {
  private readonly browser: Browser;

  public constructor(browser: Browser) {
    this.browser = browser;
  }

  public async close(): Promise<void> {
    await this.browser.close();
  }

  public async createPage(opts: Omit<CreatePageScraperOptions, "browser">): Promise<PageScraper> {
    return await PageScraper.create({ ...opts, browser: this.browser });
  }

  public static async chromium(opts?: Partial<LaunchOptions>): Promise<BrowserScraper> {
    const launchOpts = { ...defaultOpts, ...opts };
    logger.info({ launchOpts, type: "chromium" }, "Launching browser");
    const browser = await chromium.launch(launchOpts);
    return new BrowserScraper(browser);
  }

  public static async firefox(opts?: Partial<LaunchOptions>): Promise<BrowserScraper> {
    const launchOpts = { ...defaultOpts, ...opts };
    logger.info({ launchOpts, type: "firefox" }, "Launching browser");
    const browser = await firefox.launch({ ...defaultOpts, ...opts });
    return new BrowserScraper(browser);
  }

  public async fetchImage(url: string, referer?: string): Promise<Buffer> {
    const headers = referer ? { referer } : { referer: url };
    const page = await PageScraper.create({
      browser: this.browser,
      headers
    });
    try {
      const res = await page.goto(url);
      if (!res) {
        throw new LoggableError({ headers, url }, "Empty response");
      }
      const data = await res.body();
      const type = await imageType(data);
      if (!type) {
        throw new Error("Input is not a image");
      }
      return data;
    } catch (cause) {
      throw new LoggableError({ headers, url }, "Fail to fetch image via browser", { cause });
    }
  }
}
