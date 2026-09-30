import Link from "next/link";
import { HomeLink } from "./home-link";

type SiteLinkProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

/**
 * The homepage ("/") uses HomeLink: on the homepage it scrolls back to the
 * top (Next's <Link> ignores a link to the page you're on).
 * In-page anchors ("/#services") render a native <a>: the browser always
 * scrolls to the target, even when the URL already ends in that hash
 * (Next's <Link> skips same-URL navigation, so a second click did nothing).
 * Other routes use <Link> for client-side navigation.
 */
export function SiteLink({ href, ...props }: SiteLinkProps) {
  if (href === "/") return <HomeLink {...props} />;
  return href.includes("#") ? (
    <a href={href} {...props} />
  ) : (
    <Link href={href} {...props} />
  );
}
