-- Phase 18: site details — the visible text and business details that were
-- still in code (src/data/site.ts): the hero headline, navigation and
-- button labels, phone, address, social links, footer tagline and the
-- enquiry form's labels.
--
-- ONE row (singleton, like home_content), seeded with the exact current
-- values, so nothing on the website changes until an admin edits it.
-- The business NAME, link destinations and the form's validation messages
-- stay in code.

create table public.site_settings (
  id                    boolean         primary key default true check (id),

  -- Hero headline: the text, and the last part shown in italic rose
  headline_lead         public.cms_line not null,
  headline_emphasis     public.cms_line,

  footer_tagline        public.cms_line not null,

  -- Navigation labels (the destinations stay in code)
  nav_home              public.cms_line not null,
  nav_services          public.cms_line not null,
  nav_gallery           public.cms_line not null,
  nav_about             public.cms_line not null,
  nav_faq               public.cms_line not null,
  nav_contact           public.cms_line not null,

  -- Buttons and small labels
  enquire_label         public.cms_line not null,
  mobile_enquire_label  public.cms_line not null,
  mobile_call_label     public.cms_line not null,
  menu_label            public.cms_line not null,
  call_prompt           public.cms_line not null,
  footer_explore_heading public.cms_line not null,
  footer_contact_heading public.cms_line not null,
  footer_follow_heading  public.cms_line not null,
  based_in_label         public.cms_line not null,

  -- Contact details (also used for Google business data)
  phone_display         text            not null,
  address_street        public.cms_line not null,
  address_locality      public.cms_line not null,
  address_region        public.cms_line not null,
  address_postcode      text            not null,
  instagram_url         text,
  facebook_url          text,
  tiktok_url            text,

  -- Enquiry form wording
  form_name_label       public.cms_line not null,
  form_email_label      public.cms_line not null,
  form_phone_label      public.cms_line not null,
  form_event_type_label public.cms_line not null,
  form_event_date_label public.cms_line not null,
  form_venue_label      public.cms_line not null,
  form_message_label    public.cms_line not null,
  form_submit_label     public.cms_line not null,
  form_optional_label   public.cms_line not null,
  form_success_title    public.cms_line not null,
  form_success_text     public.cms_text not null,

  updated_at            timestamptz     not null default now(),

  -- A phone number people can call: digits, spaces, + ( ) -; 8–15 digits.
  constraint site_settings_phone_check check (
    phone_display ~ '^\+?[0-9 ()-]{8,24}$'
    and char_length(regexp_replace(phone_display, '[^0-9]', '', 'g')) between 8 and 15
  ),
  constraint site_settings_postcode_check check (address_postcode ~ '^[0-9]{4}$'),
  -- Social links must point at that platform over https (no javascript:, no look-alikes).
  constraint site_settings_instagram_check check (
    instagram_url is null or (char_length(instagram_url) <= 300 and instagram_url ~ '^https://(www\.)?instagram\.com/[^\s]*$')
  ),
  constraint site_settings_facebook_check check (
    facebook_url is null or (char_length(facebook_url) <= 300 and facebook_url ~ '^https://(www\.|m\.)?facebook\.com/[^\s]*$')
  ),
  constraint site_settings_tiktok_check check (
    tiktok_url is null or (char_length(tiktok_url) <= 300 and tiktok_url ~ '^https://(www\.)?tiktok\.com/[^\s]*$')
  )
);

comment on table public.site_settings is
  'Site details (singleton): headline, navigation/button labels, contact details, social links, footer tagline, enquiry form wording. Public read; admins update.';

create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- The current website, exactly (from src/data/site.ts and the enquiry form).
insert into public.site_settings (
  headline_lead, headline_emphasis, footer_tagline,
  nav_home, nav_services, nav_gallery, nav_about, nav_faq, nav_contact,
  enquire_label, mobile_enquire_label, mobile_call_label,
  menu_label, call_prompt, footer_explore_heading, footer_contact_heading, footer_follow_heading, based_in_label,
  phone_display, address_street, address_locality, address_region, address_postcode,
  instagram_url, facebook_url, tiktok_url,
  form_name_label, form_email_label, form_phone_label, form_event_type_label, form_event_date_label,
  form_venue_label, form_message_label, form_submit_label, form_optional_label, form_success_title, form_success_text
) values (
  'Turning moments into', 'masterpieces', 'Turning moments into masterpieces',
  'Home', 'Services', 'Gallery', 'About', 'FAQ', 'Contact',
  'Enquire Now', 'Enquire', 'Call',
  'Menu', 'Prefer to talk?', 'Explore', 'Contact', 'Follow', 'Based in',
  '0426 071 109', 'Duffield Avenue', 'Munno Para', 'SA', '5115',
  'https://www.instagram.com/canvas_creations_and_events/',
  'https://www.facebook.com/share/1EyUpMtEaW/?mibextid=wwXIfr',
  'https://www.tiktok.com/@canvascreations.adl.au',
  'Name', 'Email', 'Phone', 'Type of event', 'Event date',
  'Venue or location', 'Tell us about your celebration', 'Send enquiry', '(optional)', 'Thank you.',
  'We''ve received your enquiry.'
);

-- Same rules as the other singletons: everyone reads, only admins update,
-- nobody inserts a second row or deletes it.
alter table public.site_settings enable row level security;
revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant update on table public.site_settings to authenticated;

create policy "Public can read site_settings" on public.site_settings
  for select to anon, authenticated using (true);

create policy "Admins can edit site_settings" on public.site_settings
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
