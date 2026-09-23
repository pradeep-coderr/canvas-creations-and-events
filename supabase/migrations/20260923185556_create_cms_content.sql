-- CMS content model for the public website (edited from /admin).
--
-- Shape:
--   * Singletons (exactly one row, created by the seed migration):
--       home_content   section copy for the homepage
--       about_content  About / founder section
--       video_story    video section copy + an optional video
--   * Collections (ordered by sort_order, public only when is_published):
--       services, categories, gallery_items, testimonials, faqs,
--       process_steps, principles ("Why Canvas")
--   * media_assets: references to files in a future Supabase Storage bucket
--     ("cms-media"). Content points at media by foreign key, never by URL.
--
-- Security model (same philosophy as enquiries / admin_users):
--   * anon + authenticated may SELECT published collection rows, the
--     singletons, and media referenced by content they can see.
--   * Only admins (auth users listed in public.admin_users) may read drafts
--     and INSERT / UPDATE / DELETE. Singletons can be updated, never created
--     or deleted through the API.
--   * Logged-in non-admins get exactly the public view.
--
-- Deliberately not modelled: drafts/revisions, approval workflows, roles
-- beyond "admin", arbitrary JSON blocks. Business identity (name, phone,
-- address, socials), navigation, design and security stay in code.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Not exposed through the Data API (only the public schema is).
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- True when the current user is an admin. SECURITY INVOKER: it reads
-- admin_users as the caller, whose RLS shows only their own row.
create function private.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Text domains: required text is trimmed-non-empty and length-capped. NULL
-- passes a domain check, so optional columns simply stay nullable.
create domain public.cms_line as text
  check (char_length(btrim(value)) between 1 and 200 and value !~ '[\r\n]');

create domain public.cms_text as text
  check (char_length(btrim(value)) between 1 and 2000);

