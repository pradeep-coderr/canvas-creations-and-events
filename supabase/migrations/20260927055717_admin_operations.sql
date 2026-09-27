-- Phase 20: admin operations.
--   1. Phone is required on NEW enquiries (existing rows are left untouched).
--   2. Admin roles: admin | super_admin (existing admins become super_admin).
--   3. Business address becomes "Adelaide, South Australia" (street and
--      postcode become optional; the old street/postcode are removed).
--   4. push_subscriptions — Web Push subscriptions of super admins.
--   5. admin_reminders — the admin calendar's reminders.
--   6. Push dispatch without the Supabase secret key: narrow SECURITY DEFINER
--      functions guarded by a dispatch secret (stored in private.app_config,
--      set per environment outside migrations), and a pg_cron job that asks
--      the app to deliver due reminders every minute.

-- ---------------------------------------------------------------------------
-- 1. Phone required for new enquiries
-- ---------------------------------------------------------------------------
-- In the public insert policy (not a table constraint), so admins can still
-- update the status of older enquiries that were sent without a phone.
drop policy "Public can submit new enquiries" on public.enquiries;
create policy "Public can submit new enquiries"
  on public.enquiries
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and phone is not null
    and char_length(btrim(phone)) between 6 and 30
  );

-- ---------------------------------------------------------------------------
-- 2. Admin roles
-- ---------------------------------------------------------------------------
alter table public.admin_users
  add column role text not null default 'admin'
    constraint admin_users_role_check check (role in ('admin', 'super_admin'));

-- The existing admin(s) are the business owner(s): they become super admins.
-- New admins default to 'admin'; roles are changed deliberately (SQL), as
-- admin membership already is.
update public.admin_users set role = 'super_admin';

create function private.is_super_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid()) and a.role = 'super_admin'
  );
$$;
revoke all on function private.is_super_admin() from public;
grant execute on function private.is_super_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Business address: "Adelaide, South Australia"
-- ---------------------------------------------------------------------------
alter table public.site_settings
  alter column address_street drop not null,
  alter column address_postcode drop not null,
  drop constraint site_settings_postcode_check,
  add constraint site_settings_postcode_check check (address_postcode is null or address_postcode ~ '^[0-9]{4}$');

update public.site_settings
   set address_street = null,
       address_locality = 'Adelaide',
       address_region = 'South Australia',
       address_postcode = null;

-- The seeded "Where are you based?" answer names the old suburb. Only the
-- untouched seed text is replaced; an answer an admin has edited is kept.
update public.faqs
   set answer = 'We are based in Adelaide, South Australia.'
 where answer = 'We are based in Munno Para, South Australia.';

-- ---------------------------------------------------------------------------
-- 4. Push subscriptions (super admins; endpoints are capabilities: private)
-- ---------------------------------------------------------------------------
create table public.push_subscriptions (
  id              uuid        primary key default gen_random_uuid(),
  admin_user_id   uuid        not null references public.admin_users (user_id) on delete cascade,
  endpoint        text        not null,
  p256dh          text        not null,
  auth            text        not null,
  user_agent      text,
  notify_enquiries boolean    not null default true,
  notify_reminders boolean    not null default true,
  created_at      timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  revoked_at      timestamptz,
  constraint push_subscriptions_endpoint_key unique (endpoint),
  constraint push_subscriptions_endpoint_check check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  constraint push_subscriptions_keys_check check (char_length(p256dh) between 40 and 200 and char_length(auth) between 10 and 100),
  constraint push_subscriptions_user_agent_check check (user_agent is null or char_length(user_agent) <= 300)
);
create index push_subscriptions_admin_idx on public.push_subscriptions (admin_user_id) where revoked_at is null;

alter table public.push_subscriptions enable row level security;
revoke all on table public.push_subscriptions from anon, authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;

-- A super admin manages only their own subscriptions.
create policy "Super admins manage their own push subscriptions"
  on public.push_subscriptions
  for all
  to authenticated
  using (admin_user_id = (select auth.uid()) and (select private.is_super_admin()))
  with check (admin_user_id = (select auth.uid()) and (select private.is_super_admin()));

