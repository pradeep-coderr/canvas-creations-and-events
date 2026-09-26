-- Phase 16: media library, image uploads and hybrid video.
--
-- Additive on top of Phase 13 (nothing is dropped):
--   * media_assets gains an explicit provider:
--       image → provider 'supabase', file in the private "cms-media" bucket
--       video → provider 'youtube' | 'vimeo' (a link) or 'stream' (an
--               uploaded-video provider such as Cloudflare Stream; never
--               stored in Supabase)
--     plus a normalized external id, the source URL, a title and upload
--     metadata. Images must carry alt text and real dimensions.
--   * video_story now points at a video media row whose provider must match
--     (composite FK). The Phase 14 embed_url column is superseded: any link
--     saved there is carried over into media_assets, then it stays NULL.
--   * Optional image references (services, hero, about) become ON DELETE
--     RESTRICT, like gallery and video media already are: a photo that is
--     still used can't be deleted and silently blank content.
--   * Storage bucket "cms-media" (private, images only) with RLS: visitors
--     can read an object only if its media_assets row is visible to them
--     (i.e. used by published content); only admins upload and delete, and
--     only at application-generated paths.

-- ---------------------------------------------------------------------------
-- media_assets
-- ---------------------------------------------------------------------------

alter table public.media_assets
  add column provider          text not null default 'supabase',
  add column external_id       text,
  add column source_url        text,
  add column title             text,
  add column original_filename text,
  add column mime_type         text,
  add column file_size         integer;

-- Videos live elsewhere, so they have no storage path.
alter table public.media_assets alter column storage_path drop not null;

alter table public.media_assets
  add constraint media_assets_provider_check
    check (provider in ('supabase', 'youtube', 'vimeo', 'stream')),
  -- Each kind has exactly one kind of source.
  add constraint media_assets_source_check check (
    (kind = 'image' and provider = 'supabase'
      and storage_path is not null and external_id is null and source_url is null
      and width is not null and height is not null)
    or (kind = 'video' and provider in ('youtube', 'vimeo', 'stream')
      and storage_path is null and external_id is not null and title is not null)
  ),
  -- Application-generated image paths only (the bucket policy enforces the same).
  add constraint media_assets_image_path_check check (
    storage_path is null
    or storage_path ~ '^images/(library|hero|founder|services|gallery|posters)/[0-9a-f-]{36}\.(jpg|png|webp)$'
  ),
  -- Normalized ids, so nothing has to parse URLs at render time.
  add constraint media_assets_external_id_check check (
    external_id is null
    or (provider = 'youtube' and external_id ~ '^[A-Za-z0-9_-]{11}$')
    or (provider = 'vimeo' and external_id ~ '^[0-9]{6,12}(:[0-9a-f]{6,32})?$')
    or (provider = 'stream' and external_id ~ '^[A-Za-z0-9_-]{1,64}$')
  ),
  -- The original link, for the admin. Same hosts as the Phase 13 embed rules.
  add constraint media_assets_source_url_check check (
    source_url is null
    or (char_length(source_url) <= 500 and source_url !~ '\s' and (
      (provider = 'youtube' and source_url ~ '^https://(www\.|m\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)/.+$')
      or (provider = 'vimeo' and source_url ~ '^https://(www\.|player\.)?vimeo\.com/.+$')
    ))
  ),
  add constraint media_assets_title_check
    check (title is null or (char_length(btrim(title)) between 1 and 200 and title !~ '[\r\n]')),
  add constraint media_assets_original_filename_check
    check (original_filename is null or char_length(original_filename) between 1 and 200),
  add constraint media_assets_mime_type_check
    check (mime_type is null or mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  add constraint media_assets_file_size_check
    check (file_size is null or file_size between 1 and 10485760),
  add constraint media_assets_dimensions_check
    check ((width is null or width <= 20000) and (height is null or height <= 20000)),
  -- Target for the video_story FK below (media id + kind + provider).
  add constraint media_assets_id_kind_provider_key unique (id, kind, provider);

-- One library entry per external video.
create unique index media_assets_external_video_key
  on public.media_assets (provider, external_id)
  where external_id is not null;

comment on column public.media_assets.provider is
  'supabase = image in the cms-media bucket; youtube / vimeo = linked video; stream = uploaded-video provider (not Supabase).';

-- ---------------------------------------------------------------------------
-- Stricter delete protection for optional images
-- ---------------------------------------------------------------------------

alter table public.services drop constraint services_image_fkey;
alter table public.services
  add constraint services_image_fkey foreign key (image_id, image_kind)
    references public.media_assets (id, kind) on delete restrict;

alter table public.home_content drop constraint home_content_hero_image_fkey;
alter table public.home_content
  add constraint home_content_hero_image_fkey foreign key (hero_image_id, hero_image_kind)
    references public.media_assets (id, kind) on delete restrict;

alter table public.about_content drop constraint about_content_image_fkey;
alter table public.about_content
  add constraint about_content_image_fkey foreign key (image_id, image_kind)
    references public.media_assets (id, kind) on delete restrict;

-- ---------------------------------------------------------------------------
-- video_story → video media
-- ---------------------------------------------------------------------------

-- Carry over a YouTube/Vimeo link saved with the Phase 14 model (if any).
-- Two statements: an UPDATE can't see rows inserted by a CTE of the same
-- statement.
create function pg_temp.video_link_id(provider text, url text) returns text
language sql immutable as $$
  select case provider
    when 'youtube' then substring(url from '(?:[?&]v=|youtu\.be/|/embed/|/shorts/|/live/)([A-Za-z0-9_-]{11})')
    when 'vimeo' then substring(url from 'vimeo\.com/(?:video/)?(?:[^/?#]+/)*?([0-9]{6,12})')
  end
$$;

insert into public.media_assets (kind, provider, external_id, source_url, title)
select 'video', provider, pg_temp.video_link_id(provider, embed_url), embed_url, coalesce(video_title, 'Video')
from public.video_story
where provider in ('youtube', 'vimeo') and embed_url is not null
  and pg_temp.video_link_id(provider, embed_url) is not null
on conflict do nothing;

update public.video_story v
set video_media_id = m.id, embed_url = null
from public.media_assets m
where v.provider in ('youtube', 'vimeo') and v.embed_url is not null
  and m.kind = 'video' and m.provider = v.provider
  and m.external_id = pg_temp.video_link_id(v.provider, v.embed_url);

-- Anything that couldn't be carried over (unparseable link, or the never-
-- usable Phase 14 'upload' option) becomes "no video" rather than failing.
update public.video_story
set provider = null, video_media_id = null, embed_url = null, poster_id = null, video_title = null, caption = null
where provider = 'upload' or (provider is not null and video_media_id is null);

