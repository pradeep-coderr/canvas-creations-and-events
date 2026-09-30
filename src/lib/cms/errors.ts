/**
 * Turns a database error into a message the admin can act on. The database
 * is the final integrity check (constraints, foreign keys, RLS); this names
 * what it rejected instead of a generic failure.
 */
export function describeDbError(
  error: { code?: string; message?: string; details?: string } | null | undefined,
  action: string,
): string {
  const code = error?.code;
  const where = `${error?.message ?? ""} ${error?.details ?? ""}`;

  if (code === "23505") {
    if (/slug/.test(where)) return "That web address name (slug) is already used. Choose a different one.";
    if (/storage_path/.test(where)) return "That file is already in the media list.";
    if (/films_video_key/.test(where)) return "That video is already in the films list. Each video can be listed once.";
    return `Couldn't ${action}: it duplicates an existing item.`;
  }
  if (code === "23503") {
    if (/gallery_items_media_fkey/.test(where))
      return /still referenced/.test(where)
        ? "This photo is still used in the gallery. Remove it from the gallery first."
        : "The selected photo no longer exists. Choose another one.";
    if (/event_stor(ies_image|y_images_media)_fkey/.test(where))
      return /still referenced/.test(where)
        ? "This photo is used in an event story. Remove it from the story first."
        : "A selected photo no longer exists. Choose another one.";
    if (/films_video_fkey/.test(where))
      return /still referenced/.test(where)
        ? "This video is still used in the films list. Remove it from there first."
        : "The selected video no longer exists, or isn't a YouTube or Vimeo video. Choose another one.";
    if (/media_assets_poster_fkey/.test(where))
      return /still referenced/.test(where)
        ? "This photo is a video's cover. Choose another cover for that video first."
        : "The selected cover photo no longer exists. Choose another one.";
    if (/video_story_(video|poster)_fkey/.test(where))
      return "The selected video or poster no longer exists, or is still used by the video section.";
    if (/category/.test(where)) return "The selected category no longer exists. Choose another one.";
    return `Couldn't ${action}: it's linked to other content.`;
  }
  if (code === "23514" || code === "23502") {
    if (/faqs_action_check/.test(where)) return "A link needs both its text and its address.";
    if (/pricing_packages_quote_price_check/.test(where))
      return "A fixed or “from” price needs an amount; a custom quote has none.";
    if (/films_video_provider_check/.test(where)) return "Films can use YouTube or Vimeo videos only.";
    if (/video_story_video_check/.test(where))
      return "The video settings are incomplete for the chosen video type.";
    return `Couldn't ${action}: some content doesn't meet the website's rules. Check the fields and try again.`;
  }
  if (code === "42501") return "You don't have permission to do that. Try signing in again.";
  if (code === "PGRST116") return "This item no longer exists. It may have been deleted.";
  return `Couldn't ${action}. Please try again.`;
}