-- ---------------------------------------------------------------------------
-- 5. Reminders (shared business calendar: every admin can manage them)
-- ---------------------------------------------------------------------------
create table public.admin_reminders (
  id                 uuid        primary key default gen_random_uuid(),
  created_by         uuid        references public.admin_users (user_id) on delete set null,
  title              text        not null,
  notes              text,
  due_at             timestamptz not null,
  all_day            boolean     not null default false,
  related_enquiry_id uuid        references public.enquiries (id) on delete set null,
  completed_at       timestamptz,
  notified_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint admin_reminders_title_check check (char_length(btrim(title)) between 1 and 200 and title !~ '[\r\n]'),
  constraint admin_reminders_notes_check check (notes is null or char_length(notes) <= 2000)
);
create index admin_reminders_due_idx on public.admin_reminders (due_at);
create index admin_reminders_pending_idx on public.admin_reminders (due_at) where completed_at is null and notified_at is null;
create index admin_reminders_enquiry_idx on public.admin_reminders (related_enquiry_id) where related_enquiry_id is not null;

create trigger admin_reminders_set_updated_at before update on public.admin_reminders
  for each row execute function public.set_updated_at();

alter table public.admin_reminders enable row level security;
revoke all on table public.admin_reminders from anon, authenticated;
grant select, insert, update, delete on table public.admin_reminders to authenticated;

create policy "Admins manage reminders"
  on public.admin_reminders
  for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Calendar needs the event dates of enquiries (already admin-readable).
create index if not exists enquiries_event_date_idx on public.enquiries (event_date) where event_date is not null;

-- ---------------------------------------------------------------------------
-- 6. Push dispatch (no Supabase secret key in the app)
-- ---------------------------------------------------------------------------
-- Per-environment settings, never in migrations or the repo:
--   push_dispatch_secret  shared with the app (PUSH_DISPATCH_SECRET)
--   reminder_webhook_url  e.g. https://<site>/api/push/reminders
create table private.app_config (
  key   text primary key,
  value text not null
);
revoke all on table private.app_config from public, anon, authenticated;

create function private.dispatch_secret_ok(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_secret is not null and length(p_secret) >= 32
     and p_secret = (select value from private.app_config where key = 'push_dispatch_secret');
$$;
revoke all on function private.dispatch_secret_ok(text) from public;

-- Delivery targets for a kind of alert ('enquiry' | 'reminder').
create function public.push_targets(p_secret text, p_kind text)
returns table (endpoint text, p256dh text, auth text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.dispatch_secret_ok(p_secret) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
    select s.endpoint, s.p256dh, s.auth
    from public.push_subscriptions s
    join public.admin_users a on a.user_id = s.admin_user_id and a.role = 'super_admin'
    where s.revoked_at is null
      and ((p_kind = 'enquiry' and s.notify_enquiries) or (p_kind = 'reminder' and s.notify_reminders));
end;
$$;

-- A push service said the subscription is gone (404/410): stop using it.
create function public.revoke_push_endpoint(p_secret text, p_endpoint text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.dispatch_secret_ok(p_secret) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  update public.push_subscriptions set revoked_at = now() where endpoint = p_endpoint and revoked_at is null;
end;
$$;

-- Reminders due within the next 10 minutes (or overdue up to a day), not yet
-- notified: returned once and marked notified, so each is pushed once.
create function public.claim_due_reminders(p_secret text)
returns table (id uuid, title text, due_at timestamptz, all_day boolean, related_enquiry_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.dispatch_secret_ok(p_secret) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
    update public.admin_reminders r
       set notified_at = now()
     where r.completed_at is null
       and r.notified_at is null
       and r.due_at <= now() + interval '10 minutes'
       and r.due_at >= now() - interval '1 day'
    returning r.id, r.title, r.due_at, r.all_day, r.related_enquiry_id;
end;
$$;

revoke all on function public.push_targets(text, text) from public;
revoke all on function public.revoke_push_endpoint(text, text) from public;
revoke all on function public.claim_due_reminders(text) from public;
grant execute on function public.push_targets(text, text) to anon, authenticated;
grant execute on function public.revoke_push_endpoint(text, text) to anon, authenticated;
grant execute on function public.claim_due_reminders(text) to anon, authenticated;

-- Every minute, ask the app to deliver due reminders (does nothing until
-- reminder_webhook_url and push_dispatch_secret are configured).
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create function private.request_reminder_dispatch()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text := (select value from private.app_config where key = 'reminder_webhook_url');
  v_secret text := (select value from private.app_config where key = 'push_dispatch_secret');
begin
  if v_url is null or v_secret is null then
    return;
  end if;
  -- Only when something is actually due: no request every minute otherwise.
  if not exists (
    select 1 from public.admin_reminders
    where completed_at is null and notified_at is null
      and due_at <= now() + interval '10 minutes' and due_at >= now() - interval '1 day'
  ) then
    return;
  end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb
  );
end;
$$;
revoke all on function private.request_reminder_dispatch() from public;

select cron.schedule('canvas-reminder-dispatch', '* * * * *', $$select private.request_reminder_dispatch()$$);
