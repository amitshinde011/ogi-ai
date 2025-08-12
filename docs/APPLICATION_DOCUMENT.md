# Yogi AI – Application Document (All‑in‑One)

Version: 1.0  
Last updated: 2025-08-12  
Owner: Yogi AI Team

## 1. Executive Summary
Yogi AI is a wellness and mindfulness platform that delivers personalized programs, habit tracking, recipe guidance, community engagement, and progress insights. Built with React + TypeScript and Supabase, it supports robust offline-first behavior via IndexedDB and real-time updates when online.

Primary goals:
- Increase daily active users and completion of wellness goals
- Improve retention via community and streaks
- Enable smooth payments globally (Razorpay India, Braintree International)

Key outcomes (12 months):
- DAU/MAU ≥ 35%
- 30-day retention ≥ 25%
- Subscription conversion ≥ 4%

## 2. Scope
In scope:
- Auth (Supabase Auth, Google OAuth)
- Profile setup and personalization
- Programs and subscriptions with multi-gateway payments
- Daily wellness tracking: water, Surya Namaskar, meditation
- Steps tracking via Capacitor plugin
- Recipes (browse, save)
- Community posts, comments, likes
- Progress dashboards: Daily, Weekly, Journey (real-time updates)
- Offline-first experience with background sync

Out of scope (current):
- Native push notifications beyond web notifications
- Advanced coaching (1:1) and telehealth

## 3. Personas and Journeys
- Starter Seeker: explores free content, tries basic tracking
- Consistent Practitioner: subscribes to a program, uses daily tracking
- Community Builder: posts, comments, drives engagement

High-level journey: Signup → Profile Setup → Select Program → Payment → Daily tracking (water/steps/yoga/meditation) → Recipes → Community → Progress insights → Renew/upgrade.

## 4. Functional Requirements
4.1 Authentication
- Google OAuth (web and native).  
- Session persistence, auto-refresh, and protected routes.

4.2 Profile & Onboarding
- Basic info, activity preferences, photo upload.  
- Onboarding progress saved and resumable.

4.3 Programs & Subscriptions
- Browse programs, pricing, coupon codes, taxes.  
- Payment via gateway selection by country: Razorpay (INR) or Braintree (USD).  
- Free access via 100% coupons.

4.4 Payments
- Edge function /process-payment supports create_payment_session and verify_payment.  
- Orders recorded with verification and webhooks.

4.5 Wellness Tracking (Daily)
- Water intake (0.25L increments), Surya Namaskar counts, meditation completed boolean.  
- Steps from device plugin; fallbacks for web.  
- Immediate local state update; queued sync; conflict resolution via updated_at (LWW).

4.6 Recipes
- Browse by category, view detail, save/unsave.  
- Nutrition info display.

4.7 Community
- Create posts with images (R2), like, comment, report.  
- Real-time counters and thread updates.

4.8 Progress Dashboards
- Daily tab: today’s data cards and charts.  
- Weekly tab: last 7 days with aggregates.  
- Journey tab: long-term trend lines; listens to wellness/steps/meal events and re-renders in real-time (same offline-first rules).

4.9 Notifications & Messages
- In-app notifications; conversations and messages storage.  
- Presence indicators via Supabase Realtime where applicable.

## 5. Non‑Functional Requirements
- Performance: LCP < 2.8s on mid-range devices; code-splitting and lazy loading.  
- Availability: graceful offline operation; retry on reconnect.  
- Security: RLS on all user data; input sanitization; secure payments.  
- Accessibility: WCAG AA.  
- Privacy: GDPR-aligned storage and deletion flows.

## 6. Architecture Overview
Frontend: React 18, TypeScript, Vite, Tailwind with design tokens, shadcn/ui.  
Routing: React Router v6.  
State/data: React Query + custom hooks; IndexedDB for offline cache; background sync queue.  
Backend: Supabase (Postgres, Auth, Realtime, Storage proxy).  
Edge Functions (Deno): payment processing, media helpers, content refresh, group purchase, etc.  
Media: Cloudflare R2 for uploads; HLS for video.

Key components/pages: Home, Progress, Recipes, Community, Settings, Subscriptions, Auth pages.  
Real-time: Supabase channels for post interactions and live counters.

## 7. Data Model Summary
Authentication & Users
- auth.users (managed)  
- user_profiles, user_onboarding

Subscriptions
- programs, user_subscriptions, orders, coupon_codes

