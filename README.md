# Trainer acquisition website

Implemented 17 October 2026. These files overlay the **current integrated production website**, not the older standalone `befitliner_web` checkout. Current integration directory: `tmp/trainer-production-release`. Preserve its existing public trainer pages, customer reservations, gym sites, admin and Stripe return routes. The durable sources for existing trainer routes live separately in `apps/trainer-storefront`.

## User flow

`/{locale}` → three audience cards. Existing consumer content is preserved under `/{locale}/members`; the gym card retains the existing gym landing page. The new trainer journey is `/{locale}/trainers`. Supported website languages: SK, EN, DE, ES, FR, simplified Chinese. Footer is retained.

The trainer answers one question at a time, describes services and prices, reviews the 5% platform fee (Stripe fees separate), and enters the email they will use in the app. A Supabase magic link verifies control of that address. No trainer profile is attached based on an unverified email string. Existing accounts sign in instead of creating duplicate identities.

The email callback is `/trainers/join/verify?draft=<random token>`. It recovers the draft even when Facebook's embedded browser and the email browser differ. The user explicitly saves the recovered profile. An atomic server transaction creates the private trainer profile and all its services. Existing profiles are preserved, never overwritten. Replaying the same request is idempotent.

After download, the user signs in with the same email and completes normal app onboarding. `TrainerOnboardingWizard` recognizes `web_onboarding_complete` and resumes at Stripe on a fresh device. Existing local drafts take precedence. Stripe KYC, invoice checks and publication readiness remain unchanged. Neither a public listing nor payment acceptance is enabled by this website import. **Release an app build containing the resume change before advertising the seamless Stripe handoff.** Older app versions still receive server profile/services but do not have the new explicit resume behavior.

## Components and contracts

- `components/role-gateway.tsx`: three audiences.
- `components/trainer-join.tsx`: wizard, draft, verified session, import.
- `lib/trainer-join-copy.ts`: six-language copy and labels.
- `app/api/trainer-onboarding/route.ts`: same-origin proxy; only `web_prepare`, `web_resume`, `web_import` allowed. Never accepts owner IDs as authority. No service key in browser or Next client.
- `supabase/functions/trainer-commerce/handler.ts`: existing server auth plus new actions. `web_prepare` only creates a bounded temporary draft; `web_resume` requires a verified session, matching email and unexpired recovery token; `web_import` uses shared profile/service validation and authenticated caller ID.
- `supabase/migrations/20261017110000_trainer_web_onboarding.sql`: atomic import, service-only recovery table, cleanup job.
- `lib/profile/trainer_onboarding_wizard.dart`: resume at Stripe.

## Data protection and retention

Local draft is versioned and expires after seven days; the browser provides a clear-draft control. A recovery copy is made only when requesting the verification email. It expires in 24 hours; hourly `trainer-web-draft-cleanup` removes expired rows (insertion also purges expired rows). Only the SHA-256 digest of the 244-bit random recovery token is stored. Recovery also requires the verified email, so possession of the URL alone cannot read the draft. Callback is noindex and no-referrer. Draft data is not added to marketing analytics.

Anonymous/authenticated database roles cannot read recovery drafts or invoke import/prepare SQL functions. The existing Edge service is the sole writer. Import obtains a per-owner transaction lock; profile plus services commit together. Failure rolls everything back. Temporary storage is bounded to five drafts per email and 10,000 globally, with 64 KB request limits. These bounds do not replace abuse monitoring; investigate caps/rate-limit errors before increasing them.

The callback must be allowed in Supabase Auth for both its exact path and `?draft=*`. Existing redirects and authentication settings must be preserved. Do not change email autoconfirm settings, templates, Stripe secrets, or existing booking/payment flags for this feature.

## Integration and verification

Copy this directory's `app`, `components`, and `lib` trees onto the current integrated web source. Do not replace the entire website with these fragments. Build with its existing package lock and dependencies. Local dev uses `next dev --webpack` because its node_modules is a symlink; Vercel's normal install/build succeeds.

Checks performed:
- TypeScript compile and Vercel preview production build.
- Six complete translation dictionaries.
- 21 trainer-commerce handler tests including verified-caller import and email/expiry-scoped recovery.
- Disposable PostgreSQL migration/ACL/idempotency/rollback tests: `supabase/tests/trainer_web_import.sql`.
- 15 Flutter onboarding tests including web → Stripe resume.
- Browser: desktop audience cards, 390 px trainer wizard, profile/service input through service summary, draft restoration.
- Production API smoke test: anonymous import denied; temporary synthetic recovery draft accepted and removed; **no email sent, no real account created**.

Remaining end-to-end acceptance: real email link (including Facebook browser → email browser), save a new trainer profile, then sign into the updated app with that same email and verify basic onboarding + Stripe resume. No Stripe account or charge was created by tests.

## Rollout and rollback

Backend migration and Edge update are additive and deployed; see `docs/trainer-commerce/WEB_ONBOARDING_DEPLOYMENT.json`. Production website publication is pending explicit approval after automatic approval review rejected the production deploy. Preview URL is recorded with deployment evidence. Existing production homepage is unchanged.

Roll back the website to its previous Vercel deployment if needed. Keep imported trainer profiles/services; do not drop their data. Disabling the new website entry is sufficient to stop acquisition while retaining app access and existing commerce. Roll back Edge only after ensuring no active import is in progress. Do not remove shared trainer-commerce features or disable live booking/Stripe as a shortcut.
