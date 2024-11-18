import type { Browser, Page } from "playwright";

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

export interface CreatePageOptions {
  blockTypes?: ResourceType[];
  timeout?: number;
}

export async function createPage(browser: Browser, pageOpts: CreatePageOptions = {}): Promise<Page> {
  const { blockTypes = ["image", "font", "media"], timeout = 60 * 1000 } = pageOpts;
  const page = await browser.newPage();
  page.setDefaultTimeout(timeout);
  if (blockTypes.length > 0) {
    page.route("**/*", (route, req) => {
      if (blockTypes.includes(req.resourceType() as ResourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }
  return page;
}
