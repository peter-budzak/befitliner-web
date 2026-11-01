/** Run with PLAYWRIGHT_MODULE pointing to an installed Playwright entry if it is not a local dependency.
 * Deterministic 1200×630 social cards. Existing photos are illustrative; no generated app UI.
 * CHROME_EXECUTABLE optionally selects an installed Chrome. Uses system Arial/PingFang/Noto CJK fonts.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
    : "playwright"
);
const root = process.cwd();
const seo = JSON.parse(
  await fs.readFile(path.join(root, "messages/page-seo.json"), "utf8"),
);
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_EXECUTABLE
    ? { executablePath: process.env.CHROME_EXECUTABLE }
    : {}),
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  for (const locale of Object.keys(seo))
    for (const type of ["features", "partners"]) {
      const t = JSON.parse(
        await fs.readFile(
          path.join(root, `messages/${type}/${locale}.json`),
          "utf8",
        ),
      );
      const title =
        type === "features"
          ? t.title
          : `${t["Build the Fitliner network"]} ${t["in your country."]}`;
      const subtitle =
        type === "features"
          ? t.intro
          : t[
              "Help gyms simplify access, memberships and payments. We develop the product. You open doors in your market."
            ];
      const label = type === "features" ? t.all : t["COUNTRY PARTNER PROGRAM"];
      const photo = await fs.readFile(
        path.join(
          root,
          type === "features"
            ? "public/images/audiences/member-couple.webp"
            : "public/images/audiences/gym.webp",
        ),
      );
      await page.setContent(
        `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#0c0a10;color:#fff;font-family:Arial,'PingFang SC','Noto Sans CJK SC',sans-serif}.photo{position:absolute;right:0;top:0;width:468px;height:630px;object-fit:cover;object-position:center}.shade{position:absolute;right:0;top:0;width:540px;height:630px;background:linear-gradient(90deg,#0c0a10 0%,#0c0a10bb 12%,#0c0a1000 45%),linear-gradient(0deg,#0c0a10b0,transparent 60%)}.glow{position:absolute;inset:0;background:radial-gradient(ellipse at 22% 65%,#7a42c426,transparent 57%)}.brand{position:absolute;left:64px;top:48px;font-size:27px;font-weight:800;letter-spacing:8px}.brand sup{font-size:10px;letter-spacing:0;vertical-align:super}.content{position:absolute;left:64px;top:149px;width:665px}.label{color:#bca0ef;font-size:14px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;margin:0 0 22px}.title{font-size:57px;line-height:1.08;letter-spacing:-2px;font-weight:750;margin:0 0 25px;text-wrap:balance}.title:after{content:'';display:block;width:58px;height:4px;background:#a56bff;border-radius:3px;margin-top:26px}.subtitle{font-size:21px;line-height:1.48;color:#d0c7dc;margin:0;max-width:615px}.footer{position:absolute;left:64px;right:48px;bottom:40px;display:flex;align-items:center;justify-content:space-between;color:#bdb2cc;font-size:15px}.locale{font-size:12px;letter-spacing:1.5px;border:1px solid #ffffff40;background:#15101dcc;padding:9px 13px;border-radius:30px;color:white;text-transform:uppercase}</style></head><body><img class="photo" src="data:image/webp;base64,${photo.toString("base64")}"/><div class="shade"></div><div class="glow"></div><div class="brand">FITLINER<sup>®</sup></div><div class="content"><p class="label">${escape(label)}</p><h1 class="title">${escape(title)}</h1><p class="subtitle">${escape(subtitle)}</p></div><div class="footer"><span>befitliner.com/${locale}/${type}</span><span class="locale">${locale === "zh-Hans" ? "简体中文" : locale}</span></div></body></html>`,
      );
      await page.locator("img").evaluate((i) => i.decode());
      await page.evaluate(() => document.fonts.ready);
      // Fit long translations without truncating the message or overlapping the footer.
      for (
        let size = 57;
        await page
          .locator(".content")
          .evaluate((e) => e.getBoundingClientRect().bottom > 535);
        size -= 1
      ) {
        if (size < 39) throw Error(`Card overflow: ${locale}/${type}`);
        await page
          .locator(".title")
          .evaluate((e, s) => (e.style.fontSize = s + "px"), size);
      }
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth > 1200 ||
          document.documentElement.scrollHeight > 630,
      );
      if (overflow) throw Error(`Canvas overflow ${locale}/${type}`);
      const dest = path.join(root, `public/og/pages/${type}-${locale}-v1.jpg`);
      await page.screenshot({ path: dest, type: "jpeg", quality: 91 });
      console.log(`${locale}/${type}: 1200x630`);
    }
} finally {
  await browser.close();
}
