import type { SocialPlatform } from "@/data/site";
import { cn } from "@/lib/utils";

/*
 * The platforms' own logo shapes (solid, one colour: they take the text
 * colour), and each platform's brand colours for the round button behind the
 * logo. Inline SVG: no icon package or network request.
 */
export const socialBrand: Record<SocialPlatform, string> = {
  instagram: "bg-[linear-gradient(45deg,#feda75_0%,#fa7e1e_25%,#d62976_50%,#962fbf_75%,#4f5bd5_100%)] text-white",
  facebook: "bg-[#1877f2] text-white",
  // Black with TikTok's cyan and red edges on the note.
  tiktok:
    "bg-black text-white ring-1 ring-white/15 [&_svg]:[filter:drop-shadow(-1px_-1px_0_#25f4ee)_drop-shadow(1px_1px_0_#fe2c55)]",
};

const paths: Record<SocialPlatform, string> = {
  instagram:
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 1 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 1 0 0-6zm5.5-3.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 1 1 0-2.5z",
  facebook:
    "M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
};

export function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={cn("size-5", className)}>
      <path fillRule="evenodd" d={paths[platform]} />
    </svg>
  );
}
