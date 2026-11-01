# App feature overview

Public route: `/[locale]/features` in EN, SK, DE, ES, FR, zh-Hans, PL and HU.
Homepage links: visible teaser after the role cards, plus shared footer link.

## Content audit — 2026-11-01

Read-only review of the existing local `fitliner_app` source and documentation. The app checkout contains ongoing work: presence of code is NOT evidence of release to every App Store/Google Play user. The page explicitly qualifies version/account/gym-dependent availability and separates rollout items. No app, database, payment provider, membership or access-control changes are part of this web change.

| Public area | Coverage | Source in app repository |
| --- | --- | --- |
| Daily overview | Nutrition/progress summary, shortcuts, supported pinned entry, diamond balance | `lib/home/redesigned_home_page.part.dart`, `lib/home/home_hub_page.part.dart`, `lib/shell/main_menu_shell.dart` |
| Training | Plans/days/exercise demonstrations, custom exercises, sets/weights/reps, rest timer, repeat workouts, history/records/charts, own-workout offline save/sync, sharing permissions | `lib/trainings/`, `lib/training_diary/`, `docs/training-diary/README.md` |
| Nutrition | Text meal entry and reviewable AI estimates, diary, calories/macros/other nutrients, targets, remaining intake, AI summary | `lib/profile/profile_page.dart` (`_openFoodQuickAdd`, `_estimateFoodViaAI`, `_openFoodAiSummary`), `lib/profile/food_diary_view.dart` |
| Progress | Weight/other measurable goals, entries/charts/completion, sharing and visibility | `lib/profile/profile_page.dart`, `lib/training_diary/diary_progress_share.dart`, `docs/feed/README.md`, latest launch roadmap progress-feed update |
| AI coach | Chat, profile context, permission-dependent diary context; no automatic post-workout-message promise | `lib/messenger/messenger_feature.dart`, `lib/core/personal_coach_fab.dart`, `docs/training-diary/AI_COACH_TRAINING.md` |
| Health | PDF/photo/camera import, confirmation of values/dates, history/charts/score, sourced explanations, active access | `lib/health/health_import_page.dart`, `health_card_page.dart`, `health_score.dart`, `health_service.dart` |
| Gyms | Discovery/profile/contact/hours/rules, membership validity/payment records, supported gift entry, phone entry/history/traffic/reviews | `lib/gym/gym_feature.dart`, `gym_traffic_page.dart`, `gym_reviews_page.dart`, `lib/profile/widgets/buy_me_entry_sheet.dart` |
| Community | Profile search, private messages, friend invitations, workouts/completed-goal sharing, reactions/comments/hide/report, gym announcements | `lib/messenger/README.md`, `lib/feed/`, `docs/feed/README.md`, `lib/gym/gym_feature.dart` |
| Trainers | Profile/specialities/services presentation, public profile, communication, permitted diary collaboration/comments/proposals | `lib/profile/create_trainer_profile_page.dart`, `lib/profile/README.md`, `lib/training_diary/diary_sharing_pages.dart`; excludes unfinished commerce claims |
| Owners | Gym/public-site/contact/rule management, memberships/customers/existing payment/revenue/calendar views, supported access/history/announcements/review replies | `lib/gym/gym_management_page.dart`, `gym_public_website_page.dart`, `gym_feature.dart`; qualifies active system |
| Diamonds | Earning, balance, history and how-to-earn; no active discount/draw promise | Current-state notice at top of `lib/diamond_club/README.md`, `diamond_club_page.dart` |
| Account | Profile/gallery/bio/preferences, language/units, privacy, notifications, password/account deletion | `lib/profile/profile_page.dart`, `lib/notifications/notification_settings_page.dart`, `lib/main.dart` |

## Explicit release boundaries

Latest `docs/launch/LAUNCH_READINESS_ROADMAP.md` (1 November evening) records the new membership checkout endpoint/invoicing blocker. The same roadmap distinguishes trainer/offline work from confirmed releases. Accordingly:

- Existing gym memberships/payment records are described; new universal checkout, expanded invoicing/refunds/payout/export features are NOT promoted as generally available.
- Trainer profile/communication/diary collaboration are covered; new trainer bookings and commerce are rollout items.
- Own-workout offline persistence is distinct from physical offline gym entry, which is not promised as generally available.
- Diamond discounts are future work; the historical competition description is not reused.
- Health access is gated; AI/health output is not presented as diagnosis or guaranteed results.
- Staff-only admin/probe screens, staging tools and release-management infrastructure are not consumer features.

Each locale has the same 12 sections and 36 detail bullets. Keep this coverage matrix and all translations in sync when a feature ships. Preserve availability conditions during copy edits.

The page uses an existing illustrative fitness photograph, explicitly captioned. Existing promotional phone images include older UI/reward claims and were not represented as current screenshots. PL/HU links to related pages without those locales explicitly mark the English fallback.

## Verification

TypeScript, targeted ESLint, production build; dictionary shape/section parity; browser checks for 8 routes, language metadata, navigation anchors, all 12 cards, 36 bullets, availability disclosures, related links, store destinations, mobile widths, and homepage teaser/footer links. No form submissions, payments or physical entry actions are required for this content change.

## Visual hierarchy update — 2026-11-01

- Four illustrated priority cards lead the page: training diary, nutrition, AI coach and supported gym entry. SVG diagrams show the principle, not a claimed app screenshot or real user measurements.
- Progress, health, daily overview and account settings are grouped together; community/diamonds and professional tools follow. Profile/settings no longer sit under community.
- All 12 features and 36 original detail bullets remain server-rendered inside native `details` elements, usable without JavaScript and by keyboard. Four summaries now state the practical benefit directly in all eight languages; schema reads the same content.
- Each feature has a distinct line icon. Text contrast and body size increased. Diagrams animate once on entering the viewport; reduced-motion preferences disable them. Text is never hidden for animation.
- Verification: build/TypeScript/targeted ESLint; browser coverage of all locales at 320/390/768px, all disclosures with keyboard, no-JS access, reduced motion, and desktop/mobile visual review. Store links and localized social metadata remain intact.
