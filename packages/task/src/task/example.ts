import { Builder } from "@mdhsg/core/builder";
import { formatDesc, formatName } from "@mdhsg/format";
import { logger } from "@mdhsg/log";
import { DateTime } from "luxon";
import { resolveJcinfoKana } from "#kana";
import { calDateTime, compressImage, fetchImage } from "#utils";
// import { extractRegex } from "#utils";
import type { BrowserScraper, PageScraper } from "@mdhsg/browser";
import type { MdhsEpisodeSchema } from "@mdhsg/core";
import type { TaskContext } from "#type";

async function scrapePageName(page: PageScraper, _ctx: TaskContext): Promise<string> {
  return await page.scrapeString(async root => {
    const value = await root.locator(".non-exists").first().textContent();
    // value = extractRegex(/「(?<value>.+)」/u, value);
    return value ? formatName(value) : null;
  });
}

async function scrapePageDescription(page: PageScraper, _ctx: TaskContext): Promise<string> {
  return await page.scrapeString(async root => {
    const value = await root.locator(".non-exists").first().innerText();
    return value ? formatDesc(value) : null;
  });
}

async function scrapePageImage(page: PageScraper, _ctx: TaskContext): Promise<Buffer[]> {
  const url = await page.resolveUrl(async root => await root.locator(".mt-16 img").first().getAttribute("src"));
  const urls = [url];
  return await Promise.all(urls.map(async url => {
    const image = await fetchImage(url);
    return compressImage(image);
  }));
}


async function createPage(browser: BrowserScraper, _ctx: TaskContext): Promise<PageScraper> {
  const page = await browser.createPage({ initialUrl: "https://example.com" });
  // const url = await page.resolveUrl(root => root.locator("a.story-episode-link").nth(13 - ctx.episodeNum).getAttribute("href"));
  // await page.goto(url);
  return page;
}

export default async function main(ctx: TaskContext): Promise<MdhsEpisodeSchema> {
  const { browser, episodeNum } = ctx;
  logger.info({ episodeNum }, "Start task");
  const page = await createPage(browser, ctx);
  const name = await scrapePageName(page, ctx);
  const sortName = await resolveJcinfoKana(browser, name);
  const desc = await scrapePageDescription(page, ctx);
  const airDate = calDateTime({ mapping: { 1: DateTime.fromISO("2012-10-06T08:30:00", { zone: "utc" }) } }, ctx);
  const posters = await scrapePageImage(page, ctx);
  logger.info({ episodeNum }, "End task");
  return Builder.create<MdhsEpisodeSchema>()
    .set("name", name)
    .set("sortName", sortName)
    .set("description", desc)
    .set("airDate", airDate)
    .set("posters", posters)
    .build();
}
