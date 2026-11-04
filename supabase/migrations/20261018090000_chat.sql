-- Website chat (Phase 30): a menu bot on the site, a live inbox for the team.
--
-- A visitor's browser holds a random token (never sent anywhere but here);
-- the database stores only its SHA-256 hash. Everything a visitor does goes
-- through the SECURITY DEFINER functions below, which find the conversation
-- by that hash, so a visitor can only ever see and add to their own chat.
-- Visitors have no direct table access at all.
--
-- The bot's answers are not stored: a menu choice is stored as the visitor's
-- message with its key (choice), and the site shows the matching answer. So
-- nothing can be put in the bot's mouth through the public functions.
--
-- Admins (private.is_admin()) read every chat, reply (sender 'team') and
-- close/reopen chats through ordinary RLS; the inbox updates live through
-- Supabase Realtime (which applies the same RLS).
--
-- Spam limits: message length, 30 visitor messages per chat per 10 minutes,
-- 500 messages per chat, 300 new chats per hour across the site.

create table public.chat_conversations (
  id              uuid        primary key default gen_random_uuid(),
  token_hash      text        not null unique,
  status          text        not null default 'open',
  name            text,
  contact         text,
  event_date      text,
  topic           text,
  -- The visitor asked for the team (shared their details): alerts start.
  handed_over     boolean     not null default false,
  handed_over_at  timestamptz,
  -- A hash of the visitor's connection (IP), for per-visitor spam limits.
  -- Never shown to admins (no column grant).
  client_hash     text,
  -- Visitor info (approximate location, device, how they arrived), signed by
  -- the website: the admin's "Looks real / Check this / Likely spam".
  meta            jsonb,
  admin_unread    integer     not null default 0,
  visitor_unread  integer     not null default 0,
  last_message_at timestamptz not null default now(),
  last_preview    text,
  last_alert_at   timestamptz,
  -- Last time the visitor's chat window checked in (open on the site).
  visitor_seen_at timestamptz,
  -- Last "you have a reply" email to the visitor (at most one per 15 minutes).
  last_email_at   timestamptz,
  -- "Seen": when the team last read the chat / the visitor last read replies.
  admin_read_at   timestamptz,
  visitor_read_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint chat_conversations_status_check check (status in ('open', 'closed')),
  constraint chat_conversations_token_check check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint chat_conversations_name_check check (name is null or (char_length(btrim(name)) between 1 and 100 and name !~ '[\r\n]')),
  constraint chat_conversations_contact_check check (contact is null or (char_length(btrim(contact)) between 3 and 254 and contact !~ '[\r\n]')),
  constraint chat_conversations_date_check check (event_date is null or (char_length(btrim(event_date)) between 1 and 60 and event_date !~ '[\r\n]')),
  constraint chat_conversations_topic_check check (topic is null or char_length(topic) <= 60),
  constraint chat_conversations_meta_check check (meta is null or (jsonb_typeof(meta) = 'object' and pg_column_size(meta) <= 4000))
);

comment on table public.chat_conversations is
  'Website chats. Visitors reach their own row only through the chat_* functions (token hash); admins via RLS.';

create index chat_conversations_inbox_idx on public.chat_conversations (status, last_message_at desc);
create index chat_conversations_created_idx on public.chat_conversations (created_at desc);
create index chat_conversations_client_idx on public.chat_conversations (client_hash, created_at desc) where client_hash is not null;

create trigger chat_conversations_set_updated_at before update on public.chat_conversations
  for each row execute function public.set_updated_at();

create table public.chat_messages (
  id              bigint      generated always as identity primary key,
  conversation_id uuid        not null references public.chat_conversations (id) on delete cascade,
  sender          text        not null,
  body            text        not null,
  -- A menu choice the visitor tapped (the site shows the matching answer).
  choice          text,
  -- What a structured message is: the bot turned off / on (system), a quote
  -- form or a quote (team), the visitor's quote details or acceptance.
  kind            text,
  -- "Plan my event": which question this message answers.
  plan_step       text,
  -- A quote's items and total, or the visitor's quote details (see "Quotes in chat").
  data            jsonb,
  created_at      timestamptz not null default now(),
  constraint chat_messages_sender_check check (sender in ('visitor', 'team', 'system')),
  constraint chat_messages_body_check check (char_length(btrim(body)) between 1 and 1000),
  constraint chat_messages_choice_check check (choice is null or choice in ('plan', 'style', 'pricing', 'date', 'team', 'work', 'quote')),
  constraint chat_messages_plan_step_check check (
    plan_step is null or (sender = 'visitor' and plan_step in ('occasion', 'date', 'guests', 'venue', 'theme', 'budget'))
  ),
  constraint chat_messages_kind_check check (
    kind is null
    or (sender = 'system' and kind in ('bot_off', 'bot_on'))
    or (sender = 'team' and kind in ('quote_form', 'quote'))
    or (sender = 'visitor' and kind in ('quote_details', 'quote_accept'))
  ),
  constraint chat_messages_data_check check (data is null or (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 8000))
);

