# Fitliner gym administration

The Slovak operations console is served at `https://admin.befitliner.com/` and `/admin` on the existing Next.js application. Vercel's existing verified `*.befitliner.com` production domain covers it. The proxy rewrites only the admin host root and marks admin responses private, uncached and noindex.

## Access

Use the existing Fitliner account `peter@peterbudzak.com`, with its password or an emailed sign-in link. No new password is created. The Supabase redirect allowlist includes `https://admin.befitliner.com/admin` and `https://www.befitliner.com/admin`. Sessions use a separate sessionStorage key and are not shared with gym owners or the public site.

Database access is enforced by `gym_admin_access` and `is_gym_console_admin()`, checking the immutable auth user ID plus the currently confirmed auth email. A client-supplied email or profile role cannot grant access. Admin tables use RLS without public policies. All console reads and mutations go through narrowly granted RPCs. Service credentials and Stripe secrets never enter the Next.js client.

The initial allowlist is seeded from an already confirmed existing user. To revoke access, remove that user's row from `gym_admin_access` using the trusted database administration interface. Do not change ordinary gym-owner RLS policies to grant console access.

## Features and source definitions

- Overview: gyms, active paired modules, shipping queue, monthly receipts, recorded commissions and six-month chart.
- Gyms: searchable list, owner/contact details, unique historical and currently valid members, module status, ordered/paid module counts, notes, current fee override, and monthly financial history.
- Orders: all imported Stripe checkout sessions, payment and fulfillment states, quantity, delivery address, gym assignment, tracking, shipment/delivery timestamps and notes. Client pagination uses 25 rows. Unpaid sessions can have no known customer identity.
- Finance: currency-separated monthly and historical gym receipts, refunds, recorded Fitliner commissions, module sales, and CSV export with spreadsheet formula injection protection.
- Leads: the latest 500 optional gym compatibility forms, explicitly distinct from verified orders.
- Activity: last 100 audited operational changes. Fee changes also use the existing `set_fitliner_fee_override` audit mechanism.

Membership counts are distinct members, not membership rows. Active members require active status, valid time bounds and remaining entries for entry-based memberships. A module's active status means it is actively paired; this does not prove it is online or that an unlock succeeded.

Gym receipts use settled `commerce_payments` and historical ThriveCart `user_membership_payments`. Stripe fulfillment's duplicate membership history is excluded. Supported ThriveCart commerce correlations are also excluded to avoid double counting. Amounts are stored and summed in minor currency units, never combined across currencies. Monthly boundaries use Europe/Bratislava. Commerce refunds are allocated to the actual refund month.

Historical ThriveCart data does not contain verified Fitliner fees or a complete refund ledger. Missing fees are counted and displayed as unknown, never estimated from today's percentage. Recorded commissions are revenue before costs/taxes, not accounting profit. Gym turnover excludes unrecorded cash/external sales. Module sales are shown separately, by payment month less currently known cumulative refunds. Changing the current fee does not rewrite historical payment amounts.

## Stripe integration

`supabase/functions/admin-gym-orders` handles authenticated sync and Stripe-signed webhooks. Its public gateway JWT check is disabled intentionally; the handler validates administrator JWTs with Supabase Auth and the database allowlist, and validates Stripe HMAC signatures over the raw request body with a five-minute tolerance. The scheduled sync uses a separate random token that authorizes only synchronization.

The source is intentionally scoped to:

- Stripe account: `acct_1TwSc8CqeksGlIZj` (Fitliner Platform – Globalio LLC)
- Payment Link: `plink_1UEWG3CqeksGlIZjRnsiUZuZ`
- Product: `prod_VF01Wax9OaUYpo`
- Live mode only

Set `GYM_ADMIN_STRIPE_SECRET_KEY` in Supabase Edge Function secrets to a live key for that exact account. Existing keys are only reused if the account ID is verified. The production restricted key is named `Fitliner Admin Orders`. Its resource permissions are Read for Accounts, Checkout Sessions, Payment Intents, Charges and Refunds, Products and Prices; Write for Webhook Endpoints / Event Destinations. All other permissions, including connected-account permissions and payment/refund/payout writes, are disabled. Do not paste secrets into chat or source control.

After configuring the key, call the function with `{"action":"configure_webhook"}` using an authorized admin or service JWT. This creates the dedicated endpoint idempotently and stores its signing secret in the private synchronization table. It listens for completed/expired/asynchronous checkout events, refunds and disputes. Then call `{"action":"sync"}` to import history. A response with `has_more:true` means another call is required; the cursor is persisted. Each call processes at most 100 sessions, in batches of five, without skipping pages on errors.

The production SQL in `supabase/deploy/gym_admin_sync.sql` schedules an import every 15 minutes, catching open and abandoned checkouts even without webhook events. The dashboard shows last successful complete sync and the last error.

Production activation completed on 2026-09-17 after the administrator created and approved the restricted key. It is stored only in Supabase Edge Function secrets. The dedicated webhook is `we_1UGZc5CqeksGlIZjeItdYTzB`. The initial complete sync imported five live checkout sessions (one unpaid and four expired), with no paid module orders. The authenticated production console displays the imported sessions and enabled automatic payment updates. The scheduled synchronization function was also invoked and returned HTTP 200, importing the same five sessions without duplicates; cron job 7 is active every 15 minutes.

