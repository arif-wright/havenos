# HavenOS (Phase 1)

HavenOS is a rescue-first adoption CRM that focuses on the three weakest parts of Petfinder: animal listings, inquiry handling, and public adoptables pages. This repository implements the Phase 1 scope with SvelteKit, Supabase, Tailwind CSS, and Resend.

## Tech Stack
- **Frontend**: SvelteKit (App Router) + Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Storage, RLS)
- **Email**: Resend
- **Hosting**: Vercel-compatible (edge-friendly by default)

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a `.env` based on `.env.example`**
   - `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY`: project values from Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: used only on the server for trusted operations (photo uploads, emails)
   - `RESEND_API_KEY` and `RESEND_FROM_EMAIL`: Resend credentials
   - `APP_BASE_URL`: public URL for links inside the emails
3. **Provision the database**
   ```bash
   supabase db push --file supabase/schema.sql
   supabase db push --file supabase/policies.sql
   supabase db push --file supabase/migrations/20251220_phase3.sql
   supabase db push --file supabase/migrations/20251221_phase35.sql
   supabase db push --file supabase/migrations/20251222_phase4.sql
   ```
   The SQL files include all tables, indexes, triggers, and Row Level Security policies described below.
4. **Storage bucket**
   - Create a bucket called `animal-photos`
   - Make it public (read-only) and enable file uploads
5. **Run the dev server**
   ```bash
   npm run dev -- --open
   ```
6. **Lint/check**
   ```bash
   npm run check
   ```

### Auth flow
- Log in via `/admin/login`, which triggers `supabase.auth.signInWithOtp`
- Supabase sends a magic link that redirects to `${APP_BASE_URL}/admin/callback`
- `/admin/callback` exchanges the code/token for a session and redirects to `/admin`
- Protected routes live under `src/routes/(dashboard)/admin/*` and are guarded server-side; `/admin/login` stays public

## Database Overview
File: `supabase/schema.sql`

| Table | Purpose |
| --- | --- |
| `rescues` | Core rescue profile information exposed publicly |
| `rescue_members` | Links Supabase users to a rescue with `owner` / `admin` / `staff` roles |
| `animals` | Main animal record with status, metadata, soft delete, tags |
| `animal_photos` | Ordered photo URLs for each animal |
| `inquiries` | Incoming public inquiries tied to animals and rescues |

Utilities:
- `handle_updated_at()` trigger ensures `animals.updated_at` stays fresh
- `set_inquiry_rescue_id()` trigger copies the associated rescue automatically so the client never needs to trust the submitted `rescue_id`

## Onboarding & Auth Flow
- Admins log in via `/admin/login`
- Supabase emails a magic link that lands on `${APP_BASE_URL}/admin/callback`
- If the account is not yet tied to a rescue, the user is redirected to `/onboarding`
- `/onboarding` collects rescue name, slug, and contact email, creates the rescue, and inserts a `rescue_members` row with role `owner`
- After onboarding the user is redirected to the dashboard at `/admin`

## Row Level Security
File: `supabase/policies.sql`

- **rescues**: anon clients can read (for public pages); authenticated users only see rescues they belong to; owners/admins can update
- **rescue_members**: users can read their memberships and insert themselves; the service key can manage everything
- **animals**: public select limited to active animals in `available` or `hold` statuses; owners/admins can create/update their rescue’s animals
- **animal_photos**: mirrors animal access (owners/admins can mutate, public can view active listings)
- **inquiries**: anyone can insert (limited to active animals); members see their rescue’s inquiries, owners/admins can update status

Policies require RLS to be enabled on every table, so double-check that `auth.uid()` is set for authenticated requests. Public pages are rendered server-side and only expose sanitized data.

## Storage
- Bucket: `animal-photos` (public read)
- Server actions upload with the Supabase service role and derive public URLs
- Photo deletions remove the DB row and attempt to clean up storage objects (path inferred from the public URL)

## Inquiry Flow Summary
1. Public visitor opens `/animal/[id]`
2. Form submit triggers a server action that:
   - Validates payload with Zod
   - Inserts inquiry (RLS enforces the `animal_id` / rescue binding)
   - Sends confirmation email to the adopter via Resend
   - Sends notification email to the rescue contact email
3. Admin dashboard reflects the new inquiry immediately

## Phase 3 CRM additions
- Expanded inquiry statuses: `new`, `contacted`, `meet_greet`, `application`, `approved`, `adopted`, `closed`
- `inquiry_status_history` tracks every status change with who changed it
- `inquiry_notes` stores immutable team notes per inquiry
- `email_logs` records all Resend sends/failures for visibility
- Dashboard slices: new in last 7 days, no response in 48h, animals with zero inquiries
- Inquiry detail page shows pipeline controls, history timeline, notes, and email activity

### Phase 3.5 guardrails
- `first_responded_at` on inquiries; set automatically when status moves from `new` to anything else
- Stale detection: `status = 'new'` and `created_at < now() - 48h` (derived in queries, not stored)
- Dashboard highlights stale inquiries and surfaces average time to first response + stale count
- Inquiry detail shows submitted/first response timestamps and a non-blocking stale warning

### Phase 4 operational leverage
- Team invites (owner/admin) via email; pending invites tracked per rescue
- Roles: owner/admin/staff; staff read-only for team/templates, can add notes and view inquiries
- Saved reply templates per rescue; send from inquiry detail; logged in `email_logs` with `send_type`
- Public trust fields on rescues: mission statement, adoption process, response time
- Animal page “what happens next” derived from rescue info
- Duplicate inquiry hint (same email + animal, last 7 days) is non-blocking

## Development Conventions
- Mutations use SvelteKit server actions for explicit error handling
- The Supabase client is configured per-request in `src/hooks.server.ts`
- Admin routes live under `/admin/*` and are protected by the shared layout load function
- Email templates live in `src/lib/email/templates.ts` and output both text + HTML flavors
- Tailwind CSS utilities + a few composable components reside in `src/lib/components`

## Deployment Checklist
1. Configure environment variables in Vercel (or your host)
2. Supply the Supabase service role key only to the server runtime
3. Enable the `animal-photos` bucket and optionally set a CDN URL
4. Allow magic-link redirects to `${APP_BASE_URL}/admin/callback` in Supabase Auth settings
5. Verify your Resend sending domain/domain warmup
6. Run `npm run build` and deploy the generated adapter output
7. After adjusting environment variables, trigger a fresh Vercel deploy so the new secrets and code paths are picked up by the serverless runtime.

## Assumptions
- Rescue owners are onboarded through the `/onboarding` flow after logging in
- Additional team members can be added directly via the `rescue_members` table (UI planned for a later phase)
- Animal photo uploads go into a single `animal-photos` bucket; deleting photos deletes objects
- Magic-link login is sufficient; there is no password option
- Inquiry confirmation emails originate from a single `RESEND_FROM_EMAIL` address

Reach out in issues if additional capabilities are required before the next phase.
