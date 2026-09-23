import Link from "next/link";

type SiteLinkProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

/**
 * In-page anchors ("/#services") render a native <a>: the browser always
 * scrolls to the target, even when the URL already ends in that hash
 * (Next's <Link> skips same-URL navigation, so a second click did nothing).
 * Other routes use <Link> for client-side navigation.
 */
export function SiteLink({ href, ...props }: SiteLinkProps) {
  return href.includes("#") ? (
    <a href={href} {...props} />
  ) : (
    <Link href={href} {...props} />
  );
}
