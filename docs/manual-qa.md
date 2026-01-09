## Accountability & Safety QA checklist

Use this lightweight runbook to verify trust/safety behavior after deploys or schema changes.

### Setup / seed
- Create a rescue, at least one animal, and an inquiry.
- Insert a sample abuse report for that rescue/animal.
- As service role, insert a `moderation_actions` row with `action_type='suspend'` and `expires_at` in the future to simulate enforcement.

### Expected behaviors
- Suspended/hidden rescues are **absent** from browse/directory pages and their animals/photos are not publicly selectable.
- Public rescue page for a suspended/hidden rescue returns 404 unless viewed by its own members through admin preview.
- Public data only exposes mission/process/contact + verification badge level (no enforcement notes, no reporter identity).
- Admin moderation page:
  - Only allowed admins can load the page; non-admins are redirected.
  - Reports show status chips; filtering by open/closed works.
  - Updating a report to hide/suspend prompts for confirmation and creates a moderation action.
  - Approved verification request updates the rescue’s verification badge.
- Non-admin/rescue members cannot read `moderation_actions`, `verification_audit_log`, or `abuse_reports` tables via RLS.
- Billing guardrail trigger downgrades a rescue to Free when subscription_status is missing/invalid; past_due adds a grace period.

### Quick SQL spot-checks (service role)
- `select * from public.public_rescues where id = '<suspended_rescue_id>';` → empty result.
- `select * from public.abuse_reports;` → only service role should succeed.
- `select * from public.moderation_actions where resolved = false;` → returns queued actions for admins; fails for normal users.

### Regression guard
- Re-run the directory and rescue pages after lifting a suspension (resolved moderation action) to ensure they are visible again.
