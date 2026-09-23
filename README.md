# Canvas Creations and Events

_Turning moments into masterpieces_ — website for a premium event decoration and styling studio in South Australia.

## Stack

Bun · Next.js (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix, Lucide) · Motion · React Hook Form + Zod · Supabase · Vercel

## Getting started

```bash
bun install
cp .env.example .env.local   # fill in values when Supabase is set up
bun dev                      # http://localhost:3000
```

## Scripts

| Command             | Purpose                         |
| ------------------- | ------------------------------- |
| `bun dev`           | Development server (Turbopack)  |
| `bun run build`     | Production build                |
| `bun start`         | Serve the production build      |
| `bun run lint`      | ESLint                          |
| `bun run typecheck` | Generate route types + `tsc`    |

## Design system

Live reference: run `bun dev` and open **`/design-system`** (development only; returns 404 in production).

| Need | Use |
| --- | --- |
| Page width | `<Container>` (`size="narrow"` for reading width) — `components/layout` |
| Section rhythm + surface | `<Section tone="default \| ivory \| blush \| dark">` — `components/layout` |
| Eyebrow / heading / intro | `<SectionHeading eyebrow title description />`, `<Eyebrow>` — `components/shared` |
| Editorial break | `<DecorativeDivider />` — `components/shared` |
| Photography | `<ImageFrame ratio sizes alt />` — `components/shared` |
| Buttons | `<Button>` variants: `default` (primary), `secondary`, `ghost`, `link` (text CTA; add `<ArrowRight data-icon="inline-end" />`) |
| Forms | `Field`, `FieldLabel`, `FieldError`, `Input`, `Textarea`, `Select` — `components/ui` |
| Scroll reveal | `<Reveal delay={i * stagger}>` — `components/motion`; tokens in `lib/motion.ts` |

**Type scale** (fluid, no breakpoints needed): `text-display-xl` (hero), `text-display-lg` (section headings), `text-display-md` (statements/quotes), `text-display-sm` (small titles) — always with `font-display`; `text-lead`, `text-base`, `text-sm` with Manrope; `text-eyebrow` via `<Eyebrow>`.

**Colour rules**
- ~75% white/ivory, ~20% blush/rose, ~5% gold. Gold is for hairlines, borders and ornaments only — never small text on a light surface.
- Rose text and primary buttons use `primary` (rose-ink `#9B605A`), not the lighter brand roses, which fail WCAG AA as text.
- Don't put `text-muted-foreground` on `bg-secondary` (blush-soft): 4.32:1, below AA.
- Dark surfaces: `data-tone="dark"` (set by `<Section tone="dark">`) swaps the tokens; no `dark:` classes needed.

## Conventions

- **Design tokens** live in `src/app/globals.css`. Raw brand colours (`--cc-*`) are only referenced there; components use semantic utilities (`bg-primary`, `text-muted-foreground`, `bg-surface-ivory`, `text-emphasis`, …). Do not add hex values in components.
- **Fonts**: `font-display` / `font-heading` → Cormorant Garamond (headings, editorial, quotes); `font-sans` (default) → Manrope (body and UI). Loaded via `next/font` in `src/app/layout.tsx`.
- **Business details** (name, phone, address, socials) come from `src/data/site.ts`.
- **shadcn/ui**: add components individually with `bunx shadcn@latest add <component>`, then **change its `import { cn } from "cn"` to `from "@/lib/utils"`** — the project `cn` knows the custom type scale, and the default one silently drops `text-eyebrow`/`text-lead` etc. when combined with a text colour. Restyle via tokens, not per-component colour overrides.
- **Motion**: slow and restrained (`lib/motion.ts`). Fades and small lifts only; `MotionProvider` respects reduced motion. Hover effects use CSS with `ease-elegant`.
- **Supabase**: `@/lib/supabase/client` (Client Components) and `@/lib/supabase/server` (server code).
- **Logo** (`public/images/logo/`): `canvas-creations-logo.png` (1182px, transparent outside the ring — use this on the site, via `next/image`), `canvas-creations-logo-512.png` (lighter web size), `canvas-creations-monogram.png` (CC monogram only, for small placements), `canvas-creations-logo.svg` (same artwork embedded in SVG — not a true vector), `canvas-creations-logo-original.png` (untouched client file). Browser icons live in `src/app/` (`favicon.ico`, `icon.png`, `apple-icon.png`) and are linked automatically by Next.js; they use the monogram, because the full logo is unreadable at 16–32px.
- **Assets**: client-supplied media only, under `public/images/{logo,founder,gallery,services,videos}`. Use descriptive kebab-case filenames (e.g. `gallery/wedding-arch-rose-gold.jpg`).
