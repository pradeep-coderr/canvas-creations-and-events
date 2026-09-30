/**
 * On the homepage: scroll to the top (smoothly unless the visitor prefers
 * reduced motion; html's scroll-behavior decides) and drop any "#section"
 * from the address. Returns false when not on the homepage, so the caller
 * navigates normally.
 */
export function scrollHomeToTop(): boolean {
  if (window.location.pathname !== "/") return false;
  if (window.location.hash) window.history.pushState(null, "", "/");
  window.scrollTo({ top: 0 });
  return true;
}
