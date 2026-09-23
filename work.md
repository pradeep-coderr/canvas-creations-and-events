# Work Log — Project Initialization

**Project:** Canvas Creations and Events website
**Task:** Initialize and configure the project foundation (no website UI)
**Date:** Wednesday, 23 September 2026
**Timezone:** Nepal Time, NPT (UTC+05:45)
**Work window:** ~19:48 → 19:57:54 (initial commit)
**Location:** `C:\Users\pradeep\codes\personal\canvas-creations-and-events`
**Result:** Initial commit `4f2b519 chore: initialize Canvas Creations website` at 2026-09-23 19:57:54 +0545 (not pushed)

> Times come from file modification timestamps and the Git commit, not from memory. A time marked `~` is inferred from the surrounding steps.

---

## Timeline

| Date | Time (NPT) | Step | Evidence |
| --- | --- | --- | --- |
| 2026-09-23 | 19:02 | Empty project folder exists (created before this work began) | Folder timestamp at first inspection |
| 2026-09-23 | ~19:48 | Environment inspection and npm version lookup | Just before the scaffold started |
| 2026-09-23 | 19:49:19 | `create-next-app` starts writing files | `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs` |
| 2026-09-23 | 19:50:25 | Next.js dependencies installed (353 packages, 61.9s) | `node_modules/next` |
| 2026-09-23 | 19:50:33 | Scaffold complete, `AGENTS.md` / `CLAUDE.md` written | `AGENTS.md` |
| 2026-09-23 | 19:54:05 | shadcn init writes config | `components.json` |
| 2026-09-23 | 19:54:12 | shadcn dependencies installed | `node_modules/radix-ui` |
| 2026-09-23 | 19:54:37 | shadcn creates Button and `cn` helper | `button.tsx`, `lib/utils.ts` |
| 2026-09-23 | 19:55:02 – 19:55:05 | Motion, React Hook Form, Zod, resolvers, Supabase installed | `node_modules/motion`, `bun.lock` |
| 2026-09-23 | 19:56:17 | Brand theme, fonts/layout, business data written | `globals.css`, `layout.tsx`, `site.ts` |
| 2026-09-23 | 19:56:29 | Supabase clients and `.env.example` written | `lib/supabase/*`, `.env.example` |
| 2026-09-23 | 19:56:36 | `.gitignore` fix, demo SVGs removed, asset folders, `typecheck` script, `.editorconfig` | `public/images/*`, `package.json` |
| 2026-09-23 | 19:56:44 | Project README written | `README.md` |
| 2026-09-23 | 19:56:52 | Frozen install and type check run; lint follows | `tsconfig.tsbuildinfo` |
| 2026-09-23 | ~19:57:00 – 19:57:20 | Production build | Between the type check and the dev server start |
| 2026-09-23 | 19:57:23 | Dev server started, temporary Button check | `.next/`, `next-env.d.ts` |
| 2026-09-23 | 19:57:34 | Placeholder page restored, dev server stopped | `src/app/page.tsx` |
| 2026-09-23 | 19:57:54 | `.gitattributes` added, Git initialized, initial commit | `.gitattributes`, commit `4f2b519` |
| 2026-09-23 | 20:08:21 | `work.md` created | `work.md` |
| 2026-09-23 | 20:27:49 | `work.md` updated with dates and times | This update |

**Total active setup time:** about 10 minutes (~19:48 → 19:57:54).

---

## 1. Environment inspection — 2026-09-23, ~19:48 NPT

Before running anything, I checked the target folder and the installed tools.

| What | Result |
| --- | --- |
| Target folder | Existed and was empty, not yet a Git repository |
| Bun | 1.3.14 |
| Node | 24.18.0 |
| npm | 11.16.0 |
| Git | 2.55.0 |
| OS | Windows 11 |

Then I checked the latest published versions on npm so nothing would be pinned to an old release:

| Package | Latest stable |
| --- | --- |
| create-next-app / next | 16.3.6 |
| react | 19.3.0 |
| typescript | 7.0.2 |
| tailwindcss | 4.3.3 |
| shadcn | 4.21.0 |
| motion | 13.4.1 |
| react-hook-form | 7.88.0 |
| zod | 4.6.5 |
| @hookform/resolvers | 5.9.1 |
| @supabase/supabase-js | 2.117.1 |
| @supabase/ssr | 0.12.7 |

I also read `create-next-app --help` to use the current flags. In Next.js 16, Turbopack is the default bundler, so it no longer needs a flag.

---

## 2. Next.js scaffold — 2026-09-23, 19:49:19 – 19:50:33 NPT

**Command (run in the project folder):**

```bash
bunx create-next-app@latest . --ts --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-bun --agents-md --disable-git --yes
```

| Option | Why |
| --- | --- |
| `--ts` | TypeScript |
| `--tailwind` | Tailwind CSS v4 |
| `--eslint` | ESLint (flat config) |
| `--app` | App Router (no Pages Router) |
| `--src-dir` | Code lives in `src/` |
| `--import-alias "@/*"` | `@/` → `src/` |
| `--use-bun` | Bun as package manager |
| `--agents-md` | Next.js writes `AGENTS.md` with up-to-date guidance for coding agents |
| `--disable-git` | I initialized Git myself at the end, after verification |

**What it created:** `package.json`, `bun.lock`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `src/app/{layout.tsx,page.tsx,globals.css,favicon.ico}` and five demo SVGs in `public/`.

**Versions it installed:** Next.js 16.3.6, React 19.2.8, TypeScript 5.9.3, Tailwind 4.3.3, ESLint 9.39.5. I kept create-next-app's choices, because they are the combination Next.js officially supports (see Decisions).

**Problem spotted:** the generated `.gitignore` contains `.env*`, which would also hide `.env.example` from Git. Fixed in step 6.

**Next.js docs:** the generated `AGENTS.md` says to read the docs bundled in `node_modules/next/dist/docs/` before writing code. I read the font guide (`01-app/01-getting-started/13-fonts.md`) to confirm `next/font/google` is still the recommended way to load fonts.

---

## 3. shadcn/ui initialization — 2026-09-23, 19:54:05 – 19:54:37 NPT

I checked `shadcn init --help`. The CLI's default preset is `base-nova`, which uses **Base UI**, not Radix. You asked for Radix, so I used the Radix base with the current recommended style.

My first attempt with `-p radix-nova` failed. The CLI listed the valid presets (`nova, vega, maia, lyra, mira, luma, sera, rhea`) and chose the Radix variant based on `--base`.

**Command:**

```bash
bunx shadcn@latest init -t next -b radix -p nova --no-monorepo --css-variables --no-rtl -y
```

**What it created or changed:**

| File | Change |
| --- | --- |
| `components.json` | Created. Style `radix-nova`, icon library `lucide`, CSS variables on, aliases `@/components`, `@/components/ui`, `@/lib/utils`, `@/lib`, `@/hooks` |
| `src/components/ui/button.tsx` | Created automatically by init |
| `src/lib/utils.ts` | Created. Re-exports `cn` from the `cn` package |
| `src/app/globals.css` | Rewritten with shadcn's default neutral theme (later replaced with the brand theme) |
| `package.json` | Added `radix-ui`, `lucide-react`, `class-variance-authority`, `cn`, `tw-animate-css`, `shadcn` |

**Check on the `cn` package:** shadcn now uses a package called `cn` in place of the older `clsx` + `tailwind-merge` helper. Because this was unfamiliar, I checked its npm listing. Its repository is `github.com/shadcn-ui/cn` and its maintainer is shadcn, so it's the official package.

I didn't add any other shadcn components.

---

## 4. Remaining stack dependencies — 2026-09-23, 19:55:02 – 19:55:05 NPT

**Command:**

```bash
bun add motion react-hook-form zod @hookform/resolvers @supabase/supabase-js @supabase/ssr
```

| Package | Purpose |
| --- | --- |
| `motion` 13.4.1 | Animation (current package, not `framer-motion`) |
| `react-hook-form` 7.88.0 | Forms |
| `zod` 4.6.5 | Validation |
| `@hookform/resolvers` 5.9.1 | Connects React Hook Form to Zod schemas |
| `@supabase/supabase-js` 2.117.1 | Supabase client |
| `@supabase/ssr` 0.12.7 | Supabase clients for Next.js server and browser code |

Not installed, as requested: Prettier, Redux, Zustand, Axios, GSAP, a second UI library, or a CMS.

I read the installed `@supabase/ssr` type definitions and README to use its current API (`getAll` / `setAll` cookie methods; the older `get` / `set` / `remove` methods are deprecated).

---

## 5. Files written — 2026-09-23, 19:56:17 – 19:56:44 NPT

### `src/app/globals.css` — design tokens

Replaced shadcn's neutral theme with the brand theme, organized in two layers:

**Layer 1: raw brand palette (`--cc-*`).** Only referenced inside this file and not exposed as Tailwind classes, so hex colours can't end up scattered through components.

| Token | Colour |
| --- | --- |
| `--cc-white` | #FFFFFF |
| `--cc-ivory` | #FBF5EC |
| `--cc-blush` | #FFF6F5 |
| `--cc-blush-soft` | #FCE4E2 |
| `--cc-rose` | #D68B7F |
| `--cc-rose-deep` | #B96F68 |
| `--cc-champagne` | #F6D499 |
| `--cc-gold` | #D29A49 |
| `--cc-gold-deep` | #B77A31 |
| `--cc-charcoal` | #302A29 |
| `--cc-muted` | #756A67 |

**Layer 2: semantic tokens.** Components and shadcn use these:

| Semantic token | Maps to |
| --- | --- |
| `background`, `card`, `popover` | White |
| `foreground` (+ card/popover foregrounds) | Warm Charcoal |
| `primary` / `primary-foreground` | Deep Rose / White |
| `secondary` / `secondary-foreground` | Soft Blush / Charcoal |
| `muted` / `muted-foreground` | Warm Ivory / Muted Text |
| `accent` / `accent-foreground` | Blush / Charcoal |
| `ring` | Rose |
| `border`, `input` | Charcoal mixed with white at 12% / 16% |
| `destructive` | shadcn's default red |
| `surface-ivory`, `surface-blush` | Ivory, Blush (added for page sections) |
| `highlight`, `highlight-strong`, `highlight-soft` | Gold, Deep Gold, Champagne (added) |
| `highlight-foreground` | Charcoal |
| `chart-1..5`, `sidebar-*` | Mapped to brand colours (some shadcn components need them) |

