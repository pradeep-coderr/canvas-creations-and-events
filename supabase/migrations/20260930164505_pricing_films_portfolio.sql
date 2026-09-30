-- Phase 22: pricing packages, films (several videos) and video posters.
--
--   1. pricing_packages: a CMS collection. Created empty; real packages are
--      added by the owner (nothing is seeded, no price is invented).
--   2. media_assets.poster_media_id: a video's cover image, chosen from the
--      library, used wherever that video is shown.
--   3. films: a CMS collection of YouTube/Vimeo videos for the Films section.
--      The video_story row keeps the section's wording; a video set there
--      before this phase is carried over as the first film.
--   4. Public read access to media extended to films and their posters.
--   5. Section wording for pricing and the portfolio filter, and menu labels
--      for Pricing and Films (the links only appear when there is content).

-- ---------------------------------------------------------------------------
-- 1. Pricing packages
-- ---------------------------------------------------------------------------

-- A list of short lines (package features): 0–12 items, each a cms_line.
create function public.cms_line_list_ok(items text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(cardinality(items), 0) <= 12
     and not exists (
       select 1 from unnest(items) as item
       where item is null or char_length(btrim(item)) not between 1 and 200 or item ~ '[\r\n]'
     );
$$;

create table public.pricing_packages (
  id           uuid            primary key default gen_random_uuid(),
  title        public.cms_line not null,
  slug         public.cms_slug not null unique,
  description  public.cms_text,
  -- fixed: "$1,500"; starting_from: "From $1,500"; custom_quote: "Custom quote"
  price_type   text            not null check (price_type in ('fixed', 'starting_from', 'custom_quote')),
  -- Australian dollars. Never 0: an empty price is "no price", not free.
  price        numeric(10, 2)  check (price is null or (price > 0 and price <= 1000000)),
  price_prefix text            check (price_prefix is null or (char_length(btrim(price_prefix)) between 1 and 40 and price_prefix !~ '[\r\n]')),
  price_suffix text            check (price_suffix is null or (char_length(btrim(price_suffix)) between 1 and 60 and price_suffix !~ '[\r\n]')),
  features     text[]          not null default '{}' check (public.cms_line_list_ok(features)),
  cta_label    public.cms_line,
  is_featured  boolean         not null default false,
  sort_order   integer         not null default 0 check (sort_order >= 0),
  is_published boolean         not null default false,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now(),

  -- A quote has no price; a fixed or "from" price needs one.
  constraint pricing_packages_quote_price_check check (
    (price_type = 'custom_quote' and price is null)
    or (price_type <> 'custom_quote' and price is not null)
  )
);

comment on table public.pricing_packages is
  'Pricing packages (real, owner-supplied pricing only; nothing is seeded). Prices are AUD.';

create index pricing_packages_order_idx on public.pricing_packages (sort_order, created_at);
create trigger pricing_packages_set_updated_at
  before update on public.pricing_packages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Video posters
-- ---------------------------------------------------------------------------

alter table public.media_assets
  add column poster_media_id uuid,
  add column poster_kind text not null default 'image' check (poster_kind = 'image'),
  -- A poster must be a library image, and it stays until it's changed.
  add constraint media_assets_poster_fkey foreign key (poster_media_id, poster_kind)
    references public.media_assets (id, kind) on delete restrict,
  add constraint media_assets_poster_check check (poster_media_id is null or kind = 'video');

-- ---------------------------------------------------------------------------
-- 3. Films
-- ---------------------------------------------------------------------------

create table public.films (
  id             uuid            primary key default gen_random_uuid(),
  video_media_id uuid            not null,
  video_kind     text            not null default 'video' check (video_kind = 'video'),
  -- Set from the chosen library video (trigger below): YouTube or Vimeo only.
  video_provider text            not null default 'youtube' check (video_provider in ('youtube', 'vimeo')),
  title          public.cms_line not null,
  caption        public.cms_text,
  is_featured    boolean         not null default false,
  sort_order     integer         not null default 0 check (sort_order >= 0),
  is_published   boolean         not null default false,
  created_at     timestamptz     not null default now(),
  updated_at     timestamptz     not null default now(),

  -- The same video can't be listed twice.
  constraint films_video_key unique (video_media_id),
  -- A video in use by a film can't be deleted from the library.
  constraint films_video_fkey foreign key (video_media_id, video_kind, video_provider)
    references public.media_assets (id, kind, provider) on delete restrict
);

comment on table public.films is
  'Films section: YouTube/Vimeo videos from the media library (players load only on Play).';

create function public.films_set_provider()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.video_provider := coalesce(
    (select m.provider from public.media_assets m where m.id = new.video_media_id and m.kind = 'video'),
    new.video_provider
  );
  return new;
end;
$$;

create trigger films_set_provider
  before insert or update of video_media_id on public.films
  for each row execute function public.films_set_provider();

create index films_order_idx on public.films (sort_order, created_at);
create trigger films_set_updated_at
  before update on public.films
  for each row execute function public.set_updated_at();

-- A video chosen in the old single-video section becomes the first film,
-- published and featured, with its poster moved onto the video.
update public.media_assets m
   set poster_media_id = v.poster_id
  from public.video_story v
 where v.video_media_id = m.id and v.poster_id is not null and m.poster_media_id is null
   and v.provider in ('youtube', 'vimeo');

insert into public.films (video_media_id, title, caption, is_featured, sort_order, is_published)
select v.video_media_id, v.video_title, v.caption, true, 1, true
  from public.video_story v
 where v.provider in ('youtube', 'vimeo') and v.video_media_id is not null and v.video_title is not null
on conflict (video_media_id) do nothing;

update public.video_story
   set provider = null, video_media_id = null, poster_id = null, video_title = null, caption = null
 where provider in ('youtube', 'vimeo') and video_media_id is not null;

comment on column public.video_story.video_media_id is
  'Superseded in Phase 22: videos are listed in public.films. Only the section wording is used.';

-- ---------------------------------------------------------------------------
-- RLS: same rules as the other collections
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['pricing_packages', 'films'] loop
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

-- ---------------------------------------------------------------------------
-- 4. Public media access: also films and the posters of published films
-- ---------------------------------------------------------------------------

-- A poster is visible when a published film uses its video. Looked up with
-- the definer's rights: a policy on media_assets can't query media_assets
-- under its own RLS without recursing.
create function private.is_published_film_poster(p_media_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.films f
      join public.media_assets v on v.id = f.video_media_id
     where f.is_published and v.poster_media_id = p_media_id
  );
$$;
revoke all on function private.is_published_film_poster(uuid) from public;
grant execute on function private.is_published_film_poster(uuid) to anon, authenticated;

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
  );

-- ---------------------------------------------------------------------------
-- 5. Wording
-- ---------------------------------------------------------------------------

-- The pricing section's heading (only shown once a package is published) and
-- the portfolio's optional intro and "All" filter label.
alter table public.home_content
  add column pricing_eyebrow    public.cms_line not null default 'Pricing',
  add column pricing_title      public.cms_line not null default 'Packages',
  add column pricing_description public.cms_text,
  add column gallery_intro      public.cms_text,
  add column gallery_filter_all public.cms_line not null default 'All';

-- Menu labels for the two new sections.
alter table public.site_settings
  add column nav_pricing public.cms_line not null default 'Pricing',
  add column nav_films   public.cms_line not null default 'Films';
