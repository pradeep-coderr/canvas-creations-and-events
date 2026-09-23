-- Admin access to enquiries.
--
-- Model:
--   * An admin is a Supabase Auth user listed in public.admin_users. Rows are
--     added deliberately (SQL editor / CLI) — there is no self-service path.
--   * Admins may read all enquiries and change ONLY their status.
--   * Nobody may delete enquiries through the API (archive via status instead).
--   * Logged-in non-admins get nothing; the public keeps insert-only access.
--
-- The admin check is a plain RLS subquery on admin_users, which each user can
-- read only for their own row — no SECURITY DEFINER helper needed.

create table public.admin_users (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Auth users allowed into /admin. Managed manually; no API writes.';

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

create policy "Users can see their own admin membership"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Enquiries: admin read + status-only update, on top of the existing public
-- insert-only policy.
grant select on table public.enquiries to authenticated;
grant update (status) on table public.enquiries to authenticated;

create policy "Admins can read enquiries"
  on public.enquiries
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "Admins can update enquiry status"
  on public.enquiries
  for update
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
