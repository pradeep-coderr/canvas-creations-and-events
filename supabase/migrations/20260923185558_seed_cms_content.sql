-- Initial CMS content: a verbatim copy of the copy already live on the site
-- (src/data/home.ts, services.ts, faq.ts at the time of this migration), so
-- the public site renders identically once it reads from the database.
--
-- Nothing new is introduced. Collections that are empty in the code stay
-- empty here: categories, gallery items, testimonials and media. The founder
-- name/role, hero image, founder image and video stay unset until the client
-- provides real ones. Process steps, principles and the About copy are the
-- existing provisional brand-level wording, to be replaced by the client.

insert into public.home_content (
  hero_eyebrow, hero_description, hero_secondary_cta_label,
  intro_eyebrow, intro_title, intro_body,
  services_eyebrow, services_title, services_description,
  services_enquiry_title, services_enquiry_text,
  categories_eyebrow, categories_title,
  gallery_eyebrow, gallery_title, gallery_empty_title, gallery_empty_text, gallery_instagram_cta,
  process_eyebrow, process_title,
  why_eyebrow, why_title_lines,
  testimonials_eyebrow, testimonials_title,
  faq_eyebrow, faq_title,
  enquiry_eyebrow, enquiry_title, enquiry_description,
  contact_eyebrow, contact_title, contact_description
) values (
  'Event styling & décor',
  'Thoughtfully designed styling for the celebrations that matter most — shaped around your story and finished with care.',
  'Explore our work',
  'The studio',
  'Every celebration begins as a blank canvas.',
  'Canvas Creations and Events is an event styling and décor studio in South Australia. We design each setting around the people and the moment it celebrates, so the finished space feels unmistakably yours.',
  'Services',
  'Styling, shaped around your celebration.',
  'Every event is different. Tell us what you are planning and we will talk through how to bring it to life.',
  'Planning something?',
  'Tell us about your celebration.',
  'What we style',
  'Celebrations worth remembering',
  'Our work',
  'Moments, styled.',
  'Our portfolio is on its way.',
  'We are curating a selection of our celebrations for this page. In the meantime, follow along on social media.',
  'See more on Instagram',
  'The process',
  'From first idea to finished setting.',
  'Why Canvas',
  array['Designed with intention.', 'Styled with heart.']::public.cms_line[],
  'Kind words',
  'From our clients',
  'FAQ',
  'Questions, answered.',
  'Enquire',
  'Let''s plan something beautiful.',
  'Tell us a little about your celebration. The more you share, the better we can understand what you have in mind.',
  'Contact',
  'Let''s make something memorable.',
  'Prefer to talk it through? Give us a call, or follow along online.'
);

insert into public.about_content (eyebrow, title, body, cta_label) values (
  'About',
  'A personal approach to every celebration.',
  array[
    'Canvas Creations and Events is built on a simple idea: the setting of a celebration should feel as personal as the moment itself.',
    'Every event starts as a blank canvas. The colours, textures and details are chosen around the people it celebrates, so the finished space tells their story.'
  ]::public.cms_text[],
  'Tell us about your celebration'
);

insert into public.video_story (eyebrow, title, empty_text, tiktok_cta) values (
  'In motion',
  'Celebrations, in motion.',
  'Video stories from our events will live here.',
  'Watch on TikTok'
);

insert into public.services (slug, title, summary, is_featured, sort_order, is_published) values (
  'event-styling',
  'Event styling & decoration',
  'Styling and décor for your celebration, designed around the people and the occasion.',
  true, 1, true
);

insert into public.faqs (question, answer, action_label, action_href, sort_order, is_published) values
  ('How do I make an enquiry?',
   'You can send us an enquiry online using the form on this page, or call us on 0426 071 109. You can also find us on Instagram, Facebook and TikTok.',
   'Send an enquiry', '/#enquire', 1, true),
  ('What details help with an enquiry?',
   'Your event date, the type of celebration and the venue or location are a great start, along with any ideas, colours or inspiration you already have in mind.',
   null, null, 2, true),
  ('Where are you based?',
   'We are based in Munno Para, South Australia.',
   null, null, 3, true);

insert into public.process_steps (title, description, sort_order, is_published) values
  ('Enquire', 'Share the date, the occasion and any ideas you already have in mind.', 1, true),
  ('Talk it through', 'We get in touch to understand your vision and what matters most to you.', 2, true),
  ('Shape the look', 'Together we shape the styling and details around your celebration.', 3, true),
  ('Celebrate', 'Your setting comes together, so you can enjoy the moment.', 4, true);

insert into public.principles (title, description, sort_order, is_published) values
  ('Personal', 'Styling shaped around you, your people and the occasion you are celebrating.', 1, true),
  ('Considered', 'Colour, texture and detail chosen to work together as one setting.', 2, true),
  ('Elegant', 'Refined, warm styling that lets the moment take centre stage.', 3, true);
