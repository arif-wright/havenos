# Token Expiry & Revocation QA

- Shortlist expiry: create shortlist via `/api/shortlists`; in SQL set `expires_at` to past; hit `/saved/{token}` and expect 404 + “link expired or was revoked”.
- Shortlist revoke: create shortlist, call `POST /api/shortlists/revoke` with token, refresh `/saved/{token}` and expect 404; UI should show revoke message on /saved page.
- Inquiry close → expiry set: update inquiry status to `closed` or `adopted`; verify `closed_at` is set and `public_token_expires_at = closed_at + 30 days`; timeline link still works before cutoff.
- Inquiry revoke: in admin inquiry detail, click “Revoke public link”, confirm badge shows Revoked; public page `/inquiry/{token}` should 404.
- Public page safety: verify `/inquiry/{token}` payload omits notes/assignees/moderation fields and only includes status, timestamps, rescue public contact, pet name/photo.
