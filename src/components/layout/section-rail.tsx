"use client";

import { useEffect, useRef, useState } from "react";
import { MiniBow } from "@/components/shared/mini-bow";

type RailItem = { href: string; label: string; el: HTMLElement };

/** The homepage's sections, as they are on the page: unpublished ones are simply absent. */
function readSections(): RailItem[] {
  const sections = document.querySelectorAll<HTMLElement>("#main section[aria-labelledby]");
  return [...sections].flatMap((el, i) => {
    if (i === 0) return [{ href: "#main", label: "Home", el }];
    const label = el.querySelector("[data-eyebrow]")?.textContent?.trim();
    return el.id && label ? [{ href: `#${el.id}`, label, el }] : [];
  });
}

/**
 * A gold arc down the right edge of the homepage (large screens), strung
 * with a pearl bead per section. It fills as you scroll, a small bow riding
 * its tip with a ribbon flag naming the current section, so it covers almost
 * nothing. Hovering or tabbing to it opens a drawer with every section by
 * name; each is a link that glides there (SmoothScroll handles the links).
 * See globals.css "Section rail".
 */
export function SectionRail() {
  const [items, setItems] = useState<RailItem[]>([]);
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setItems(readSections()));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Progress: the section at 40% of the way down the screen, plus how far
  // the page has moved towards the next one. Written straight to --rail,
  // so scrolling re-renders only when the section changes.
  useEffect(() => {
    if (items.length < 2) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const tops = items.map((item) => item.el.getBoundingClientRect().top);
      const last = items.length - 1;
      let index = 0;
      tops.forEach((top, i) => {
        if (top <= line) index = i;
      });
      const part = index < last ? Math.min(1, (line - tops[index]) / (tops[index + 1] - tops[index])) : 0;
      const end = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      rail.current?.style.setProperty("--rail", String(end ? 1 : Math.max(0, index + part) / last));
      setActive(end ? last : index);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  if (items.length < 2) return null;
  const last = items.length - 1;

  return (
    <div className="section-rail-dock">
      <nav ref={rail} aria-label="Page sections" className="section-rail" style={{ "--n": items.length } as React.CSSProperties}>
        {/* The arc: a quadratic curve, so a bead at s along it sits 2s(1-s) of
            the arc's width in from the edge (--o below). */}
        <span aria-hidden="true" className="rail-arc">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="rail-arc-track">
            <path d="M100 0 Q 0 50 100 100" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="rail-arc-fill">
            <path d="M100 0 Q 0 50 100 100" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="rail-tip">
            <span className="rail-flag">{items[active]?.label}</span>
            <MiniBow className="rail-bow" />
          </span>
        </span>
        <ol className="rail-list">
          {items.map((item, i) => {
            const s = i / last;
            return (
              <li key={item.href} style={{ "--o": 2 * s * (1 - s) } as React.CSSProperties}>
                <a
                  href={item.href}
                  aria-current={i === active ? "location" : undefined}
                  data-done={i <= active || undefined}
                  className="rail-link"
                >
                  <span className="rail-label">{item.label}</span>
                  <span aria-hidden="true" className="rail-bead" />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
