# Localized sharing and search discovery

Scope: `/features` and `/partners`, all eight page locales (16 URLs). Implemented 2026-11-01.

## Changes

- `messages/page-seo.json`: purpose-specific localized search titles/descriptions.
- `lib/page-discovery.ts`: explicit canonical/hreflang/x-default, Open Graph locale/alternate locales, 1200×630 JPEG images with localized alt text, Twitter `summary_large_image`, index/follow and large-image preview directives.
- `public/og/pages/`: 16 versioned static JPEG social cards. No runtime rendering/API/database dependency for the image; 1.5 MB total. Brand, image and localized message are visible in every card. Existing fitness photos are illustrative.
- `scripts/seo/render-social-cards.mjs`: reproducible renderer using Playwright and Chrome; rejects clipped/overflowing text. If copy changes, regenerate the cards and bump their asset version in the renderer and `socialImage` together to avoid stale image caches.
- Features JSON-LD: CollectionPage, BreadcrumbList, ImageObject, ItemList with 12 actual feature sections, and MobileApplication describing the same visible features and availability qualifications. No invented ratings, prices, reviews or guarantees.
- Partners JSON-LD: WebPage, BreadcrumbList, ImageObject and FAQPage using the six visible questions and answers. `lib/partners/faq.ts` is shared with the UI to prevent divergence. This is a business partnership, not a JobPosting, investment offer or guaranteed-income listing.
- Sitemap includes the localized sharing images. Root website languages include Hungarian.

## Crawlers and AI

Both pages expose their main content and JSON-LD in server-rendered HTML. Existing homepage links and reciprocal hreflang remain. The existing `User-agent: *` robots rule permits the public routes and image assets, including access for search crawlers such as OAI-SearchBot; admin/API restrictions are preserved. No new training-bot permissions or crawler-specific content are introduced.

Google's guidance says existing search fundamentals apply to AI features, structured data must match visible text, and no special AI file/schema is required:
https://developers.google.com/search/docs/appearance/ai-features

OpenAI distinguishes OAI-SearchBot (search discovery) from GPTBot (model training):
https://developers.openai.com/api/docs/bots

This work improves eligibility/readability, not guaranteed indexing, ranking, AI citation or FAQ rich results. Social platforms may retain an old page preview until they recrawl it. Versioned image URLs avoid reuse of the old image asset once metadata is refreshed.

## Verification scope

Firecrawl audit could not run because the connected account had no credits. Direct HTML/browser inspection replaces it; no claim of a completed Firecrawl crawl. Validate all 16 URLs: a single localized title/description/canonical, nine hreflang links, matching OG/Twitter image, 1200×630 image response, page language, indexable content and valid JSON-LD that matches visible feature bullets/FAQ answers. Also check raw head metadata with social/search user agents, robots and sitemap. Visual checks cover short/long Latin text and Chinese glyph rendering. TypeScript, targeted ESLint and production build are required before deployment.
