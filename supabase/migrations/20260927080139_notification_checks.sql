-- Phase 21: results of the notification self-tests in Admin → Settings.
--
--   1. notification_checks: the last "Send test enquiry email" result
--      (shared by super admins; one row per kind of check).
--   2. push_subscriptions: the last "Send test notification" result for
--      each device.
--
-- Only results are stored: never an API key, a push key or email content.

create table public.notification_checks (
  kind       text primary key check (kind in ('email')),
  ok         boolean not null,
  detail     text not null check (char_length(detail) <= 300),
  checked_at timestamptz not null default now(),
  checked_by uuid references public.admin_users (user_id) on delete set null
);

alter table public.notification_checks enable row level security;

create policy "Super admins read and record notification checks"
  on public.notification_checks
  for all
  to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

grant select, insert, update on table public.notification_checks to authenticated;

alter table public.push_subscriptions
  add column last_test_at timestamptz,
  add column last_test_result text check (last_test_result in ('sent', 'delivered', 'failed')),
  add column last_test_detail text check (char_length(last_test_detail) <= 300);
