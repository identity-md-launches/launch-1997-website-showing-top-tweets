/** Validate the actual production export at a gateway-like subpath. No external requests. */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { tmpdir } from "node:os";
const { chromium, webkit } = await import(
  process.env.PLAYWRIGHT_MODULE || "@playwright/test"
);
const { default: AxeBuilder } = await import(
  process.env.AXE_MODULE || "@axe-core/playwright"
);
const root = resolve("dist");
const output = resolve(
  process.env.VALIDATION_OUT || `${tmpdir()}/swamp-signal-validation`,
);
await mkdir(output, { recursive: true });
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (!path.startsWith("/preview/")) throw new Error("Unknown subpath");
    const file = resolve(root, path.slice(9) || "index.html");
    if (!file.startsWith(`${root}/`)) throw new Error("Outside export");
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}/preview/`;
const report = {
  timestamp: new Date().toISOString(),
  export: "dist/",
  subpath: "/preview/",
  results: [],
  limitations: [],
};
const data = JSON.parse(await readFile("src/data/posts.json", "utf8"));
const capture = async (page, name) =>
  page.screenshot({ path: `${output}/${name}.png`, fullPage: false });
let browser;
async function test(name, run) {
  try {
    await run();
    report.results.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.results.push({ name, passed: false, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
async function checkEngine(engine, label) {
  try {
    browser = await engine.launch({ headless: true });
  } catch (error) {
    if (label === "Chromium") throw error;
    report.limitations.push(
      `${label} could not launch: ${error.message.split("\n").filter(Boolean).slice(0, 5).join(" ")}`,
    );
    console.log(`NOT RUN ${label}: required host libraries are unavailable.`);
    return;
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [],
    failedResources = [],
    external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      failedResources.push(`${response.status()} ${response.url()}`);
  });
  await context.route("**/*", (route) => {
    if (route.request().url().startsWith(origin)) return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  const articles = page.locator("article.post-card");
  const range = page.getByRole("combobox", {
    name: "Post date range, relative to snapshot",
  });
  const search = page.getByRole("searchbox", {
    name: "Search posts, people, or keywords",
  });
  const allDates = () => range.selectOption("all");
  const topic = (name) =>
    page
      .getByRole("group", { name: "Filter by topic", exact: true })
      .getByRole("button", { name, exact: true })
      .click();
  const saveButton = () =>
    articles.first().getByRole("button", { name: /^Save post/ });
  await test(`${label}: export, metadata, local font and initial ranking`, async () => {
    assert.equal(await articles.count(), 6);
    assert.equal(
      await articles.first().getAttribute("data-post-id"),
      "2110849667097375208",
    );
    assert.match(await page.title(), /Swamp Signal/);
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:image"]',
    ])
      assert.ok(await page.locator(selector).getAttribute("content"));
    for (const asset of [
      await page.locator('link[rel="icon"]').getAttribute("href"),
      await page.locator('meta[property="og:image"]').getAttribute("content"),
    ]) {
      assert.ok(asset.startsWith("./"));
      assert.equal(
        (await context.request.get(new URL(asset, url).href)).status(),
        200,
      );
    }
    assert.ok(
      await page.evaluate(() => document.fonts.check('400 16px "DM Sans"')),
    );
  });
  await test(`${label}: all dates, load more and exact ranking`, async () => {
    await allDates();
    await page.getByRole("button", { name: "Show 6 more posts" }).click();
    assert.equal(await articles.count(), data.length);
    const ids = await articles.evaluateAll((nodes) =>
      nodes.map((n) => n.dataset.postId),
    );
    assert.deepEqual(
      ids,
      [...data]
        .sort((a, b) => b.likes - a.likes || b.reposts - a.reposts)
        .map((p) => p.id),
    );
  });
  await test(`${label}: author and keyword search, no results, reset`, async () => {
    await search.fill("oracle");
    assert.equal(await articles.count(), 2);
    await search.fill("nagato");
    assert.equal(await articles.count(), 1);
    await search.fill("no-such-post-1234");
    assert.equal(await articles.count(), 0);
    assert.ok(
      await page
        .getByRole("heading", { name: "No signal here. Yet." })
        .isVisible(),
    );
    await page.getByRole("button", { name: "Clear filters" }).click();
    assert.equal(await articles.count(), 6);
    assert.equal(await search.inputValue(), "");
  });
  await test(`${label}: topic, date and sort controls`, async () => {
    await topic("Memes");
    assert.equal(await articles.count(), 2);
    assert.equal(await range.inputValue(), "all");
    await topic("All topics");
    await page.getByRole("button", { name: "Latest", exact: true }).click();
    assert.equal(
      await articles.first().getAttribute("data-post-id"),
      "2111047506687598832",
    );
    await page
      .getByRole("button", { name: "Most reposted", exact: true })
      .click();
    assert.equal(
      await articles.first().getAttribute("data-post-id"),
      "2095213015931203803",
    );
    await range.selectOption("week");
    assert.equal(
      await articles.first().getAttribute("data-post-id"),
      "2110849667097375208",
    );
    await range.selectOption("month");
    assert.equal(await page.locator(".result-badge").innerText(), "11");
  });
  await test(`${label}: expand and collapse the complete original post`, async () => {
    await allDates();
    await page.getByRole("button", { name: "Top", exact: true }).click();
    const card = articles.first();
    assert.ok(
      await card.getByRole("button", { name: "Read full post" }).isVisible(),
    );
    await card.getByRole("button", { name: "Read full post" }).click();
    assert.equal(
      (await card.locator("blockquote").innerText()).trim(),
      data.find((p) => p.id === "2106551440864874678").text.trim(),
    );
    await card.getByRole("button", { name: "Show less" }).click();
    assert.ok((await card.locator("blockquote").innerText()).endsWith("…"));
  });
  await test(`${label}: save, persist, saved navigation, remove and empty recovery`, async () => {
    await saveButton().click();
    assert.equal(
      await articles
        .first()
        .getByRole("button", { name: /^Unsave/ })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.reload();
    await page.getByRole("link", { name: /Saved posts/ }).click();
    assert.equal(await articles.count(), 1);
    assert.equal(
      await articles.first().getAttribute("data-post-id"),
      "2106551440864874678",
    );
    await articles
      .first()
      .getByRole("button", { name: /^Unsave/ })
      .click();
    assert.ok(
      await page
        .getByRole("heading", { name: "Keep the good stuff." })
        .isVisible(),
    );
    await page.getByRole("button", { name: "Explore top tweets" }).click();
    assert.equal(await articles.count(), 6);
  });
  await test(`${label}: original links and copy-link failure recovery`, async () => {
    const card = articles.first(),
      id = await card.getAttribute("data-post-id");
    assert.equal(
      await card
        .getByRole("link", { name: /^Open original/ })
        .getAttribute("href"),
      data.find((p) => p.id === id).url,
    );
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("Denied");
          },
        },
      }),
    );
    await card.getByRole("button", { name: /^Copy link/ }).click();
    assert.equal(
      await page
        .getByRole("textbox", { name: "Post link to copy" })
        .inputValue(),
      data.find((p) => p.id === id).url,
    );
    await page.getByRole("button", { name: "Dismiss notification" }).click();
  });
  await test(`${label}: successful copy feedback`, async () => {
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value) => {
            window.__copied = value;
          },
        },
      }),
    );
    await articles
      .first()
      .getByRole("button", { name: /^Copy link/ })
      .click();
    assert.match(await page.locator(".notice").innerText(), /Post link copied/);
    assert.match(
      await page.evaluate(() => window.__copied),
      /^https:\/\/x.com\/.+\/status\/\d+$/,
    );
    await page.getByRole("button", { name: "Dismiss notification" }).click();
  });
  await test(`${label}: about dialog, keyboard dismissal and focus return`, async () => {
    const trigger = page.getByRole("button", {
      name: "Snapshot · Oct 16, 2026",
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    assert.ok(await page.getByRole("dialog").isVisible());
    assert.equal(
      await page.evaluate(() =>
        document.activeElement.getAttribute("aria-label"),
      ),
      "Close about this feed",
    );
    await page.keyboard.press("Shift+Tab");
    assert.ok(
      await page.evaluate(() =>
        document.querySelector("dialog").contains(document.activeElement),
      ),
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").isVisible(), false);
    assert.ok(await trigger.evaluate((el) => el === document.activeElement));
  });
  await test(`${label}: keyboard skip link and visible focus`, async () => {
    await page.goto(url);
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent),
      "Skip to feed",
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "main-content",
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(
        () => getComputedStyle(document.activeElement).outlineStyle,
      ),
      "solid",
    );
    await capture(page, `${label.toLowerCase()}-keyboard`);
  });
  await test(`${label}: responsive reflow and first screen at 390`, async () => {
    for (const width of [320, 390, 680, 900, 1160, 1440]) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow at ${width}`,
      );
      if (width === 390) {
        const action = await articles
          .first()
          .getByRole("link", { name: /^Open original/ })
          .boundingBox();
        assert.ok(
          action.y + action.height < 844,
          "Original-post action must be on the first screen",
        );
        const title = await page
          .getByRole("heading", { level: 1 })
          .boundingBox();
        assert.ok(title.y < 250);
        await capture(page, `${label.toLowerCase()}-390`);
        await page
          .getByRole("combobox", { name: "Filter by topic", exact: true })
          .selectOption("Memes");
        assert.equal(await articles.count(), 2);
        await page
          .getByRole("combobox", { name: "Filter by topic", exact: true })
          .selectOption("All topics");
      }
      if (width === 1440 || width === 320)
        await capture(page, `${label.toLowerCase()}-${width}`);
    }
  });
  await test(`${label}: 200% text enlargement and reduced motion`, async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "32px";
    });
    await capture(page, `${label.toLowerCase()}-text-enlargement`);
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width && r.right > innerWidth + 1;
        })
        .map((el) => `${el.tagName}.${el.className}`)
        .slice(0, 12),
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Text enlargement overflows: ${overflow.join(", ")}`,
    );
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    assert.ok(
      await page.evaluate(() =>
        document.getAnimations().every((a) => a.playState !== "running"),
      ),
    );
  });
  await test(`${label}: accessibility scan, feed and dialog`, async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    await writeFile(
      `${output}/${label.toLowerCase()}-axe.json`,
      JSON.stringify(results.violations, null, 2),
    );
    assert.deepEqual(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
    );
    await page.getByRole("button", { name: "Snapshot · Oct 16, 2026" }).click();
    const dialogResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    assert.deepEqual(
      dialogResults.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
    );
    await page.keyboard.press("Escape");
  });
  await test(`${label}: unavailable and corrupt browser storage`, async () => {
    await page.evaluate(() =>
      localStorage.setItem("swamp-signal:saved", "{invalid"),
    );
    await page.reload();
    assert.equal(await articles.count(), 6);
    assert.equal(await page.locator(".nav-count").innerText(), "0");
    await page.evaluate(() =>
      Object.defineProperty(Storage.prototype, "setItem", {
        value: () => {
          throw new Error("Storage unavailable");
        },
        configurable: true,
      }),
    );
    await saveButton().click();
    assert.ok(
      await articles
        .first()
        .getByRole("button", { name: /^Unsave/ })
        .isVisible(),
    );
    assert.match(
      await page.locator(".notice").innerText(),
      /last for this visit only/,
    );
  });
  await test(`${label}: no runtime errors or external asset requests`, async () => {
    assert.deepEqual(errors, []);
    assert.deepEqual(failedResources, []);
    assert.deepEqual(external, []);
  });
  await context.close();
  await browser.close();
  browser = null;
}
try {
  await checkEngine(chromium, "Chromium");
  if (process.env.SKIP_WEBKIT !== "1") await checkEngine(webkit, "WebKit");
} catch (error) {
  report.results.push({
    name: "Test setup",
    passed: false,
    error: error.message,
  });
} finally {
  if (browser) await browser.close();
  await new Promise((done) => server.close(done));
  report.passed = report.results.every((result) => result.passed);
  await writeFile(
    `${output}/results.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    `${report.results.filter((r) => r.passed).length}/${report.results.length} checks passed. Report: ${output}/results.json`,
  );
  if (!report.passed) process.exitCode = 1;
}
