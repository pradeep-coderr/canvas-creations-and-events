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

## Conventions

- **Design tokens** live in `src/app/globals.css`. Raw brand colours (`--cc-*`) are only referenced there; components use semantic utilities (`bg-primary`, `text-muted-foreground`, `bg-surface-ivory`, `text-highlight`, …). Do not add hex values in components.
- **Fonts**: `font-display` / `font-heading` → Cormorant Garamond (headings, editorial, quotes); `font-sans` (default) → Manrope (body and UI). Loaded via `next/font` in `src/app/layout.tsx`.
- **Business details** (name, phone, address, socials) come from `src/data/site.ts`.
- **shadcn/ui**: add components individually with `bunx shadcn@latest add <component>`. Restyle via tokens, not per-component colour overrides.
- **Supabase**: `@/lib/supabase/client` (Client Components) and `@/lib/supabase/server` (server code).
- **Assets**: client-supplied media only, under `public/images/{logo,founder,gallery,services,videos}`. Use descriptive kebab-case filenames (e.g. `gallery/wedding-arch-rose-gold.jpg`).
