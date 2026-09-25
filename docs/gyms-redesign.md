# Gym landing redesign — implementation and release notes

## Scope and architecture

The existing Next.js App Router route `app/[locale]/gyms/page.tsx` now renders a server-first sales page with small client components for video, links, FAQ, consent and the sticky CTA. No database migration or new runtime dependency was introduced. The gym checkout uses a direct Stripe Payment Link.

Sequence: hero → existing Slovak video → six-step automation story → universal parallel access-system connection → three installation scenarios → starter package → owner outcomes → real member app screenshot → four onboarding steps → €297 one-time system offer → founder story → FAQ → final order/contact close.

SK, EN, DE, ES, FR and simplified Chinese have complete independent dictionaries under `messages/gyms/`. The route keeps localized canonical/hreflang metadata, one H1, the existing safe JSON-LD renderer, localized Service description and FAQ schema generated from the visible FAQ. The source copy is Slovak. Metadata uses the new dictionary directly; unrelated site metadata remains unchanged.

## Files

- `app/[locale]/gyms/page.tsx`: complete page, metadata and structured data.
- `app/[locale]/gyms/gyms.css`: scoped responsive styles, focus indicators, reduced-motion support and reserved media dimensions.
- `components/gyms/gyms-interactions.tsx`: events respecting stored opt-outs, floating video, FAQ and responsive sticky CTA.
- `components/gyms/gyms-funnel.tsx`: retained legacy component, no longer rendered on the gym sales page.
- `components/gyms/gym-testimonials.tsx`: reusable renderer for future approved owner quotes; no invented testimonials are displayed.
- `lib/gyms.ts`: dictionaries, Stripe checkout URL/config override, replaceable video/poster, optional real package image and Slovak headline variants.
- `lib/meta-pixel.ts`: extracted existing Meta initializer, shared without duplicate scripts.
- Health funnel remains unchanged. Gym tracking uses its own initializer respecting stored opt-outs and respects an existing pixel instance.
- `messages/gyms/{sk,en,de,es,fr,zh-Hans}.json`: six complete translations.
- `scripts/check-gyms.mjs`: isolated conversion/consent and qualification-contract regression tests.

## Order behavior

All primary landing CTAs scroll to the offer. The offer CTA goes directly to the Stripe-hosted checkout. The sticky CTA appears after the hero. On desktop, the VSL docks in the lower-right corner after the hero leaves the viewport and can be dismissed. Consultation uses the existing public support email via a mailto link; no message is sent automatically. The former multi-step compatibility form is no longer rendered.

## Tracking

Update: the user supplied the approved VEED embed on 2026-09-11. All six locales now use that iframe. Native `GymVideo` tracking remains available and tested for future use, but **VSL play/progress/completion events are not emitted for the VEED iframe** because no verified cross-origin player event API has been integrated. An iframe load or click outside the frame is not reported as a video play.

The existing `fitliner_marketing_tracking_consent` preference and Meta pixel are reused. As requested on 2026-09-16, new visits initialize measurement automatically without an initial banner. Existing rejected preferences remain respected; settings still allow opting out. No consent record is fabricated. Questionnaire answers/contact fields are not included in landing events. There is no GA4 integration in the existing route and no new analytics library.

Implemented events:

- `gyms_landing_view`
- `gyms_vsl_play`, `gyms_vsl_25`, `gyms_vsl_50`, `gyms_vsl_75`, `gyms_vsl_complete`
- `gyms_primary_cta_click`
- `gyms_starter_order_start`
- `gyms_call_cta_click`
- `gyms_faq_interaction`

Video milestones and play/completion are deduplicated per mounted video. Milestones represent playback position, not verified continuous watch time. FAQ opens count once per opening, not on closing. The order-start event occurs only on the external checkout CTA, not on every offer anchor.

`gyms_starter_order_complete` is intentionally NOT fired: this repository has no verified starter-order payment callback or webhook. A click or query parameter is not payment proof. Implement completion at the external provider or a signature-verified webhook, deduplicated by transaction ID, after the merchant supplies that integration. The existing health payment callback is a different product and is not reused.

## Validation

- Prettier applied to new/changed gym files; existing health style retained.
- ESLint and TypeScript passed.
- Production Next.js build passed with access to the project's existing Google Fonts. The initial sandboxed build failed only because those fonts could not be fetched.
- `node scripts/check-gyms.mjs`: six dictionary shapes, automatic measurement and stored opt-outs, one primary/order event per click, deduplicated VSL events, FAQ open-only events, single shared pixel initialization, optional four-stage form and unchanged saved backend payload. Network calls are mocked; no production lead or payment was created.
- Existing `check:seo`: 26 canonical pages, locale alternates, sitemap, robots, IndexNow and noindex rules passed, including member-facing and health routes.
- Existing `check:legal`: all 12 localized documents passed.
- Browser checks cover responsive layouts across all six languages with no horizontal overflow, one H1, the hero, floating video, sticky CTA, offer anchor and FAQ.

## Before paid traffic / remaining external work

The owner authorized direct Stripe payment to Globalio LLC and delivery to all 27 EU member countries. The active Payment Link is https://buy.stripe.com/4gM4gyavMcLYaLa7a904800 (`plink_1UEWG3CqeksGlIZjRnsiUZuZ`) in Fitliner Platform – Globalio LLC. It charges EUR 297 once, tax included, quantity fixed at one, with required names and billing/shipping addresses. There is no additional shipping rate. Product `prod_VF01Wax9OaUYpo` uses General - Tangible Goods. Managed Payments and connected-account splitting are off. Stripe shows its default confirmation after payment; fulfillment details remain in Stripe. No live payment was made and no purchase-completed analytics event is inferred from a redirect.

All six locales now use this link and state EU delivery. All use the supplied Slovak VEED video. Published on 2026-09-11. On 2026-09-16 the owner revised the offer to a one-time EUR 297 Fitliner system and module with free lifetime app access for owners and clients and no monthly subscription. All locale copy reflects this offer; no transaction fees are displayed on the landing. Stripe product description update requires the owner to sign in again.

Update: the video appears directly below the hero heading and introduction, before the order CTA, with eager iframe loading. The public offer does not display internal payment-processing fees.
