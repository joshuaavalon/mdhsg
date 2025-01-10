import { LoggableError } from "@mdhsg/core/error";
import imageType from "image-type";
import { chromium } from "playwright-extra";
import { chromium as chromiumExtra } from "playwright-extra";
import { default as stealth } from "puppeteer-extra-plugin-stealth";
import { PuppeteerExtraPluginAdblocker } from "#plugins";
import { MdhsPage } from "./page.js";
import type { Logger } from "pino";
import type { Browser, LaunchOptions } from "playwright";
import type { MdhsPageOptions } from "./page.js";

const defaultOpts = { args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"] } satisfies LaunchOptions;

export type MdhsBrowserOptions = {
  extra?: boolean;
  launchOpts?: Partial<LaunchOptions>;
  logger: Logger;
};

export class MdhsBrowser {
  private readonly browser: Browser;
  private readonly logger: Logger;

  public constructor(logger: Logger, browser: Browser) {
    this.logger = logger;
    this.browser = browser;
  }

  public static async chromium(opts: MdhsBrowserOptions): Promise<MdhsBrowser> {
    const { extra = true, launchOpts, logger } = opts;
    const browserOpts = { ...defaultOpts, ...launchOpts };
    logger.info({ options: browserOpts, type: "chromium" }, "Launching browser");
    let browser: Browser;
    if (extra) {
      chromiumExtra.use(stealth());
      chromiumExtra.use(new PuppeteerExtraPluginAdblocker({}));
      browser = await chromiumExtra.launch(browserOpts);
    } else {
      browser = await chromium.launch(browserOpts);
    }
    return new MdhsBrowser(logger, browser);
  }

  public get raw(): Browser {
    return this.browser;
  }

  public async newPage(opts: Omit<MdhsPageOptions, "logger" | "page"> = {}): Promise<MdhsPage> {
    return await MdhsPage.create({
      ...opts,
      logger: this.logger,
      page: await this.browser.newPage()
    });
  }

  public async fetchImage(url: string, referer?: string): Promise<Buffer> {
    const headers = referer ? { referer } : { referer: url };
    this.logger.info({ headers, url }, "Fetching image");
    const page = await this.newPage({ headers });
    try {
      const res = await page.raw.goto(url);
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
