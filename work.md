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
