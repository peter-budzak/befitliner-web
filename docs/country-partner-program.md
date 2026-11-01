# Fitliner Country Partner Program

Last updated: 2026-11-01 (Europe/Bratislava). **Live in production.** PR #8 is merged; the database, MailerSend, public pages and existing admin integration have been verified. See the release record below for actual evidence; a successful build alone does not prove persistence or email delivery.

## Scope and business rules

This extends `peter-budzak/befitliner-web`, Vercel project `befitliner-web`, existing PR #8 / branch `feature/country-partners`. Public routes are `/sk/partners` and `/en/partners`. There is no separate partner application or admin site.

- One strategic partner per country; an accepted application does not grant exclusivity or create a contract.
- Qualification lasts 90 days without exclusivity. Ten activated **paying** gyms qualify a partner for consideration for 12 months of exclusivity.
- Renewal depends on the country's contractual annual target. Seeded targets are proposals (`target_approved=false`), not approved commitments.
- Partner share is 50% of agreed net distributable revenue. For the current €297 one-off sale, subtract attributable costs before splitting. The calculator lets the visitor change these costs.
- A 2% transaction fee is illustrated as 1% Fitliner / 1% partner only if the entire fee is distributable; actual costs and the final contract can reduce it.
- Commissions/exclusivity are not automatically lifelong. Attribution, activation, refunds, support, termination and settlement terms must be agreed in the contract.

## Architecture and source files

1. `app/[locale]/partners/page.tsx` loads only public country settings using the anon client. It serves SK/EN metadata and reuses the existing dark/purple/Geist gym visual language.
2. `app/[locale]/partners/partner-interactive.tsx` implements country selection, calculator and accessible form success/error feedback. `partners.css` supplies responsive styles. Country targets and availability come from the database; Slovak labels are local translations.
3. `app/api/partner-applications/route.ts` validates the streamed request, consent and bot fields, then invokes the service-only transactional `submit_partner_application` RPC. It calls the notification function only after a durable save.
4. `supabase/functions/partner-application-notify/index.ts` uses the **existing MailerSend** credentials in Supabase. It checks the exact service-role bearer token in code (deployment uses `--no-verify-jwt`; this does not make the handler public). No Resend integration or MailerSend secret copying is required.
5. `components/admin/partners-panel.tsx` is the Partners tab inside `components/admin/admin-console.tsx`. It reuses the existing admin session, `fitliner-admin-session`, and existing `is_gym_console_admin()` authorization.
6. `app/api/admin/partners/route.ts` verifies the bearer token with Supabase Auth, then calls that existing admin predicate before changing a status, retrying an eligible notification or checking delivery. Reads go directly through RLS; all mutations remain server-only.

## Database and migrations

Production Supabase: `jkjncktexqqkrmezdjui` (`befitliner`). Existing staging: `xguwwicyqhuutcgkpsyh` (`fitliner-staging`). Both migrations are applied and recorded in `supabase_migrations.schema_migrations` in both projects:

- `supabase/migrations/20261031150000_country_partner_program.sql`
- `supabase/migrations/20261101090000_partner_application_operations.sql`

The pre-existing `partners` table belongs to `diamond_rewards`; it is untouched and is not a national distributor registry.

| Table | Purpose / relationships |
| --- | --- |
| `partner_countries` | ISO code primary key, name, availability, qualification rules, annual target and approval flag; 19 seeded countries. |
| `partner_applications` | Applicant contacts, experience, message, consent timestamp and processing status; country FK. Includes request UUID/hash, HMAC IP hash, notification state, attempts, provider message ID, safe error code and notification timestamp. |
| `country_partners` | Approved legal entity and contract/qualification/exclusivity dates; country and optional application FKs. A partial unique index permits only one `exclusive` partner per country. |

Gym attribution and an append-only commission ledger remain future work, not part of this release. Application status changes do not silently create partner contracts.

### Security and request controls

