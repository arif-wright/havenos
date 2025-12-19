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
   ```
   The SQL files include all tables, indexes, triggers, and Row Level Security policies described below.
4. **Storage bucket**
   - Create a bucket called `animal-photos`
   - Make it public (read-only) and enable file uploads
5. **Create rescues and admins**
   - Insert rows into `rescues`
   - Insert `rescue_admins` rows that map Supabase Auth user IDs to a rescue
   - Admins authenticate via magic links from the `/admin/login` page
6. **Run the dev server**
   ```bash
   npm run dev -- --open
   ```
7. **Lint/check**
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
| `rescue_admins` | Maps Supabase users to a rescue (supports multi-admin) |
| `animals` | Main animal record with status, metadata, soft delete, tags |
| `animal_photos` | Ordered photo URLs for each animal |
| `inquiries` | Incoming public inquiries tied to animals and rescues |

Utilities:
- `handle_updated_at()` trigger ensures `animals.updated_at` stays fresh
- `set_inquiry_rescue_id()` trigger copies the associated rescue automatically so the client never needs to trust the submitted `rescue_id`

## Row Level Security
File: `supabase/policies.sql`

- **rescues**: public read access; updates limited to admins assigned to the rescue
- **rescue_admins**: admins read their own memberships; service role manages assignments
- **animals**: public select limited to active animals in `available` or `hold` statuses; authenticated admins can fully manage their own records
- **animal_photos**: mirrors animal access (public can only view media for active animals)
- **inquiries**: anyone can insert (limited to active animals); admins see and update inquiries for their rescue only

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

## Assumptions
- Rescue admins are created manually in Supabase during Phase 1
- Animal photo uploads go into a single `animal-photos` bucket; deleting photos deletes objects
- Magic-link login is sufficient; there is no password option
- Inquiry confirmation emails originate from a single `RESEND_FROM_EMAIL` address

Reach out in issues if additional capabilities are required before the next phase.