Content
- recipes, user_saved_recipes

Community
- community_posts, community_post_likes, community_post_comments, followers

Progress
- daily_wellness (date, water_litres, surya_namaskar_count, meditation_completed, updated_at)  
- steps_tracking (date, steps_count, updated_at)  
- meal_tracking (date, meal_type)

Communication
- conversations, conversation_participants, messages, notifications

RLS: All user-scoped tables enforce auth.uid() = user_id.

## 8. APIs & Edge Functions
- process-payment: POST actions create_payment_session, verify_payment  
  Request (create): { action, programId, gateway, amount, currency }  
  Request (verify): { action, orderId, transactionId, gateway }
- generate-signed-video-urls: returns time-limited HLS URLs.
- get-meditation-audio: returns signed audio URLs/metadata.  
- upload-to-r2: server-side upload flow with validation.  
- refresh-community-feed: background refresh helpers.  
- group purchase: create-group-purchase, get-group-purchase, join-group-purchase.

All endpoints require proper auth (except setup utilities configured in Supabase).

## 9. Offline‑First & Sync Strategy
- Cache: IndexedDB stores daily_wellness, steps_tracking, meal_tracking, key profile snippets.  
- Read path: prefer IndexedDB; when online, merge with latest DB by updated_at; de-dup by date+user.  
- Write path: optimistic UI → queue → attempt online upsert; if offline, persist in queue; on reconnect, flush with conflict resolution (LWW).  
- Eventing: emit wellnessUpdated, stepsUpdated, mealLogged, progressDataInvalidated to re-render dashboards (Daily/Weekly/Journey).  
- Network guards: suppress network calls when offline to avoid console noise.

## 10. Video System
- HLS with quality selection and auto-adaptive behavior.  
- Resume progress and watched state; signed URLs via edge function.

## 11. Analytics & Monitoring
- GA4 for page and custom events (goal completions, conversions).  
- Error boundaries in React; console error logging; Supabase logs for DB and functions.  
- KPIs tracked: DAU/MAU, subscription conversion, stickiness, weekly active streaks, community engagement.

## 12. Security
- Supabase RLS everywhere; minimal policy principle.  
- Input sanitization and XSS protection for UGC.  
- Payment tokenization; no card data stored.  
- Secrets in Supabase config; key rotation procedures.

## 13. Testing Strategy
- Unit: utils and hooks.  
- Integration: API calls, edge functions via staging.  
- E2E: core user flows (auth → payment → tracking → progress → community).  
- Visual regression for critical pages.  
- Performance checks (Lighthouse) in CI.  
- Offline simulation tests (toggle network) ensuring smooth UI and no failed requests.

## 14. Deployment & Environments
- Hosting: Lovable platform with automatic builds.  
- Supabase project configured via config.toml; secrets set in dashboard.  
- CDN for static assets; image optimization; caching.  
- Rollbacks supported via Lovable deployment history.

## 15. Operations & Runbooks
Common incidents:
- Payment failures: retry verify_payment; check gateway dashboards.  
- Realtime desync: reconnect channel; refetch hooks.  
- Offline queue stuck: inspect IndexedDB queue; clear and reattempt; logs in console.  
- Media upload issues: validate R2 credentials and bucket policies.

On-call quick checks:
- Supabase status, function logs, DB row counts, error rate in GA4, recent deploys.

## 16. Privacy & Compliance
- User consent for analytics and cookies where applicable.  
- Data minimization; user deletion flow.  
- Export user data on request.

## 17. Roadmap (Next 2 Quarters)
- Q1: Enhanced community moderation tools; richer recipe filters; improved streak mechanics.  
- Q2: Push notifications; social sign-ins expansion; coach-led programs beta.

## 18. Routes Map (Web)
- /, /login, /signup, /home, /progress, /recipes, /community, /messages, /settings, /subscriptions, /profile, /profile/edit, /upload, /payment, /terms, /privacy, /contact.

## 19. Glossary
- LWW: Last Write Wins, conflict strategy using updated_at.  
- RLS: Row Level Security for per-user access control.  
- HLS: HTTP Live Streaming for adaptive video.

## 20. References
- PROJECT_OVERVIEW.md, PROJECT_STRUCTURE.md, DEVELOPMENT_SETUP.md, DEPLOYMENT.md, API_DOCUMENTATION.md, API_REFERENCE.md, TROUBLESHOOTING.md.
