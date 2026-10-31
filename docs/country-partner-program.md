# Fitliner Country Partner Program — functional and technical specification

Status: **design approved; implementation pending** (2026-10-31). This file documents the intended behavior, not an assertion that the features are deployed.

## Purpose and routes
Recruit and manage exclusive national Fitliner distributors, retaining central ownership of the platform and gym/customer records. Planned public URLs: `/[locale]/partners` (including `/sk/partners`, `/en/partners`); optional `/partners` redirect to the English or localized route. Existing Next.js App Router routes are under `app/[locale]`.

## Visual design
**Reuse the existing gym landing-page visual language**, not the former standalone prototype's green branding. Reference files: `app/[locale]/gyms/page.tsx`, `app/[locale]/gyms/gyms.css`, `app/layout.tsx`.

- Background `#0b0b0e`, text `#faf9ff`, muted `#aba8b6`.
- Purple `#b69aff`; CTAs `#8c5af2`; occasional lime `#c8ff68`.
- Geist sans, existing Fitliner wordmark, mobile-first layout and accessibility/focus rules.
- First release SK/EN; additional languages to follow existing i18n patterns.

## Offer and business rules
1. A candidate picks a country and applies. Country status: open, qualification, exclusive/occupied, paused.
2. A **90-day non-exclusive qualification** period starts only after the application is accepted and a partner agreement is signed.
3. **10 activated paying gyms within 90 days** qualify the partner for consideration for **12 months' exclusivity**. The agreement must define what counts as activated, refunds and verified attribution.
4. Exclusivity renewal depends on a country-specific minimum of **new activated gyms over the contract year**. The historical example is **70 per year**, but thresholds are configuration, not hard-coded worldwide promises. Country population is only an input, not a sufficient basis.
5. Participation in recurring revenue lasts only while the agreed contractual criteria are satisfied. On non-renewal or termination, already-earned commissions remain payable; future commissions follow the agreement and any defined transition period.
6. An indicative split is **50% of the agreed net distributable revenue** after direct attributable costs and adjustments, **not** 50% of gross receipts or all company profit. For a €297 one-off gym sale, allocate actual hardware/shipping/payment/refund costs before split. For the **2% platform transaction fee**, illustrative 1 percentage point may be assigned to the partner, *subject to actual payment processing costs and the final agreement*. Never call this guaranteed or cost-free revenue.
7. Fitliner centrally owns product, platform, technology, customer billing relationships and customer data. Partner leads local promotion, gym acquisition, and duties specified in contract. Local support/installation responsibility remains **to be agreed**.

## Public page acceptance criteria
- Identical Fitliner branding with localized SK/EN text.
- Country selection uses a controlled country table; show **proposed** annual targets until formally approved.
- A transparent revenue calculator with inputs for gym count, monthly gym payment volume, onboarding price and attributable costs; dynamically displays partner share, and labels outputs as *illustrative, not guaranteed*. No invented country occupancy claims.
- Qualification milestones: apply → 90 days / 10 verified gyms → potential 12-month exclusivity → country-specific annual renewal.
- Application form: name, company, email, telephone, country, relevant experience, optional message, privacy consent. Server-side validation, rate limits, anti-spam and acknowledgement/error states.
- Do not present a fake successful application if persistence is unavailable.
- Public pages only show non-personal country settings; partner contacts and metrics are admin-only.
- No unapproved partner-status or earnings claims in marketing copy.

## Proposed Supabase schema
Create migrations under `supabase/migrations` after reviewing existing tables and policies. Suggested entities:

**`partner_countries`**
- `code text primary key` ISO 3166-1 alpha-2, `name text`, `public_status text` enum/check (open, qualifying, exclusive, paused)
- `qualification_gyms integer default 10`, `qualification_days integer default 90`, `annual_new_gyms_target integer` configurable, `target_approved boolean default false`
- `exclusive_partner_id uuid nullable`, `exclusivity_until timestamptz nullable`, `updated_at timestamptz`
- Public read **only** of approved, non-personal country fields, ideally via a curated view.

