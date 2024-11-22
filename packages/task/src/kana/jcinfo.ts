import { LoggableError } from "@mdhsg/core/error";
import type { BrowserScraper } from "@mdhsg/browser";


export async function resolveJcinfoKana(browser: BrowserScraper, value: string): Promise<string> {
  const page = await browser.createPage({ initialUrl: "https://www.jcinfo.net/ja/tools/kana" });
  return await page.run(async (root, page) => {
    await root.locator("#input_text").fill(value.replaceAll(/[-()〈〉、!?！？。・♡：]/gu, " "));
    await root.locator("label#is_katakana").click();
    await root.locator(".btn-primary").click();
    await page.waitForLoadState("load");
    const results = await page.locator("._result").allTextContents();
    if (results.length !== 3 || !results[2]) {
      throw new LoggableError({ value }, "Cannot resolve Kana");
    }
    return results[2]
      .replaceAll("ヴ", "ゔ")
      .trim()
      .replaceAll(/\s+/gu, " ");
  });
}
