"use client";

import Link from "next/link";
import { scrollHomeToTop } from "./scroll-home";

type HomeLinkProps = Omit<React.ComponentProps<"a">, "href">;

/**
 * A link to the homepage ("/"). On the homepage itself Next's <Link> does
 * nothing (it's the same page), so here it scrolls back to the top instead
 * and drops any "#section" from the address. Elsewhere it navigates normally.
 */
export function HomeLink({ onClick, ...props }: HomeLinkProps) {
  return (
    <Link
      href="/"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        if (scrollHomeToTop()) event.preventDefault();
      }}
    />
  );
}
