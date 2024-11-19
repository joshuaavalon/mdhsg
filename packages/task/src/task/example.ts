import { BrowserScraper } from "@mdhsg/browser";
import { Builder } from "@mdhsg/core/builder";
import { logger } from "@mdhsg/log";
import type { MdhsEpisodeSchema } from "@mdhsg/core";
import type { Task } from "#type";

const task: Task = {
  main: async ctx => {
    const { episodeNum } = ctx;
    logger.info("Start task");
    const browser = await BrowserScraper.chromium();
    const page = await browser.createPage({ initialUrl: "https://example.com" });
    const builder = Builder.create<MdhsEpisodeSchema>();
    builder.set("name", await page.scrapeName(root => root.locator(".non-exists")));
    logger.info(episodeNum);
    logger.info("End task");
    return builder.build();
  }
};

export default task;
