-- Phase 17: the global site theme.
--
-- ONE row (singleton, like home_content): the active theme of the public
-- website for every visitor. The admin Design page updates it; the website
-- reads it on the server and turns it into CSS variables
-- (src/lib/theme/css.ts). Values are brand colours and a few design choices
-- from fixed lists; how they apply lives in code (globals.css).
--
-- The database enforces the FORMAT (6-digit lowercase hex, allowed options).
-- Colour contrast (WCAG) is checked by the app before saving
-- (src/lib/theme/palette.ts) — it needs colour maths that don't belong here.

create table public.site_theme (
  id                  boolean     primary key default true check (id),

  -- Colours
  primary_color       text        not null,
  primary_foreground  text        not null,
  blush               text        not null,
  accent              text        not null,
  background          text        not null,
  surface             text        not null,
  foreground          text        not null,
  muted_foreground    text        not null,
  border              text        not null,

  -- Buttons
  button_style        text        not null,
  button_radius       text        not null,
  button_size         text        not null,

  -- Shape, surfaces, typography
  radius              text        not null,
  shadow              text        not null,
  surface_background  text        not null,
  surface_border      text        not null,
  surface_radius      text        not null,
  surface_shadow      text        not null,
  heading_weight      text        not null,
  body_weight         text        not null,

  updated_at          timestamptz not null default now(),

  constraint site_theme_colors_check check (
        primary_color      ~ '^#[0-9a-f]{6}$'
    and primary_foreground ~ '^#[0-9a-f]{6}$'
    and blush              ~ '^#[0-9a-f]{6}$'
    and accent             ~ '^#[0-9a-f]{6}$'
    and background         ~ '^#[0-9a-f]{6}$'
    and surface            ~ '^#[0-9a-f]{6}$'
    and foreground         ~ '^#[0-9a-f]{6}$'
    and muted_foreground   ~ '^#[0-9a-f]{6}$'
    and border             ~ '^#[0-9a-f]{6}$'
  ),
  constraint site_theme_button_style_check  check (button_style in ('filled', 'outline', 'soft', 'ghost')),
  constraint site_theme_button_radius_check check (button_radius in ('sharp', 'small', 'medium', 'rounded', 'pill')),
  constraint site_theme_button_size_check   check (button_size in ('compact', 'normal', 'large')),
  constraint site_theme_radius_check        check (radius in ('0', '4', '8', '10', '12', '16', '24')),
  constraint site_theme_shadow_check        check (shadow in ('none', 'soft', 'medium')),
  constraint site_theme_surface_background_check check (surface_background in ('background', 'surface', 'blush')),
  constraint site_theme_surface_border_check     check (surface_border in ('none', 'hairline', 'accent')),
  constraint site_theme_surface_radius_check     check (surface_radius in ('0', '4', '8', '10', '12', '16', '24')),
  constraint site_theme_surface_shadow_check     check (surface_shadow in ('none', 'soft', 'medium')),
  constraint site_theme_heading_weight_check     check (heading_weight in ('300', '400', '500', '600')),
  constraint site_theme_body_weight_check        check (body_weight in ('400', '500'))
);

comment on table public.site_theme is
  'Global website theme (singleton). Public read; admins update. Applied to the public site for every visitor.';

create trigger site_theme_set_updated_at before update on public.site_theme
  for each row execute function public.set_updated_at();

-- The rose-pink default (= defaultTheme in src/lib/theme/schema.ts).
insert into public.site_theme (
  primary_color, primary_foreground, blush, accent, background, surface, foreground, muted_foreground, border,
  button_style, button_radius, button_size, radius, shadow,
  surface_background, surface_border, surface_radius, surface_shadow, heading_weight, body_weight
) values (
  '#ad4a66', '#ffffff', '#f9dde2', '#d29a49', '#ffffff', '#fbf5ec', '#302a29', '#756a67', '#ebe1df',
  'filled', 'medium', 'normal', '10', 'soft',
  'background', 'none', '0', 'none', '500', '400'
);

-- Row Level Security: exactly the singleton rules of the CMS content.
-- Everyone (the website) can read the theme; only admins can change it;
-- nobody can insert a second row or delete the theme.
alter table public.site_theme enable row level security;
revoke all on table public.site_theme from anon, authenticated;
grant select on table public.site_theme to anon, authenticated;
grant update on table public.site_theme to authenticated;

create policy "Public can read site_theme" on public.site_theme
  for select to anon, authenticated using (true);

create policy "Admins can edit site_theme" on public.site_theme
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
