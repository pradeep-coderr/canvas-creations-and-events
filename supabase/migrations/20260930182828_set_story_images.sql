-- Phase 23 review fix: replace an event story's extra photos in ONE step.
-- Delete + insert inside a single function call is a single transaction, so
-- a failure (e.g. a photo deleted meanwhile) leaves the previous list intact.
-- SECURITY INVOKER: the admin's own RLS applies (admins only).
create function public.set_story_images(p_story_id uuid, p_media_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.event_story_images where story_id = p_story_id;
  insert into public.event_story_images (story_id, media_id, sort_order)
  select p_story_id, m.media_id, m.ord::integer
    from unnest(coalesce(p_media_ids, '{}')) with ordinality as m(media_id, ord);
end;
$$;

revoke all on function public.set_story_images(uuid, uuid[]) from public, anon;
grant execute on function public.set_story_images(uuid, uuid[]) to authenticated;
