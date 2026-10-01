-- Client request (1 Oct 2026):
--   1. A public contact email, editable in Site details like the phone number.
--   2. "Corporate events" in "What we style" (a real category, not sample).

alter table public.site_settings
  add column contact_email text,
  -- An address people can write to: one @, a dot in the domain, no spaces.
  add constraint site_settings_contact_email_check check (
    contact_email is null
    or (char_length(contact_email) <= 254 and contact_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
  );

update public.site_settings set contact_email = 'ccandevents2242@gmail.com' where contact_email is null;

-- After the existing categories; published; not sample content. Idempotent.
insert into public.categories (slug, label, sort_order, is_published, is_demo)
values (
  'corporate-events',
  'Corporate events',
  coalesce((select max(sort_order) + 1 from public.categories), 0),
  true,
  false
)
on conflict (slug) do nothing;