create index chat_messages_conversation_idx on public.chat_messages (conversation_id, id);
create index chat_messages_recent_idx on public.chat_messages (conversation_id, sender, created_at desc);

-- Keep the conversation's preview, time and unread counts in step.
create function private.chat_message_added()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_conversations c
  set last_message_at = new.created_at,
      last_preview = case when new.sender = 'system' then c.last_preview else left(new.body, 140) end,
      admin_unread = case when new.sender = 'visitor' then c.admin_unread + 1
                          when new.sender = 'team' then 0
                          else c.admin_unread end,
      -- Replying means the team has read everything before it.
      admin_read_at = case when new.sender = 'team' then new.created_at else c.admin_read_at end,
      visitor_unread = case when new.sender = 'team' then c.visitor_unread + 1 else c.visitor_unread end,
      -- A new message reopens a closed chat.
      status = case when new.sender in ('visitor', 'team') then 'open' else c.status end
  where c.id = new.conversation_id;
  return new;
end;
$$;
revoke all on function private.chat_message_added() from public;

create trigger chat_message_added after insert on public.chat_messages
  for each row execute function private.chat_message_added();

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
revoke all on table public.chat_conversations from anon, authenticated;
revoke all on table public.chat_messages from anon, authenticated;

-- Admins: read everything (never the token hash), close/reopen, mark read.
grant select (id, status, name, contact, event_date, topic, handed_over, admin_unread, visitor_unread,
              last_message_at, last_preview, visitor_seen_at, last_email_at, admin_read_at, visitor_read_at,
              meta, created_at, updated_at)
  on public.chat_conversations to authenticated;
grant update (status, admin_unread, last_email_at, admin_read_at) on public.chat_conversations to authenticated;
grant delete on public.chat_conversations to authenticated;
grant select on public.chat_messages to authenticated;
grant insert (conversation_id, sender, body, kind, data) on public.chat_messages to authenticated;

create policy "Admins can read chats"
  on public.chat_conversations for select to authenticated
  using ((select private.is_admin()));
create policy "Admins can update chats"
  on public.chat_conversations for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete chats"
  on public.chat_conversations for delete to authenticated
  using ((select private.is_admin()));
create policy "Admins can read chat messages"
  on public.chat_messages for select to authenticated
  using ((select private.is_admin()));
-- Replies, quote forms and quotes, and turning the bot off / on for a chat
-- (recorded as an event in the chat).
create policy "Admins can reply in chats"
  on public.chat_messages for insert to authenticated
  with check (
    (select private.is_admin())
    and (
      (sender = 'team' and kind is null and data is null)
      or (sender = 'team' and kind = 'quote_form' and data is null)
      or (sender = 'team' and kind = 'quote' and data ? 'items' and data ? 'total')
      or (sender = 'system' and kind in ('bot_off', 'bot_on') and data is null)
    )
  );

-- Live inbox (Realtime applies the policies above).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.chat_conversations, public.chat_messages;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Visitor functions (anon): everything is found by the token's hash
-- ---------------------------------------------------------------------------
create function private.chat_token_hash(p_token text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_token is null or p_token !~ '^[A-Za-z0-9_-]{32,128}$' then
    raise exception 'invalid chat token' using errcode = '22023';
  end if;
  return encode(extensions.digest(p_token, 'sha256'), 'hex');
end;
$$;
revoke all on function private.chat_token_hash(text) from public;

-- Per-visitor limits. The website's server passes the visitor's IP with a
-- shared key (CHAT_SERVER_KEY, stored here only as a hash), so one person
-- can't use up the site-wide limits. A call without the key (someone calling
-- the API directly) is counted by its own connection instead. Until a key is
-- set, there are no per-visitor limits (only the site-wide ones).
create table private.chat_server_key (
  id       boolean primary key default true check (id),
  key_hash text    not null check (key_hash ~ '^[0-9a-f]{64}$')
);
revoke all on table private.chat_server_key from public;

