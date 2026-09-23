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