**`partner_applications`**
- `id uuid primary key`, `country_code text references partner_countries`, `contact_name text`, `company text`, `email text`, `phone text`, `experience text`, `message text`, `privacy_accepted_at timestamptz`
- `status text` (new, reviewing, contacted, accepted, rejected), `created_at timestamptz`, `updated_at timestamptz`, optional `assigned_admin_id uuid`.
- Personally identifying data must **never** be readable via public anon client. Enforce RLS and server-side access. Avoid printing application payloads to logs.

**`country_partners`**
- `id uuid primary key`, `country_code text`, `application_id uuid`, `legal_entity text`, `contract_signed_at timestamptz`, `qualification_started_at timestamptz`, `qualification_ends_at timestamptz`, `exclusivity_started_at timestamptz`, `exclusivity_ends_at timestamptz`, `status text`, `terms_version text`.
- Partner records may be created only by authenticated administrators, never by application submissions.

**`partner_gym_attributions`** (proposed later stage)
- Unique gym-to-partner attribution with gym ID, partner ID, signed/activated timestamps, verified state, refunded/cancelled state and audit history. Eligibility counts require validated events.

**`partner_commission_ledger`** (proposed later stage)
- Append-only transaction references, gross platform revenue, cost deductions, net distributable amount, currency, percentage, partner amount, earned_at, payout status. Reversals as new rows, not silent rewrites.

### Security and operational rules
- All public submissions go through a **server-side route handler** with validation and rate-limiting. Use a server-only Supabase key (never `NEXT_PUBLIC_`); check existing Supabase configuration before adding any env var.
- Admin-only access is enforced by Supabase RLS / trusted server-side authorization; country names and *approved* goals alone may be public.
- Keep explicit contact consent, a privacy notice and retention/deletion policy. GDPR obligations apply.
- One exclusive partner per country at a time: guard with DB constraints/transactional checks, not only UI state.
- Store country thresholds in DB, not JSX. Keep historical contract terms versioned.

## Deploy, test and audit
1. Create and review schema migrations on a test/staging Supabase environment; run policy checks.
2. Build country selector, calculator and application form in existing Next.js code.
3. Verify SK/EN, mobile styles, accessibility and SEO. Test form success/error/duplicate/spam.
4. Verify server validation, RLS and that no anonymous read of applications/partners is possible.
5. Deploy Vercel preview; check migrations separately. Release production only after test and approval.
6. Record the migration filename, deployment ID, final route, env-variable names (never values), admin operation workflow and any changed contract rules in this document.
7. Every future behavior or DB change requires updating this document **in the same pull request**.

## Decisions still open
- Contractual definition of an activated gym and partner attribution.
- Country-specific targets/approval, prospective targets for PL and other countries.
- Technical installation and local support ownership.
- Commission costs, payout timing, taxation, exchange rates, clawback and termination transition.
- Data retention and privacy language.

## Founder email alerts (2026-10-31)
- After an application is **successfully saved** into `partner_applications`, the API attempts a founder notification to `peter@peterbudzak.com` with country, applicant details, experience and application ID. A failed notification does not undo the saved application; the sender logs an error without exposing applicant details.
- Current code uses a **conditional Resend adapter**, only if server-side `RESEND_API_KEY` and `PARTNER_NOTIFICATION_FROM` are configured. Never expose these through `NEXT_PUBLIC_`. No working mail transport has been verified yet.
- Founder indicated that existing website/app notifications may already use a system called “Sandy” (possibly Sendy); identify and preferably reuse the actual verified existing provider before configuring duplicate mailing infrastructure.
- Before releasing, verify sender-domain authentication, delivery to the founder mailbox, failure handling, and add server-side bot protection and rate limiting to the public application endpoint.
