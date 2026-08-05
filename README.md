This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Fitliner Health funnel

The Slovak paid-acquisition funnel is available at `/sk/health`. It uses the
existing Supabase Health Edge Functions for consent-backed lead capture and
Stripe checkout.

Required deployment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_META_PIXEL_ID=475851925437843 # optional override
META_PIXEL_ID=475851925437843 # optional server-side override
META_GRAPH_API_VERSION=v26.0
META_CONVERSIONS_API_TOKEN=... # server-only; never expose as NEXT_PUBLIC
META_TEST_EVENT_CODE=... # temporary, only while validating Events Manager
```

The Meta Pixel is loaded only after an explicit marketing-tracking opt-in.
Health questionnaire answers and uploaded health data must never be sent to
Meta. Campaign and creative attribution is persisted through UTM parameters;
`fbclid` is retained only when marketing-tracking consent is granted.

Browser and server `CompleteRegistration` events share one `event_id` for
deduplication. `Purchase` must be sent by the authoritative Stripe webhook,
not inferred from a browser success-page visit.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
