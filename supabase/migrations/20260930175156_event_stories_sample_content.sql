-- Phase 23: sample (demo) content and event stories.
--
--   1. is_demo on the content that can hold temporary sample material
--      (gallery photos, categories, films, event stories). The admin shows
--      "SAMPLE / DEMO CONTENT"; the public site labels it "Sample".
--   2. media_assets.credit / credit_url: where a library photo came from
--      (e.g. a stock-photo page), so sample images stay traceable.
--   3. event_stories (+ event_story_images): editorial stories of a
--      celebration: one main photo, optional extra photos, styling notes,
--      optional location and an optional REAL testimonial (from the existing
--      testimonials list; never invented).
--   4. Public media access for published stories; wording for the section.
--
-- No content is inserted here: sample content is added through the CMS.

-- ---------------------------------------------------------------------------
-- 1. Sample / demo flags
-- ---------------------------------------------------------------------------
alter table public.gallery_items add column is_demo boolean not null default false;
alter table public.categories    add column is_demo boolean not null default false;
alter table public.films         add column is_demo boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Photo credits
-- ---------------------------------------------------------------------------
alter table public.media_assets
  add column credit     text check (credit is null or (char_length(btrim(credit)) between 1 and 200 and credit !~ '[\r\n]')),
  add column credit_url text check (credit_url is null or (char_length(credit_url) <= 500 and credit_url ~ '^https://[^\s]+$'));

-- ---------------------------------------------------------------------------
-- 3. Event stories
-- ---------------------------------------------------------------------------
create table public.event_stories (
  id             uuid            primary key default gen_random_uuid(),
  title          public.cms_line not null,
  slug           public.cms_slug not null unique,
  description    public.cms_text not null,
  category_id    uuid            references public.categories (id) on delete set null,
  image_id       uuid            not null,
  image_kind     text            not null default 'image' check (image_kind = 'image'),
  location       public.cms_line,
  -- "Backdrop · Balloons · Cake table": up to 12 short lines.
  styling        text[]          not null default '{}' check (public.cms_line_list_ok(styling)),
  -- Only a real, client-approved testimonial from the testimonials list.
  testimonial_id uuid            references public.testimonials (id) on delete set null,
  is_demo        boolean         not null default false,
  is_featured    boolean         not null default false,
  sort_order     integer         not null default 0 check (sort_order >= 0),
  is_published   boolean         not null default false,
  created_at     timestamptz     not null default now(),
  updated_at     timestamptz     not null default now(),

  constraint event_stories_image_fkey foreign key (image_id, image_kind)
    references public.media_assets (id, kind) on delete restrict
);

comment on table public.event_stories is
  'Editorial event stories. is_demo marks temporary sample content (labelled on the site).';

create index event_stories_order_idx on public.event_stories (sort_order, created_at);
create trigger event_stories_set_updated_at
  before update on public.event_stories
  for each row execute function public.set_updated_at();

-- Extra photos of a story, in order. A photo in use can't be deleted.
create table public.event_story_images (
  story_id   uuid    not null references public.event_stories (id) on delete cascade,
  media_id   uuid    not null,
  media_kind text    not null default 'image' check (media_kind = 'image'),
  sort_order integer not null default 0 check (sort_order >= 0),
  primary key (story_id, media_id),
  constraint event_story_images_media_fkey foreign key (media_id, media_kind)
    references public.media_assets (id, kind) on delete restrict
);

create index event_story_images_media_idx on public.event_story_images (media_id);

-- RLS: stories like the other collections; their photos follow the story.
alter table public.event_stories enable row level security;
revoke all on table public.event_stories from anon, authenticated;
grant select on table public.event_stories to anon, authenticated;
grant insert, update, delete on table public.event_stories to authenticated;

create policy "Public can read published event_stories" on public.event_stories
  for select to anon, authenticated using (is_published);
create policy "Admins can read all event_stories" on public.event_stories
  for select to authenticated using ((select private.is_admin()));
create policy "Admins can add event_stories" on public.event_stories
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins can edit event_stories" on public.event_stories
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete event_stories" on public.event_stories
  for delete to authenticated using ((select private.is_admin()));

alter table public.event_story_images enable row level security;
revoke all on table public.event_story_images from anon, authenticated;
grant select on table public.event_story_images to anon, authenticated;
grant insert, update, delete on table public.event_story_images to authenticated;

-- The subquery runs under event_stories RLS: only published stories count.
create policy "Public can read photos of published stories" on public.event_story_images
  for select to anon, authenticated
  using (exists (select 1 from public.event_stories s where s.id = event_story_images.story_id));
create policy "Admins manage story photos" on public.event_story_images
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- 4. Public media access: + photos of published stories
-- ---------------------------------------------------------------------------
drop policy "Public can read media used by visible content" on public.media_assets;
create policy "Public can read media used by visible content"
  on public.media_assets
  for select
  to anon, authenticated
  using (
    exists (select 1 from public.services s where s.image_id = media_assets.id)
    or exists (select 1 from public.gallery_items g where g.media_id = media_assets.id)
    or exists (select 1 from public.home_content h where h.hero_image_id = media_assets.id)
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

-- Wording: the stories section and the note shown while sample content is live.
alter table public.home_content
  add column stories_eyebrow public.cms_line not null default 'Event stories',
  add column stories_title   public.cms_line not null default 'A celebration, up close',
  add column sample_notice   public.cms_text not null
    default 'Sample imagery is shown while our portfolio is being prepared.';
