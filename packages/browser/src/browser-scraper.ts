import { logger } from "@mdhsg/log";
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
}
