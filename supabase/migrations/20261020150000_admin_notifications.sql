-- Admin → Notifications: one feed of what happened (new enquiries, chats
-- handed to the team, quote details and acceptances, new reviews, due
-- reminders), built from the existing tables. The only new state is when
-- each admin last read the feed, so "new" is the same on every device.

create table public.admin_notification_reads (
  user_id uuid        primary key references public.admin_users (user_id) on delete cascade,
  read_at timestamptz not null default now()
);

comment on table public.admin_notification_reads is
  'When each admin last read Admin → Notifications (items after it show as new).';

alter table public.admin_notification_reads enable row level security;
revoke all on table public.admin_notification_reads from anon, authenticated;
grant select, insert, update (read_at) on table public.admin_notification_reads to authenticated;

-- Each admin reads and moves only their own marker.
create policy "Admins read their own notification marker"
  on public.admin_notification_reads for select to authenticated
  using ((select private.is_admin()) and user_id = (select auth.uid()));
create policy "Admins set their own notification marker"
  on public.admin_notification_reads for insert to authenticated
  with check ((select private.is_admin()) and user_id = (select auth.uid()));
create policy "Admins move their own notification marker"
  on public.admin_notification_reads for update to authenticated
  using ((select private.is_admin()) and user_id = (select auth.uid()))
  with check ((select private.is_admin()) and user_id = (select auth.uid()));
