-- Phase 3.5 guardrails migration

-- Add first_responded_at to inquiries
alter table inquiries
    add column if not exists first_responded_at timestamptz null;