All three tables have RLS enabled. Anonymous users can read only country configuration. Authenticated users can select applications **only** when `is_gym_console_admin()` is true; they cannot insert or update through the data API. `country_partners` has no public/user grants. The submission RPC can be executed only by `service_role` (plus database owners). Credentials never enter client props or public environment variables.

Server validation rejects invalid types/lengths rather than silently truncating. It enforces email format, required name/phone/experience, explicit consent, a v4 request UUID, an empty honeypot and 2-second to 24-hour form age. Body size is limited to 12,000 streamed bytes, including when Content-Length is missing. Cross-origin browser requests are rejected.

The submission transaction serializes its short quota check and insert using an advisory transaction lock: 5 applications/IP/hour, 3/email/day, 100 total/hour. Vercel's trusted `x-vercel-forwarded-for` is HMAC-hashed with the server key; raw IPs are not stored. Local testing shares the `local` bucket. This is layered basic anti-spam, not a CAPTCHA service; review quotas if abuse or legitimate volume grows.

The request UUID is unique. Repeating identical normalized content returns the same application ID, while changed content with the same UUID returns 409. The form rotates the UUID after acknowledged success. If a request has an ambiguous outcome, retry unchanged details first; refresh before making a genuinely new application. Application payloads and provider bodies are not logged.

## Email delivery and safe recovery

Recipient is fixed to `peter@peterbudzak.com`. The message includes country, name, company, email, phone, experience, optional message and application ID. The ID is also in the subject for reconciliation. Reply-to uses the applicant's validated email.

The application row is the durable notification record. An atomic conditional update claims `pending`/`failed` work as `sending`, preventing concurrent sends. HTTP 202 plus `x-message-id` records `accepted`, which means provider acceptance, **not** delivery. Admin “Overiť doručenie” queries MailerSend's message endpoint and records `delivered` or `rejected` when observed.

| State | Operator action |
| --- | --- |
| `pending` | Saved but not yet claimed; use “Odoslať upozornenie”. |
| `failed` | Missing configuration or explicit 4xx rejection; fix the cause, then retry from Partners. |
| `accepted` | Do not resend. Check delivery using the saved provider message ID. |
| `delivered` | Provider confirms delivery; no further sending. |
| `rejected` | Investigate recipient/provider activity before deciding whether to send again. |
| `sending` / `unknown` | A crash, timeout or ambiguous provider response may already have sent the email. Never automatically reset/retry. Search MailerSend using the application ID and reconcile first. |

There is no automatic cron retry in this release. Each saved application immediately attempts delivery; recovery is available in the existing admin console. An operator may reset an ambiguous row to `failed` **only after confirming no email was accepted**, documenting the investigation. If the provider did accept it, record its message ID and `accepted` instead. The design deliberately avoids promising exactly-once delivery across independent database and email transactions. A failed notification never removes an application.

