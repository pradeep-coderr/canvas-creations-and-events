"use client";

import { useState } from "react";
import type { SocialPlatform } from "@/data/site";
import { cn } from "@/lib/utils";

/*
 * Above the chat's message box: the studio's social accounts. A button shows
 * a few ready-made messages; choosing one copies it and opens that inbox in a
 * new tab, so the visitor can send it from their own account. Nothing can be
 * sent for them: each app needs its own Send press. How close each one gets:
 *   Facebook:  m.me fills the message in, from a page address (a share link
 *              has no page name, so it opens that link instead)
 *   Instagram: ig.me opens the conversation; the message is pasted
 *   TikTok:    no inbox link for a normal account, so it opens the profile
 */

type Social = { platform: SocialPlatform; label: string; href: string };

const SUGGESTIONS = [
  "Hi! I'd love some help planning a celebration.",
  "Hi! Are you available on my event date?",
  "Hi! Could you share your packages and pricing?",
];

const ICONS: Record<SocialPlatform, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </>
  ),
  facebook: <path fill="currentColor" d="M14 8.5h2.5V5H14c-2.4 0-4 1.6-4 4v2H8v3.5h2V21h3.5v-6.5H16l.5-3.5h-3V9c0-.3.2-.5.5-.5z" />,
  tiktok: (
    <path
      fill="currentColor"
      d="M16 3c.3 2.4 1.7 3.9 4 4.1v3.1c-1.5 0-2.8-.4-4-1.2v6.4c0 3.4-2.6 5.6-5.6 5.6-3.1 0-5.4-2.4-5.4-5.4 0-3.3 2.8-5.8 6.3-5.3v3.2c-1.6-.4-3.1.6-3.1 2.1 0 1.3 1 2.3 2.2 2.3 1.4 0 2.4-1 2.4-2.7V3z"
    />
  ),
};

/** Where a suggestion goes, and whether the message arrives already typed. */
function inbox({ platform, href }: Social, message: string) {
  let name = "";
  try {
    name = new URL(href).pathname.split("/").filter(Boolean)[0] ?? "";
  } catch {
    return { url: href, filled: false };
  }
  if (platform === "instagram" && name) return { url: `https://ig.me/m/${name}`, filled: false };
  if (platform === "facebook" && name && name !== "share" && !name.endsWith(".php")) {
    return { url: `https://m.me/${name}?text=${encodeURIComponent(message)}`, filled: true };
  }
  return { url: href, filled: false };
}

export function ChatSocials({ socials }: { socials: Social[] }) {
  const [active, setActive] = useState<SocialPlatform | null>(null);
  const [status, setStatus] = useState("");
  const social = socials.find((s) => s.platform === active);
  if (socials.length === 0) return null;

  const choose = async (s: Social, message: string, filled: boolean) => {
    const copied = await navigator.clipboard?.writeText(message).then(
      () => true,
      () => false,
    );
    if (filled) setStatus(`Your message is on its way to ${s.label}. Press send there.`);
    else if (!copied) setStatus(`${s.label} is opening. Type your message there and press send.`);
    else if (s.platform === "tiktok") setStatus("Message copied. On our TikTok profile, tap Message, paste it and press send.");
    else setStatus(`Message copied. Paste it in ${s.label} and press send.`);
  };

  return (
    <div className="border-t border-border px-3 py-2">
      <div className="flex items-center gap-1.5">
        <p className="mr-auto text-xs font-semibold text-muted-foreground">Or message us on</p>
        {socials.map((s) => (
          <button
            key={s.platform}
            type="button"
            aria-label={`Message us on ${s.label}`}
            aria-expanded={active === s.platform}
            title={s.label}
            onClick={() => {
              setActive(active === s.platform ? null : s.platform);
              setStatus("");
            }}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active === s.platform ? "border-primary bg-surface-blush text-emphasis" : "border-border text-foreground hover:border-primary hover:text-emphasis",
            )}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
              {ICONS[s.platform]}
            </svg>
          </button>
        ))}
      </div>
      {social && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {SUGGESTIONS.map((message) => {
            const { url, filled } = inbox(social, message);
            return (
              <li key={message}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void choose(social, message, filled)}
                  className="block rounded-2xl border border-primary/40 bg-background px-3.5 py-2 text-[13px] leading-snug font-semibold text-emphasis transition-colors hover:border-primary hover:bg-surface-blush focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {message}
                  <span className="sr-only"> (opens {social.label} in a new tab)</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      <p role="status" className="mt-2 text-xs leading-snug text-muted-foreground empty:hidden">
        {status}
      </p>
    </div>
  );
}