Every imported order is retrieved again from Stripe instead of trusting event payload status. A paid session also requires a paid charge. Partial/full refunds and disputes are represented. Older snapshots cannot overwrite newer data, repeat deliveries cannot duplicate orders, and sync preserves operational notes, gym assignment and fulfillment status. Shipment preparation/shipping/delivery require a verified paid or partially refunded order; shipped/delivered requires tracking or a personal handover description. Optimistic revision/timestamp checks prevent silently overwriting another edit.

## Deployment and verification

### Paid module SMS alerts

`20260917100000_gym_order_alerts.sql` adds a private, durable queue for the first verified payment of a module order at EUR 15 per module. Checkout openings, pending payments, other prices/currencies, and payments older than the installation cutoff do not queue alerts. A unique order constraint deduplicates webhook retries and scheduled imports. Pending alerts are canceled if the order is refunded before dispatch. New qualifying payments are queued even while sending is disabled, so setup does not silently discard them.

The recipient is stored in the private `gym_admin_alert_settings` table, and is only shown as its last four digits in the console. Sending is disabled by default. The requested destination ends in `9969`; configure the full E.164 number through the trusted database connection, not in source control.

To activate SMS, connect a funded Twilio account with Slovakia enabled in messaging geographic permissions and a supported sender. Set these Supabase Edge Function secrets:

- `GYM_ADMIN_TWILIO_ACCOUNT_SID`
- `GYM_ADMIN_TWILIO_API_KEY` and `GYM_ADMIN_TWILIO_API_SECRET` (Messages create/read access)
- `GYM_ADMIN_SMS_FROM` (defaults to the alphanumeric sender `Fitliner`)

After verifying the account, sender and recipient, set `gym_admin_alert_settings.enabled=true` using the trusted database administration connection. No credentials are requested in chat or returned by the admin API. As of this implementation, the provider account is not connected and SMS sending remains disabled; no test SMS has been sent.

The Stripe handler starts the sender in a Supabase background task after committing imported orders. The existing 15-minute sync also drains the queue, so a failed notification does not prevent payment synchronization. Atomic claims prevent simultaneous senders from sending the same queue item. A run sends at most three alerts and polls up to three previously accepted messages for delivery receipts. SMS content uses ASCII, includes amount, quantity, an abbreviated order ID and the authenticated admin URL, and excludes customer names/contact data.

Provider acceptance is not reported as delivery. Only a delivery receipt marks an alert delivered. HTTP 429 retries are limited to five attempts. A timeout, ambiguous server response or interrupted sender is marked `unknown` and never automatically resent: check Twilio logs before resolving it. Other failures appear in the console's attention count. Inspect the private queue by `order_id` for details; do not reset an uncertain attempt to pending without confirming that no SMS was accepted by the provider. Sending cannot be made exactly-once across an external provider and a database transaction.

Run `npm run check:order-alerts` for the provider contract and error cases, and `supabase/tests/gym_order_alerts.sql` for rollback-only database tests. No SMS is sent by either test suite. Provider activation still requires a real delivery test to the configured recipient.

References: [Twilio SMS API](https://www.twilio.com/docs/messaging/api/message-resource), [Slovakia sender support](https://www.twilio.com/en-us/guidelines/sk/sms), [Supabase background tasks](https://supabase.com/docs/guides/functions/background-tasks).

### Application deployment

1. Apply `supabase/migrations/20260916190000_gym_admin_console.sql` and then `20260917100000_gym_order_alerts.sql` once through the trusted Supabase management connection. These are additive to the existing Fitliner schema.
2. Run `supabase/tests/gym_admin_console.sql` and `supabase/tests/gym_order_alerts.sql` (all test writes roll back).
3. Deploy `admin-gym-orders` with `--no-verify-jwt` and configure its Stripe key as above.
4. Apply the production scheduler SQL. Do not run this production-specific schedule in staging unchanged.
5. Deploy the Next.js source to the existing Vercel project. The only web environment variables remain the existing public Supabase URL and anon key.

The mobile application repository also manages this Supabase database. Treat this repository's migration as the canonical source for the console extension; coordinate migration history before a full database push from another repository. Never reset the shared database from this web repository.

Checks: `npm run check:admin`, targeted ESLint, TypeScript, production build, existing gym funnel tests, SEO tests and legal-document checks. Database tests cover anonymous access, forged email, secret isolation, audit, note conflicts, order revision conflicts, unpaid shipment rejection, required tracking, idempotent import and out-of-order replay. HTTP smoke checks verify actual anonymous REST denials, bad webhook signatures, host routing, noindex and no-store. Visual fixtures are local-only and are not shipped with the application.

References: [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signinwithotp), [Stripe fulfillment](https://docs.stripe.com/checkout/fulfillment), [Checkout session listing](https://docs.stripe.com/api/checkout/sessions/list).
