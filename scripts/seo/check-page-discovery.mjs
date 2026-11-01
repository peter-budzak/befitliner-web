/** Read-only verification; uses the same external Playwright options as render-social-cards.mjs.
 * BASE_URL defaults to production. VERCEL_OIDC_TOKEN is sent only to the exact preview origin.
 */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
    : "playwright"
);
const require = createRequire(`${process.cwd()}/package.json`);
const sharp = require("sharp");
const seo = JSON.parse(await fs.readFile("messages/page-seo.json", "utf8"));
const base = process.env.BASE_URL || "https://www.befitliner.com";
const prod = "https://www.befitliner.com";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_EXECUTABLE
    ? { executablePath: process.env.CHROME_EXECUTABLE }
    : {}),
});
try {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const auth = base.includes(".vercel.app")
    ? { "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN }
    : {};
  if (base.includes(".vercel.app"))
    await page.route(`${base}/**`, (r) =>
      r.continue({ headers: { ...r.request().headers(), ...auth } }),
    );
  const get = (url, headers = {}) =>
    page.request.get(url, { headers: { ...auth, ...headers } });
  for (const locale of Object.keys(seo))
    for (const type of ["features", "partners"]) {
      const url = `${prod}/${locale}/${type}`;
      const expected = seo[locale][type];
      const response = await page.goto(`${base}/${locale}/${type}`);
      assert.equal(response.status(), 200);
      const html = await response.text();
      const head = html.split("</head>")[0];
      assert.ok(
        head.includes('property="og:image"'),
        `${locale}/${type} raw head OG`,
      );
      assert.equal(await page.title(), expected.title);
      assert.equal(
        await page.locator("meta[name=description]").getAttribute("content"),
        expected.description,
      );
      assert.equal(
        await page.locator("link[rel=canonical]").getAttribute("href"),
        url,
      );
      assert.equal(await page.locator("html").getAttribute("lang"), locale);
      assert.equal(
        await page.locator("link[rel=alternate][hreflang]").count(),
        9,
      );
      assert.equal(await page.locator('meta[property="og:title"]').count(), 1);
      const image = `${prod}/og/pages/${type}-${locale}-v1.jpg`;
      assert.equal(
        await page.locator('meta[property="og:image"]').getAttribute("content"),
        image,
      );
      assert.equal(
        await page
          .locator('meta[property="og:image:width"]')
          .getAttribute("content"),
        "1200",
      );
      assert.equal(
        await page
          .locator('meta[property="og:image:height"]')
          .getAttribute("content"),
        "630",
      );
      assert.equal(
        await page
          .locator('meta[property="og:image:alt"]')
          .getAttribute("content"),
        expected.title,
      );
      assert.equal(
        await page.locator('meta[name="twitter:card"]').getAttribute("content"),
        "summary_large_image",
      );
      assert.equal(
        await page
          .locator('meta[name="twitter:image"]')
          .getAttribute("content"),
        image,
      );
      assert.equal(
        await page
          .locator('meta[name="twitter:title"]')
          .getAttribute("content"),
        expected.title,
      );
      assert.ok(
        (
          await page.locator("meta[name=robots]").getAttribute("content")
        ).includes("max-image-preview:large"),
      );
      assert.ok(
        !(
          await page.locator("meta[name=robots]").getAttribute("content")
        ).includes("noindex"),
      );
      const img = await get(image.replace(prod, base));
      assert.equal(img.status(), 200);
      assert.ok(img.headers()["content-type"].includes("image/jpeg"));
      const bytes = await img.body();
      const size = await sharp(bytes).metadata();
      assert.equal(size.width, 1200);
      assert.equal(size.height, 630);
      assert.ok(bytes.length < 500000);
      const schemas = (
        await page
          .locator('script[type="application/ld+json"]')
          .allTextContents()
      ).map(JSON.parse);
      const graph = schemas.find((s) => s["@graph"])["@graph"];
      assert.equal(
        graph.find((n) => n["@id"] === `${url}#webpage`).inLanguage,
        locale,
      );
      assert.equal(
        graph.find((n) => n["@type"] === "BreadcrumbList").itemListElement[1]
          .item,
        url,
      );
      if (type === "features") {
        const list = graph.find((n) => n["@type"] === "ItemList");
        assert.equal(list.numberOfItems, 12);
        for (const { item } of list.itemListElement) {
          const id = new URL(item.url).hash;
          assert.equal(await page.locator(`${id} h3`).innerText(), item.name);
          for (const text of await page.locator(`${id} li`).allTextContents())
            assert.ok(item.description.includes(text));
        }
        assert.equal(await page.locator(".feature-card li").count(), 36);
        assert.ok(graph.find((n) => n["@type"] === "MobileApplication"));
      } else {
        const questions = graph.find(
          (n) => n["@type"] === "FAQPage",
        ).mainEntity;
        assert.equal(questions.length, 6);
        assert.equal(await page.locator("#faq details").count(), 6);
        for (const [i, q] of questions.entries()) {
          assert.ok(
            (await page.locator("#faq summary").nth(i).textContent()).includes(
              q.name,
            ),
          );
          assert.equal(
            (await page.locator("#faq details p").nth(i).textContent()).trim(),
            q.acceptedAnswer.text,
          );
        }
      }
      console.log(
        `${locale}/${type}: PASS metadata, 1200x630 image, SSR and matching JSON-LD`,
      );
    }
  for (const bot of [
    "facebookexternalhit/1.1",
    "Twitterbot/1.0",
    "Googlebot",
    "OAI-SearchBot/1.4",
    "ChatGPT-User/1.0",
    "PerplexityBot",
  ])
    for (const type of ["features", "partners"]) {
      const r = await get(`${base}/sk/${type}`, { "User-Agent": bot });
      assert.equal(r.status(), 200);
      const head = (await r.text()).split("</head>")[0];
      assert.ok(
        head.includes(`/og/pages/${type}-sk-v1.jpg`),
        `${bot} ${type} head`,
      );
    }
  const robots = await (await get(`${base}/robots.txt`)).text();
  assert.ok(robots.includes("User-Agent: *"));
  assert.ok(robots.includes("Allow: /"));
  assert.ok(!robots.includes("Disallow: /og"));
  assert.ok(!robots.includes("Disallow: /sk/features"));
  const sitemap = await (await get(`${base}/sitemap.xml`)).text();
  for (const locale of Object.keys(seo))
    for (const type of ["features", "partners"]) {
      assert.ok(sitemap.includes(`${prod}/${locale}/${type}`));
      assert.ok(sitemap.includes(`${type}-${locale}-v1.jpg`));
    }
  console.log(
    "PASS social/search bot raw-head responses, robots and image sitemap. No JavaScript required.",
  );
} finally {
  await browser.close();
}
