import { Builder } from "@joshuaavalon/mdhsg-core/builder";
import { LoggableError } from "@joshuaavalon/mdhsg-core/error";
import { chromium, firefox } from "playwright";
import { createPage } from "./create-page.js";
import type { MdhsContext } from "@joshuaavalon/mdhsg-core";
import type { Browser, LaunchOptions, Page } from "playwright";
import type { CreatePageOptions } from "./create-page.js";

export type BrowserContext = {
  browser: Browser;
  createPage: () => Promise<Page>;
};

export interface CreateBrowserContextOptions {
  browserOptions?: Partial<LaunchOptions>;
  pageOptions?: Partial<CreatePageOptions>;
  type: "chromium" | "firefox";
}

const defaultOpts = { args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"] } satisfies LaunchOptions;

export async function createBrowserContext(ctx: MdhsContext, opts: CreateBrowserContextOptions): Promise<BrowserContext> {
  const { logger } = ctx;
  const { browserOptions, pageOptions, type } = opts;
  switch (type) {
    case "chromium": {
      logger.info("Launch chromium");
      const browser = await chromium.launch({ ...defaultOpts, ...browserOptions });
      return Builder.create<BrowserContext>()
        .set("browser", browser)
        .set("createPage", () => createPage(browser, pageOptions))
        .build();
    }
    case "firefox": {
      logger.info("Launch firefox");
      const browser = await firefox.launch({ ...defaultOpts, ...browserOptions });
      return Builder.create<BrowserContext>()
        .set("browser", browser)
        .set("createPage", () => createPage(browser, pageOptions))
        .build();
    }
    default:
      throw new LoggableError({ type }, "Ignore unknown browser type");
  }
}
