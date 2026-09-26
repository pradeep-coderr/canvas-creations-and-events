-- Phase 17 follow-up: a separate BUTTON colour.
--
-- The brand pink #F7889A is too light for text (2.34:1 on white) and for
-- white button text, but reads well as a button fill with charcoal text
-- (6.0:1). So buttons get their own colour, and `primary_color` stays the
-- rose used for text-level accents (links, labels, headline accent, focus).

alter table public.site_theme
  add column button_color      text not null default '#f7889a',
  add column button_foreground text not null default '#302a29',
  add constraint site_theme_button_colors_check check (
        button_color      ~ '^#[0-9a-f]{6}$'
    and button_foreground ~ '^#[0-9a-f]{6}$'
  );

-- The new default rose for text (a deeper shade of the button pink, 5.16:1
-- on white). Only replaces the previous default, never a colour an admin
-- chose in the Design editor.
update public.site_theme
   set primary_color = '#b64762'
 where primary_color = '#ad4a66';
