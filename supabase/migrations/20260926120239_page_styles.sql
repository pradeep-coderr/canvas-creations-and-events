-- Phase 18: page styles — controlled style presets the admin sets in the
-- visual editor, without code.
--
-- ONE row (singleton). Two maps:
--   text_styles:    { "<scope>.<field>": { size, weight, color, italic, align } }
--                   e.g. "home.introTitle" → { "size": "display-lg", "color": "rose" }
--   section_styles: { "<section>": { tone, spacing } }
--                   e.g. "faq" → { "tone": "blush", "spacing": "compact" }
--
-- Every value is a choice from a fixed list, validated by the app before
-- saving (src/lib/styles/schema.ts) and turned into CSS from code-owned
-- recipes — never free CSS. The database guards the shape and size; the
-- empty maps are the website exactly as designed.

create table public.page_styles (
  id              boolean     primary key default true check (id),
  text_styles     jsonb       not null default '{}'::jsonb,
  section_styles  jsonb       not null default '{}'::jsonb,
  updated_at      timestamptz not null default now(),

  constraint page_styles_shape_check check (
    jsonb_typeof(text_styles) = 'object'
    and jsonb_typeof(section_styles) = 'object'
    and pg_column_size(text_styles) <= 32768
    and pg_column_size(section_styles) <= 8192
  )
);

comment on table public.page_styles is
  'Style presets for page text and sections (singleton, fixed options only). Public read; admins update.';

create trigger page_styles_set_updated_at before update on public.page_styles
  for each row execute function public.set_updated_at();

insert into public.page_styles default values;

alter table public.page_styles enable row level security;
revoke all on table public.page_styles from anon, authenticated;
grant select on table public.page_styles to anon, authenticated;
grant update on table public.page_styles to authenticated;

create policy "Public can read page_styles" on public.page_styles
  for select to anon, authenticated using (true);

create policy "Admins can edit page_styles" on public.page_styles
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
