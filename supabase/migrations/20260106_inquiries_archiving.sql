-- Add soft-archive fields to inquiries without touching status or existing data
alter table inquiries
	add column if not exists archived_at timestamptz null,
	add column if not exists archived_by uuid references auth.users(id) on delete set null;

create index if not exists idx_inquiries_archived on inquiries(rescue_id, archived_at desc);