alter table public.video_story
  drop constraint video_story_provider_check,
  drop constraint video_story_video_check;

alter table public.video_story
  add constraint video_story_provider_check check (provider in ('youtube', 'vimeo', 'stream')),
  add constraint video_story_video_check check (
    embed_url is null
    and (
      (provider is null
        and video_media_id is null and poster_id is null and video_title is null and caption is null)
      or (provider is not null and video_media_id is not null and video_title is not null)
    )
  ),
  -- The chosen video must be a video of that provider.
  add constraint video_story_video_provider_fkey foreign key (video_media_id, video_kind, provider)
    references public.media_assets (id, kind, provider) on delete restrict;

comment on column public.video_story.embed_url is
  'Superseded in Phase 16: video links live in media_assets (provider, external_id, source_url). Always NULL.';

-- ---------------------------------------------------------------------------
-- Storage: private bucket for CMS images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media', 'cms-media', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Read: an object is readable when its media_assets row is visible to the
-- caller. That subquery runs under media_assets RLS, so visitors can read
-- only images used by published content; admins can read all of them.
create policy "CMS media: read images the caller may see"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'cms-media'
    and exists (select 1 from public.media_assets m where m.storage_path = storage.objects.name)
  );

-- Admins also read uploads that are still being processed.
create policy "CMS media: admins read everything in the bucket"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'cms-media' and (select private.is_admin()));

-- Upload: admins only, and only at application-generated paths (a raw upload
-- under incoming/, or a processed image under images/<use>/).
create policy "CMS media: admins upload images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cms-media'
    and (select private.is_admin())
    and name ~ '^(incoming/[0-9a-f-]{36}|images/(library|hero|founder|services|gallery|posters)/[0-9a-f-]{36}\.(jpg|png|webp))$'
  );

-- Delete: admins only. (No update policy: stored images are never overwritten.)
create policy "CMS media: admins delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'cms-media' and (select private.is_admin()));
