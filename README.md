# RescueOS (Model A)

RescueOS is a rescue-first adoption CRM with public pages, inquiries, verification badges, reporting/moderation, and billing-ready tiers. Built with **SvelteKit**, **Supabase** (Postgres/Auth/Storage/RLS), Tailwind, and Resend.

## Getting Started
1) Install dependencies  
```bash
npm install
```
2) Configure environment variables (`.env` based on `.env.example`)
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `APP_BASE_URL` (used for auth/email links)
- `ADMIN_EMAILS` (comma-separated list allowed into /admin/moderation)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_ID` (subscription), `STRIPE_SUPPORT_PRICE_ID` (one-time support)
3) Provision database (order matters)
```bash
supabase db push --file supabase/schema.sql
supabase db push --file supabase/policies.sql
supabase db push --file supabase/migrations/20251220_phase3.sql
supabase db push --file supabase/migrations/20251221_phase35.sql
supabase db push --file supabase/migrations/20251222_phase4.sql
supabase db push --file supabase/migrations/20260106_inquiries_archiving.sql
supabase db push --file supabase/migrations/20260107_profiles_team.sql
supabase db push --file supabase/migrations/20260108_rescue_identity.sql
supabase db push --file supabase/migrations/20260109_model_a.sql
supabase db push --file supabase/migrations/20260110_public_assets.sql
```
4) Storage buckets
- `rescue-media` (public read) for rescue assets
- `public-assets` (public read) for user avatars
5) Run dev server  
```bash
npm run dev -- --open
```
6) Lint/check  
```bash
npm run check
```

## Auth
- Email + password (no magic links). Routes: `/auth/signup`, `/admin/login`.
- Optional Google OAuth (UI placeholder only).
- Admin moderation gate: users whose email is in `ADMIN_EMAILS` can access `/admin/moderation`.

## Key Features
- Public directory `/rescues` with verification badges, adoptable counts, and reporting.
- Public rescue pages `/rescue/[slug]` with mission/process, donation link, badges, report flow.
- Sample page `/rescue/sample` to demo UI.
- For rescues page `/for-rescues`, Support `/support` (one-time sponsor log), Partners `/partners` (lead capture).
- Admin dashboard for animals, inquiries, templates (duplicate), team (profiles), settings (branding, verification submission), billing stub (`/admin/settings/billing`), moderation (`/admin/moderation`).
- Reporting + moderation: `abuse_reports`, `verification_requests`, disable rescue flag.
- Monetization-ready: `plan_tier`, Stripe IDs/period fields on `rescues`; support payments log; partner leads.

## Verification badges
- `verification_status`: `unverified` | `verified` | `verified_501c3`.
- Rescue can submit website/social (and EIN/legal name) in Settings → Verification.
- Admin review in `/admin/moderation` approves/rejects; 501(c)(3) when EIN present.
- Badges shown on directory cards and public rescue pages with tooltips (no gov endorsement implied).

## Policies & Compliance
- Public pages at `/privacy`, `/terms`, `/acceptable-use`, `/refunds`.
- Inquiry data private to rescues; we reserve moderation/suspension for abuse.

## RLS/Storage highlights
- RLS enabled on all tables; admin service-role used for moderation tasks.
- Storage policies for `rescue-media` (rescue-scoped) and `public-assets` (user-scoped).

## TODO (next)
- Wire actual Stripe Checkout buttons/price IDs in production; webhook endpoint is `/api/webhooks/stripe` (Stripe-signature verified).
- Further moderation UX polish and automated notifications.