create function private.chat_client(p_client text, p_key text)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_key text;
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_ip text;
begin
  select key_hash into v_key from private.chat_server_key;
  if v_key is null then
    return null;
  end if;
  if p_key is not null and encode(extensions.digest(p_key, 'sha256'), 'hex') = v_key then
    v_ip := p_client;
  else
    v_ip := coalesce(v_headers ->> 'cf-connecting-ip', v_headers ->> 'x-real-ip',
                     split_part(v_headers ->> 'x-forwarded-for', ',', 1));
  end if;
  v_ip := nullif(btrim(left(v_ip, 100)), '');
  return case when v_ip is null then null else encode(extensions.digest(v_ip, 'sha256'), 'hex') end;
end;
$$;
revoke all on function private.chat_client(text, text) from public;

-- Send a message (typed, or a menu choice). Starts the chat on first use.
-- Returns the chat id and whether the team should get an alert now.
create function public.chat_send(p_token text, p_body text, p_choice text default null, p_plan_step text default null,
                                 p_client text default null, p_key text default null, p_meta jsonb default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_hash text := private.chat_token_hash(p_token);
  v_conv public.chat_conversations;
  v_alert boolean := false;
  v_topic text;
  v_client text;
begin
  if p_body is null or char_length(btrim(p_body)) not between 1 and 1000 then
    raise exception 'invalid message' using errcode = '22023';
  end if;
  v_topic := case p_choice
    when 'style' then 'What we style' when 'pricing' then 'Pricing & packages'
    when 'date' then 'Check a date' when 'team' then 'Talk to the team'
    when 'work' then 'See our work' when 'quote' then 'Get a quote'
    when 'plan' then 'Plan my event'
    else null end;
  if p_choice is not null and v_topic is null then
    raise exception 'invalid choice' using errcode = '22023';
  end if;
  if p_plan_step is not null and (p_choice is not null
      or p_plan_step not in ('occasion', 'date', 'guests', 'venue', 'theme', 'budget')) then
    raise exception 'invalid plan step' using errcode = '22023';
  end if;

  select * into v_conv from public.chat_conversations where token_hash = v_hash for update;
  if not found then
    -- New chats: at most 20 an hour from one visitor, 1000 across the site.
    v_client := private.chat_client(p_client, p_key);
    if (v_client is not null and (select count(*) from public.chat_conversations
          where client_hash = v_client and created_at > now() - interval '1 hour') >= 20)
       or (select count(*) from public.chat_conversations where created_at > now() - interval '1 hour') >= 1000 then
      raise exception 'chat is busy' using errcode = 'P0001', hint = 'rate_limited';
    end if;
    -- Two first messages at once (a double tap) start one chat, not an error.
    -- Visitor info is kept from the first message only.
    insert into public.chat_conversations (token_hash, topic, client_hash, meta)
    values (v_hash, v_topic, v_client,
            case when jsonb_typeof(p_meta) = 'object' and pg_column_size(p_meta) <= 4000 then p_meta end)
    on conflict (token_hash) do nothing;
    select * into v_conv from public.chat_conversations where token_hash = v_hash for update;
  end if;

  if (select count(*) from public.chat_messages
      where conversation_id = v_conv.id and sender = 'visitor' and created_at > now() - interval '10 minutes') >= 30
     or (select count(*) from public.chat_messages where conversation_id = v_conv.id) >= 500 then
    raise exception 'too many messages' using errcode = 'P0001', hint = 'rate_limited';
  end if;

  insert into public.chat_messages (conversation_id, sender, body, choice, plan_step)
  values (v_conv.id, 'visitor', btrim(p_body), p_choice, p_plan_step);

  -- Alert the team for chats handed to them, at most every 10 minutes per chat.
  if v_conv.handed_over and (v_conv.last_alert_at is null or v_conv.last_alert_at < now() - interval '10 minutes') then
    v_alert := true;
  end if;
  update public.chat_conversations
  set topic = coalesce(topic, v_topic),
      last_alert_at = case when v_alert then now() else last_alert_at end
  where id = v_conv.id;

  return jsonb_build_object('conversationId', v_conv.id, 'alert', v_alert, 'name', v_conv.name);
end;
$$;

-- Share name and how to reach them: the chat is handed to the team.
create function public.chat_share_contact(p_token text, p_name text, p_contact text, p_event_date text default null,
                                           p_client text default null, p_key text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_hash text := private.chat_token_hash(p_token);
  v_conv public.chat_conversations;
  v_date text := nullif(btrim(left(coalesce(p_event_date, ''), 200)), '');
  v_first boolean;
  v_alert boolean;
  v_occasion text;
  v_client text;
begin
  if nullif(btrim(coalesce(p_name, '')), '') is null or nullif(btrim(coalesce(p_contact, '')), '') is null then
    raise exception 'name and contact are required' using errcode = '22023';
  end if;
  select * into v_conv from public.chat_conversations where token_hash = v_hash for update;
  if not found then
    raise exception 'no chat yet' using errcode = 'P0002';
  end if;
  v_first := not v_conv.handed_over;

  -- New hand-overs: at most 5 an hour from one visitor.
  if v_first then
    v_client := coalesce(v_conv.client_hash, private.chat_client(p_client, p_key));
    if v_client is not null and (select count(*) from public.chat_conversations
        where client_hash = v_client and handed_over_at > now() - interval '1 hour') >= 5 then
      raise exception 'too many chats' using errcode = 'P0001', hint = 'rate_limited';
    end if;
  end if;

  -- The same spam limits as messages: at most 3 shares per 10 minutes, and
  -- the chat's 500-message cap.
  if (select count(*) from public.chat_messages
      where conversation_id = v_conv.id and sender = 'system' and kind is null
        and created_at > now() - interval '10 minutes') >= 3
     or (select count(*) from public.chat_messages where conversation_id = v_conv.id) >= 500 then
    raise exception 'too many updates' using errcode = 'P0001', hint = 'rate_limited';
  end if;

  -- Alert the team the first time, then at most every 10 minutes (as chat_send).
  v_alert := v_first or v_conv.last_alert_at is null or v_conv.last_alert_at < now() - interval '10 minutes';
  -- A flood of new hand-overs (more than 60 in an hour across the site) stops
  -- alerting; the chats still appear in the inbox.
  if v_alert and (select count(*) from public.chat_conversations
                  where handed_over_at > now() - interval '1 hour') >= 60 then
    v_alert := false;
  end if;

  -- "Plan my event" answers (latest per question) fill the topic and the date.
  select coalesce(v_date, (select m.body from public.chat_messages m
                           where m.conversation_id = v_conv.id and m.plan_step = 'date' and m.body <> 'Not sure yet'
                           order by m.id desc limit 1))
    into v_date;
  -- One line, at most 60 characters (a typed answer can be long or multi-line).
  v_date := nullif(left(btrim(regexp_replace(v_date, '\s+', ' ', 'g')), 60), '');
  select m.body into v_occasion from public.chat_messages m
  where m.conversation_id = v_conv.id and m.plan_step = 'occasion'
  order by m.id desc limit 1;

  update public.chat_conversations
  set name = btrim(p_name),
      contact = btrim(p_contact),
      event_date = coalesce(v_date, event_date),
      topic = coalesce(left(btrim(regexp_replace(v_occasion, '\s+', ' ', 'g')), 60), topic),
      handed_over = true,
      handed_over_at = coalesce(handed_over_at, now()),
      status = 'open',
      last_alert_at = case when v_alert then now() else last_alert_at end
  where id = v_conv.id;

  insert into public.chat_messages (conversation_id, sender, body)
  values (v_conv.id, 'system',
          concat_ws(' · ', 'Details shared', btrim(p_name), btrim(p_contact), v_date));

  return jsonb_build_object('conversationId', v_conv.id, 'alert', v_alert, 'first', v_first);
end;
$$;

-- The visitor's chat: new messages after a given id (0 = all). With p_seen
-- (the chat window is open) the team's replies are marked as read; a peek
-- from the minimised chat only notes that the visitor is on the site.
create function public.chat_fetch(p_token text, p_after bigint default 0, p_seen boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_conv public.chat_conversations;
begin
  select * into v_conv from public.chat_conversations where token_hash = private.chat_token_hash(p_token);
  if not found then
    return jsonb_build_object('exists', false);
  end if;
  if p_seen then
    update public.chat_conversations
    set visitor_unread = 0, visitor_read_at = now(), visitor_seen_at = now()
    where id = v_conv.id;
  else
    update public.chat_conversations set visitor_seen_at = now() where id = v_conv.id;
  end if;
  return jsonb_build_object(
    'exists', true,
    'status', v_conv.status,
    'handedOver', v_conv.handed_over,
    'name', v_conv.name,
    'adminReadAt', v_conv.admin_read_at,
    'visitorReadAt', v_conv.visitor_read_at,
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object('id', m.id, 'sender', m.sender, 'body', m.body, 'choice', m.choice, 'kind', m.kind,
                                          'planStep', m.plan_step, 'data', m.data, 'at', m.created_at) order by m.id)
      from (select * from public.chat_messages
            -- Also the last minute's messages: a reply can commit after a
            -- newer message, and the visitor's chat skips what it already has.
            where conversation_id = v_conv.id
              and (id > coalesce(p_after, 0) or (p_after > 0 and created_at > now() - interval '1 minute'))
            order by id limit 200) m
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.chat_send(text, text, text, text, text, text, jsonb) from public;
revoke all on function public.chat_share_contact(text, text, text, text, text, text) from public;
revoke all on function public.chat_fetch(text, bigint, boolean) from public;
grant execute on function public.chat_send(text, text, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.chat_share_contact(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.chat_fetch(text, bigint, boolean) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Online / Away (shown in the chat header; set from Admin → Chats)
-- ---------------------------------------------------------------------------
create table public.chat_settings (
  id         boolean     primary key default true,
  away       boolean     not null default false,
  updated_at timestamptz not null default now(),
  constraint chat_settings_singleton check (id)
);
insert into public.chat_settings (id) values (true);
create trigger chat_settings_set_updated_at before update on public.chat_settings
  for each row execute function public.set_updated_at();
alter table public.chat_settings enable row level security;
revoke all on table public.chat_settings from anon, authenticated;
grant select (id, away) on public.chat_settings to anon, authenticated;
grant update (away) on public.chat_settings to authenticated;
create policy "Anyone can read the chat status"
  on public.chat_settings for select to anon, authenticated using (true);
create policy "Admins can set the chat status"
  on public.chat_settings for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Quick replies (saved answers for the team; admins only)
-- ---------------------------------------------------------------------------
create table public.chat_quick_replies (
  id         uuid        primary key default gen_random_uuid(),
  label      text        not null,
  body       text        not null,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_quick_replies_label_check check (char_length(btrim(label)) between 1 and 40 and label !~ '[\r\n]'),
  constraint chat_quick_replies_body_check check (char_length(btrim(body)) between 1 and 1000)
);
create trigger chat_quick_replies_set_updated_at before update on public.chat_quick_replies
  for each row execute function public.set_updated_at();
alter table public.chat_quick_replies enable row level security;
revoke all on table public.chat_quick_replies from anon, authenticated;
grant select, insert, update, delete on public.chat_quick_replies to authenticated;
create policy "Admins manage quick replies"
  on public.chat_quick_replies for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- Starters ({name} and {date} are filled in from the chat; [brackets] are for the team to complete).
insert into public.chat_quick_replies (label, body, sort_order) values
  ('Welcome', 'Hi {name}! Thanks for reaching out to Canvas Creations and Events. How can I help with your celebration?', 1),
  ('Need details', 'To put a quote together, could you tell me the date, the venue, roughly how many guests, and the colours or theme you have in mind?', 2),
  ('Date is free', 'Hi {name}! Good news: {date} is free. What are you celebrating?', 3),
  ('Date taken', 'Sorry {name}, we''re already booked on {date}. Is there another date that could work, or is the day flexible?', 4),
  ('Starting price', 'Our packages start from {price}. The final price depends on the size of the setup, the venue and any extras, so I''ll tailor a quote for you.', 5),
  ('Quote coming', 'Thanks {name}! I''ll put a quote together and send it to you shortly.', 6),
  ('Quote sent', 'I''ve sent your quote to [email or phone]. Have a look, and let me know if you''d like to change anything.', 7),
  ('Venue photo', 'Could you send a photo or two of the venue? It helps us plan the setup and the colours.', 8),
  ('Inspiration', 'Do you have any inspiration photos (Pinterest, Instagram or screenshots)? Send them through and we''ll match the style.', 9),
  ('Deposit', 'To lock in your date we take a [deposit] deposit, and the balance is due [when]. I''ll send the details.', 10),
  ('Booking confirmed', 'You''re booked in, {name}! {date} is locked in for you. We''ll be in touch closer to the day to confirm the final details.', 11),
  ('Setup time', 'We usually arrive [2 to 3 hours] before the event to set up, and pack down afterwards. What time does the venue give access?', 12),
  ('Follow-up', 'Hi {name}, just checking in on the quote I sent. Any questions, or would you like to go ahead?', 13),
  ('Call you?', 'Would it be easier to talk it through? What''s a good time for a quick call?', 14),
  ('Thanks', 'Thanks for chatting with us, {name}! We''d love to help make your celebration special.', 15);

-- ---------------------------------------------------------------------------
-- Quotes in chat (Admin → Chats → Quote)
-- ---------------------------------------------------------------------------
-- 1. The team sends a quote form (a team message, kind 'quote_form').
-- 2. The visitor fills it in: chat_quote_details (kind 'quote_details', the
--    answers in data). The chat's date and topic follow the answers.
-- 3. The team sends a quote (kind 'quote': items, total, deposit, note).
-- 4. The visitor accepts the latest quote: chat_quote_accept (kind
--    'quote_accept', data.quoteId). The team gets an alert either way.
create function public.chat_quote_details(p_token text, p_body text, p_details jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_conv public.chat_conversations;
  v_key text;
  v_alert boolean;
  v_date text;
begin
  if p_body is null or char_length(btrim(p_body)) not between 1 and 1000 then
    raise exception 'invalid message' using errcode = '22023';
  end if;
  if p_details is null or jsonb_typeof(p_details) <> 'object' then
    raise exception 'invalid details' using errcode = '22023';
  end if;
  for v_key in select jsonb_object_keys(p_details) loop
    if v_key not in ('occasion', 'date', 'guests', 'venue', 'theme', 'budget')
       or jsonb_typeof(p_details -> v_key) <> 'string'
       or char_length(p_details ->> v_key) > 100
       or (p_details ->> v_key) ~ '[\r\n]' then
      raise exception 'invalid details' using errcode = '22023';
    end if;
  end loop;

  select * into v_conv from public.chat_conversations where token_hash = private.chat_token_hash(p_token) for update;
  if not found then
    raise exception 'no chat yet' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.chat_messages
                 where conversation_id = v_conv.id and sender = 'team' and kind = 'quote_form') then
    raise exception 'no quote form in this chat' using errcode = '22023';
  end if;
  if (select count(*) from public.chat_messages
      where conversation_id = v_conv.id and sender = 'visitor' and created_at > now() - interval '10 minutes') >= 30
     or (select count(*) from public.chat_messages where conversation_id = v_conv.id) >= 500 then
    raise exception 'too many messages' using errcode = 'P0001', hint = 'rate_limited';
  end if;

  v_alert := v_conv.last_alert_at is null or v_conv.last_alert_at < now() - interval '10 minutes';
  v_date := nullif(btrim(p_details ->> 'date'), '');
  if v_date = 'Not sure yet' then
    v_date := null;
  end if;

  insert into public.chat_messages (conversation_id, sender, body, kind, data)
  values (v_conv.id, 'visitor', btrim(p_body), 'quote_details', p_details);
  update public.chat_conversations
  set event_date = coalesce(left(v_date, 60), event_date),
      topic = coalesce(left(nullif(btrim(p_details ->> 'occasion'), ''), 60), topic),
      last_alert_at = case when v_alert then now() else last_alert_at end
  where id = v_conv.id;

  return jsonb_build_object('conversationId', v_conv.id, 'alert', v_alert, 'name', v_conv.name);
end;
$$;

create function public.chat_quote_accept(p_token text, p_quote_id bigint)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_conv public.chat_conversations;
begin
  select * into v_conv from public.chat_conversations where token_hash = private.chat_token_hash(p_token) for update;
  if not found then
    raise exception 'no chat yet' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.chat_messages
                 where id = p_quote_id and conversation_id = v_conv.id and sender = 'team' and kind = 'quote') then
    raise exception 'no such quote' using errcode = '22023';
  end if;
  -- Only the latest quote can be accepted (an earlier one was replaced).
  if exists (select 1 from public.chat_messages
             where conversation_id = v_conv.id and sender = 'team' and kind = 'quote' and id > p_quote_id) then
    raise exception 'quote replaced' using errcode = 'P0001', hint = 'quote_replaced';
  end if;
  -- Accepting twice changes nothing.
  if exists (select 1 from public.chat_messages
             where conversation_id = v_conv.id and kind = 'quote_accept' and (data ->> 'quoteId')::bigint = p_quote_id) then
    return jsonb_build_object('conversationId', v_conv.id, 'alert', false, 'name', v_conv.name);
  end if;
  if (select count(*) from public.chat_messages where conversation_id = v_conv.id) >= 500 then
    raise exception 'too many messages' using errcode = 'P0001', hint = 'rate_limited';
  end if;

  insert into public.chat_messages (conversation_id, sender, body, kind, data)
  values (v_conv.id, 'visitor', 'Accepted the quote', 'quote_accept', jsonb_build_object('quoteId', p_quote_id));
  -- Always an alert: an accepted quote is a booking to follow up.
  update public.chat_conversations set last_alert_at = now() where id = v_conv.id;

  return jsonb_build_object('conversationId', v_conv.id, 'alert', true, 'name', v_conv.name);
end;
$$;

revoke all on function public.chat_quote_details(text, text, jsonb) from public;
revoke all on function public.chat_quote_accept(text, bigint) from public;
grant execute on function public.chat_quote_details(text, text, jsonb) to anon, authenticated;
grant execute on function public.chat_quote_accept(text, bigint) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- "Create enquiry" from a chat (Admin → Chats)
-- ---------------------------------------------------------------------------
-- A chat visitor gives an email OR a phone number, so enquiries made from a
-- chat need only one of the two. Website form enquiries are unchanged: the
-- form still requires both (and the public insert policy still requires a
-- phone). Each chat becomes at most one enquiry.
alter table public.enquiries
  add column source  text not null default 'website',
  add column chat_id uuid references public.chat_conversations (id) on delete set null,
  alter column email drop not null,
  drop constraint enquiries_email_check,
  add constraint enquiries_email_check check (
    email is null or (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  ),
  add constraint enquiries_source_check check (source in ('website', 'chat')),
  add constraint enquiries_contact_check check (email is not null or phone is not null),
  add constraint enquiries_website_email_check check (source <> 'website' or email is not null);

create unique index enquiries_chat_id_key on public.enquiries (chat_id) where chat_id is not null;

-- Visitor info for website enquiries (the same as chats: see chat_conversations.meta).
alter table public.enquiries
  add column meta jsonb,
  add constraint enquiries_meta_check check (meta is null or (jsonb_typeof(meta) = 'object' and pg_column_size(meta) <= 4000));
grant insert (meta) on public.enquiries to anon, authenticated;

grant insert (source, chat_id) on public.enquiries to authenticated;

-- The public form makes website enquiries only (signed-in non-admins too).
drop policy "Public can submit new enquiries" on public.enquiries;
create policy "Public can submit new enquiries"
  on public.enquiries
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and phone is not null
    and char_length(btrim(phone)) between 6 and 30
    and source = 'website'
    and chat_id is null
  );

create policy "Admins can add enquiries from chats"
  on public.enquiries for insert to authenticated
  with check ((select private.is_admin()) and source = 'chat' and chat_id is not null and status = 'new');

-- ---------------------------------------------------------------------------
-- "New chat message" push alerts (per device, like the others)
-- ---------------------------------------------------------------------------
alter table public.push_subscriptions
  add column notify_chats boolean not null default true;

create or replace function public.push_targets(p_secret text, p_kind text)
returns table (endpoint text, p256dh text, auth text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.dispatch_secret_ok(p_secret) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
    select s.endpoint, s.p256dh, s.auth
    from public.push_subscriptions s
    join public.admin_users a on a.user_id = s.admin_user_id and a.role = 'super_admin'
    where s.revoked_at is null
      and (   (p_kind = 'enquiry' and s.notify_enquiries)
           or (p_kind = 'reminder' and s.notify_reminders)
           or (p_kind = 'review' and s.notify_reviews)
           or (p_kind = 'chat' and s.notify_chats));
end;
$$;
revoke all on function public.push_targets(text, text) from public;
grant execute on function public.push_targets(text, text) to anon, authenticated;