create domain public.cms_slug as text
  check (char_length(value) <= 80 and value ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- Links editors may enter: site-relative paths ("/", "/#faq" — not "//host"),
-- tel:, mailto: or https:. Never javascript: or other schemes.
create domain public.cms_href as text
  check (
    char_length(value) <= 500
    and value !~ '\s'
    and value ~ '^(/([^/\\].*)?|tel:\+?[0-9]{6,15}|mailto:[^@]+@[^@]+|https://.+)$'
  );

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------

create table public.media_assets (
  id           uuid        primary key default gen_random_uuid(),
  kind         text        not null,
  -- Object path inside the "cms-media" storage bucket, e.g. "gallery/arbour.jpg".
  storage_path text        not null unique,
  -- Describes the image for screen readers. Required for images.
  alt          text,
  width        integer,
  height       integer,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint media_assets_kind_check check (kind in ('image', 'video')),
  constraint media_assets_storage_path_check check (
    char_length(storage_path) <= 300
    and storage_path ~ '^[a-z0-9][a-z0-9._/-]*$'
    and storage_path !~ '(^|/)\.\.?(/|$)'
  ),
  constraint media_assets_alt_check
    check (alt is null or char_length(btrim(alt)) between 1 and 300),
  constraint media_assets_image_alt_required check (kind <> 'image' or alt is not null),
  constraint media_assets_width_check check (width is null or width > 0),
  constraint media_assets_height_check check (height is null or height > 0),
  -- Target for (media id, kind) foreign keys, so content can require an image or video.
  constraint media_assets_id_kind_key unique (id, kind)
);

comment on table public.media_assets is
  'Files in the cms-media storage bucket that content can reference. Public rows: only media used by visible content.';

-- ---------------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------------

create table public.categories (
  id           uuid            primary key default gen_random_uuid(),
  slug         public.cms_slug not null unique,
  label        public.cms_line not null,
  sort_order   integer         not null default 0 check (sort_order >= 0),
  is_published boolean         not null default false,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now()
);

comment on table public.categories is 'Kinds of celebrations styled (homepage strip, gallery grouping).';

create table public.services (
  id           uuid            primary key default gen_random_uuid(),
  slug         public.cms_slug not null unique,
  title        public.cms_line not null,
  summary      public.cms_text not null,
  image_id     uuid,
  image_kind   text            not null default 'image' check (image_kind = 'image'),
  is_featured  boolean         not null default true,
  sort_order   integer         not null default 0 check (sort_order >= 0),
  is_published boolean         not null default false,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now(),

  constraint services_image_fkey foreign key (image_id, image_kind)
    references public.media_assets (id, kind) on delete set null (image_id)
);

comment on table public.services is 'Services offered. is_featured = shown on the homepage.';

create table public.gallery_items (
  id           uuid            primary key default gen_random_uuid(),
  media_id     uuid            not null,
  media_kind   text            not null default 'image' check (media_kind = 'image'),
  title        public.cms_line,
  category_id  uuid            references public.categories (id) on delete set null,
  is_featured  boolean         not null default false,
  sort_order   integer         not null default 0 check (sort_order >= 0),
  is_published boolean         not null default false,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now(),

  -- An image in use by the gallery cannot be deleted; remove the item first.
  constraint gallery_items_media_fkey foreign key (media_id, media_kind)
    references public.media_assets (id, kind) on delete restrict
);

comment on table public.gallery_items is
  'Portfolio images (real client photography only). is_featured = homepage preview.';

create table public.testimonials (
  id           uuid            primary key default gen_random_uuid(),
  quote        public.cms_text not null,
  -- As the client agreed to be credited, e.g. first names only.
  author_name  public.cms_line not null,
  event_type   public.cms_line,
  is_featured  boolean         not null default true,
  sort_order   integer         not null default 0 check (sort_order >= 0),
  is_published boolean         not null default false,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now()
);

comment on table public.testimonials is 'Real, client-approved testimonials only. No ratings.';

create table public.faqs (
  id           uuid            primary key default gen_random_uuid(),
  question     public.cms_line not null,
  answer       public.cms_text not null,
  -- Optional follow-up link under the answer; both or neither.
  action_label public.cms_line,
  action_href  public.cms_href,
  sort_order   integer         not null default 0 check (sort_order >= 0),
  is_published boolean         not null default false,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now(),

  constraint faqs_action_check check ((action_label is null) = (action_href is null))
);

create table public.process_steps (
  id           uuid            primary key default gen_random_uuid(),
  title        public.cms_line not null,
  description  public.cms_text not null,
  sort_order   integer         not null default 0 check (sort_order >= 0),
  is_published boolean         not null default false,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now()
);

comment on table public.process_steps is 'Steps in working with the studio. Numbering comes from order.';

create table public.principles (
  id           uuid            primary key default gen_random_uuid(),
  title        public.cms_line not null,
  description  public.cms_text not null,
  sort_order   integer         not null default 0 check (sort_order >= 0),
  is_published boolean         not null default false,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now()
);

comment on table public.principles is 'Brand principles in the "Why Canvas" section.';

-- ---------------------------------------------------------------------------
-- Singletons (id is always true, so there can only be one row)
-- ---------------------------------------------------------------------------

create table public.home_content (
  id                       boolean         primary key default true check (id),
  hero_eyebrow             public.cms_line not null,
  hero_description         public.cms_text not null,
  hero_secondary_cta_label public.cms_line not null,
  hero_image_id            uuid,
  hero_image_kind          text            not null default 'image' check (hero_image_kind = 'image'),
  intro_eyebrow            public.cms_line not null,
  intro_title              public.cms_line not null,
  intro_body               public.cms_text not null,
  services_eyebrow         public.cms_line not null,
  services_title           public.cms_line not null,
  services_description     public.cms_text not null,
  services_enquiry_title   public.cms_line not null,
  services_enquiry_text    public.cms_line not null,
  categories_eyebrow       public.cms_line not null,
  categories_title         public.cms_line not null,
  gallery_eyebrow          public.cms_line not null,
  gallery_title            public.cms_line not null,
  gallery_empty_title      public.cms_line not null,
  gallery_empty_text       public.cms_text not null,
  gallery_instagram_cta    public.cms_line not null,
  process_eyebrow          public.cms_line not null,
  process_title            public.cms_line not null,
  -- Each line is set on its own line in the heading.
  why_eyebrow              public.cms_line not null,
  why_title_lines          public.cms_line[] not null,
  testimonials_eyebrow     public.cms_line not null,
  testimonials_title       public.cms_line not null,
  faq_eyebrow              public.cms_line not null,
  faq_title                public.cms_line not null,
  enquiry_eyebrow          public.cms_line not null,
  enquiry_title            public.cms_line not null,
  enquiry_description      public.cms_text not null,
  contact_eyebrow          public.cms_line not null,
  contact_title            public.cms_line not null,
  contact_description      public.cms_text not null,
  updated_at               timestamptz     not null default now(),

  constraint home_content_hero_image_fkey foreign key (hero_image_id, hero_image_kind)
    references public.media_assets (id, kind) on delete set null (hero_image_id),
  constraint home_content_why_title_lines_check check (
    cardinality(why_title_lines) between 1 and 3
    and array_position(why_title_lines, null) is null
  )
);

comment on table public.home_content is 'Homepage section copy (single row).';

create table public.about_content (
  id            boolean         primary key default true check (id),
  eyebrow       public.cms_line not null,
  title         public.cms_line not null,
  -- Paragraphs, in order.
  body          public.cms_text[] not null,
  -- Optional until the client provides them; never invented.
  founder_name  public.cms_line,
  founder_role  public.cms_line,
  image_id      uuid,
  image_kind    text            not null default 'image' check (image_kind = 'image'),
  cta_label     public.cms_line not null,
  updated_at    timestamptz     not null default now(),

  constraint about_content_image_fkey foreign key (image_id, image_kind)
    references public.media_assets (id, kind) on delete set null (image_id),
  constraint about_content_body_check check (
    cardinality(body) between 1 and 6 and array_position(body, null) is null
  )
);

comment on table public.about_content is 'About / founder section (single row).';

create table public.video_story (
  id              boolean         primary key default true check (id),
  eyebrow         public.cms_line not null,
  title           public.cms_line not null,
  empty_text      public.cms_text not null,
  tiktok_cta      public.cms_line not null,
  -- The video itself: none, an uploaded file (with a poster image), or an
  -- embed from an allowed provider.
  provider        text,
  video_media_id  uuid,
  video_kind      text            not null default 'video' check (video_kind = 'video'),
  embed_url       text,
  poster_id       uuid,
  poster_kind     text            not null default 'image' check (poster_kind = 'image'),
  -- Accessible name for the player.
  video_title     public.cms_line,
  caption         public.cms_line,
  updated_at      timestamptz     not null default now(),

  constraint video_story_video_fkey foreign key (video_media_id, video_kind)
    references public.media_assets (id, kind) on delete restrict,
  constraint video_story_poster_fkey foreign key (poster_id, poster_kind)
    references public.media_assets (id, kind) on delete restrict,
  constraint video_story_provider_check check (provider in ('upload', 'youtube', 'vimeo')),
  constraint video_story_video_check check (
    (provider is null
      and video_media_id is null and embed_url is null and poster_id is null
      and video_title is null and caption is null)
    or (provider = 'upload'
      and video_media_id is not null and poster_id is not null and embed_url is null
      and video_title is not null)
    or (provider = 'youtube'
      and embed_url ~ '^https://(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)/[^\s]+$'
      and video_media_id is null and video_title is not null)
    or (provider = 'vimeo'
      and embed_url ~ '^https://(player\.)?vimeo\.com/[^\s]+$'
      and video_media_id is null and video_title is not null)
  )
);

comment on table public.video_story is 'Video / story section (single row). Video is optional.';

-- ---------------------------------------------------------------------------
-- Indexes: public reads filter on is_published and sort by sort_order;
-- foreign keys are indexed for joins and ON DELETE checks.
-- ---------------------------------------------------------------------------

create index categories_published_order_idx    on public.categories (sort_order) where is_published;
create index services_published_order_idx      on public.services (sort_order) where is_published;
create index gallery_items_published_order_idx on public.gallery_items (sort_order) where is_published;
create index testimonials_published_order_idx  on public.testimonials (sort_order) where is_published;
create index faqs_published_order_idx          on public.faqs (sort_order) where is_published;
create index process_steps_published_order_idx on public.process_steps (sort_order) where is_published;
create index principles_published_order_idx    on public.principles (sort_order) where is_published;

create index services_image_id_idx         on public.services (image_id);
create index gallery_items_media_id_idx    on public.gallery_items (media_id);
create index gallery_items_category_id_idx on public.gallery_items (category_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers (public.set_updated_at from the enquiries migration)
-- ---------------------------------------------------------------------------

create trigger media_assets_set_updated_at  before update on public.media_assets  for each row execute function public.set_updated_at();
create trigger categories_set_updated_at    before update on public.categories    for each row execute function public.set_updated_at();
create trigger services_set_updated_at      before update on public.services      for each row execute function public.set_updated_at();
create trigger gallery_items_set_updated_at before update on public.gallery_items for each row execute function public.set_updated_at();
create trigger testimonials_set_updated_at  before update on public.testimonials  for each row execute function public.set_updated_at();
create trigger faqs_set_updated_at          before update on public.faqs          for each row execute function public.set_updated_at();
create trigger process_steps_set_updated_at before update on public.process_steps for each row execute function public.set_updated_at();
create trigger principles_set_updated_at    before update on public.principles    for each row execute function public.set_updated_at();
create trigger home_content_set_updated_at  before update on public.home_content  for each row execute function public.set_updated_at();
create trigger about_content_set_updated_at before update on public.about_content for each row execute function public.set_updated_at();
create trigger video_story_set_updated_at   before update on public.video_story   for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security and grants
-- ---------------------------------------------------------------------------

-- Collections: public reads published rows; admins read and write everything.
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'services', 'gallery_items', 'testimonials',
    'faqs', 'process_steps', 'principles'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on table public.%I to authenticated', t);

    execute format(
      'create policy "Public can read published %1$s" on public.%1$I
         for select to anon, authenticated using (is_published)', t);
    execute format(
      'create policy "Admins can read all %1$s" on public.%1$I
         for select to authenticated using ((select private.is_admin()))', t);
    execute format(
      'create policy "Admins can add %1$s" on public.%1$I
         for insert to authenticated with check ((select private.is_admin()))', t);
    execute format(
      'create policy "Admins can edit %1$s" on public.%1$I
         for update to authenticated
         using ((select private.is_admin())) with check ((select private.is_admin()))', t);
    execute format(
      'create policy "Admins can delete %1$s" on public.%1$I
         for delete to authenticated using ((select private.is_admin()))', t);
  end loop;
end
$$;

-- Singletons: public reads the row; admins may update it (no insert/delete).
do $$
declare
  t text;
begin
  foreach t in array array['home_content', 'about_content', 'video_story'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format('grant update on table public.%I to authenticated', t);

    execute format(
      'create policy "Public can read %1$s" on public.%1$I
         for select to anon, authenticated using (true)', t);
    execute format(
      'create policy "Admins can edit %1$s" on public.%1$I
         for update to authenticated
         using ((select private.is_admin())) with check ((select private.is_admin()))', t);
  end loop;
end
$$;

-- Media: public reads only media referenced by content the reader can see.
-- Each subquery runs under that table's RLS, so draft content doesn't count.
alter table public.media_assets enable row level security;
revoke all on table public.media_assets from anon, authenticated;
grant select on table public.media_assets to anon, authenticated;
grant insert, update, delete on table public.media_assets to authenticated;

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
  );

create policy "Admins can read all media"
  on public.media_assets for select to authenticated
  using ((select private.is_admin()));

create policy "Admins can add media"
  on public.media_assets for insert to authenticated
  with check ((select private.is_admin()));

create policy "Admins can edit media"
  on public.media_assets for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Admins can delete media"
  on public.media_assets for delete to authenticated
  using ((select private.is_admin()));
