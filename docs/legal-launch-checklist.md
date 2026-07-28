# Fitliner legal launch checklist

The public documents describe the current product and intended controls. They are not a substitute for implementing those controls. Complete and evidence the following before publishing the 2026-07-28 versions.

## P0 — required before publication

- [ ] Have qualified counsel review all six language versions for every country where Fitliner is actively offered. Consumer and privacy rights cannot be waived by contract.
- [ ] Assess GDPR Article 27. Globalio LLC is established in the United States and expressly offers Services in the EEA. If the limited exception does not apply, appoint an EU representative and add its identity and contact details to every Privacy Policy.
- [ ] Complete and record a GDPR DPIA for Fitliner Health, document extraction, AI Coach health personalisation, public progress/food visibility, messaging and access-control logs. Record the separate DPO assessment.
- [ ] Verify that production deletion jobs enforce the public retention commitments, including the 30-day account-deletion schedule, 24-month access/funnel limits and 90-day backup rotation. Change the Policy before launch if the systems cannot meet a stated period.
- [ ] Provide a reliable in-app account-deletion initiation flow and a public web deletion route. Deletion must cover Supabase account data and stored files, while isolating only documented legal holds. Test the Apple and Google requirements end to end.
- [ ] Add a separate, unticked consent for health data and a complete withdrawal flow. Withdrawal must stop health-dependent AI processing and delete or isolate affected Health data without blocking unrelated account features.
- [ ] At the EU checkout, obtain any legally required express request for immediate performance and acknowledgement concerning the withdrawal period. Preserve the exact text, timestamp and checkout version.
- [ ] Confirm the seller/merchant-of-record identity, recurring price, renewal period, cancellation method, refund support and tax role in every checkout and receipt. Test Link subscription-management URLs and failed-payment handling.

## P1 — contracts, records and product controls

- [ ] Maintain the Article 30 record of processing, data-flow map, lawful-basis assessment and legitimate-interest assessments matching the published Policy.
- [ ] Execute and archive appropriate DPAs and international-transfer safeguards with Supabase, OpenAI, Google/Firebase, Stripe/Link, MailerSend, TTLock/access providers, Vercel and any other production subprocessor. Record each independent-controller role separately.
- [ ] Confirm OpenAI API configuration and contract terms for Health files and AI Coach data, including the requested non-storage setting, provider abuse retention and prohibition on model training where promised.
- [ ] Give users clear audience controls before profile, progress or recent food data becomes visible. Default sensitive or health-revealing fields to private and log changes.
- [ ] Give gyms and trainers their own controller/processor allocation, DPA, member-notice obligations, data-export/deletion workflow, seller terms and incident-cooperation process.
- [ ] Implement an operational illegal-content notice and appeal queue with timestamps, reasoned decisions, abuse controls and escalation ownership.
- [ ] Reconcile Apple privacy labels, Google Play Data safety, permission prompts and website cookie/marketing choices with the real data flows in every production build.
- [ ] Maintain incident response, access review, secret rotation, vulnerability intake and evidence-preservation procedures. Terms against scraping, false reports or competitor abuse only help when technical controls and evidence exist.

## Release evidence

- [ ] Archive the exact legal Markdown commit, translation review, counsel approval, effective date and material-change notice.
- [ ] Run `npm run check:legal`, targeted ESLint, TypeScript and route checks for all 12 legal pages.
- [ ] Verify localized account-deletion links, support mailbox handling and subscription cancellation instructions with a test account in each purchase channel.
