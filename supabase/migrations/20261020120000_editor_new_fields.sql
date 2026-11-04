-- Edit website / Content: the parts added to the homepage in October that
-- were still fixed in code, now editable like the rest.
--
--   site_settings: the studio's name above the hero headline (empty hides
--   it), the hero email link's text and the email subject, and the privacy
--   note under the enquiry form with the privacy link's text.
--   home_content: the blurred background photo behind the hero and "The
--   studio" (a library photo; none = the built-in ballroom photo) and
--   whether it's shown at all.
--
-- Defaults are the current wording, so nothing on the website changes until
-- an admin edits it.

alter table public.site_settings
  add column hero_brand         public.cms_line default 'Canvas Creations and Events',
  add column email_link_label   public.cms_line not null default 'Email',
  add column email_subject      public.cms_line not null default 'Enquiry from the website',
  add column privacy_note       public.cms_text not null
    default 'We use your details to reply to you, and note a few things about the visit to keep spam out.',
  add column privacy_link_label public.cms_line not null default 'Privacy policy';

alter table public.home_content
  add column background_image_id   uuid,
  add column background_image_kind text not null default 'image' check (background_image_kind = 'image'),
  add column show_background       boolean not null default true,
  -- Like the hero photo: a photo in use can't be deleted from the library.
  add constraint home_content_background_image_fkey foreign key (background_image_id, background_image_kind)
    references public.media_assets (id, kind) on delete restrict;

-- Visitors can see the background photo (the same rule as every photo the
-- homepage uses; storage access follows this policy).
drop policy "Public can read media used by visible content" on public.media_assets;
create policy "Public can read media used by visible content"
  on public.media_assets
  for select
  to anon, authenticated
  using (
    exists (select 1 from public.services s where s.image_id = media_assets.id)
    or exists (select 1 from public.gallery_items g where g.media_id = media_assets.id)
    or exists (select 1 from public.home_content h where h.hero_image_id = media_assets.id)
    or exists (select 1 from public.home_content h where h.background_image_id = media_assets.id and h.show_background)
    or exists (select 1 from public.about_content a where a.image_id = media_assets.id)
    or exists (
      select 1 from public.video_story v
      where v.video_media_id = media_assets.id or v.poster_id = media_assets.id
    )
    or exists (select 1 from public.films f where f.video_media_id = media_assets.id)
    or (kind = 'image' and (select private.is_published_film_poster(media_assets.id)))
    or exists (select 1 from public.event_stories e where e.image_id = media_assets.id)
    or exists (select 1 from public.event_story_images i where i.media_id = media_assets.id)
  );
