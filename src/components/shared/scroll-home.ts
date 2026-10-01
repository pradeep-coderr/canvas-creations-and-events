import { scrollPageTo } from "@/components/motion/smooth-scroll";

/**
 * On the homepage: scroll to the top (smoothly unless the visitor prefers
 * reduced motion) and drop any "#section"
 * from the address. Returns false when not on the homepage, so the caller
 * navigates normally.
 */
export function scrollHomeToTop(): boolean {
  if (window.location.pathname !== "/") return false;
  if (window.location.hash) window.history.pushState(null, "", "/");
  scrollPageTo(0);
  return true;
}