**Why Deep Rose for `primary` instead of Rose:** white text on Rose (#D68B7F) has a contrast ratio of about 2.7:1, which fails WCAG AA. On Deep Rose (#B96F68) it's about 4.9:1, which passes.

**Other changes in this file:**

- Fonts registered in `@theme inline`: `--font-sans` → Manrope, `--font-display` → Cormorant Garamond, `--font-heading` → `--font-display`. This creates the `font-sans`, `font-display` and `font-heading` classes.
- I removed shadcn's `.dark` colour set because the site is light-only. I kept the `dark` custom variant so shadcn component classes still compile.
- Kept the radius scale (`--radius: 0.625rem`) and base layer (default border colour, background and text colour, `font-sans` on `html`).

### `src/app/layout.tsx` — fonts and metadata

- Removed Geist and Geist Mono.
- Added `Manrope` (variable `--font-manrope`) and `Cormorant_Garamond` (variable `--font-cormorant`, normal and italic styles) from `next/font/google`, both with `display: "swap"`.
- Font variables are applied on `<html>`, which uses `lang="en-AU"`.
- Metadata comes from the business data file: default title `Canvas Creations and Events | Turning moments into masterpieces`, title template `%s | Canvas Creations and Events`, and the site description.

### `src/app/page.tsx` — placeholder only

Replaced the Next.js demo page with a minimal placeholder: the business name in `font-display` and the slogan in `text-muted-foreground` on `bg-surface-ivory`. This is not the homepage design. It exists to show that Tailwind, the tokens, the fonts and the `@/` alias work.

### `src/data/site.ts` — business information

A single typed `site` object (`as const`) with:

- `name`, `shortName`, `slogan`, `description`, `locale` (`en-AU`)
- `contact.phone`: `display: "0426 071 109"`, `href: "tel:+61426071109"` (international format for links)
- `contact.email`: `null`, since it hasn't been provided and I didn't invent one
- `contact.address`: Duffield Avenue, Munno Para, SA, 5115, Australia (`AU`), stored as separate fields for future structured data
- `socials`: Instagram, Facebook and TikTok with the provided URLs, typed by the `SocialLink` interface

### `src/lib/supabase/` — Supabase preparation

| File | Contents |
| --- | --- |
| `env.ts` | `getSupabaseEnv()` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and throws a clear error if either is missing |
| `client.ts` | `createClient()` for Client Components, using `createBrowserClient` |
| `server.ts` | Async `createClient()` for server code, using `createServerClient` with `await cookies()` and the `getAll` / `setAll` cookie methods. A cookie write from a Server Component, where cookies can't be changed, is safely ignored |

These are only factory functions. Nothing connects to Supabase until one is called, and no credentials exist yet. I didn't implement auth, database tables, RLS policies, storage buckets or Edge Functions.

### `.env.example`

Lists `NEXT_PUBLIC_SUPABASE_URL=` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` with no values, notes where to find them and to add them in Vercel, and has a section for future server-only secrets such as a Resend key. That section explains that these secrets must not use the `NEXT_PUBLIC_` prefix and that Edge Function secrets belong in Supabase.

### `README.md`

Replaced the default Next.js README with a project README covering the stack, getting started, scripts, and conventions for tokens, fonts, business data, shadcn, Supabase and assets.

---

## 6. Config and housekeeping — 2026-09-23, 19:56:36 NPT (`.gitattributes` at 19:57:54)

| Change | Where | Why |
| --- | --- | --- |
| Added `!.env.example` below `.env*` | `.gitignore` | So the example file is committed while `.env.local` stays ignored |
| Deleted `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | `public/` | Unused Next.js demo assets |
| Created `logo/`, `founder/`, `gallery/`, `services/`, `videos/` with `.gitkeep` files | `public/images/` | Asset structure you asked for (Git doesn't track empty folders) |
| Added `"typecheck": "next typegen && tsc --noEmit"` | `package.json` scripts | `next typegen` generates route types such as `LayoutProps` before `tsc` runs |
| Added `.editorconfig` | project root | UTF-8, LF line endings, 2-space indent, final newline. Basic formatting consistency without adding Prettier |
| Added `.gitattributes` (`* text=auto eol=lf`, `*.ico binary`) | project root | Git on this machine converts line endings to Windows format (`core.autocrlf=true`). This keeps the repo on LF everywhere |

No assets were downloaded or invented. The real logo and photos will be added later.

---

## 7. Verification — 2026-09-23, 19:56:52 – 19:57:34 NPT

All of these checks were run, not assumed.

| Check | Command | Result |
| --- | --- | --- |
| Install | `bun install --frozen-lockfile` | ✅ No changes, lockfile consistent |
| Type check | `bun run typecheck` | ✅ Exit 0 |
| Lint | `bun run lint` | ✅ Exit 0, no warnings |
| Production build | `bun run build` | ✅ Compiled with Turbopack; `/` and `/_not-found` rendered as static pages. Google Fonts downloaded and hosted with the site |
| Dev server | `bun run dev` | ✅ Ready in 381ms, `GET /` → 200 |

**Checking Tailwind, shadcn, Lucide, fonts and the alias together:** I temporarily changed `page.tsx` to render the shadcn `<Button>` with a Lucide `<Heart />` icon, loaded the page from the dev server, and checked:

- The Button rendered with its shadcn attributes (`data-slot="button"`) and classes.
- The Lucide `lucide-heart` SVG was in the HTML.
- `<html>` had both next/font variable classes (Manrope and Cormorant Garamond).
- The CSS contained `.bg-primary`, `.bg-surface-ivory`, `.font-display`, `--primary: var(--cc-rose-deep)`, and `@font-face` rules for Cormorant and Manrope.

Then I restored the placeholder page, stopped the dev server, and deleted the temporary files.

---

## 8. Git — 2026-09-23, 19:57:54 NPT

```bash
git init -b main
git add -A
git add --renormalize .    # apply the LF rule from .gitattributes
git commit                 # using your existing Git identity
```

- Commit: `4f2b519 chore: initialize Canvas Creations website`
- Commit time: 2026-09-23 19:57:54 +0545
- Branch: `main`
- `.env.local` confirmed ignored with `git check-ignore`; `.env.example` is tracked.
- After the commit, the working tree was clean except ignored build output (`.next/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`).
- **Not pushed.** There's no remote yet.

---

## 9. Final installed versions — as of 2026-09-23

| Package | Version |
| --- | --- |
| next | 16.3.6 |
| react / react-dom | 19.2.8 |
| typescript | 5.9.3 |
| tailwindcss | 4.3.3 |
| eslint | 9.39.5 |
| shadcn | 4.21.0 |
| radix-ui | 1.6.7 |
| lucide-react | 1.47.0 |
| motion | 13.4.1 |
| react-hook-form | 7.88.0 |
| zod | 4.6.5 |
| @hookform/resolvers | 5.9.1 |
| @supabase/supabase-js | 2.117.1 |
| @supabase/ssr | 0.12.7 |

---

## 10. Decisions and deviations

1. **TypeScript 5.9, not 7.0.** create-next-app chose 5.9. TypeScript 7 is the new native compiler, and I didn't switch until Next.js officially supports it.
2. **React 19.2.8, not 19.3.0.** This is the version Next.js 16.3.6 installs. I kept it for compatibility.
3. **Radix, not shadcn's default Base UI.** Matches your spec. The style is `radix-nova`.
4. **`cn` package** instead of `clsx` + `tailwind-merge`. This is now shadcn's default, and I checked that it's official.
5. **`src/lib/utils.ts` is a file, not a `utils/` folder,** because `components.json` points to that path.
6. **No empty source folders.** `components/layout`, `components/sections` and `types/` will be created when they have files. `public/images/*` was created because you asked for that asset layout.
7. **Light theme only.** I removed shadcn's dark colours.
8. **Deep Rose is `primary`** for accessible contrast with white text.
9. **Extras added:** `@hookform/resolvers`, `.editorconfig`, `.gitattributes`, and the `typecheck` script.
10. **The Next.js favicon is still in place** until the real logo is added.

## 11. Open items for later

- Add the real logo to `public/images/logo/` and replace `src/app/favicon.ico`.
- Add the business email to `src/data/site.ts` once it's provided.
- Create a Supabase project and fill in `.env.local` and the Vercel environment variables.
- Decide whether to add Prettier. Generated files currently mix styles: Next.js files use semicolons and shadcn files don't.
- Create the GitHub repository and push when you're ready.

---
---

## Phase 2 — Design System

**Date:** Wednesday, 23 September 2026
**Timezone:** Nepal Time, NPT (UTC+05:45)
**Work window:** 20:44:33 → ~21:03 (commit)
**Goal:** Reusable design language and UI primitives for building the whole site. No homepage sections.
**Result:** Commit `feat: establish Canvas Creations design system` (not pushed)

> Times come from file timestamps, screenshot files and command output. `~` means inferred from neighbouring steps. Some files were edited more than once; the table shows the step, not every save.

### Timeline

| Time (NPT) | Step | Evidence |
| --- | --- | --- |
| 20:44:33 | Phase start: checked git state, logo folder, existing components | `date` output |
| ~20:45 | WCAG contrast audit of the whole palette | Script output (below) |
| ~20:46 | `shadcn add input textarea label select field` (+ `separator`, pulled in by `field`) | New `components/ui` files |
| 20:49:31 | Token layer rewritten: rose ink, type scale, shadows, easing, dark-tone scope | `globals.css` |
| ~20:50 | Button and form controls restyled | `button.tsx`, `input.tsx`, … |
| 20:50:37 | Container, Section, Eyebrow, SectionHeading, DecorativeDivider, ImageFrame | `components/layout`, `components/shared` |
| 20:50:51 | Motion tokens, `MotionProvider`, `Reveal`; provider added to root layout | `lib/motion.ts`, `layout.tsx` |
| 20:51:25 | Dev-only style guide `/design-system` | `app/design-system/page.tsx` |
| ~20:51 | Type check ✅, lint ✅, first screenshots → **found eyebrow bug** | `ds-1440.png` |
| 20:52:51 | Fix: project `cn` with custom theme groups; shadcn files switched to `@/lib/utils` | `lib/utils.ts` |
| 20:53 – 20:54 | Device-emulated screenshots + overflow measurement at 7 widths | `r-375.png` … |
| ~20:55 – 20:58 | Keyboard focus, keyboard Select, reduced-motion checks | `focus.png` (20:58:32) |
| ~20:59 | Production build ✅; production 404 check for `/design-system` ✅ | build output |
| 20:59:40 | Type check ✅ and lint ✅ re-run after the `cn` change | command output |
| 20:59:54 | README: design system usage guide | `README.md` |
| ~21:02 | This work-log entry; commit | `work.md` |

### Correction to Phase 1

Phase 1 said white text on Deep Rose (`#B96F68`) had about 4.9:1 contrast. **That was wrong.** Measured properly, it's **3.79:1**, which fails WCAG AA for normal-size text such as button labels. Phase 1's primary button colour therefore wasn't accessible. It's fixed below.

### Contrast audit (WCAG 2.x relative luminance)

| Pair | Ratio | Verdict |
| --- | --- | --- |
| White on Deep Rose `#B96F68` | 3.79 | ❌ fails AA text |
| Rose `#D68B7F` on white | 2.67 | ❌ |
| Deep Gold `#B77A31` on white | 3.59 | ❌ |
| Gold `#D29A49` on white | 2.48 | ❌ |
| Muted `#756A67` on white / ivory / blush | 5.23 / 4.83 / 4.92 | ✅ |
| Muted on Soft Blush `#FCE4E2` | 4.32 | ❌ never combine |
| **White on Rose Ink `#9B605A`** (new) | **4.98** | ✅ |
| **Rose Ink on white / ivory / blush** | **4.98 / 4.60 / 4.69** | ✅ |
| Charcoal on Rose (dark-tone primary) | 5.28 | ✅ |
| Rose on charcoal | 5.28 | ✅ |
| Gold on charcoal | 5.68 | ✅ |
| Champagne on charcoal (dark eyebrow, ring) | 9.94 | ✅ |
| Ivory on charcoal | 13.01 | ✅ |
| Dark muted text (ivory 72% mix) on charcoal | 7.49 | ✅ |
| Input border light (muted 80% mix) on white / ivory | 3.46 / 3.19 | ✅ 1.4.11 (3:1) |
| Input border dark (ivory 42% mix) on charcoal | 3.57 | ✅ |
| Primary hover `#8C5853` with white text | 5.78 | ✅ |
| shadcn default red on ivory | 4.40 | ❌ → replaced with `#B42318` |

### What was created

**Design tokens (`src/app/globals.css`)**

- **`--cc-rose-ink: #9B605A`**: the one new palette value, derived from Deep Rose mixed 22% toward Charcoal. It's the lightest rose that passes AA in both directions. It's used for `primary`, `ring` and `emphasis`. All 11 original brand values are unchanged.
- New semantic tokens:
  - `primary-hover`
  - `emphasis` (eyebrow and small accent text: rose ink on light surfaces, champagne on dark)
  - a stronger `input` border (meets 3:1)
  - `destructive` changed to `#B42318` (a lighter red on dark surfaces)
- **Type scale**, fluid with `clamp()`:

  | Token | Size range | Use |
  | --- | --- | --- |
  | `display-xl` | 44 → 84px | Hero |
  | `display-lg` | 36 → 60px | Section headings |
  | `display-md` | 28 → 40px | Statements, quotes |
  | `display-sm` | 22 → 28px | Small titles |
  | `lead` | 17 → 20px | Intro copy |
  | `eyebrow` | 12px, 0.22em tracking | Eyebrow labels |

  Body copy uses Tailwind's `text-base` and `text-sm`. That's six custom sizes in total.
- `--ease-elegant: cubic-bezier(0.22, 1, 0.36, 1)`, plus `shadow-soft` and `shadow-lift` (warm, low shadows).
- **Dark-tone scope:** `[data-tone="dark"]` redefines the semantic tokens, so every component inside turns charcoal/ivory with no `dark:` classes.
- **Base layer:**
  - balanced heading wrap and pretty paragraph wrap
  - blush text selection
  - a global 2px `:focus-visible` outline
  - smooth scrolling only when reduced motion isn't requested

**Components**

| Component | File | Purpose |
| --- | --- | --- |
| `Container` | `components/layout/container.tsx` | Centered, 1280px box (1200px of content), 20/32/40px gutters; `size="narrow"` (768px) for reading width |
| `Section` | `components/layout/section.tsx` | Semantic `<section>`, 80/96/128px vertical rhythm, `tone`: default / ivory / blush / dark |
| `Eyebrow` | `components/shared/eyebrow.tsx` | 12px uppercase, 0.22em tracking, semibold, `text-emphasis` |
| `SectionHeading` | `components/shared/section-heading.tsx` | Eyebrow + display heading + lead; `align`, heading level `as`, `id` for `aria-labelledby` |
| `DecorativeDivider` | `components/shared/decorative-divider.tsx` | Fading gold hairlines with a small leaf-sprig ornament (original drawing, not the logo); `aria-hidden` |
| `ImageFrame` | `components/shared/image-frame.tsx` | `next/image` fill with aspect ratios (square, portrait 4:5, tall 2:3, landscape 3:2, wide 16:9), optional rounding, slow hover zoom, `imageClassName` for cropping, `sizes` required; no filters or overlays |
| `Button` (restyled) | `components/ui/button.tsx` | Primary (rose ink + faint champagne inner edge), secondary (gold hairline), ghost, link (gold-underlined text CTA with arrow nudge), outline, destructive; 44px default height |
| `Input`, `Textarea`, `Select`, `Label`, `Field*` (added + restyled) | `components/ui/` | 44px controls, 16px text at every width (no iOS zoom), 3:1 borders, rose-ink focus ring, red error border, ring and message |
| `Separator` | `components/ui/separator.tsx` | Added automatically by `field`; unchanged |
| `MotionProvider` | `components/motion/motion-provider.tsx` | `MotionConfig` with `reducedMotion="user"` and the shared transition; wraps the app in `layout.tsx` |
| `Reveal` | `components/motion/reveal.tsx` | Fade and 24px lift once in view; `delay` for staggering |
| Motion tokens | `lib/motion.ts` | `easeElegant`, `duration` (0.3 / 0.5 / 0.9s), `fadeUp`, `fade`, `stagger` |
| Style guide | `app/design-system/page.tsx` | Every primitive in all 4 tones; **development only** (`notFound()` in production, `noindex`) |

### Files changed

| File | Change |
| --- | --- |
| `src/app/globals.css` | Token layer extended (see above) |
| `src/app/layout.tsx` | Wrapped in `MotionProvider` |
| `src/lib/utils.ts` | Project `cn` built with `createCn`, registering the custom `text-*` sizes and `shadow-*` tokens |
| `src/components/ui/button.tsx` | Brand variants and sizes; `cn` from `@/lib/utils` |
| `src/components/ui/{input,textarea,label,select,field,separator}.tsx` | Added via shadcn CLI; restyled (except separator); `cn` from `@/lib/utils` |
| `src/components/layout/*`, `shared/*`, `motion/*`, `src/lib/motion.ts` | New |
| `src/app/design-system/page.tsx` | New (dev only) |
| `README.md` | Design system usage guide, colour rules, shadcn `cn` import rule |
| `work.md` | This section |

No packages were added. Everything uses dependencies already installed in Phase 1.

### Design decisions

1. **Rose Ink replaces Deep Rose as `primary`.** Deep Rose fails AA with white text. Rose Ink is slightly deeper and dustier but still reads as rose. Deep Rose stays in the palette for decorative and large uses.
2. **Gold is decorative only on light surfaces** (hairlines, borders, ornaments, the secondary button border, underlines), because every gold shade is under 3.6:1 on white. It works as text only on charcoal.
3. **Eyebrows change with context:** rose ink on light surfaces, champagne on dark, through the `emphasis` token.
4. **One dark surface, done through token scoping** (`data-tone="dark"`), not a site-wide dark mode.
5. **Fluid type scale**, so there are no per-breakpoint font sizes; Cormorant is set at weight 500 for headings.
6. **Buttons:** sentence case, semibold Manrope, 0.5rem radius, 44px height (touch target), no gradients, no drop shadows. The primary button has a faint champagne inner edge as its gold detail.
7. **Forms:** 16px input text at every width, which stops iOS from zooming on focus, and borders strong enough to meet WCAG 1.4.11.
8. **No generic Card component.** Nothing needs one yet, and the direction favours editorial layouts. `ImageFrame` covers imagery.
9. **Motion:** hover effects use CSS transitions (cheap, and they respect `motion-safe`). Motion is used for reveals now and for menus, modals and the gallery later. There's one easing curve for both CSS and Motion.
10. **`cn` with custom theme groups.** The default `cn` treated `text-eyebrow` (size) and `text-emphasis` (colour) as the same utility group and dropped one. I fixed it in `lib/utils.ts` rather than with `cn`'s `withCn` build wrapper, which would add machinery to `next.config`.
11. **Kept shadcn's variant and size names** (`default`, `outline`, `icon-xs`, …) so shadcn components added later that reference them keep working.

### Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` | ✅ Exit 0 (run twice, including after the `cn` change) |
| `bun run lint` | ✅ Exit 0, no warnings (run twice) |
| `bun run build` | ✅ `/`, `/_not-found`, `/design-system` generated |
| Production `/design-system` (`next start`) | ✅ 404, `noindex` |
| Horizontal overflow at 375 / 390 / 430 / 768 / 1024 / 1280 / 1440px | ✅ None: `scrollWidth` equals viewport width at every size (Chrome DevTools device emulation) |
| Visual check at 375px and 1440px | ✅ Fonts, tokens, all 4 tones, buttons, form states, image frames and reveals render as designed |
| Keyboard focus | ✅ Tab reaches buttons; `:focus-visible` shows a 2px rose-ink ring with a 2px offset |
| shadcn / Radix Select (keyboard only) | ✅ Enter opens the listbox (3 options, `aria-expanded=true`), ArrowDown + Enter selects "Birthday", focus returns to the trigger |
| Reduced motion | ✅ With `prefers-reduced-motion: reduce`, reveals don't transform (fade only); without it, they lift |
| `cn` merging | ✅ `text-eyebrow` + `text-emphasis` both kept; the link button resolves to `h-auto px-0` at every size |

**Verification tooling:** headless Chrome (already installed) driven over the DevTools protocol by a throwaway Node script in the temp folder. No packages were installed. Screenshots were cropped with .NET `System.Drawing`.

### Mistakes and issues found during this phase

- **Eyebrow bug (fixed):** see decision 10.
- **Wrong Phase 1 contrast claim (fixed):** see the correction above.
- **I stopped a dev server I didn't start.** My `bun run dev` found port 3000 already in use (PID 34612) and exited, since Next.js 16 allows one dev server per project. My checks ran against that existing server, which was serving this project's live code, so the results hold. My cleanup then stopped whatever was listening on port 3000, which included that server. If it was yours, restart it with `bun dev`.
- The editor's CSS checker warns about `@theme`, `@apply` and `@custom-variant`. These are Tailwind v4 at-rules the plain CSS checker doesn't know; the build handles them. Harmless.

### Unresolved / deferred

- **Logo still missing:** `public/images/logo/` contains only `.gitkeep`. Nothing was created in its place.
- **Favicon** is still the Next.js default.
- **`Reveal` content starts at `opacity: 0` in server-rendered HTML,** so it's invisible if JavaScript fails. Google renders JavaScript, so SEO is fine. Only use `Reveal` for content that isn't critical above the fold.
- **New shadcn components** must have their `cn` import changed to `@/lib/utils` (documented in the README).
- **Not built, as instructed:** navbar, hero, sections, gallery, FAQ, enquiry form, footer, homepage, Supabase, email.
- **Still open from Phase 1:** business email, Supabase project, the Prettier decision, GitHub remote.

---
---

## Logo, favicon and SVG

**Date:** Wednesday, 23 September 2026 · **Time:** ~21:04 → 21:12 NPT (UTC+05:45)
**Source:** client logo supplied in chat: 1254×1254 PNG, opaque white background, photorealistic gold and pink artwork.
**Result:** resolves the "logo missing" and "default favicon" items from Phase 2. Not committed yet.

### Files

| File | Size | What it is |
| --- | --- | --- |
| `public/images/logo/canvas-creations-logo-original.png` | 1254², 1.45 MB | Untouched client original |
| `public/images/logo/canvas-creations-logo.png` | 1182², 1.45 MB | Full logo, **transparent outside the gold ring** (use on the site) |
| `public/images/logo/canvas-creations-logo-512.png` | 512², 316 KB | Lighter web size of the above |
| `public/images/logo/canvas-creations-monogram.png` | 804², 475 KB | CC monogram + ribbon + leaves, circular, transparent |
| `public/images/logo/canvas-creations-logo.svg` | 1182², 1.94 MB | SVG containing the transparent PNG |
| `src/app/favicon.ico` | 16 + 32 + 48 px | Monogram, PNG-encoded ICO (replaced the Next.js default) |
| `src/app/icon.png` | 512² | Monogram, transparent |
| `src/app/apple-icon.png` | 180² | Monogram on opaque white with padding (iOS fills transparency with black and rounds corners) |

`.gitkeep` was removed from `public/images/logo/` because the folder now has real files.

### How it was made

- **No redrawing, no packages.** Every output is made from the client's own pixels, using .NET `System.Drawing` through an inline C# helper (`Add-Type`) plus Node for the ICO check and the SVG.
- **Transparent background:**
  - I measured the gold ring's outer edge at 16 angles. It's slightly elliptical: centre (626.5, 609.5), radii 586 × 578 px.
  - I cut it with a matching elliptical mask and a 1.5px anti-aliased edge.
  - Checked at 1:1 on charcoal: there's no white halo.
- **Favicon uses the monogram, not the full logo.** Tested at real sizes: the full logo becomes an unreadable gold blur at 32px and is unrecognisable at 16px.
  - The monogram (measured box x 254–1026, y 208–734) was copied onto a clean white square, which drops fragments of the logo's inner rings that a plain circular crop picked up.
  - It was then masked to a circle to echo the logo shape.
  - At 32px it reads clearly as CC with the pink sprig. At 16px it's soft, as any detailed metallic mark is, but still recognisable.
  - A tighter letters-only crop was tried and rejected because it cut off the second C.
- **Downscaling:** repeated halving with high-quality bicubic, then the final size, which avoids the blurring and aliasing of a single big resize.

### About the SVG (important)

The SVG **wraps the PNG artwork, so it isn't a true vector.** The logo is photorealistic (metallic textures, gradients, soft shadows), and automatic tracing would produce blotchy, visibly worse artwork. A real vector version needs the original design source file, or a designer's redraw, which would be a new rendition of the brand mark. The SVG works anywhere an SVG is required, but it stays sharp only up to about 1182px, like the PNG. On the website, use the PNG through `next/image`: it's smaller and gets optimised automatically.

### Verification

| Check | Result |
| --- | --- |
| Icon `<link>` tags in `<head>` | ✅ `favicon.ico` (48x48), `icon.png` (512x512), `apple-touch-icon` (180x180), generated by Next.js |
| All icon and logo URLs | ✅ HTTP 200 with correct content types |
| `favicon.ico` structure | ✅ ICO type 1, 3 PNG entries: 16, 32, 48 |
| SVG renders in Chrome | ✅ after a fix: the first version was malformed XML (a text edit left a fragment in the attribute) and was regenerated |
| Embedded PNG in the SVG | ✅ valid signature and IEND chunk, 1,452,978 bytes |
| `bun run build` | ✅ `/icon.png` and `/apple-icon.png` prerendered |
| Your dev server | Left running (PID 4800 on port 3000); used for checks, not stopped |

---
---

## Phase 3 — Site Shell, Navbar & Hero

**Date:** Wednesday, 23 September 2026
**Timezone:** Nepal Time, NPT (UTC+05:45)
**Work window:** 21:21:33 → ~21:36 (commit)
**Goal:** First production UI: site shell, header/navbar (desktop + mobile), homepage hero. Nothing further down the homepage.
**Result:** Commit `feat: build site shell and hero` (not pushed)

### Timeline

| Time (NPT) | Step | Evidence |
| --- | --- | --- |
| 21:21:33 | Inspection: git clean at `465b620`; **no photography** in `public/images` (only logo assets); your dev server on port 3000 | `date`, `find` |
| ~21:23 | `shadcn add sheet`: the CLI asked to overwrite `button.tsx`; I declined, and the file's hash was unchanged afterwards | `sha1sum -c` |
| 21:24:31 | Sheet restyled (brand surface, no blur, slow easing, reduced motion, `cn` import) | `sheet.tsx` |
| 21:25:28 | Navigation + enquiry CTA in `site.ts`; hero copy + image slot in `home.ts` | data files |
| 21:25:47 | Header-height token, anchor scroll offset, hero keyframes | `globals.css` |
| 21:26 – 21:28 | Header shell, mobile menu, site header, hero; skip link + header in root layout | components |
| ~21:29 | Type check ✅, lint ✅; first 7-width audit | script output |
| ~21:29 | Fix: deprecated `priority` → `loading="eager"` / `fetchPriority` (Next 16 docs) | `hero.tsx`, `site-header.tsx` |
| ~21:30 | Fix: monogram white disc blended into ivory with `mix-blend-multiply` | `hero.tsx` |
| 21:30:00 – 21:30:58 | Menu/keyboard/scroll/reduced-motion checks; screenshots | `p3-menu-390.png` … |
| ~21:31 – 21:33 | Final type check/lint/build; production audit on port 3057 (my server, stopped afterwards) | command output |
| ~21:35 | This entry; commit | `work.md` |

### What was created

| File | Type | Purpose |
| --- | --- | --- |
| `src/components/layout/site-header.tsx` | Server | Logo, desktop nav (`<nav aria-label="Main">`), Enquire CTA, mobile menu slot |
| `src/components/layout/header-shell.tsx` | Client (tiny) | Sticky `<header>`; adds hairline + soft shadow after 8px of scroll (`useSyncExternalStore`, no resizing) |
| `src/components/layout/mobile-menu.tsx` | Client | Radix Dialog (via shadcn Sheet) menu: labelled "Menu"/"Close" triggers, Cormorant links with gold hairlines, bottom-anchored CTA, phone, socials |
| `src/components/sections/hero.tsx` | Server | Editorial split hero, image slot, CSS entrance animation |
| `src/components/ui/sheet.tsx` | shadcn, restyled | Added via CLI (Button **not** overwritten) |
| `src/data/home.ts` | Data | Hero eyebrow, description, secondary CTA, `image` slot (currently `null`) |

### Files changed

| File | Change |
| --- | --- |
| `src/data/site.ts` | `NavLink` type, `region`, `navigation` (6 items), `enquiry` CTA |
| `src/app/globals.css` | `--header-height` (72px mobile / 96px from lg) + `scroll-padding-top`; `animate-rise` / `animate-fade` keyframes |
| `src/app/layout.tsx` | Skip link, `<SiteHeader />` inside `MotionProvider` |
| `src/app/page.tsx` | Placeholder replaced by `<main id="main"><Hero /></main>` |
| `src/app/design-system/page.tsx` | `id="main"` for the skip link |

No new packages. Sheet uses Radix Dialog from the existing `radix-ui` dependency.

### Design decisions

1. **Header: sticky, solid white, no transparent-over-hero.** A transparent header only helps over full-bleed photography, and there isn't any yet. At the top it sits flush with the hero; after scrolling it gains a hairline and a soft shadow. There's no resizing, no blur and no glassmorphism.
2. **Logo:** the real full logo (`canvas-creations-logo-512.png`) at 72px on desktop and 52px on mobile, served through `next/image` (96w and 64w files). I used it rather than the monogram because the header should carry the complete brand mark.
3. **Nav:** six links from `site.navigation`, Manrope 14px with slight tracking at 80% charcoal. On hover the text darkens and a gold hairline draws in from the left. No pills, no heavy borders.
4. **Anchors, not routes:** the nav and CTAs point to `/#services`, `/#gallery`, `/#about`, `/#faq`, `/#contact`, `/#enquire`. These are sections still to come. The links stay on the homepage now and start working as the sections land. No broken routes were created.
5. **Hero headline is the client's own slogan** ("Turning moments into *masterpieces*"), with "masterpieces" in Cormorant italic Rose Ink. It's their line, and it says exactly what the brief asked. Supporting copy makes no claims: no services, numbers, awards or years. "South Australia" (from the business brief) is added as screen-reader text after the eyebrow.
6. **CTA hierarchy:** filled "Enquire Now", then the text link "Explore our work →", then "Prefer to talk? Call 0426 071 109" (real phone number from `site.ts`).
7. **Layout:** a 7/5 asymmetric split on desktop. The image sits in an offset gold hairline frame, done with padding and no negative margins. On mobile everything stacks, the image comes after the CTAs, and the crop is shorter (4:3 on phones, 3:2 on tablets, 4:5 on desktop).
8. **No photography, so no fake photography:** the image slot renders `ImageFrame` when `hero.image` is set (eager loading, high fetch priority, `sizes`, `position` for cropping). Until then it shows the real CC monogram on ivory. It's brand art, clearly not a photo, and not a watermark. `mix-blend-multiply` removes the monogram's white disc against the ivory.
9. **Motion:** hero entrance uses **CSS** keyframes (`motion-safe:animate-rise`, staggered 0–320ms, plus a slow fade on the image), not Motion. Content is in the server HTML, doesn't wait for hydration, works without JavaScript, and is fully static with reduced motion. Menu items rise in a gentle stagger, and the panel slides and fades over 500ms with `ease-elegant`.

### Responsive behaviour (measured)

| Width | Header | H1 size / lines | Primary CTA top (fold) | Overflow |
| --- | --- | --- | --- | --- |
| 375 | 73px, menu | 44px / 2 | y=386 (fold 812) | none |
| 390 | 73px, menu | 44px / 2 | y=386 (fold 844) | none |
| 430 | 73px, menu | 44px / 2 | y=387 (fold 932) | none |
| 768 | 73px, menu | 57.9px / 2 | y=453 (fold 1024) | none |
| 1024 | 97px, full nav | 68.6px / 2 | y=495 (fold 768) | none |
| 1280 | 97px, full nav | 79.4px / 2 | y=556 (fold 800) | none |
| 1440 | 97px, full nav | 84px / 2 | y=561 (fold 900) | none |

The primary CTA is above the fold at every size. The desktop nav appears from 1024px (`lg`), and the mobile menu is used below that.

### Accessibility (tested, not assumed)

| Check | Result |
| --- | --- |
| Landmarks | `<header>`, `<nav aria-label="Main">`, `<main id="main">`, hero `<section aria-labelledby="hero-title">` |
| Headings | Exactly one `<h1>` (the slogan); no skipped levels |
| Skip link | First Tab stop, becomes visible, targets `#main` |
| Desktop Tab order | Skip link → logo → Home → Services → Gallery → About → FAQ → Contact → Enquire Now → Enquire Now (hero) → Explore our work → Call |
| Focus visibility | 2px Rose Ink outline (`rgb(155, 96, 90)`) on nav links |
| Mobile menu | Enter opens; `aria-expanded` changes to `true`; `aria-controls` matches the dialog id; dialog labelled "Menu"; focus moves inside (Close) and stays trapped over 16 Tabs; **Escape closes and returns focus to the trigger**; tapping a link closes the menu and navigates (`/#services`) |
| Text labels | Menu/Close buttons show visible text, not icons alone; social links are text and announce "(opens in a new tab)" |
| Logo | Link's accessible name comes from `alt="Canvas Creations and Events"`; decorative images use `alt=""` |
| Contrast | All text uses Phase 2 tokens (Rose Ink 4.98:1, muted 5.23:1); gold only on hairlines |
| Reduced motion | With `reduce`: h1 `animation-name: none`, opacity 1 immediately. Without it: `cc-rise` runs |

### Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` | ✅ exit 0 |
| `bun run lint` | ✅ exit 0 |
| `bun run build` | ✅ all routes static |
| Dev audit, 7 widths (your server on port 3000) | ✅ no overflow, no broken images, no console errors, warnings or hydration errors (after the LCP fix) |
| Production audit, 7 widths (`next start` on port 3057) | ✅ no overflow, no console errors; images confirmed on a fresh load (see issues) |
| Server-rendered HTML | ✅ h1, nav and skip link present; no inline `opacity:0` on content |

### Issues found / fixed

1. **shadcn tried to overwrite `button.tsx`** when adding Sheet. Declined; hash verified unchanged.
2. **Deprecated `priority` prop:** Next 16 deprecates it. Replaced with `loading="eager"` (logo, placeholder) and `loading="eager"` + `fetchPriority="high"` (future hero photo). This also cleared the LCP warning at 768px.
3. **Monogram "sticker" effect:** its white disc showed on ivory. Fixed with `mix-blend-multiply`; the asset itself is unchanged.
4. **Unlayered vs layered CSS:** my first desktop `--header-height` override sat in `@layer base` and would have lost to the unlayered `:root`. Moved to top level before testing.
5. **Test-harness problems, not site bugs (recorded so nobody chases them):**
   - Enter didn't open the menu until the script sent a real `keyDown` with a character; the page was fine.
   - The production "broken image" at desktop widths came from switching one tab from phone to desktop emulation. On fresh loads the logo (w=96) and monogram (w=384) load completely with no network failures.
6. Removed `-mr-3` optical-alignment margins from the menu buttons to keep to the no-negative-margins rule.

### Remaining / deferred

- **Hero photography:** the biggest open item. Add a real event photo and set `hero.image` in `src/data/home.ts`; the layout, `sizes`, eager loading and cropping are already wired. The monogram panel is a stand-in only.
- **Anchor targets:** `#services`, `#gallery`, `#about`, `#faq`, `#contact` and `#enquire` don't exist until those sections are built.
- **No active-section highlighting in the nav** (needs scroll-spy once sections exist).
- **Not built, per brief:** services, gallery, about/founder, process, testimonials, FAQ, enquiry form, contact, footer, Supabase, email.
- **Still open:** business email, Supabase project, the Prettier decision, GitHub remote.

---
---

## Phase 4 — Homepage Content Sections

**Date:** Wednesday, 23 September 2026
**Timezone:** Nepal Time, NPT (UTC+05:45)
**Work window:** 21:41:54 → ~21:55 (commit)
**Goal:** Intro, Services, Category strip and Gallery foundation below the hero. Honest content, future-ready data.
**Result:** Commit `feat: build homepage content sections` (not pushed)

### Timeline

| Time (NPT) | Step | Evidence |
| --- | --- | --- |
| 21:41:54 | Inspection: tree clean at `78ceab9`; still **no photography**; no verified service or category list; your dev server on port 3000 | `date`, `find` |
| 21:42:10 | `Reveal` rebuilt as CSS scroll-driven animation (fixes the Phase 2 deferred issue) | `reveal.tsx`, `globals.css` |
| 21:42:24 – 21:42:32 | Data: `services.ts`, `categories.ts`, `gallery.ts`; section copy in `home.ts` | data files |
| 21:43 – 21:44 | Intro, Services, CategoryStrip, GalleryPreview; `page.tsx`; sample-data demos on `/design-system` | components |
| ~21:45 | Type check ✅, lint ✅; 7-width audit; full-page screenshots | script output |
| 21:46:36 | Fix: category separators → spacing-only layout | `category-strip.tsx` |
| 21:46:47 | Canonical `aspect-3/2` / `aspect-4/5` classes | `gallery-preview.tsx` |
| 21:48:19 | **Bug fix:** same-hash re-click did nothing → `SiteLink` | `site-link.tsx` + 4 call sites |
| 21:50:04 | **Bug fix:** mobile menu links didn't scroll (scroll lock) → close, then navigate | `mobile-menu.tsx` |
| ~21:51 | Production build ✅ + 7-width production audit ✅ (my server on port 3057, stopped afterwards) | command output |
| 21:52 | Category strip re-screenshotted after the fix | `cat-375.png`, `cat-1440.png` |
| ~21:55 | This entry; commit | `work.md` |

### Sections created

| Section | File | Anchor | Tone | Notes |
| --- | --- | --- | --- | --- |
| Intro | `sections/intro.tsx` | `#intro` | white | Centred, narrow column: eyebrow "The studio", display statement, one lead paragraph, sprig divider. Reduced top padding so hero + intro read as one deliberate pause. Not in the nav (no nav change needed). |
| Services | `sections/services.tsx` | `#services` | ivory | 5/7 split: sticky heading on the left; on the right, a hairline-ruled `<ol>` of service rows plus a permanent "Planning something?" row linking to `#enquire`. |
| Category strip | `sections/category-strip.tsx` | — | white | **Renders nothing until verified categories exist.** Typographic list: italic Cormorant, stacked on phones, wrapped row above. |
| Gallery preview | `sections/gallery-preview.tsx` | `#gallery` | dark | With images: large lead image + two stacked + a pair beneath (12-column grid), lightbox-ready markup. Without images: a deliberate empty state (see below). |

`src/app/page.tsx` is now explicit: `<Hero /> <Intro /> <Services /> <CategoryStrip /> <GalleryPreview />`.

### Content & data architecture

| File | Contents | Future table |
| --- | --- | --- |
| `data/site.ts` | Business-wide (unchanged this phase) | — |
| `data/home.ts` | Homepage section copy: `hero`, `intro`, `servicesSection`, `categoriesSection`, `gallerySection` | — |
| `data/services.ts` | `Service { id, title, summary, image?, href?, order, featured }` + `featuredServices` | `services` |
| `data/categories.ts` | `Category { id, label, order }` + `sortedCategories` | `categories` |
| `data/gallery.ts` | `GalleryItem { id, src, alt, title?, categoryId?, featured, order }` + `galleryPreview` (≤5 featured) | `gallery_items` |

- Every collection has a stable slug `id` and an explicit `order`, and relationships go by id (`GalleryItem.categoryId → Category.id`). Swapping the arrays for Supabase queries later won't change the components.
- Components take their data as props that default to the real data, so the same components render sample data on `/design-system` without it touching the homepage.

**Honesty rules applied:**

- **Services:** one entry only, "Event styling & decoration". That's the one offering the business brief confirms. No invented catalogue. Numbering (01, 02…) switches on automatically once there's more than one service.
- **Categories:** empty array. The strip doesn't render, so nothing invented appears.
- **Gallery:** empty array. The empty state says truthfully that the portfolio is being curated and links to the real Instagram, Facebook and TikTok profiles from `site.ts`. No placeholder frames pretending to be work.
- **Copy:** no services, materials, reach, numbers, awards or superlatives. "South Australia" comes from the business brief.
- **Sample data** exists only on the dev-only `/design-system` page, under a visible notice ("design reference only, not client content"), and is labelled "Sample service 1" and so on. That page returns 404 in production.

### Design decisions

1. **Rhythm:** hero (white) → intro (white, a calm centred pause) → services (ivory, asymmetric) → categories (white, typographic; hidden for now) → gallery (charcoal). The charcoal gallery gives the page its strongest visual moment and will frame photography well. It's the only dark section, and it's easy to change through the `tone` prop.
2. **Services as an editorial list, not cards:** hairline rules, Cormorant titles, muted summaries.
   - Linked rows get a 44px round arrow that's visible without hover, so touch users see the affordance.
   - On hover the title turns rose, the circle's border turns rose and the arrow nudges right. All subtle, and the nudge is `motion-safe`.
   - Rows without an `href` are plain, non-interactive elements, so nothing fakes interactivity.
3. **The enquiry row is always present** so the services list ends with a clear next step even while it holds only one service.
4. **Category strip uses spacing, not separators.** Gold diamonds between items looked accidental whenever a wrapped line began with one (seen in screenshots), and CSS can't suppress a separator at the start of a wrapped line. There's no horizontal scrolling either, so every item is visible and overflow isn't possible.
5. **Gallery grid:** on desktop the lead image spans two rows (7 columns) beside two 3:2 images (5 columns), then two 6-column images. On mobile the lead is full width with a 2×2 grid below, and a trailing odd image spans the full width. Images load lazily (not eager) with slot-specific `sizes`. Markup is `ul > li[data-gallery-index] > figure > ImageFrame + figcaption`, so a lightbox can attach later without changing the markup.
6. **Gold and blush restraint:** gold appears only in the intro and gallery divider sprigs and in link underlines. Blush is used only as hover or accent backgrounds.

### Motion: `Reveal` rebuilt (resolves a Phase 2 deferred item)

The Motion-based `Reveal` rendered `opacity: 0` in server HTML, so content was invisible until JavaScript ran. It's now a **server component** that adds a `reveal` utility: a CSS scroll-driven animation (`animation-timeline: view()`, `animation-range: entry 0% entry 45%`, a 24px rise with `ease-elegant`).

- Content is fully visible in server HTML (verified: no inline `opacity:0`).
- No JavaScript, and no flicker for content already in view.
- Browsers without scroll timelines (Firefox today) show content statically. With reduced motion it's `animation: none`.
- The API is simpler (no `delay`); the one `/design-system` usage was updated.
- Used selectively: the intro block, each service row, the enquiry row, the category list and gallery items. Headings of the other sections are not animated.

### Responsive behaviour (measured, dev and production)

| Width | `scrollWidth` = viewport | Page height (dev) | Notes |
| --- | --- | --- | --- |
| 375 | ✅ 375 | 2728 | Services stack (heading, then rows); gallery CTA full-width |
| 390 | ✅ 390 | 2686 | |
| 430 | ✅ 430 | 2685 | |
| 768 | ✅ 768 | 2940 | Still single-column services |
| 1024 | ✅ 1024 | 2426 | 5/7 services split; sticky heading |
| 1280 | ✅ 1280 | 2553 | |
| 1440 | ✅ 1440 | 2569 | |

No `overflow-x: hidden` anywhere; nothing overflows to begin with. The populated states (3 services, 5 categories, 5 gallery images) were also checked at 375, 768 and 1440 on `/design-system`: no overflow, the grid collapses as designed.

### Accessibility (tested)

| Check | Result |
| --- | --- |
| Headings | One h1; outline H1 → H2 (intro) → H2 (services) → H3 (service) → H2 (gallery); **no skipped levels** at any width |
| Sections | Each `<section>` labelled by its heading (`aria-labelledby`); list semantics (`ol` for services, `ul` for categories and gallery) |
| Anchors | `#intro`, `#services`, `#gallery` exist; desktop nav → Services lands at 96px (header 97px, clear of it); mobile menu → Services lands at 72px (mobile header height); Gallery scrolls to the end of the page (it's currently the last section) |
| Keyboard | Enquiry row and social links: 2px outline; Instagram button: champagne ring with charcoal offset on the dark surface (read after the 300ms transition) |
| Interactivity | Only real links are interactive; rows without an `href` render as a `div` |
| External links | `target="_blank" rel="noopener noreferrer"` + screen-reader text "(opens in a new tab)" |
| Images | No homepage images added this phase; gallery `alt` is required by the type |
| Reduced motion | `.reveal` → `animation-name: none`, opacity 1 |

### Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` | ✅ exit 0 (after every change) |
| `bun run lint` | ✅ exit 0 |
| `bun run build` | ✅ all routes static |
| Dev audit, 7 widths (your server on port 3000) | ✅ no overflow, no broken images, no failed requests, no console, hydration or React errors |
| Production audit, 7 widths (`next start` on port 3057) | ✅ same results |
| `/design-system` in production | ✅ 404 |
| Fabricated content check | ✅ homepage shows only the verified service, neutral copy and real social links |

### Issues found / fixed

1. **Same-hash links did nothing on a second click (also affected Phase 3's nav).**
   - Next's `<Link>` skips navigation to an identical URL, so Services → scroll up → Services left the page where it was (measured: section stayed at 1362px).
   - Added `shared/site-link.tsx`: in-page anchors render a native `<a>`, which the browser always scrolls; other routes keep `<Link>`. Used in the header, hero and services.
   - Verified: the second click now lands at 96px.
2. **Mobile menu links changed the URL but didn't scroll (also since Phase 3).**
   - The dialog's scroll lock blocks the jump to the anchor.
   - Links now close the menu first, then navigate on `onCloseAutoFocus` in the next frame (`scrollIntoView`, which honours `scroll-padding-top`). Ctrl/⌘/Shift-click still behaves natively.
   - Verified by actual scroll position.
3. **Category separators** started wrapped lines; replaced with a spacing-only layout.
4. **Tailwind canonical classes:** `aspect-[3/2]` → `aspect-3/2` and similar; confirmed `cn` still merges them correctly against `ImageFrame`'s default ratio.
5. **Test-harness notes:** keyboard labels once broke on regex escaping, and the Instagram ring was first read mid-transition. Both were re-run correctly; neither was a site bug.

### Remaining / deferred

- **Real content needed from the client:**
  - the service list (titles, short descriptions, optional photos)
  - celebration categories
  - gallery photography
  - a hero photo

  Each drops into its data file with no component changes.
- **Anchors still to build:** `#about`, `#faq`, `#contact`, `#enquire` (the Services enquiry row and all Enquire buttons point to `#enquire`).
- **`#gallery` is the last section,** so it can't scroll to the very top yet; that resolves when more sections follow.
- **No lightbox and no dedicated gallery page** (deferred per brief). The markup already carries `data-gallery-index`.
- **Not built, per brief:** about/founder, process, why Canvas, testimonials, FAQ, enquiry form, contact, footer, Supabase, email.
- **Still open:** business email, Supabase project, the Prettier decision, GitHub remote.

---
---

## Phase 5 — Brand Story, Process, Why Canvas & Video

**Date:** Wednesday, 23 September 2026
**Timezone:** Nepal Time, NPT (UTC+05:45)
**Work window:** 22:00:24 → ~22:08 (commit)
**Goal:** Continue the homepage below the Gallery: About/Founder, Process, Why Canvas, Video storytelling. Honest content and media states.
**Result:** Commit `feat: build brand story sections` (not pushed)

### Timeline

| Time (NPT) | Step | Evidence |
| --- | --- | --- |
| 22:00:24 | Inspection: tree clean at `7a945cc`; `founder/`, `gallery/`, `services/`, `videos/` all empty (only `.gitkeep`); your dev server on port 3000 | `date`, `ls` |
| ~22:01 | Data: `HeroImage` → `EditorialImage` (shared); `about`, `processSection`, `whyCanvas`, `videoStory` in `home.ts` | `home.ts` |
| ~22:01 | Honesty correction: rewrote "began with a simple idea" (invented origin story) as present-tense philosophy; neutral About heading | `home.ts` |
| 22:01:47 | About/Founder, Process components | `about-founder.tsx`, `process.tsx` |
| ~22:02 | Why Canvas, Video Story; `page.tsx` order | components |
| ~22:02 | Type check ✅, lint ✅; 7-width audit; full-page screenshots | script output |
| 22:03:41 | Fix: compact video empty state; Why Canvas heading as two lines | `video-story.tsx`, `home.ts` |
| 22:03:56 | Fix: space between heading lines for the accessible name | `why-canvas.tsx` |
| ~22:04 | Anchors, accessible name, focus, mobile menu, reduced-motion tests | script output |
| ~22:05 | Production build ✅ + 7-width production audit ✅ (my server on port 3057, stopped afterwards) | command output |
| ~22:08 | This entry; commit | `work.md` |

### Sections created

| Section | File | Anchor / label | Tone | Layout |
| --- | --- | --- | --- | --- |
| About / Founder | `sections/about-founder.tsx` | `#about` (nav) | white | Asymmetric 5/6 split: portrait slot left (desktop), eyebrow + heading + two paragraphs + one text-link CTA (`/#enquire`) right. Text comes first in the DOM (reading order); `lg:order-first` puts the image first visually. |
| Process | `sections/process.tsx` | `aria-labelledby="process-title"` | ivory | Four numbered columns with a hairline over each (1 column → 2 at `sm` → 4 at `lg`). Rose Ink italic numerals, hidden from screen readers because the `<ol>` already conveys order. |
| Why Canvas | `sections/why-canvas.tsx` | `why-title` | dark | Heading set as two lines, then three principles in a desktop **staircase** (0 / 25% / 50% offsets); no rules, no cards. Champagne numerals. |
| Video story | `sections/video-story.tsx` | `video-title` | white | With a local video: native `<video controls playsInline preload="none" poster aria-label>` in a `<figure>` with a caption. Without one: a compact framed note with the TikTok link. |

Page order: Hero → Intro → Services → CategoryStrip → GalleryPreview → **AboutFounder → Process → WhyCanvas → VideoStory**. Process, Why Canvas and Video were **not** added to the nav; they're supporting sections.

### Content & data structures (`src/data/home.ts`)

| Export | Shape | Future entity |
| --- | --- | --- |
| `EditorialImage` | `{ src, alt, position? }` (renamed from `HeroImage`; used by hero and about) | media |
| `about` | `{ eyebrow, title, body: string[], image: EditorialImage \| null, cta }` | about content |
| `processSection` | `{ eyebrow, title, steps: ProcessStep[] }`, `ProcessStep { id, title, description }` (numbers come from order) | process steps |
| `whyCanvas` | `{ eyebrow, titleLines: string[], principles: Principle[] }`, `Principle { id, title, description }` | brand principles |
| `videoStory` | `{ eyebrow, title, video: VideoContent \| null, emptyText, tiktokCta }`, `VideoContent { src, poster, title, caption? }` | video content |

These stay in `home.ts` because each is small homepage content, which avoids tiny single-use files. Arrays carry stable `id`s for a later move to Supabase.

**Honesty:**

- No founder name, biography, history, qualifications, numbers, guarantees or superlatives.
- Process steps and principles are marked **provisional** in code comments. Principles are drawn from the brand personality in the original brief (personal, creative, elegant) and phrased as approach, not claims.
- One line was caught and rewritten before any checks: "began with a simple idea" would have been an invented origin story.

### Media availability

| Slot | Real asset? | What renders |
| --- | --- | --- |
| Founder/studio portrait | ❌ none in `public/images/founder/` | Blush panel with the **real full logo** (`mix-blend-multiply` blends its white disc into the blush). Brand content, not a fake portrait, and a different treatment from the hero's ivory monogram panel. Swaps to `ImageFrame` when `about.image` is set. |
| Event video | ❌ none in `public/images/videos/` | Compact ivory note with an inset gold hairline: "Video stories from our events will live here." plus a "Watch on TikTok" link (the real profile from `site.ts`). **No fake player, play button, poster or stock footage.** |

### Design decisions

1. **Tone sequence:** Gallery (dark) → About (white) → Process (ivory) → Why Canvas (dark) → Video (white). The page turns personal after the gallery, and the second dark section gives Why Canvas its cinematic weight.
2. **Each section has a different structure** (split, columns with rules, staircase, centred frame) so nothing reads as a repeated template. Services (Phase 4) uses horizontal rows; Process uses vertical columns.
3. **Blush used once** (the About portrait slot). **Gold** only in hairlines, the video frame's inset rule and the existing dividers. **Rose Ink** for Process numerals; **champagne** for Why Canvas numerals on charcoal.
4. **One CTA per section at most:** About has a single text link to `/#enquire`; Process and Why Canvas have none; Video has only the TikTok link.
5. **Video player, once media exists:** native controls (keyboard-accessible by default), `preload="none"` so nothing downloads until the visitor asks, a poster required by the type, no autoplay and no sound.

### Motion

- `Reveal` (the CSS scroll-driven version from Phase 4) wraps: the About text and media blocks, each Process step, each principle, and the video frame. Headings aren't animated individually.
- Verified: `cc-reveal` runs normally; with `prefers-reduced-motion: reduce` it becomes `animation-name: none` at opacity 1.
- Server HTML has no inline `opacity:0` (production check), so the JavaScript-opacity problem from before Phase 4 hasn't returned.

### Responsive behaviour

| Width | `scrollWidth` = viewport | Page height (dev) |
| --- | --- | --- |
| 375 | ✅ | 6208 |
| 390 | ✅ | 6139 |
| 430 | ✅ | 6149 |
| 768 | ✅ | 6410 |
| 1024 | ✅ | 5753 |
| 1280 | ✅ | 6079 |
| 1440 | ✅ | 6121 |

- **About:** text then image on phones (4:3), 3:2 on tablets, side by side with a 4:5 image on desktop.
- **Process:** 1 → 2 → 4 columns.
- **Why Canvas:** the staircase only from `lg`; stacked below.
- **Video:** the empty note is `max-w-3xl` and padded (not 16:9); a real video is always 16:9 up to `max-w-5xl`.

### Accessibility (tested)

| Check | Result |
| --- | --- |
| Headings | One h1; H2 per section with H3 steps and principles; **no skipped levels** at any width |
| Landmarks | Every new `<section>` has `aria-labelledby` pointing to its heading |
| Accessible name | Two-line heading reads "Designed with intention. Styled with heart." (checked in Chrome's accessibility tree; the first attempt had no space between the sentences) |
| Anchors | Desktop nav → About lands at 96px (header 97px); mobile menu → About lands at 72px and closes the menu |
| Focus | About CTA and "Watch on TikTok": `:focus-visible` with the 4px ring |
| Decorative | Process/principle numerals `aria-hidden` (list order is semantic); portrait-slot logo `alt=""` |
| External link | TikTok: new tab + screen-reader text "(opens in a new tab)" |
| Reduced motion | Reveals off |

### Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` / `lint` | ✅ exit 0 (after every change) |
| `bun run build` | ✅ all routes static |
| Dev audit, 7 widths | ✅ no overflow, no console, hydration or React errors, **no failed requests** |
| Production audit, 7 widths (port 3057) | ✅ same results; `about`, `process-title`, `why-title`, `video-title` present in server HTML |
| Images | ✅ the About logo is lazy and loads when scrolled to (256w, `complete`, no failures). The audit's "not loaded" count is this lazy image before scrolling, not a broken request |

### Issues found / fixed

1. **Invented origin story** in draft About copy ("began with…") → present-tense philosophy; the heading no longer promises a founder story.
2. **Video empty state too large** (a 16:9 frame roughly 1024×576 around one sentence) → compact framed note.
3. **Why Canvas heading wrapped mid-sentence** on phones → two stored lines, one sentence per line.
4. **Accessible name ran the sentences together** ("intention.Styled") → an explicit space between the lines; verified in the accessibility tree.
5. **Audit false positive:** "broken image" was a not-yet-loaded lazy image. Confirmed by scrolling it into view; the audit reads the network log for real failures.
6. **Resolved from Phase 4:** `#gallery` is no longer the last section; nav → Gallery now lands exactly under the header (96px).

### Remaining / deferred

- **Content from the client:**
  - founder/studio portrait, and founder name and story if they want it public
  - their actual process
  - their own words for what makes them different
  - event video + poster frame (+ captions/subtitles file, then add a `<track>`)
  - hero photo, service list, categories, gallery photos (from earlier phases)
- **The video player path is untested with real media,** because none exists. It's type-checked and uses native controls. Verify playback and keyboard controls once a file is added.
- **Anchors still to build:** `#faq`, `#contact`, `#enquire` (all Enquire CTAs and the About CTA point to `#enquire`).
- **Not built, per brief:** testimonials, FAQ, enquiry form, contact, footer, Supabase, auth, admin, email, lightbox, gallery page, booking.
- **Still open:** business email, Supabase project, the Prettier decision, GitHub remote.

---
---

## Phase 6 — Trust, Enquiry, Contact & Footer

**Date:** Wednesday, 23 September 2026
**Timezone:** Nepal Time, NPT (UTC+05:45)
**Work window:** 22:09:57 → ~22:24 (commit)
**Goal:** Testimonials, FAQ, Enquiry, Contact and Footer, so the public homepage is structurally complete. Frontend only: no backend, no email.
**Result:** Commit `feat: complete homepage conversion sections` (not pushed)

### Timeline

| Time (NPT) | Step |
| --- | --- |
| 22:09:57 | Inspection: tree clean at `419d390`; no media beyond the logo; `#enquire` already referenced by header, menu, hero, services and About; email `null` in `site.ts`; your dev server on port 3000 |
| ~22:10 | `shadcn add accordion` (overwrite prompts declined; checksums of every existing `ui/*` file unchanged); accordion restyled |
| ~22:11 | Data: `testimonials.ts` (empty), `faq.ts` (3 verified Q&As), section copy in `home.ts`; `lib/enquiry.ts` (schema + `submitEnquiry`) |
| ~22:12 – 22:14 | `EnquiryForm`, Testimonials, FAQ, Enquiry, Contact, SiteFooter, MobileCtaBar; layout + page order; previews on `/design-system` |
| ~22:15 | Type check ✅, lint ✅; 7-width audit; full-page screenshots |
| ~22:16 | Footer Explore list → 2 columns on phones |
| ~22:17 | Interaction suite (CTAs, anchors, FAQ keyboard, form validation, preview success, mobile bar, reduced motion) |
| ~22:18 | **Bug fix:** reduced motion didn't stop accordion, Sheet or Select animations → `motion-safe:` gating |
| ~22:19 | Motion re-verified in both modes; clean-load console check |
| 22:20 | Production build ✅ + 7-width production audit ✅ (my server on port 3057, stopped afterwards) |
| ~22:24 | This entry; commit |

### Sections created

| Section | File | Anchor | Tone | Treatment |
| --- | --- | --- | --- | --- |
| Testimonials | `sections/testimonials.tsx` | — | white | One large italic Cormorant lead quote, up to two smaller below; `figure > blockquote + figcaption`; no stars, avatars or carousel. **Renders nothing while `testimonials` is empty (it is).** |
| FAQ | `sections/faq.tsx` | `#faq` | ivory | Centred narrow column; Radix accordion (single, collapsible); Cormorant questions, hairline rules, rotating chevron |
| Enquiry | `sections/enquiry.tsx` + `enquiry-form.tsx` | `#enquire` | blush | 5/7 split: sticky context on the left, form on the right, directly on blush (white fields, no card) |
| Contact | `sections/contact.tsx` | `#contact` | white | Large statement on the left; `<address><dl>` with Call / Based in / Follow rows in Cormorant, separated by hairlines |
| Footer | `layout/site-footer.tsx` | `<footer>` (in root layout, outside `<main>`) | dark | Logo + slogan; Explore (`site.navigation` + `site.enquiry`); Contact; Follow; © year |
| Mobile CTA bar | `layout/mobile-cta-bar.tsx` | `nav[aria-label="Quick contact"]` | white | Mobile only; Call + Enquire (see below) |

**Page order:** Hero → Intro → Services → CategoryStrip → GalleryPreview → AboutFounder → Process → **Testimonials** → WhyCanvas → VideoStory → **Faq → Enquiry → Contact**, then the footer in the layout.

**Testimonials placement:** right after Process ("how we work"), so proof follows the process. While empty, Process (ivory) flows straight into Why Canvas (dark). When filled, a white section sits between them, so the tones still alternate.

**Tone rhythm, bottom half:** Why (dark) → Video (white) → FAQ (ivory) → Enquiry (blush) → Contact (white) → Footer (dark). No extra dark blocks.

### Content & data structures

| File | Contents | Future table |
| --- | --- | --- |
| `data/testimonials.ts` | `Testimonial { id, quote, name, eventType?, featured, order }`, `featuredTestimonials` (≤3). **Empty.** | `testimonials` |
| `data/faq.ts` | `FaqItem { id, question, answer, action?, order }`, `sortedFaqs`. Answers built from `site.ts` values (phone, locality, region), so nothing is duplicated | `faqs` |
| `data/home.ts` | `testimonialsSection`, `faqSection`, `enquirySection` (incl. `offlineNotice`), `contactSection` | — |

**Published FAQs (verifiable only):**

1. How do I make an enquiry? → by phone (real number, plus a call link); "also find us on Instagram, Facebook and TikTok". A code comment says to update this when the form goes live.
2. What details help with an enquiry? → date, type of celebration, venue, ideas. Informational, with no promises.
3. Where are you based? → "Munno Para, South Australia", from `site.ts`.

**Deliberately not published:** pricing, availability, lead times, service area, deposits, response times, hours.

### Enquiry architecture

- **`src/lib/enquiry.ts`**
  - `enquirySchema` (Zod 4): shared by the form now and a future server action later (validate on both sides).
    - `name` required, max 100
    - `email` required, max 254, valid format
    - `phone` optional, digits/spaces/`+()-` with at least 8 digits
    - `eventType` optional, max 100
    - `eventDate` optional, `YYYY-MM-DD`, not in the past
    - `venue` optional, max 200
    - `message` required, max 2000
    - All inputs are trimmed.
  - Types: `EnquiryInput` / `Enquiry` / `EnquiryResult` (`sent` | `unavailable` | `error`).
  - `enquiriesEnabled = false`.
  - `submitEnquiry()` is the **single integration point**. It currently returns `{ status: "unavailable" }`; later it becomes a server action call (Supabase insert + Resend email). The UI won't need changes.
- **`EnquiryForm`** (the only new client component besides the bar): React Hook Form + `zodResolver`, `mode: "onTouched"`, `noValidate`.
  - States: `idle` / `submitting` (button disabled, "Sending…") / `sent` / `unavailable` / `error`.
- **Honesty:**
  - While `enquiriesEnabled` is false, a notice sits **above** the fields: "Online enquiries are still being set up, so this form can't send messages yet. For now, please call us." plus a call link. The form references it via `aria-describedby`.
  - A valid submit shows: "Your details look good, but online enquiries aren't connected yet, so nothing has been sent. Please call us on 0426 071 109. Your details are still in the form."
  - The form **never shows "Thank you" / "sent"** without a real backend (verified).
- **Success state:** a "Thank you." heading that receives focus, plus a "Send another enquiry" link. It's only reachable through `preview` mode, used solely on the dev-only `/design-system` page (simulated 600ms delivery), or later through a real backend.
- **Fields asked (7):** name, email, phone (optional), type of event (free text, optional; there's no dropdown because categories aren't verified), event date (optional, native date picker), venue or location (optional), message. **Not asked:** budget, guest count.

### Mobile CTA bar decision

Added. The page is about 9,600px tall on phones, and between the hero and the enquiry section there was no visible call/enquire action without opening the menu.

- It's shown **only when none of** the hero, `#enquire`, `#contact` or the footer is on screen (IntersectionObserver). It never covers the form (or the keyboard while typing in it), the contact details, or the page end.
- When hidden it's `inert` + `aria-hidden`, so it can't be focused.
- Safe-area bottom padding; solid background with a hairline (no blur); 44px buttons; `z-30`, below the header and menu; `lg:hidden`.

### Design decisions

1. **Four jobs, four treatments:** proof (large italic quotes), answers (centred accordion), conversion (split layout with a sticky context column), direct contact (statement plus a typographic definition list). None use cards.
2. **The form sits directly on blush;** white fields supply the structure. The offline notice uses a gold left rule, not an alert box.
3. **Footer is quiet:** four groups, champagne eyebrows, a small logo badge, one hairline above the copyright. No legal or company details were invented.
4. **Contact shows the address exactly as supplied** (street without number, locality, postcode); the footer shows locality only. No map (not required, no dependency).
5. **No structured data added:** no LocalBusiness, Review or Rating schema (production HTML checked: no `aggregateRating`, no stars).

### Accessibility (tested)

| Check | Result |
| --- | --- |
| Headings | One h1; FAQ questions are h3 (Radix header); no skipped levels at any width |
| Landmarks | `<header>`, `<nav aria-label="Main">`, `<main>`, `<nav aria-label="Footer">`, `<footer>` (outside `<main>`), `<nav aria-label="Quick contact">` |
| FAQ | Enter opens (`aria-expanded` changes to `true`, region `role="region"` visible); ArrowDown moves to the next question; Space toggles (single mode closes the previous one); focus ring visible |
| Form labels | Visible `<label for>` on every field; "(optional)" in the label text; required fields `aria-required` |
| Form errors | Empty submit focuses **Name**; errors render as `role="alert"`; the input gets `aria-invalid="true"` and `aria-describedby="enquiry-name-error"`, which resolves to the message text |
| Validation messages seen | "Please enter your name." · "Please enter your email address." · "Please tell us a little about your celebration." · "Please enter a valid email address." · "Please enter a valid phone number, or leave it blank." · "Please choose a date that hasn't passed." |
| Submit outcome | Announced through a `role="status"` live region; the success heading receives focus |
| Inputs | 16px font (no iOS zoom); `autocomplete` name/email/tel; `inputmode="tel"` |
| External links | Contact and footer socials: `target="_blank" rel="noopener noreferrer"` + screen-reader text "(opens in a new tab)" |
| Reduced motion | Accordion, Sheet (menu) and Select open/close animations off; bar transition off; reveals off |

### Responsive behaviour

| Width | `scrollWidth` = viewport | Page height (dev) |
| --- | --- | --- |
| 375 | ✅ | 9650 |
| 390 | ✅ | 9554 |
| 430 | ✅ | 9570 |
| 768 | ✅ | 9133 |
| 1024 | ✅ | 8045 |
| 1280 | ✅ | 8344 |
| 1440 | ✅ | 8399 |

- Form: one column on phones, two from `sm` (message and submit full width).
- The Enquiry and Contact splits stack below `lg`.
- Footer: 1 column on phones (with a 2-column link list), 2 at `sm`, 12-column layout at `lg`.

### Anchors & CTAs (measured)

| Trigger | Result |
| --- | --- |
| Header / hero / services row / About CTA / footer "Enquire Now" (desktop) | `#enquire` at 96px (header 97px), each one |
| Header nav FAQ, Contact; footer nav FAQ | `#faq` / `#contact` at 96px |
| Mobile menu FAQ, Contact, Enquire Now | at 72px (mobile header), menu closed |
| Mobile bar Enquire | `#enquire` at 72px; bar then hides |

All six nav anchors now exist: `#services`, `#gallery`, `#about`, `#faq`, `#contact`, `#enquire`.

### Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` / `lint` | ✅ exit 0 (after every change) |
| `bun run build` | ✅ all routes static |
| Dev audit, 7 widths | ✅ no overflow, no failed requests, no console or hydration errors |
| Production audit, 7 widths (port 3057) | ✅ same; server HTML contains `#faq`, `#enquire`, `#contact`, the footer and the form; © 2026 rendered; no inline `opacity:0` |
| `/design-system` in production | ✅ 404 |
| Fabricated content | ✅ none: no testimonials, ratings, hours, prices, response times or email |

### Issues found / fixed

1. **Reduced motion didn't stop open/close animations** (accordion, and since Phase 3 the Sheet menu; also Select). `data-open:animate-*` has higher specificity than `motion-reduce:animate-none`, so the override never applied. Now the animations only run under `motion-safe:`. Verified: `accordion-down`/`enter` normally, `none` with reduce.
2. **shadcn accordion's fixed inner height** (`h-(--radix-accordion-content-height)` on the wrapper) could clip text if the viewport width changes while a question is open. Removed.
3. **Footer Explore list** was a tall single column on phones → 2 columns.
4. **Test artifacts, not site bugs:**
   - An LCP warning only appeared after scripted scrolling; clean loads (390, 1440, `/design-system`) show no warnings.
   - "Missing" `aria-controls` on closed FAQ triggers: Radix only links the panel while it's mounted (open), which is correct.
   - The copyright year grep split on React's `<!-- -->` text marker; "© 2026" is present.

### Remaining / deferred

- **Backend for enquiries** (next phase): Supabase table + RLS, server action calling `submitEnquiry` → insert → Resend email. Then set `enquiriesEnabled = true`, update the FAQ "How do I make an enquiry?" answer, and remove the offline notice.
- **Content from the client:**
  - real testimonials (with permission to publish names)
  - FAQ answers they want public (pricing, service area, lead times…)
  - a business email
  - plus everything from earlier phases (photos, services, categories, founder story, process, video)
- **Copyright year** is set at build time; a rebuild keeps it current.
- **Not built, per brief:** Supabase, storage, auth, RLS, admin, CMS, email, Edge Functions, lightbox, gallery page, booking, pricing.
- **Still open:** Prettier decision, GitHub remote.

---
---

## Phase 7 — Supabase Backend Foundation & Enquiry Pipeline

**Date:** Wednesday, 23 September 2026
**Timezone:** Nepal Time, NPT (UTC+05:45)
**Work window:** 22:26:14 → ~22:49 (commit)
**Goal:** Connect the existing enquiry form to Supabase: server-side validation → Postgres, behind RLS. No admin, no email.
**Result:** Commit `feat: connect enquiry pipeline to Supabase` (not pushed)

### Supabase setup (decision made with you)

- **No `.env.local` existed, so there were no credentials.** None were invented.
- Asked you: hosted project, local Docker stack, or build only. **You chose the local Supabase stack.**
- `bunx supabase init` created `supabase/config.toml` (no secrets) and `supabase/.gitignore` (`.temp`, `.branches` ignored).
- Started a **trimmed stack**: only `db` (Postgres 17), `rest` (PostgREST) and `kong` (gateway), with 11 services excluded. Ports 54321/54322 were free, and **your 10 existing containers kept running untouched**.
- `.env.local` (git-ignored, confirmed with `git check-ignore`) holds the local API URL and the CLI-generated **publishable** key, read from the gateway config without printing it. The secret key is never written anywhere.
- **The hosted project is not connected yet** (see Remaining): `supabase link` + `supabase db push` + two Vercel env vars.

### Timeline

| Time (NPT) | Step |
| --- | --- |
| 22:26:14 | Inspection: tree clean at `fd4064c`; no `.env.local`; Docker running with 10 of your containers; CLI 2.117 via `bunx` |
| ~22:27 | Asked about the connection strategy → local stack |
| 22:29 | `supabase init`; ports checked; `migration new create_enquiries` |
| ~22:31 | Migration written; `supabase start` (trimmed) → **migration applied** |
| ~22:34 | `.env.local` written; **public API probed**: RLS/grants/constraints (11 cases); probe row deleted |
| ~22:36 | `isSupabaseConfigured()`; schema/types kept in `enquiry.ts`; `submitEnquiry` moved to a `"use server"` module; form + section + FAQ wired |
| ~22:37 | Lint caught `react-hooks/refs` (ref read in the submit handler) → honeypot read from the submitted `FormData` |
| ~22:38 | Browser E2E valid submit → row verified in Postgres |
| ~22:39 | Direct server-action calls bypassing the browser (10 payloads) |
| ~22:40 | Outage test (REST container stopped) → generic error, 0 rows, 1 request |
| ~22:42 | Test rows deleted; production build; secret scan |
| ~22:43 | Production server with captured logs: 7-width audit, E2E, bypass, outage, log content check |
| ~22:45 | Phase 6 accessibility/interaction suite re-run against the live form; rows cleaned |
| ~22:47 | README + `.env.example`; this entry; commit |

### Migration / schema: `supabase/migrations/20260923164440_create_enquiries.sql`

| Column | Type | Rule |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `name` | `text` | not null; trimmed length 1–100 |
| `email` | `text` | not null; ≤254; basic `x@y.z` pattern |
| `phone` | `text` | nullable; ≤30 |
| `event_type` | `text` | nullable; ≤100 |
| `event_date` | `date` | nullable |
| `venue` | `text` | nullable; ≤200 |
| `message` | `text` | not null; trimmed length 1–2000 |
| `status` | `text` | not null, default `'new'`; CHECK in (`new`, `contacted`, `quoted`, `booked`, `completed`, `archived`) |
| `created_at` / `updated_at` | `timestamptz` | not null, default `now()`; `updated_at` maintained by the `set_updated_at()` trigger (`search_path = ''`) |

- **Indexes, for the future admin only:**
  - `(created_at desc)` for "newest first"
  - `(status, created_at desc)` for "filter by status, newest first"
- **Status as a CHECK constraint, not an enum:** it rejects invalid values just the same, and is easier to extend later with a migration.
- **"Event date not in the past" stays in Zod only:** a `current_date` CHECK would make valid historical rows fail on dump/restore.
- **Not modelled (deferred):** budget, guest count, pricing, assignee, quote, notes, booking.

### RLS / security

1. `enable row level security`, with **one policy**: `"Public can submit new enquiries"`, `for insert to anon, authenticated with check (status = 'new')`. There are no select, update or delete policies.
2. `revoke all on public.enquiries from anon, authenticated`, then `grant insert (name, email, phone, event_type, event_date, venue, message)`. Column-level: public roles **can't set** `id`, `status` or timestamps, and have **no SELECT privilege**, which also stops `return=representation` read-backs.
3. `authenticated` is included only for insert, so a future logged-in admin browsing the public site can still submit. Authenticated users get **no** other access; the admin model comes later.
4. The app **never uses the secret / service_role key.** Inserts run through the existing server client with the publishable key (public role), so RLS is always in force.

**Verified against the running database using the public key over the REST API (the same capability a browser has):**

| Attempt | Result |
| --- | --- |
| SELECT all | 401 `permission denied` |
| INSERT valid (minimal) | **201** |
| INSERT + return representation | 401, and the insert rolled back (no row) |
| INSERT with `status=booked` / chosen `id` / `created_at` | 401 each |
| PATCH / DELETE | 401 each |
| Bad email / blank name / 3,000-character message | 400 CHECK violation each |

### Server submission architecture

- **`src/lib/enquiry.ts`** (shared, client-safe): `enquirySchema`, `EnquiryInput`, `Enquiry`, `EnquiryResult` (`sent` = stored, `unavailable` = no database configured, `error`). The old `enquiriesEnabled` constant and the stub `submitEnquiry` were removed from here.
- **`src/lib/submit-enquiry.ts`** (`"use server"`): the same single `submitEnquiry` integration point, now real. A `"use server"` module may only export async functions, so the schema stays in the shared file. Steps:
  1. **Honeypot** (`hp_field`): filled → a quiet `sent`, nothing stored.
  2. `isSupabaseConfigured()`: false → `unavailable`.
  3. **Zod `safeParse` again.** Invalid → generic error; logs field **names** only.
  4. **Explicit mapping:** `eventType → event_type`, `eventDate → event_date`, blank optional fields → `NULL`.
  5. `createClient()` (existing server client) → `.insert(row)` (return=minimal).
  6. Database error → logs `{ code, message }`, returns a generic error. A thrown error does the same.
  7. **`sent` only after the insert succeeds.**
- **`src/lib/supabase/env.ts`:** the one targeted addition is `isSupabaseConfigured()`, which doesn't throw. No new clients.
- **`EnquiryForm`:**
  - takes `enabled` from the server (replacing the constant)
  - calls the server action and wraps it in try/catch, so a network failure gives `error`, never success
  - reads the honeypot from the submitted `FormData`
  - success copy: "Thank you. We've received your enquiry." (**no promise of a reply**, because nobody is notified yet)
- **`Enquiry` section:** `<EnquiryForm enabled={isSupabaseConfigured()} />`.
- **FAQ "How do I make an enquiry?":**
  - configured: "You can send us an enquiry online using the form on this page, or call us on 0426 071 109. You can also find us on Instagram, Facebook and TikTok." with a "Send an enquiry" link
  - otherwise: the previous phone answer
  - No response-time promises.
- **No API route, Express or Axios.** A Next.js server action is the whole transport.
- **Duplicates:** there's no deduplication by email, phone or date (people may legitimately enquire twice). One interaction sends one request: the button is disabled while submitting (verified: 1 POST per submit, even when the database is down).

### Validation (three layers)

1. **Client:** Zod through React Hook Form, as in Phase 6. All behaviour was re-verified.
2. **Server:** the same Zod schema re-validates every call. **Verified by bypassing the browser** and POSTing directly to the server action (action ID taken from the client bundle):

   | Payload | Result | Rows |
   | --- | --- | --- |
   | invalid email | generic error | +0 |
   | blank name | generic error | +0 |
   | missing message | generic error | +0 |
   | invalid phone `12ab` | generic error | +0 |
   | past date `2020-01-01` | generic error | +0 |
   | 2,500-char message | generic error | +0 |
   | string instead of object | generic error | +0 |
   | object with missing fields | generic error | +0 |
   | honeypot filled | `sent` (silent) | **+0** |
   | extra keys `status:"booked"`, `id`, `created_at` | `sent` | +1, **stored as `new`, DB-generated id, created now** (Zod stripped the extras) |

3. **Database:** CHECK constraints (verified by the direct REST probes above).

### End-to-end test (real browser → server → Postgres)

**Valid submission** (390px mobile, keyboard Enter submit; name padded with spaces, venue left blank):

- UI: "Sending… (disabled)", then **"Thank you."** with focus moved to it, and "We've received your enquiry."
- Row checked **directly in Postgres** (psql as postgres in the db container):

  | Field | Value |
  | --- | --- |
  | `id` | generated |
  | `name` | stored **trimmed** as `[E2E valid test]` |
  | email / phone / event type | stored as entered |
  | `event_date` | 30 days ahead |
  | `venue` | **NULL** |
  | `status` | **`new`** |
  | timestamps | set, with `updated_at = created_at` |

**Failure path** (REST container stopped to simulate an outage):

- "Sending…" for about 5–7 seconds (supabase-js retries), then "Something went wrong and your enquiry wasn't sent. Please try again, or call us on 0426 071 109."
- No success view, **0 rows**, visitor input kept, **1 POST** for one submit.
- REST restarted afterwards (200).

**Test data:** every probe, E2E, tamper and suite row was deleted. The database ended at **0 rows**.

### Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` / `lint` | ✅ exit 0 (after the `react-hooks/refs` fix) |
| `bun run build` | ✅ all routes static (built with the local Supabase env, so the online form is live in that build) |
| Secret scan `.next/static` | ✅ 0 files with `sb_secret_`, 0 with the actual local secret value, 0 with `service_role`. Even the publishable key is absent (the browser never talks to Supabase) |
| Server HTML | ✅ no `sb_secret`; no enquiry data; no offline notice; online FAQ wording; all 6 anchors |
| Production 7-width audit | ✅ no overflow, no console errors, no failed requests |
| Production E2E valid / bypass / outage | ✅ success, rejected, generic error (same as dev) |
| **Server log content** (production, captured) | ✅ `[enquiry] rejected invalid payload { fields: [ 'eventDate' ] }`, `[enquiry] insert failed { code, message }`. **0** occurrences of the test names, emails, message text or any key |
| Accessibility regression (Phase 6 suite, live form) | ✅ labels, `aria-required`, `aria-invalid`, `aria-describedby`, `role="alert"`, first-error focus, 16px inputs, success-heading focus, FAQ keyboard, mobile bar and menu anchors, reduced motion |

### Issues found / fixed

1. **Lint `react-hooks/refs`:** reading a ref inside the submit handler passed to `handleSubmit` during render. Fixed by reading the honeypot from the submitted form's `FormData`, so no ref is needed.
2. **Local key discovery:** `supabase status` omits API keys when auth is excluded. The key was read from the gateway's config. The first attempt returned empty because Git Bash rewrote the container path; re-run inside `sh -c`.
3. **Success copy:** it had promised "We will be in touch". With no email or admin yet, nobody is notified, so it now says only that the enquiry was received.
4. **Test harness notes (not site bugs):**
   - Chrome reports request headers in lowercase (`next-action`); the first request count read 0.
   - The Phase 6 suite expected the old "unavailable" state after a valid submit; updated for the live success state.
   - The same LCP console warning appears only after scripted scrolling (clean loads show none, per Phase 6).

### Remaining / deferred

- **Business risk to decide before going live:** with email and admin deferred, **nobody is notified of new enquiries**. They're only visible in the Supabase dashboard. Either keep production unconfigured (the form shows the honest phone fallback) until notifications exist, or have someone check the dashboard.
- **Connect the hosted project:** `supabase login` → `supabase link --project-ref …` → `supabase db push`, then set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel **before** building.
- **Next phases:** email notification (Resend, via server action or Edge Function; server-only secret) and the admin portal (auth + role-checked RLS policies for select/update; status changes).
- **Outage latency:** about 5–7 seconds before the error appears (client retries). Acceptable for now; could shorten with a fetch timeout later.
- **Rate limiting / CAPTCHA:** not added. Honeypot + validation + constraints only; revisit if spam appears.
- **Local stack is still running** (3 containers). Stop with `bunx supabase stop`. While it's stopped, the dev form shows the error state because `.env.local` is still set.
- **Still open:** business email, client content (photos, services, categories, testimonials, founder story, process, video), Prettier decision, GitHub remote.

### Phase 7 addendum: hosted Supabase connected (2026-09-23)

- You replaced `.env.local` with the hosted project's values. Verified without printing them: only `NEXT_PUBLIC_SUPABASE_URL` (a hosted `…supabase.co` URL) and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (a publishable key). **No secret or service_role key.** Still git-ignored.
- You ran `supabase login`, `supabase link --project-ref vxupiukrnlnwchvdxcte` and a dry run (1 pending migration). I ran `supabase db push`, which applied `20260923164440_create_enquiries.sql`. `migration list` shows local = remote.
- **Hosted schema confirmed** (`db query --linked`): RLS enabled; 1 policy, `Public can submit new enquiries [INSERT to anon,authenticated]`; public table grants: none; anon INSERT columns: exactly the 7 visitor fields; 0 rows.
- **Hosted public-key probes:** SELECT, insert-with-read-back, `status=booked`, a chosen `id`, UPDATE and DELETE → all **401 permission denied**. Bad email → 400 CHECK. No rows written.
- **Hosted end-to-end test:** a real browser submit through the dev server → "Thank you." (focused), 1 POST. The hosted row count went 0 → 1 while the local stack stayed at 0. The row was verified (trimmed name, correct mapping, venue NULL, status `new`, timestamps set) and then **deleted**. The hosted table is back to 0 rows.
- **Security advisor** (`db advisors --linked`): 2 WARNs about the **pre-existing** `public.rls_auto_enable()`, Supabase's "auto-enable RLS on new tables" event-trigger function (`ensure_rls` on `ddl_command_end`). It isn't from this repo. It's `SECURITY DEFINER` and executable by anon/authenticated through RPC, but it returns `event_trigger`, so Postgres won't run it as a normal function. Low practical risk. Left unchanged pending your decision; the optional hardening is `revoke execute on function public.rls_auto_enable() from anon, authenticated, public;` as a migration.
- **Still true:** nobody is notified of new enquiries (no email or admin yet). Vercel still needs the two env vars set before building for production.

---
---

## Phase 8 — Resend Email Notifications

**Date:** Wednesday, 23 September 2026
**Timezone:** Nepal Time, NPT (UTC+05:45)
**Work window:** 23:04:57 → ~23:20 (commit)
**Goal:** After an enquiry is stored, send an internal notification email through Resend. The database stays the source of truth. No admin, auth, customer emails or inbox.
**Result:** Commit `feat: add enquiry email notifications` (not pushed). This commit also includes the uncommitted Phase 7 addendum above.

### Inspection findings

- **Current signatures:**
  - `submitEnquiry(input: unknown, honeypot?: unknown): Promise<EnquiryResult>` in `src/lib/submit-enquiry.ts` (`"use server"`)
  - `EnquiryResult = sent | unavailable | error`
  - The form is at `src/components/sections/enquiry-form.tsx` (there is no `components/forms` folder).
- **`.env.local`** contains only the two hosted Supabase public variables. **No Resend credentials exist**, so no real email could be sent in this session, and none were invented.
- **The insert returned no id.** Public roles have no SELECT privilege, so `INSERT … RETURNING` is impossible, and the notification needs the id.

### Email architecture

The server action is still the only public entry point. Steps, in order:

1. honeypot
2. Supabase configured?
3. Zod re-validation
4. **generate the id** (`crypto.randomUUID()`)
5. insert (id included)
6. log `stored <id>`
7. `sendEnquiryNotification(id, enquiry)`
8. return `{ status: "sent", notified }`

**How the enquiry gets its id.** I compared three options and chose the third:

| Option | Verdict |
| --- | --- |
| A `SECURITY DEFINER` RPC | Rejected: bypasses RLS, adds a public RPC surface, advisor WARN |
| A SELECT policy for `RETURNING` | Rejected: would expose rows |
| **The server generates the UUID** + an additive `GRANT INSERT (id)` | **Chosen** |

- The id is the row's real primary key. RLS, the single insert-only policy and "no public reads" are unchanged, and public roles still can't set `status` or timestamps. The DB default `gen_random_uuid()` remains for any other insert.
- New migration: `supabase/migrations/20260923172126_allow_enquiry_id_on_insert.sql`.

**Modules** (`src/lib/email/`, each starting with `import "server-only"`, which fails the build if imported into client code):

| File | Role |
| --- | --- |
| `config.ts` | `getEmailConfig()`: the **only** reader of the email env variables. Returns `null` when not configured; never throws. |
| `enquiry-notification.ts` | `buildEnquiryNotification({ id, enquiry, receivedAt })` → `{ subject, html, text }`. Pure template. |
| `send-enquiry-notification.ts` | `sendEnquiryNotification(id, enquiry)` → `"sent" \| "not-configured" \| "failed"`. Never throws. |

**Resend usage:** `new Resend(apiKey)` → `resend.emails.send(payload, { idempotencyKey })`, from `resend@6.28.1` (added with `bun add resend`). Checked against the installed package's types: `CreateEmailRequestOptions` extends `IdempotentRequest`, which sends the `Idempotency-Key` header. Errors return as `{ data, error }` with named codes. There's no API route, browser integration or extra email framework.

### Environment variables (server-only)

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | API key. Never `NEXT_PUBLIC_`. |
| `RESEND_FROM_EMAIL` | Sender; must be valid for the Resend account/domain |
| `ENQUIRY_NOTIFICATION_EMAIL` | Recipient(s), comma-separated |

- `.env.example` has names and explanations only. `.gitignore` already covers `.env*` except `.env.example`.
- **Nothing in `src/data/site.ts` changed. No business email was invented.**

### Email template

- **Subject:** `New enquiry from <name>`. The name is reduced to one line (control characters and newlines collapsed).
- **HTML:** table layout with inline styles; brand colours mirrored from the tokens (email clients can't read CSS variables); Georgia for the heading, Arial for the body; no images or external assets.
  - Brand eyebrow "Canvas Creations and Events", then an `<h1>` "New enquiry"
  - Reference id, plus "Received" (formatted in the `Australia/Adelaide` timezone)
  - "Details" `<h2>` with a `<th scope="row">` table: Name, Email (mailto), then only if provided: Phone (tel), Event type, Event date (e.g. "Monday 2 November 2026"), Venue
  - "Message" `<h2>` with a blockquote (`white-space: pre-wrap`)
  - A note to reply to the enquirer directly
- **Plain-text part** with the same content.
- **Escaping:** every value goes through `escapeHtml` (`& < > " '`), including hrefs. No field outside the schema, and no price, availability or response promises.
- **Addresses:** `from` and `to` come only from configuration. `replyTo` is the **server-validated** email (Zod `z.email()`, no CR/LF possible). The visitor can't influence the sender or recipient.

### Failure semantics (exactly what the visitor sees)

| Situation | Stored? | Email attempts | Result | Visitor sees |
| --- | --- | --- | --- | --- |
| Stored + Resend OK | ✅ | 1 | `sent`, `notified: true` | "Thank you. We've received your enquiry." |
| Stored + Resend fails / rejects / times out | ✅ (not rolled back, `status = new`) | 1–2 | `sent`, `notified: false` | the same + "If it's urgent, please also call us on 0426 071 109." |
| Stored + email not configured | ✅ | 0 | `sent`, `notified: false` | the same as the row above |
| Database unavailable / insert error | ❌ | **0** | `error` | "Something went wrong and your enquiry wasn't sent. Please try again, or call us…" |
| Invalid payload (server) | ❌ | 0 | `error` | generic "Some details weren't valid…" |
| Honeypot | ❌ | 0 | `sent`, `notified: false` | (bot) quiet success |
| No Supabase config | ❌ | 0 | `unavailable` | the Phase 6/7 honest phone message |

- **Result model change:** `sent` gained `notified: boolean`; nothing else changed.
- **The frontend never claims a notification was sent.** It only adds the call line when `notified` is false, and never mentions email, Resend, the database or notifications.
- **A Resend timeout** (8 seconds) counts as a failure. The enquiry is already stored, so the visitor still gets the thank-you.

### Idempotency

- **Key:** `enquiry-notification/<enquiry id>`.
- The payload, including the "Received" timestamp, is **built once** per notification, and every attempt sends the identical payload with the same key. Resend deduplicates identical keyed requests, so a retry can't create a second email. A different payload under the same key is rejected by Resend (`invalid_idempotent_request`).
- **Retry policy:** one retry after 500ms, only for `application_error`, `internal_server_error`, `rate_limit_exceeded`, `concurrent_idempotent_requests`, a thrown exception or a timeout. No retry for validation or authentication errors.
- **Duplicate form submissions remain allowed.** Each submission is a new row with a new id and a new key, so legitimate separate enquiries are never merged.
- **No queue.** If both attempts fail, the enquiry stays `new` in the database (visible in the Supabase dashboard); there's no automatic later resend (deferred).

### Security

- The Resend key is read only in `src/lib/email/config.ts` (server-only). It never uses `NEXT_PUBLIC_`, and is never logged or rendered.
- **Logs (verified):** `[enquiry] stored <id>`, `notification sent <id> { emailId, attempt }`, `notification failed <id> { attempt, code, message }`, `notification skipped <id> (email not configured)`, `insert failed { code, message }`, `rejected invalid payload { fields }`. **No** name, email, message, raw payload or key.
- **No service-role key** anywhere; inserts still go through the public role under RLS.

### Tests performed (actual results)

**Local verification method.** No real Resend credentials exist, so nothing was ever emailed.

- A **throwaway mock of the Resend REST API** in my scratchpad (not in the repo) recorded every request. The official SDK was pointed at it by setting its own `RESEND_BASE_URL` variable in the **test process only**. It simulated success, a persistent 500, fail-once and a 422, and applied Resend's documented idempotency rule.
- The test build targeted the **local** Supabase stack through process-env overrides (hosted untouched). It used a dummy key and `example.com` addresses, and ran on port 3057 (my server, stopped afterwards).

| # | Test | Result |
| --- | --- | --- |
| 1 | Valid submission with HTML/script in name and message | UI "Thank you." (focused), no call line, 1 POST. **Row stored raw, `status = new`.** Mock got **1** request: key `enquiry-notification/<the row id>`, from/to from config, `replyTo` = visitor email. HTML: no raw `<script>`, `<b>` or `onerror`; all escaped (`&lt;script&gt;`, `&amp;`). Text part complete; date formatted. Log: `stored`, `notification sent … attempt 1` |
| 2 | Resend persistent 500 | UI thank-you **+ call line**; **row stored, `new`**; 2 attempts, **1 idempotency key, identical payloads**; 2 × `notification failed` |
| 3 | Resend fails once, then OK | Plain thank-you; 2 attempts, same key and payload; `notification sent … attempt 2` |
| 4 | Resend 422 (non-retryable) | Thank-you + call line; **1 attempt only**; row stored |
| 5 | Honeypot (direct action call) | `{"status":"sent","notified":false}`, **0 rows, 0 Resend requests** |
| 6 | Server validation (browser bypassed): bad email, missing name, bad phone, past date, 2,500-char message | All generic error; **0 rows, 0 Resend requests** |
| 7 | Database outage (local REST stopped) | Generic error after about 5s; **no false success; 0 rows; 0 Resend requests**; 1 POST; log `insert failed { code, message }` |
| 8 | Email not configured (same build, variables unset) | Thank-you + call line; **row stored, `new`**; 0 Resend requests; `notification skipped <id> (email not configured)` |
| — | Server log scan across all tests | **0** names, emails, message text or key |
| — | Client bundle scan (test build and final build) | **0** files with a key, `RESEND_*` variable names, `api.resend.com`, idempotency code, `sb_secret_` or `service_role`; server HTML clean |

**Hosted project** (you approved the push):

- `db push --dry-run` listed only `20260923172126`, then it was pushed; local and remote history match.
- Hosted state: RLS on, 1 policy, no public table grants, anon INSERT columns = the 7 visitor fields + `id`.
- Public-key SELECT, UPDATE, DELETE and `status=booked` → all **401**.
- Real browser end-to-end through your dev server → hosted: thank-you + call line (your `.env.local` has no Resend variables), row `new`, then **deleted**.

**Local and hosted test data:** all test rows deleted (local 0, hosted 0).

### Verification (final)

| Check | Result |
| --- | --- |
| `bun install --frozen-lockfile` | ✅ no changes |
| `bun run typecheck` / `lint` | ✅ exit 0 |
| `bun run build` | ✅ all routes static |
| 7-width audit (production build) | ✅ no overflow, all 6 anchors, 1 h1, no skipped headings, no console errors, **no failed requests**. (375px showed 2 lazy images not yet loaded on the cold first load, the known effect from Phases 5–6; 0 at every other width) |
| Interaction/a11y suite (dev → hosted) | ✅ all CTAs and anchors; FAQ keyboard (online answer); first-error focus, `aria-invalid`, `aria-describedby`, `role="alert"`, 16px; live submit → thank-you focused; preview; mobile bar and menu; reduced motion. The suite's hosted row was deleted |

### Issues found / fixed

1. **No id available after insert** (public roles can't read), so a notification couldn't be referenced or deduplicated. Fixed with a server-generated UUID + an additive `GRANT INSERT (id)` migration, applied locally and (with your approval) to hosted.
2. **The hosted database would have rejected the new inserts** until that grant existed (your dev server points at hosted). Pushed and verified.
3. **Test harness notes:** the known scripted-scroll LCP warning, and cold-cache lazy images at the first audited width. Neither is a site bug.

### Remaining / deferred

- **Production email isn't live.** No Resend credentials or verified sender were supplied, so **real delivery through Resend has not been tested.** To go live: verify a sending domain in Resend, set `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `ENQUIRY_NOTIFICATION_EMAIL` (in `.env.local` and on Vercel), then submit one real test enquiry and confirm delivery (and that a quick retry doesn't duplicate it).
- **No automatic resend** if both attempts fail (the enquiry stays `new` in the database). A queue or admin "resend" is for later.
- **The visitor waits for the email step:** usually well under a second; at most about 17s in the worst case (two 8-second timeouts plus the pause).
- **Not built, per brief:** admin UI, auth, admin RLS, customer confirmation emails, quotes and bookings, CMS, inbox.
- **Carried over:** the `rls_auto_enable()` advisor note, business email, client content, the Prettier decision, the GitHub remote. The local Supabase stack is still running (3 containers).

---
---

## Phase 9 — Admin Enquiries Portal (self-directed)

**Date:** Wednesday, 23 September 2026 · **Timezone:** NPT (UTC+05:45) · **Work window:** 23:21 → ~23:37
**Why this task:** you asked me to choose the next task. The biggest gap was that nobody could see or manage enquiries except in the raw Supabase dashboard, and every earlier phase had deferred the admin portal. The schema (status vocabulary, indexes) was already designed for it.
**Result:** implemented and verified locally and on hosted (migration pushed with your approval). **Not committed yet.**

### Plan (as announced) → done

1. **DB migration** `supabase/migrations/20260923173616_admin_enquiry_access.sql`:
   - `admin_users (user_id → auth.users, cascade)`, with RLS: a user can see only their own row. Public roles have no other grants.
   - Enquiries: `grant select` + `grant update (status)` to `authenticated`, plus policies "Admins can read enquiries" and "Admins can update enquiry status". The admin check is a plain `exists (… admin_users where user_id = (select auth.uid()))` subquery, so **no SECURITY DEFINER function** is needed.
   - No delete for anyone (archive instead).
2. **Auth:** email + password. Local `config.toml`: `[auth] enable_signup = false`. (`[auth.email] enable_signup` must stay `true`: in this CLI it disables the email *provider*, which blocked all logins. Found and fixed during testing.)
3. **App:**
   - Public pages moved into the `src/app/(site)/` route group (URLs unchanged); the root layout is now just the shell.
   - `src/proxy.ts`: Next 16's proxy (the renamed `middleware`), matching `/admin/*` only; it only refreshes the session (`src/lib/supabase/proxy.ts`).
   - `src/lib/admin/session.ts`: `getAdmin()` (verified JWT via `getClaims()` + `admin_users` membership, cached per request) and `requireAdmin()`. **Called by every admin page and server action,** as the Next docs advise against relying on the proxy for authorization.
   - `src/app/admin/`:
     - `layout.tsx`: `noindex, nofollow`, ivory shell
     - `login/`: `useActionState`, generic errors, non-admins signed straight back out
     - `(portal)/layout.tsx`: header with sign-out
     - `(portal)/page.tsx`: list, newest first, status filter with counts, ≤200 rows
     - `(portal)/enquiries/[id]/`: detail + status form with a live-region confirmation
     - `actions.ts`: `signIn`, `signOut`, `updateEnquiryStatus` (Zod: uuid + status enum)
   - `src/lib/enquiry-status.ts`: statuses, labels and Zod enum (matches the DB CHECK).
   - `src/lib/datetime.ts`: shared Adelaide-time formatters. The email template now uses them instead of its own copy.
4. **README:** admin section (creating and removing admins, disabling sign-up, how access is enforced); the local start command now includes auth.

### Security matrix (local, real login tokens via the Auth API)

| Role | Read enquiries | Update status | Update other column | Delete | admin_users read | Self-promote |
| --- | --- | --- | --- | --- | --- | --- |
| anon | 401 | 401 | 401 | 401 | 401 | 401 |
| logged-in non-admin | `[]` (sees nothing) | 0 rows affected | 403 | 403 | `[]` | 403 |
| admin | ✅ all rows | ✅ (`updated_at` refreshed) | **403** | **403** | own row only | 403 |

- An admin setting status `deleted` → rejected by the CHECK constraint.
- A wrong password → no token.
- Public sign-up (local) → `signup_disabled`.

### Browser E2E (production build against the local stack, port 3057)

- **Logged out:** `/admin` and the detail page redirect to `/admin/login`. The login page is `noindex, nofollow`, with no public header.
- **Wrong password:** "Incorrect email or password." (`role="alert"`, linked by `aria-describedby`).
- **Non-admin:** "This account doesn't have access to the admin area.", signed out immediately (`/admin` redirects again).
- **Admin list:**
  - Counts per status and `aria-current` on the active filter.
  - The `?status=new` filter works; `?status=deleted` falls back to All.
- **Detail and status change:**
  - The detail page shows all fields.
  - Status → Quoted: "Status updated to Quoted." (live region). The DB confirms `quoted`, with `updated_at` refreshed.
  - **A tampered `<option value="deleted">` was rejected** ("Choose a valid status."); the DB was unchanged.
- **Bad ids:** a malformed id and an unknown UUID both give a 404.
- **Keyboard:** skip link → home → Sign out → filters, with focus visible.
- **Width:** no horizontal overflow at 375px or 768px (list and detail).
- **Sign out** → login, and `/admin` redirects.
- **Server log:** codes and user ids only (`sign-in failed { code }`, `refused: not an admin { userId }`, `signed in`, `status updated { id, status }`). No passwords or enquiry content.

### Public-site regression (after the route-group move)

- **7 widths:** no overflow, all 6 anchors, 1 h1, no console errors or failed requests. The public page still has its header, footer and quick-contact bar, **no noindex, and no link to /admin**.
- **Phase 6/7 interaction and accessibility suite (dev → hosted):** all pass (CTAs and anchors, FAQ keyboard, form validation and focus, live submit, preview, mobile bar and menu, reduced motion). The suite's hosted row was deleted.

### Hosted (you approved the push)

- Dry run listed only `20260923173616`, then pushed.
- Hosted policies: enquiries = public INSERT + admin SELECT + admin UPDATE; admin_users = own-row SELECT.
- Public probes: enquiries select/delete and admin_users select/insert → all 401. 0 admins, 0 enquiries.
- **Sign-up setting on hosted not confirmed:** the probe used the reserved `example.com`, which hosted rejects before checking. I didn't probe with a real address, since that would create an account. Recommend turning sign-up off in the dashboard; non-admin accounts see nothing either way.

### Verification

`bun install --frozen-lockfile` (no changes) · typecheck ✅ · lint ✅ · build ✅ (`/admin*` dynamic, proxy active, public pages static) · secret scan: 0 files · `git diff --check` clean · dev server: `/admin` → 307 → `/admin/login` (200), `/` 200.

### Issues found / fixed

1. **`[auth.email] enable_signup = false` disabled email logins entirely** in this CLI → reverted. Sign-ups are blocked by `[auth] enable_signup = false` alone (verified: `signup_disabled`, while logins work).
2. **Test harness:** Windows `node` output added `\r` to generated test passwords and tokens (logins failed, and requests went out unauthenticated). Fixed in the harness and re-run; the anon results were valid throughout.
3. **Cleanup:** local seed enquiry and both local test accounts deleted; temp credential files removed; local and hosted enquiries at 0.

### Remaining

- **You:** create your admin login on hosted (Dashboard → Authentication → Add user, auto-confirm), then register it (`insert into public.admin_users …`, or tell me the email and I'll run it). Turn off public sign-up in the dashboard.
- **Commit** this phase (not done yet).
- **Deferred:** password reset / magic links, multiple roles, internal notes on enquiries, notification resend button, pagination beyond 200, CSV export.
- **Still open:** Resend credentials (email not live), `rls_auto_enable()` advisor note, business email, client content, the Prettier decision, the GitHub remote.

---

### Phase 9 follow-up: shadcn date picker and status select (2026-09-23)

**Request:** replace the native date input (enquiry form) and native `<select>` (admin status) with shadcn components; the native ones looked out of place.

- **Added** via the shadcn CLI (overwrite prompts declined; checksums of all existing `ui/*` files unchanged): `ui/calendar.tsx` and `ui/popover.tsx`. New dependencies required by shadcn's Calendar: **`react-day-picker@10`**, **`date-fns@4`**.
- **Brand restyle:** project `cn` import.
  - Calendar: 40px day cells (touch-friendly), Cormorant month title, Rose Ink selected day, blush "today" marker.
  - Popover: hairline border + `shadow-soft`; open/close animations only under `motion-safe:` (as in Phase 6).
- **New `ui/date-picker.tsx`** (shadcn Popover + Calendar pattern):
  - The trigger matches the other controls (44px, 16px text, same border, focus and error styles).
  - Works on the existing `"YYYY-MM-DD"` string (no schema change); past days disabled; weeks start Monday; "Clear date" option.
  - Accessible name = label + chosen date (`aria-labelledby`). Errors are announced via `aria-describedby`; the error style uses `data-invalid` (lint caught that `aria-invalid` isn't valid on a button).
- **Enquiry form:** the event date uses `DatePicker` through RHF `Controller` (keeps first-error focus and on-touch validation). Every other field stays shadcn `Input`.
- **Admin status form:** now the shadcn `Select` with `name="status"` (Radix submits it with the form); the server still validates.
- **No native `type="date"` inputs or `<select>` elements remain in `src`.**

**Verified** (local test build, then cleaned up):

- **Date picker** at 1280 and 390px: Enter opens it and focus moves into the calendar; past days disabled; 40px cells; Escape closes and returns focus. Picking the 15th of next month shows "Thu 15 October 2026", and a real submit stored `event_date = 2026-10-15`.
- **Admin Select:** keyboard open, 6 options, Booked → "Status updated to Booked.", DB `booked`. No console errors.
- **Regression:** frozen install ✅ · typecheck ✅ · lint ✅ · build ✅ · 7 widths ✅ (no overflow, all anchors) · interaction/a11y suite ✅ (its past-date step was removed: past dates can no longer be picked in the UI; the server still rejects them).
- **Cleanup:** local test enquiry and temporary local admin deleted. Hosted suite rows deleted. One hosted enquiry, "Fly Man" (23:43 NPT, not from my tests), left untouched.

---
---

## Phase 10 — Production Readiness, SEO & Deployment Hardening

**Date:** Wednesday 23 → Thursday 24 September 2026 · **Timezone:** NPT (UTC+05:45) · **Work window:** 23:55 → ~00:10
**Result:** Commit `chore: harden production readiness` (not pushed). **Nothing was deployed.**

### Git state before starting (brief step 1)

The brief assumed Phase 9 was uncommitted (the Phase 9 entry above says "Not committed yet" because it was written just before committing). Checked: `git status` was clean, `git diff` was empty, `git diff --check` was clean. The Phase 9 work is already in **`a9489db feat: add admin enquiries portal`** (23 files, including the admin migration), with its follow-up in **`b0f1a51 feat: use shadcn date picker and select`**. So **no "feat: build admin enquiries portal" commit was created**: there was nothing to commit, and renaming an existing commit would rewrite history.

### Metadata audit (before)

- The root layout held the public title and description, so **the admin area inherited the public marketing description**.
- There was no `metadataBase`, canonical, Open Graph, Twitter, robots, sitemap, manifest, JSON-LD, `not-found` or `error` file.
- `next.config.ts` was empty. Icons came from the Phase 1 files (`favicon.ico`, `icon.png`, `apple-icon.png`).

### Changes

| File | Change |
| --- | --- |
| `src/lib/site-url.ts` (new) | `getSiteUrl()` / `absoluteUrl()`: `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `http://localhost:3000`. No hard-coded domain; an invalid value fails the build. |
| `src/app/layout.tsx` | Now only route-neutral metadata: `metadataBase`, `applicationName`, a plain `title`. |
| `src/app/(site)/layout.tsx` | Public metadata: title and template, description, Open Graph (`website`, `en_AU`, siteName, url `/`, logo image 512×512 with alt), Twitter `summary`. |
| `src/app/(site)/page.tsx` | `alternates.canonical: "/"`; JSON-LD script. |
| `src/lib/structured-data.ts` (new) | `localBusinessJsonLd()` + `serializeJsonLd()` (escapes `<` as `<`, the Next.js-documented pattern). |
| `src/app/robots.ts` (new) | Allow `/`; disallow `/admin`, `/design-system`; sitemap URL. |
| `src/app/sitemap.ts` (new) | `/` only (monthly, priority 1). |
| `src/app/not-found.tsx` (new) | Branded site-wide 404 (logo, eyebrow, Cormorant heading, "Back to the homepage"). |
| `src/app/admin/(portal)/not-found.tsx` (new) | "Enquiry not found" inside the admin shell, with a link back. |
| `src/app/(site)/error.tsx` (new) | Minimal branded public error boundary: generic message, retry and phone number; no error details shown. |
| `next.config.ts` | Security headers, `poweredByHeader: false`, `X-Robots-Tag: noindex, nofollow` for `/admin` and `/admin/:path*`. |
| `.env.example`, `README.md` | `NEXT_PUBLIC_SITE_URL`; a new "Production & deployment (Vercel)" section. |

### Decisions

- **Open Graph image:** the real square logo (Twitter `summary` card, not `summary_large_image`). No fabricated promotional or social image. A proper landscape share image should come from real client photography later.
- **Structured data used:** `LocalBusiness` with `@id`, name, slogan, description, url, telephone (`+61426071109`), logo, image (logo), a `PostalAddress` (Duffield Avenue, Munno Para, SA, 5115, AU) and `sameAs` (Instagram, Facebook, TikTok).
  - **Not used:** openingHours, priceRange, aggregateRating/review, email, geo, foundingDate, numberOfEmployees, areaServed/radius, services.
  - It's static data only, never user input, and appears on the public homepage only.
- **Robots policy:** crawl everything public; disallow `/admin` and `/design-system`. Page-level `noindex` stays on both (robots.txt alone doesn't prevent indexing).
- **Sitemap policy:** only `/` (the only public page); there are no gallery or service routes to include.
- **Security headers:**

  | Header | Decision |
  | --- | --- |
  | `X-Content-Type-Options: nosniff` | ✅ added |
  | `Referrer-Policy: strict-origin-when-cross-origin` | ✅ added |
  | `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()` | ✅ added |
  | Clickjacking: `X-Frame-Options: DENY` + `Content-Security-Policy: frame-ancestors 'none'` | ✅ added (this CSP restricts framing only, so nothing else can break) |
  | `X-Powered-By` | ✅ removed |
  | Full script/style/connect CSP | ❌ deferred: Next.js inline scripts need per-request nonces, which would force dynamic rendering of the static pages. A fragile CSP isn't an improvement. |
  | HSTS | ❌ not added: Vercel sends HSTS on its domains; add it only once the custom domain is confirmed HTTPS-only, including subdomains. |

- **Images:** audited every `next/image` / `ImageFrame`. `alt=""` only on decorative images; eager only above the fold (header logo, hero LCP image, small logos on the login and 404 pages); footer and About images lazy; `sizes` on all; no remote image config. **No changes needed.**
- **Vercel:** no `vercel.json` and no extra packages. Bun is detected from `bun.lock`, build command `bun run build`. `NEXT_PUBLIC_*` variables must be set before the build (static homepage). Admin routes are dynamic, and the proxy covers `/admin` only.

### Verification (production build with `NEXT_PUBLIC_SITE_URL=https://www.example.com`, a reserved test domain, against the local Supabase stack with a temporary local admin)

| Check | Result |
| --- | --- |
| Status codes | `/` 200 · `/robots.txt` 200 · `/sitemap.xml` 200 · `/admin` 307 → login · `/admin/login` 200 · `/design-system` **404** · `/no-such-page` **404** · `/admin/no-such-page` 404 · `/admin/enquiries/not-a-uuid` and a real id while logged out → 307 → login |
| robots.txt | `Allow: /` · `Disallow: /admin` · `Disallow: /design-system` · `Sitemap: https://www.example.com/sitemap.xml` |
| sitemap.xml | exactly one `<loc>https://www.example.com/</loc>` |
| Headers on `/` | all five security headers present; no `X-Powered-By` |
| Headers on `/admin/login` | also `X-Robots-Tag: noindex, nofollow` |
| 404 bodies | no stack traces, `node_modules`, Supabase or Postgres mentions; `noindex` |
| Homepage (browser) | `lang=en-AU`, 1 h1, title, description, **no robots noindex**, canonical `https://www.example.com/`, full og:* and twitter:* tags, **JSON-LD parses** with exactly the properties above |
| Admin login, list, detail (browser) | `noindex, nofollow`; **no** description, canonical, OG, Twitter, JSON-LD or public nav. Detail page: the enquiry's name, email and message **absent from `<head>`**; a `<script>` in the name renders as text |
| Admin unknown id (logged in) | "Enquiry not found" inside the admin shell, noindex |
| Public 404 (browser) | branded page, home link, noindex, no OG |
| 7 widths | no overflow, all 6 anchors, 1 h1, no console errors, **no failed requests** (lazy-image counts at 375/768 are the known cold-load effect) |
| Date picker + admin Select | same results as the Phase 9 follow-up (keyboard, past days disabled, 40px cells, stored date correct; Select → `booked`) |
| Phase 3 suite (dev) | skip link first; dialog focus trap (16 Tabs); Escape returns focus; Tab order; 2px focus ring; reduced motion |
| Phase 6 suite (dev → hosted) | CTAs and anchors, FAQ keyboard, first-error focus, alerts, success focus, mobile bar and menu, reduced motion. Its hosted row was deleted |
| Header scroll state (isolated, dev and prod, 390 and 1440) | top: not scrolled · 600px: scrolled · back to top: not scrolled |
| Final gate | `bun install --frozen-lockfile` · typecheck · lint · build · `git diff --check` (see commit) |

### Issues found / fixed

1. **Admin inherited the public description** (it lived in the root layout) → public metadata moved to the `(site)` layout; verified that admin pages have none.
2. **Unbranded default 404** → site and admin not-found pages.
3. **My mistake:** I ran `rm -rf .next` while your dev server was running. It deleted part of `.next/dev`, and the dev server started returning **500** (`TurbopackInternalError: Failed to restore meta`). A file-watcher nudge didn't help; you restarted the dev server (PID 35852) and it has served 200 since. Afterwards I built without deleting anything. Lesson: never remove `.next` while a dev server uses it.
4. **The Phase 3 suite reported "header scrolled at top: true"** → an isolated re-test showed the correct behaviour on dev and prod; it was a timing overlap with the menu's smooth scroll in that script. No code change.

### Remaining / deferred

- **Set `NEXT_PUBLIC_SITE_URL`** to the real domain in Vercel once it's known (until then the Vercel production domain is used).
- **Deploy to Vercel** (not done). Set all variables before the first build.
- **Resend:** verify the sending domain and set credentials; real delivery is still unverified.
- **Full CSP with nonces** (would make pages dynamic) and **HSTS on the custom domain**: later.
- **A proper Open Graph image** from real photography; a web app manifest if wanted.
- **Hosted:** keep public sign-up off; one real enquiry ("Fly Man") is in the database.
