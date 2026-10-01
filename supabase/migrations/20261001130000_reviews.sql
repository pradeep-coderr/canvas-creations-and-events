-- Reviews & feedback (Phase 25).
--
-- Clients leave a star rating and a review on the website. Nothing is public
-- until an admin approves it, and only reviews whose author ticked "OK to
-- publish" can ever be approved; the rest are private feedback for the team.
-- Admins can also add reviews they received elsewhere (source = 'admin').
--
-- Security model (mirrors enquiries):
--   * Visitors (anon) may only INSERT new website reviews, through a
--     column-level grant: they can't choose the status, source or dates,
--     and can't read anything back (the server generates the id).
--   * Visitors may read APPROVED reviews only, and only the public columns
--     (never the email address).
--   * Admins (private.is_admin()) read, approve, hide, add and delete.
--   * A client's own words (name, rating, message, event, consent) can't be
--     edited by anyone afterwards (trigger), so a published review is always
--     what the client wrote.

create table public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text,
  event_type  text,
  rating      smallint    not null,
  message     text        not null,
  can_publish boolean     not null default false,
  status      text        not null default 'new',
  source      text        not null default 'website',
  approved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint reviews_name_check check (char_length(btrim(name)) between 1 and 100 and name !~ '[\r\n]'),
  constraint reviews_email_check check (
    email is null or (char_length(email) <= 254 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
  ),
  constraint reviews_event_type_check check (
    event_type is null or (char_length(btrim(event_type)) between 1 and 100 and event_type !~ '[\r\n]')
  ),
  constraint reviews_rating_check check (rating between 1 and 5),
  constraint reviews_message_check check (char_length(btrim(message)) between 10 and 1500),
  constraint reviews_status_check check (status in ('new', 'approved', 'hidden')),
  constraint reviews_source_check check (source in ('website', 'admin')),
  -- Only with the author's permission; admin-added reviews always have it.
  constraint reviews_publish_consent_check check (status <> 'approved' or can_publish),
  constraint reviews_admin_consent_check check (source <> 'admin' or can_publish)
);

comment on table public.reviews is
  'Client reviews and private feedback. Public only when status = approved (requires can_publish). Never invented.';

create index reviews_approved_idx on public.reviews (approved_at desc) where status = 'approved';
create index reviews_status_idx on public.reviews (status, created_at desc);

create trigger reviews_set_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

-- approved_at follows the status; a client's words are never changed.
create function private.reviews_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.source = 'website' and (
       new.name is distinct from old.name
    or new.email is distinct from old.email
    or new.event_type is distinct from old.event_type
    or new.rating is distinct from old.rating
    or new.message is distinct from old.message
    or new.can_publish is distinct from old.can_publish
    or new.source is distinct from old.source
  ) then
    raise exception 'A client''s review can''t be edited' using errcode = '42501';
  end if;
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status <> 'approved') then
    new.approved_at := now();
  elsif new.status <> 'approved' then
    new.approved_at := null;
  end if;
  return new;
end;
$$;
revoke all on function private.reviews_guard() from public;

create trigger reviews_guard before insert or update on public.reviews
  for each row execute function private.reviews_guard();

alter table public.reviews enable row level security;
revoke all on table public.reviews from anon, authenticated;

-- Visitors: submit (these columns only) and read approved reviews' public columns.
grant insert (id, name, email, event_type, rating, message, can_publish) on public.reviews to anon, authenticated;
-- (status is readable so the site can ask for approved ones; never the email.)
grant select (id, name, event_type, rating, message, status, approved_at) on public.reviews to anon;
-- Admins: everything (RLS below limits it to admins).
grant select, delete on public.reviews to authenticated;
grant insert (status, source) on public.reviews to authenticated;
grant update (status, name, event_type, rating, message) on public.reviews to authenticated;

create policy "Public can submit reviews"
  on public.reviews
  for insert
  to anon, authenticated
  with check (status = 'new' and source = 'website' and approved_at is null);

create policy "Public can read approved reviews"
  on public.reviews
  for select
  to anon
  using (status = 'approved');

create policy "Admins can read reviews"
  on public.reviews
  for select
  to authenticated
  using ((select private.is_admin()));

create policy "Admins can add reviews"
  on public.reviews
  for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins can update reviews"
  on public.reviews
  for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete reviews"
  on public.reviews
  for delete
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Homepage section wording (editable like the other sections)
-- ---------------------------------------------------------------------------
alter table public.home_content
  add column reviews_eyebrow     public.cms_line not null default 'Reviews',
  add column reviews_title       public.cms_line not null default 'Kind words from our clients',
  add column reviews_description public.cms_text not null default 'Celebrated with us? We''d love to hear how it went.',
  add column reviews_empty_text  public.cms_text not null default 'Be the first to share your experience with Canvas Creations and Events.',
  add column reviews_cta_label   public.cms_line not null default 'Leave a review';

-- ---------------------------------------------------------------------------
-- "New review" push alerts (per device, like enquiries and reminders)
-- ---------------------------------------------------------------------------
alter table public.push_subscriptions
  add column notify_reviews boolean not null default true;

create or replace function public.push_targets(p_secret text, p_kind text)
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
      and (   (p_kind = 'enquiry' and s.notify_enquiries)
           or (p_kind = 'reminder' and s.notify_reminders)
           or (p_kind = 'review' and s.notify_reviews));
end;
$$;
revoke all on function public.push_targets(text, text) from public;
grant execute on function public.push_targets(text, text) to anon, authenticated;
