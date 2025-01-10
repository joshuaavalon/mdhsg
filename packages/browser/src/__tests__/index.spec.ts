import { assert } from "chai";
import { pino } from "pino";
import { MdhsBrowser } from "../index.js";


describe("Test @mdhsg/browser", async () => {
  it("should extract string", async () => {
    const logger = pino();
    const browser = await MdhsBrowser.chromium({ logger });
    const page = await browser.newPage();
    await page.raw.goto("https://example.com/");
    const text = await page.raw.locator("h1").textContent();
    assert.equal(text, "Example Domain");
  });
});
