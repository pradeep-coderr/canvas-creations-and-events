-- Enquiries submitted through the public website form (src/lib/submit-enquiry.ts).
--
-- Security model:
--   * Public roles (anon, authenticated) may INSERT the visitor-supplied
--     columns only. They cannot choose id, status or timestamps.
--   * Nobody but the service role can SELECT, UPDATE or DELETE. Admin access
--     will be granted later through explicit, role-checked policies.
--   * Validation lives in the shared Zod schema (client + server); the
--     constraints below are the database's own last line of defence.

create table public.enquiries (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  phone       text,
  event_type  text,
  event_date  date,
  venue       text,
  message     text        not null,
  status      text        not null default 'new',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint enquiries_status_check
    check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'archived')),
  constraint enquiries_name_check
    check (char_length(btrim(name)) between 1 and 100),
  constraint enquiries_email_check
    check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint enquiries_phone_check
    check (phone is null or char_length(phone) <= 30),
  constraint enquiries_event_type_check
    check (event_type is null or char_length(event_type) <= 100),
  constraint enquiries_venue_check
    check (venue is null or char_length(venue) <= 200),
  constraint enquiries_message_check
    check (char_length(btrim(message)) between 1 and 2000)
  -- "Event date not in the past" is enforced by the Zod schema only: a
  -- current_date CHECK would make older rows fail on dump/restore.
);

comment on table public.enquiries is
  'Enquiries from the public website form. Public roles may insert only; no public reads.';

-- Future admin: list newest first, and filter by status newest first.
create index enquiries_created_at_idx on public.enquiries (created_at desc);
create index enquiries_status_created_at_idx on public.enquiries (status, created_at desc);

-- Keep updated_at current on every change.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger enquiries_set_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

-- Row Level Security: deny by default; only the insert policy below opens access.
alter table public.enquiries enable row level security;

-- Least privilege at the grant level too: remove Supabase's default table
-- privileges from public roles, then allow INSERT on the visitor columns only.
revoke all on table public.enquiries from anon, authenticated;
grant insert (name, email, phone, event_type, event_date, venue, message)
  on table public.enquiries to anon, authenticated;

create policy "Public can submit new enquiries"
  on public.enquiries
  for insert
  to anon, authenticated
  with check (status = 'new');
