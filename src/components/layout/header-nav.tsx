"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteLink } from "@/components/shared/site-link";

type NavItem = { label: React.ReactNode; href: string };

// Matches the admin tabs. The hover line sits where the current item's underline does.
const linkClass =
  "relative inline-flex h-full items-center px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors duration-300 after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-transparent after:transition-colors hover:text-foreground hover:after:bg-foreground/20 aria-[current]:text-foreground";

/**
 * Which menu item's section is on screen (homepage only): the last of the
 * linked sections whose top has passed 40% of the way down the screen, or
 * Home above them all. Elsewhere, nothing.
 */
function useActiveHref(items: NavItem[]) {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (pathname !== "/") return;
    const targets = items
      .map((item) => ({ href: item.href, el: item.href.startsWith("/#") ? document.getElementById(item.href.slice(2)) : null }))
      .filter((t): t is { href: string; el: HTMLElement } => !!t.el);
    const home = items.find((item) => item.href === "/")?.href ?? null;
    let frame = 0;
    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let next = home;
      for (const { href, el } of targets) if (el.getBoundingClientRect().top <= line) next = href;
      setActive(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, items]);
  return pathname === "/" ? active : null;
}

/**
 * The main menu (desktop). On the homepage an underline on the header's
 * bottom edge marks the section you're looking at and slides along as you
 * scroll (globals.css "Header ribbon"); that item is marked aria-current.
 */
export function HeaderNav({ items }: { items: NavItem[] }) {
  const active = useActiveHref(items);
  const list = useRef<HTMLUListElement>(null);
  const [line, setLine] = useState<{ x: number; w: number } | null>(null);

  // Fit the underline to the active item (and again when the layout changes).
  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const place = () => {
      const li = active ? ul.querySelector<HTMLElement>(`[data-href="${active}"]`) : null;
      // Inset by the link's px-3 padding, so it spans the text.
      setLine(li ? { x: li.offsetLeft + 12, w: li.offsetWidth - 24 } : null);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(ul);
    return () => ro.disconnect();
  }, [active]);

  return (
    <nav aria-label="Main" className="relative hidden self-stretch lg:block">
      <ul ref={list} className="flex h-full gap-1 xl:gap-3">
        {items.map((item) => (
          <li key={item.href} data-href={item.href} className="h-full">
            <SiteLink href={item.href} aria-current={item.href === active ? "location" : undefined} className={linkClass}>
              {item.label}
            </SiteLink>
          </li>
        ))}
      </ul>
      <span
        aria-hidden="true"
        className="nav-line bg-primary"
        data-shown={line ? true : undefined}
        style={{ "--x": `${line?.x ?? 0}px`, "--w": `${line?.w ?? 0}px` } as React.CSSProperties}
      />
    </nav>
  );
}