Provider references: [sending email](https://developers.mailersend.com/api/v1/email), [message status](https://developers.mailersend.com/api/v1/email/messages). IP header reference: [Vercel request headers](https://vercel.com/docs/headers/request-headers).

## Environment configuration (names only)

Vercel Production and Preview:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — sensitive, server-only, configured for this release.

Supabase Edge Function runtime:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — platform-provided.
- `MAILERSEND_API_KEY`, `MAILERSEND_FROM_EMAIL`, `MAILERSEND_FROM_NAME` — existing production configuration, reused unchanged.

`.env.local` is ignored by Git. Never print keys or put them in PR descriptions, test evidence or screenshots. Preview currently uses the same Supabase project as production: use clearly marked synthetic test applications, not real prospect data.

## Repeatable testing

- `npx tsc --noEmit`
- `npm run build`
- `npm run check:admin`
- `node scripts/partners/check-notification.mjs` — mocked provider/database tests of concurrent claims, accepted-message deduplication, explicit rejection retries, missing config and ambiguous failure holds; sends no email.
- `PARTNER_TEST_URL=http://localhost:3015 node scripts/partners/check-api.mjs` — invalid payload, body size, origin, consent/honeypot/time validation and unauthenticated admin denial; inserts no records.
- `scripts/partners/check-database.sql` — execute through an authorized SQL connection. All fixtures are inside a rolled-back transaction. Tests idempotency/conflict, quota, public RPC restrictions, anon country read, non-admin isolation and existing founder access. Requires an existing configured admin; staging currently has none, so its admin-specific assertion must be skipped explicitly (do not invent a user).
- Browser: both languages, country targets, calculator (10 gyms × €1,000 × 1% + 2 sales × (€297−€97) × 50% = €300), 390px mobile overflow, success/error states, duplicate request ID, Partners list and status mutation on a test record.
- Real delivery: send an explicitly labeled synthetic application, verify the row, then query MailerSend until `delivered`. Do not equate a build, HTTP 201 or provider 202 with inbox delivery.

## Preserved production baseline

The live deployment `dpl_A1pZVbV8MMZT6z42oPnVitfgCFGv` was uploaded through CLI and contained newer member, trainer, public-profile and routing features absent from Git main. Before release, its 298 relevant source files were recovered and SHA-1-verified against Vercel’s source manifest. They are retained in this branch, with the small Partners tab addition applied on top of the deployed admin console. `docs/country-partner-production-baseline.json` records the source hashes. The original dirty checkout was not modified. This reconciliation is essential: deploying the original PR directly would have removed existing live routes.

## Deployment and rollback

1. Inspect branch, PR head, latest production deployment and migration history. Preserve unrelated local work.
2. Apply reviewed additive migrations to staging; run transactional RLS tests. Apply to production only after successful staging checks, with migration history recorded.
3. Deploy only `partner-application-notify` to the confirmed Supabase project. Other Edge Functions are not redeployed.
4. Configure Vercel server credential, run checks, push the existing PR branch and verify its preview, including a real save/email and admin denial.
5. Merge PR #8 only at the tested head; confirm Git-triggered production deployment is READY and serves the expected commit. Verify both public URLs, calculator, form and existing admin integration on the live deployment.
6. Rollback web code through Vercel if necessary. Keep additive tables and application records; do not drop tables or delete data to roll back the UI. Existing unrelated functions remain independent.

Operationally review failed/pending/unknown notifications and applications regularly. Agree a retention period with the business owner, restrict contact exports, and remove expired IP/request hashes through a separately reviewed retention job. No automatic deletion of existing data is introduced here. Backup and audit practices of the existing Supabase project remain applicable.

## Release evidence (2026-11-01)

- Initial PR head: `97c3345d81a20fe3cb94fbbf2e97f7527352fc66`; original preview `dpl_B56zT3dDwtRr7beAHSJDtbE6d6xb` was build-only evidence.
- Staging: additive schema and transaction tests passed; no configured staging admin, explicitly excluded from its admin assertion.
- Production: both migrations applied; rollback test passed for idempotency, quotas, anon/non-admin isolation and existing founder RLS access.
- Local production build and TypeScript passed; targeted lint and existing admin regression suite passed.
- Browser SK/EN, country selection, calculator, desktop/mobile overflow, successful feedback and duplicate ID passed with no browser runtime errors.
- Existing admin session: Partners list and status update passed on synthetic application only; the temporary test session was revoked.
- Test `db87a4da-44ad-418b-9018-e15bcdc9e24c`: persisted; MailerSend message `6ae77640954541e35794cea1` confirmed `delivered`.
- Second synthetic test `fcf8664e-e89d-410a-b786-d3bddadedb08`: saved and delivery confirmed; duplicate requests returned this same ID. Synthetic records are intentionally retained as audit evidence and clearly labeled TEST.
- Preserved production source: all 298 manifest files match the previous live deployment byte-for-byte, except the intentional Partners tab addition to `components/admin/admin-console.tsx`. Original working checkout content hashes remained unchanged.
- Preview `dpl_417UroKRmg8gbde6DPwqz6K5qjCN`, commit `0cb3bfa6a226acb07ed7158fe95365770cd75974`: READY; SK/EN metadata, mobile, calculator, error/success feedback, real save, duplicate ID, admin list/status and existing member/trainer routes passed. Application `e10ca513-9bf9-40ae-bc79-741f94d464b8` confirmed delivered by MailerSend.
- PR #8 merged into main as `2b2ee475a2f1c2bdde15083f124a9242d60f79e1`.
- Production release `dpl_3ESZhYpKQWoKXpoW4M5PgmiYeUHY` (`befitliner-4rbwa1b1t-peter-budzaks-projects.vercel.app`), that merge commit: READY and assigned to the live domains. The public `/sk/partners` and `/en/partners` URLs on `befitliner.com` preserve the existing 308 redirect to `www.befitliner.com` and load successfully.
- Production browser test passed for both languages, SEO alternates, country selection, €300 calculator case, 390px mobile layout, simulated error feedback, real successful submission/acknowledgement, identical-request retry, anonymous admin denial and existing member/trainer routes. Production admin list and status updates also passed. Browser runtime errors: none.
- Production application `d7654847-59f6-4032-a9a2-6ba614c396bf`: persisted, acknowledged in the browser and confirmed **delivered** by MailerSend.
- Real anonymous HTTP access: application/contract table reads returned 401; calling the notification function with the anon key returned 403.
- Preview and initial production error/fatal runtime-log queries returned no groups during the test window. This is a release-window check, not a claim of continuous monitoring.
- Four explicitly labeled synthetic test applications are retained as audit evidence and marked `rejected` so they are not active candidates. No existing application or user data was deleted.
- This documentation-only follow-up records the verified initial production release above; subsequent builds of the same application code may have newer deployment IDs.

## Partner-page presentation refresh (2026-11-01)

The SK/EN landing page now explains the commercial opportunity and product before qualification requirements. `partner-story.tsx` renders the hero, existing illustrative gym image, real application-interface visual (`/gym.png`), product benefits, division of responsibilities, qualification path and native expandable FAQ. The image is explicitly illustrative, not a customer endorsement. No invented usage statistics, references, support commitments or investment terms are presented.

The calculator starts with 5 gyms, €5,000 monthly payment volume per gym, one new sale and €120 direct cost per sale. Presets for 5/10/25 gyms set 1/2/3 new sales respectively and clearly state that these are illustrative scenarios, not forecasts. All original inputs remain editable. The form explains what follows submission and preserves its existing API contract, consent, idempotency and notification pipeline.

`partner-motion.tsx` adds one-time viewport reveals, complemented by short CSS entrance, hover and result transitions. There are no perpetual animations or autoplay media. `prefers-reduced-motion` disables motion and keeps all content visible; without JavaScript, the static narrative remains visible. Images use Next Image, with only the hero prioritized and the product screenshot lazy-loaded. FAQ is keyboard-operable native `details`/`summary`.

Validation: TypeScript, targeted ESLint and production build passed. Browser checks passed in SK/EN for image loading, all three presets, a custom €300 calculation, synchronized country selectors, keyboard FAQ, 320/390/768px overflow, reduced motion, and request payload/error/success feedback. Form responses were mocked for this presentation-only regression; no new application or email was created. The API, database and MailerSend implementation are unchanged from the verified production release above. The same checks passed on the protected Vercel Preview and on the live production URLs.

Presentation release evidence: PR #9 merged as `46721cc4dd512a344fd4aa9a151f50d858a0b0ac`. Preview `dpl_BHMBPnLtPm2jaz9CTbJC7G2Tp7z8` and production `dpl_5gptgP9jSPRGaqt8VDyof79dSduF` reached READY. Both live language pages passed the browser checks listed above; the production error/fatal runtime-log query returned no groups during verification. This documentation-only follow-up does not change the verified application code.

## Calculator assumptions update (2026-11-01)

At the owner’s request, the calculator now defaults to 10 active gyms and €15,000 monthly volume per gym, with presets for 10/50/100 gyms. The presets retain 1/2/3 new sales and €120 direct cost per sale. Revenue is labeled an illustrative average, not an independently verified regional statistic; the explanatory text clarifies that the calculation assumes this volume is processed through Fitliner. Both SK and EN use the same assumptions.
