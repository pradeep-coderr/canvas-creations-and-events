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

---

## Phase 11 — Progressive Web App

**Date:** Thursday 24 September 2026 · **Timezone:** NPT (UTC+05:45) · **Work window:** ~00:10 → ~00:35
**Result:** Commit `feat: make the public site installable` (not pushed). **Nothing was deployed.**

### What was built

| File | Purpose |
| --- | --- |
| `src/app/manifest.ts` (new) | Native Next.js manifest → `/manifest.webmanifest` (static). `id`/`start_url`/`scope` `/`, `standalone` (+ `display_override` standalone → minimal-ui), `en-AU`, theme + background `#ffffff` (the header colour, so the standalone title bar blends in) |
| `public/icons/icon-192.png` (new) | Real CC monogram, transparent, `any` |
| `public/icons/maskable-192.png`, `maskable-512.png` (new) | Monogram at 77% on white. Furthest artwork pixel at 76.3% of the radius, inside the 80% safe zone. Checked visually under circle, 80%-circle and rounded-square masks |
| `src/app/icon.png` (existing) | Reused as the 512 `any` icon. **Not** declared maskable: its artwork reaches 99% of the edge |
| `public/sw.js` (new) | A small hand-written worker; no Workbox or next-pwa. Strategies are in the README |
| `src/components/pwa/service-worker-registration.tsx` (new) | Production-only registration (`scope: "/"`, `updateViaCache: "none"`), rendered from the public `(site)` layout only |
| `next.config.ts` | Headers for `/sw.js`: JS content type, `no-cache, no-store, must-revalidate`, `default-src 'self'` CSP |
| `src/app/layout.tsx` | `viewport.themeColor: #ffffff` |
| `src/components/sections/enquiry-form.tsx` | New `offline` status: checked before submitting (`navigator.onLine`) and when a submit throws while offline. Values are kept; nothing is queued or stored |

### Decisions

- **No install button.** The browser's own install UI is used. A custom `beforeinstallprompt` button would be Chromium-only and easy to get wrong.
- **No `skipWaiting`.** A new worker waits until tabs close, so a visitor filling in the form is never switched mid-session. `clients.claim()` runs on activation so the first install controls the page straight away.
- **No background sync or offline queue** for enquiries, which would mean storing personal data on the device. The form is online-only with a clear message.
- **Admin boundary:** the worker returns early for `/admin` and `/admin/*` (the browser handles them normally, with nothing cached), and it isn't registered from admin pages. Once registered it controls the whole origin, so the early return is the real guarantee.
- **Standalone CSS:** none needed. There's no browser chrome to replace, the sticky header works unchanged, and the mobile quick-contact bar already pads with `env(safe-area-inset-bottom)`; `viewport-fit=cover` isn't set, so content is never under notches.

### Verification (production build, `NEXT_PUBLIC_SITE_URL=https://www.example.com`, local Supabase, headless Chrome 153 over CDP)

| Check | Result |
| --- | --- |
| Manifest | 200 `application/manifest+json`; Chrome `Page.getAppManifest`: **no errors**; the 4 icon URLs return 200 `image/png` |
| Installability | `Page.getInstallabilityErrors` → **`[]` (installable)**; `Page.getAppId` → `http://localhost:3057/` (recommended id `/`) |
| Service worker | scope `/`, script `/sw.js`, **activated**, page **controlled** on the first visit |
| Caches after the first visit | `cc-pages-v1` (1: `/`), `cc-static-v1` (19) |
| Repeat visit | 23/27 responses served by the worker; DOMContentLoaded 136 ms → **36 ms** (localhost) |
| Admin (logged in as a temp local admin, detail page of a seeded "Private Person" enquiry) | **0 of 3** admin responses from the worker; caches contain **0** `/admin`, **0** Supabase and **0** `_rsc` entries; **0** cached bodies contain the enquiry's name/email/message or an auth token |
| Offline `/` | loads from cache: h1, fonts, all 6 section anchors, 0 broken visible images (2 failed requests are non-cached lazy images) |
| Offline enquiry | offline message shown, **no POST sent**, values kept, no localStorage or IndexedDB used |
| Offline `/admin/login` | browser's own offline error (**not** served by the worker, nothing cached) |
| Offline unknown public page | the worker's "You're offline" page (noindex, 503) |
| Back online | homepage from network, still controlled; a valid enquiry → "Thank you." and stored |
| Storage used | ~4.4 MB (mostly the static JS/CSS and a few images) |
| Real install via CDP `PWA.install` | **Not possible here:** Chrome 153 headless doesn't expose the `PWA` domain (`'PWA.install' wasn't found`, on both page and browser targets). **I didn't do a headful install**, as it would add an app to this machine's Start menu |
| `display-mode: standalone` emulation | CDP media emulation doesn't support `display-mode` (it didn't match). The layout was checked at 390px mobile instead (no overflow, menu focus trap, bar at the bottom edge) |
| iOS / Safari | **Not tested** (no device). iOS uses `apple-icon.png` and the manifest name; offline behaviour depends on Safari's service worker support |
| Regression | robots/sitemap/headers unchanged (no `X-Powered-By`; admin `X-Robots-Tag`; `/design-system` 404); metadata suite (canonical, OG, JSON-LD, admin noindex, no private data in `<head>`); header scroll state at 390 and 1440; 7 widths with no overflow or console errors; date picker + admin Select; Phase 3 (a11y/keyboard/reduced motion) and Phase 6 (CTAs, FAQ, form validation, mobile bar) suites. **All pass** (the Phase 6 preview checks need `/design-system`, which is dev-only by design) |

The Phase 3/6 suites ran against the local production server (local Supabase), **not** your dev server with the hosted project, so no hosted row or real notification email was created. All local test data (enquiries and the temp admin) and temp files were deleted; the prod server on 3057 was stopped; your dev server was not touched.

### Remaining / deferred

- **Install it for real once deployed:** Chrome/Edge desktop (address-bar install icon), Android Chrome (Add to Home screen), iOS Safari (Share → Add to Home Screen). Check the icon shape and the standalone launch.
- Real client photography will make the offline homepage cache larger; the media cap (60) keeps it bounded.
- If the enquiry form is ever needed offline, that's a deliberate product decision (on-device storage of personal data).

---

## Phase 12 — Admin PWA Experience

**Date:** Thursday 24 September 2026 · **Timezone:** NPT (UTC+05:45)
**Result:** Commit `feat: make the admin installable` (the brief was cut off partway through section 11, so you confirmed the commit separately). Not pushed; nothing deployed.

### Why

Phase 11 made the **public site** the install target (`start_url`/`scope` `/`). The real requirement is an installable **admin** app that opens straight into `/admin`.

### Architecture decision: Option A (keep the public app, add a separate admin app)

- **Separate identities:** the two manifests have different `id`s (`/` and `/admin`). Chrome treats them as two apps, and the narrower `/admin` scope wins for admin URLs.
- **One manifest per page:** Next.js's `app/manifest.ts` only works at the app root. The admin manifest is therefore a static route handler, linked via `metadata.manifest` in `src/app/admin/layout.tsx`, which **replaces** the root link. Verified: every admin page has exactly one `<link rel="manifest">`, the admin one, and public pages have only the public one.
- **Nothing removed:** the public offline homepage (Phase 11) is unaffected. The owner installs from the admin, so there's no confusion about which app opens.
- **Option B not chosen:** removing public installability would have given up working functionality without solving anything.

### Changes

| File | Change |
| --- | --- |
| `src/app/admin/manifest.webmanifest/route.ts` (new) | Static admin manifest. Name "Canvas Creations Admin" (built from `site.shortName`), short "Canvas Admin"; `id`/`start_url`/`scope` `/admin`; standalone; white theme/background; the same four monogram icons; shortcuts "New enquiries" (`/admin?status=new`) and "All enquiries" (`/admin`) with the 192 icon. No private data |
| `src/app/admin/layout.tsx` | `manifest: "/admin/manifest.webmanifest"`; `appleWebApp.title` "Canvas Admin" (the iOS home-screen name). Applies to login, list and detail |
| `src/app/admin/(portal)/enquiries/[id]/page.tsx` | The "All enquiries" back link was 20px tall; it's now a 44px tap target via `py-3 -my-3`, with no visual or layout change. It's the only way back in an installed iOS app (no browser back button) |
| `public/sw.js` | Comment only: the admin manifest is also under the `/admin` early return. **No logic change**, and the admin stays uncached |
| `README.md` | PWA section rewritten for the two apps |

- **`/admin` vs `/admin/`:** the brief suggested `/admin/`. Next.js 308-redirects `/admin/` to `/admin` (no `trailingSlash`), and a `/admin/` scope would put the dashboard itself **out of scope** (a browser bar would appear on the main screen). So `start_url` and `scope` are `/admin`, which prefix-matches `/admin`, `/admin/login` and `/admin/enquiries/*`.
- **No service worker for the admin:** it isn't needed for installability (Chrome reports no errors with no worker registered), and offline admin data is deliberately not supported.
- **No standalone-specific CSS:** there's no `viewport-fit=cover`, the header is white like `theme_color`, and nothing is fixed to the bottom in the admin.

### Verification (local production build, local Supabase, temporary local admin, 2 seed enquiries; headless Chrome 153 over CDP)

| Check | Result |
| --- | --- |
| `/admin/login`, logged out, fresh profile (public site never visited, **no service worker**) | manifest `/admin/manifest.webmanifest`, **0 manifest errors, 0 installability errors**, app id `/admin`, start `/admin`, scope `/admin`, shortcuts parsed, 1 manifest link |
| `/` for comparison | public manifest, app id `/`, installable, 1 manifest link |
| After sign-in (`/admin`) | still the admin manifest, installable |
| Launch via start_url, signed in | `/admin` → "All enquiries", newest first |
| Shortcut `/admin?status=new` | "New enquiries", only the new row, the "New" filter marked current |
| Mobile 375/390/430 list | no horizontal overflow, 0 clipped elements; Sign out visible (36px); filter chips wrap (3/3/2 rows, 36px); rows 108px tall; newest enquiry at y≈318/275 |
| Mobile detail | no overflow; back link **44px** (was 20); status Select 44px tall, full width |
| Status change at 390 (tap Select → Contacted → Save) | "Status updated to Contacted.", database `contacted`; back link → `/admin`; history back → detail |
| Worker boundary (worker installed via the public site, page controlled) | 4 admin responses, **0 from the worker**; admin HTML `Cache-Control: private, no-cache, no-store…`; manifest fetch not from the worker (only `/favicon.ico` was); caches: 30 entries, **0 `/admin`**, **0** bodies containing enquiry data or auth tokens |
| Offline `/admin` | browser offline error, not served from any cache |
| Sign out | → `/admin/login`, still the admin manifest (in scope) |
| start_url signed out / cookies cleared (expired session) | → `/admin/login`; a deep link to an enquiry → login, private name not shown |
| All admin navigations | inside scope `/admin` |
| Regressions | metadata suite (admin noindex, no public metadata, no private data in `<head>`); date picker + admin Select; headers (`X-Robots-Tag` also on the admin manifest). All pass, no console errors |
| typecheck · lint · build | pass |

**Not tested:**
- **A real install:** the CDP `PWA.install` isn't available in headless Chrome, and I didn't install headfully on this machine.
- **`display-mode: standalone` rendering:** CDP can't emulate it.
- **iOS and Android devices.**

All local test data and the temp admin were deleted; the test server was stopped; your dev server on 3000 was not touched.

### Remaining

- After deploying: install on the owner's phone from `/admin/login`, then check the icon, launch into `/admin`, the shortcuts (Android) and sign-out/sign-in inside the app.
- An admin offline page ("You're offline, Canvas Admin needs a connection") would be possible without caching private data, but it means the worker handling `/admin` navigations. It's deferred to keep the "never touches /admin" rule simple.
- The brief was cut off in section 11; any later sections (for example, further verification or the commit message) weren't received.

---

## Phase 13 — CMS Architecture & Content Model

**Date:** Thursday 24 September 2026 · **Timezone:** NPT (UTC+05:45) · **Work window:** ~00:40 → ~01:25
**Result:** Commit `feat: establish CMS content model` (the hash is in the final report; a commit can't contain its own hash). Not pushed. **Both migrations were applied locally and to the hosted project (you approved the push).**

### What I inspected first

- `src/data/*` already mirrored the future tables:
  - Every file had a `Maps onto a future … table` note.
  - `Services`, `GalleryPreview`, `Testimonials` and `CategoryStrip` already took optional props with local defaults.
  - Relationships were by string (`GalleryItem.categoryId → Category.id`).
- Hard-coded content:
  - `site.ts` (identity/contact/socials/nav).
  - `home.ts` (all section copy, including 4 process steps and 3 principles).
  - `services.ts` (1 service), `faq.ts` (3 FAQs, one built from phone/address and switching on whether online enquiries are live).
  - `categories`, `gallery` and `testimonials` are empty on purpose.
- Security pattern to follow: explicit grants and RLS, with admin checked via `admin_users` (own-row RLS). Enquiries: public insert-only, admin select + status update, no deletes.
- The homepage is statically rendered, and the server Supabase client reads cookies, which would make it dynamic. So public content needs a cookie-less client.
- Cache Components are **not** enabled, so the "previous" caching model applies (`revalidate`, data cache, `revalidateTag`); checked in `node_modules/next/dist/docs`.

### Architecture decisions

| Decision | Choice and why |
| --- | --- |
| CMS platform | None added. Supabase tables + RLS + the existing `/admin` auth (`requireAdmin`, `admin_users`) |
| Singletons vs generic blocks | Three typed singleton tables (`home_content`, `about_content`, `video_story`), not a generic key/value or JSON page builder. The single row is enforced by `id boolean primary key default true check (id)` |
| Collections | `services`, `categories`, `gallery_items`, `testimonials`, `faqs`, `process_steps`, `principles` (the "Why Canvas" items, a real collection on the page). UUID keys; `slug` only where it'll be a URL/stable key (services, categories); `sort_order`; `is_published` (default **false**, so new rows are drafts); `is_featured` where the homepage selects a subset |
| `site_settings` table | **Not created.** Business identity (name, phone, address, socials, email once supplied) is used by JSON-LD, metadata, both manifests and email templates, and rarely changes. It stays in `src/data/site.ts`, as does the navigation. Content settings are the homepage singletons |
| Relationships | Real foreign keys: `gallery_items.category_id → categories` (on delete set null); content → `media_assets` |
| Media | Small `media_assets` table (kind image/video, storage path in a future `cms-media` bucket, alt required for images, optional dimensions). Content uses **composite FKs (media id, kind)**, so a gallery item or poster can only point at an image and a video file only at a video. Gallery media and video/poster are `on delete restrict`; optional images are `set null (image_id)`. No uploads/Storage bucket yet |
| Video | `video_story.provider` = none / `upload` (media file + poster required) / `youtube` / `vimeo` (embed URL checked against the provider's hosts). The public component still supports only local files, so embeds are modelled but not rendered yet |
| Text rules | Domains `cms_line` (1–200 chars trimmed, single line), `cms_text` (1–2000), `cms_slug`, `cms_href` (site-relative `/…` but not `//host`, `tel:`, `mailto:`, `https:` only, so no `javascript:`). Arrays of domains for paragraphs and title lines, with count and no-null checks |
| Roles | Single admin role (existing). Editor/author roles, approvals, drafts-with-revisions: not added; they can be layered on `private.is_admin()` later |
| Initial content | A second migration copies the **existing** site copy verbatim (1 service, 3 FAQs, 4 steps, 3 principles, all section copy, About paragraphs). Empty collections stay empty. Founder name/role/image, hero image and video stay NULL. The "how to enquire" FAQ uses its online wording (a database implies online enquiries) |

### Content ownership: CMS vs code

| Content | Where it lives now | Why |
| --- | --- | --- |
| Services, categories, gallery, testimonials, FAQs, process steps, principles | **CMS**, and read from it | Client-editable collections |
| Hero, intro, section headings/descriptions, gallery empty state, enquiry/contact copy | **CMS** (`home_content`) but still read from `home.ts` | Editable once the admin screens exist |
| About/founder copy, founder name/role/portrait | **CMS** (`about_content`), still read from `home.ts` | As above; founder fields empty until real |
| Video/story copy + video | **CMS** (`video_story`), still read from `home.ts` | As above |
| Name, slogan, description, phone, address, socials, email | **Code** (`site.ts`) | Identity used by SEO/JSON-LD, manifests, emails; rarely changes |
| Navigation, anchors, CTA targets (e.g. hero CTA `href`), routes | **Code** | Structure, not copy (labels are CMS) |
| Enquiry "offline" notice, form labels/validation messages | **Code** | System/accessibility copy tied to behaviour |
| Design tokens, typography, layout, breakpoints, image cropping classes | **Code** | Not exposed to the CMS |
| Security headers, CSP, auth, PWA manifests, service worker | **Code** | Security/platform configuration |

### RLS / security

- Every CMS table: `revoke all` from anon/authenticated, then explicit grants.
- **Collections:**
  - anon + authenticated `SELECT` where `is_published`.
  - Admins: `SELECT` all, plus `INSERT`/`UPDATE`/`DELETE`.
- **Singletons:**
  - Public `SELECT`.
  - Admin `UPDATE` only; no insert or delete grants, so the row can't be removed or duplicated.
- **Media:**
  - Public `SELECT` only for media referenced by content the reader can see. The policy's subqueries run under each content table's RLS, so draft-only media stays hidden.
  - Admins have full access.
- **`private.is_admin()`:** `SECURITY INVOKER`, `search_path = ''`, in a non-API schema; execute is granted to `authenticated` only (anon policies never call it). Policies wrap it as `(select private.is_admin())` so it runs once per query.
- **Enquiries and `admin_users`:** not touched.

### Application data layer

| File | Role |
| --- | --- |
| `src/lib/supabase/public.ts` (new) | `createPublicClient()`: anon key, no session or cookies (keeps pages static). Server-only. Every request is tagged `cms-content` (`CMS_CONTENT_TAG`) |
| `src/lib/content/public.ts` (new) | Server-only queries for services, categories, gallery preview (with media + category), testimonials, FAQs, process steps and principles. Explicit `is_published` filter on top of RLS; order by `sort_order`, then `created_at`. Maps rows to the **existing** types (`sort_order → order`, `slug → id` for services/categories, `author_name → name`, FAQ action columns → `action`, media → `{ src, alt }`). `getHomepageCollections()` fetches all seven in parallel |
| `src/lib/content/media.ts` (new) | `cmsMediaUrl(path)` → public Storage URL for the `cms-media` bucket |
| `src/app/(site)/page.tsx` | Async; passes the collections to sections; `revalidate = 3600`. The route stays **static** (`○ /  1h`) |
| Sections | `Faq`, `Process`, `WhyCanvas` got optional props with the local defaults (same pattern as the existing ones) and render nothing when empty. `Services` keeps its enquiry prompt when there are no services (the top rule moved from the list to the column, so the look is unchanged) |
| `next.config.ts` | `images.remotePatterns`: only `<NEXT_PUBLIC_SUPABASE_URL>/storage/v1/object/public/cms-media/**` |
| `src/data/*` | Types and built-in copy kept, not deleted. Comments now say the database is the source of truth |
| `supabase/migrations/20260923185556_create_cms_content.sql` (new) | Schema, domains, constraints, indexes, triggers, grants, RLS |
| `supabase/migrations/20260923185558_seed_cms_content.sql` (new) | Verbatim copy of the existing site copy |
| `README.md` | New "CMS content model (Supabase)" section |

- **Fallback rule:** use `src/data` only when no database is configured or a query throws (logged server-side with code/message). An empty result is shown as empty, never replaced.
- **Section copy** (`home_content` / `about_content` / `video_story`) is in the database but still **read from `home.ts`** until the admin screens exist. Wiring it before it can be edited adds risk without benefit.
- **Admin structure for next phase (routes not created yet):**
  - `/admin` stays the enquiries list (the PWA `start_url` and shortcuts point there).
  - Planned: `/admin/content` (overview) → `/admin/content/home`, `/services`, `/gallery`, `/faqs`, `/testimonials`, `/process`, … behind the same `requireAdmin()` layout, plus a header nav.
  - Writes should use the cookie session client (`src/lib/supabase/server.ts`) so RLS sees the admin, then `revalidateTag(CMS_CONTENT_TAG)`.

### Tests actually run

**Local Supabase (Docker), `rls13.mjs`: 141 checks, 141 pass.** Real sessions for a local admin and a local signed-in non-admin, plus anon, over the Data API:

| Area | Checks |
| --- | --- |
| Public reads | anon and non-admin get only published rows in all 7 collections; the draft category and draft FAQ are hidden; only media used by published content is visible (draft-gallery and unused media hidden); singletons readable; `admin_users`/`enquiries` still denied; `is_admin` not callable via RPC (PGRST202) |
| Public writes | anon: every insert/update/publish/reorder/delete on all collections, singletons and media → **42501**. Non-admin: inserts → 42501; updates/deletes → 0 rows (RLS). A direct DB check confirmed nothing changed (no `sort_order = 99`, singleton text unchanged, no `hack-*` rows) |
| Admin | reads drafts; inserts media/categories/gallery/FAQ (drafts by default); publishes and reorders; `updated_at` trigger advances; the change is visible publicly; deletes; updates a singleton; **cannot** create a second singleton row or delete one; still cannot delete enquiries |
| Constraints | bad slug, duplicate slug, blank label, negative order, `javascript:` and `//host` hrefs, label without href, gallery → video asset (FK), gallery without media, image without alt, `..` in path, a YouTube provider with a non-YouTube URL, upload without poster, video slot → image asset, empty title lines: **all rejected**. A valid YouTube embed is accepted |
| Relationships | public gallery embeds media + category; an unpublished category embeds as `null`; ordering follows `sort_order`; media used by the gallery can't be deleted; deleting a service image nulls `image_id` only; deleting a category keeps the gallery item with `category_id` null |

**`supabase db lint`:** no issues.

**Local production builds** (local Supabase, `NEXT_PUBLIC_SITE_URL=https://www.example.com`):

| Build | Result |
| --- | --- |
| A: temporary published testimonial + categories, draft category/FAQ, extra first process step, "Elegant" unpublished | testimonial rendered; categories in `sort_order` (A before B); drafts absent; extra step first; "Elegant" gone; `/` still static (1h) |
| B: every collection unpublished (empty DB) | FAQ, Process, Why Canvas, Categories, Testimonials absent; Services shows heading + enquiry prompt (screenshots at 390/1440 look intentional); 7 widths: no overflow, 1 h1, footer, no console errors |
| D: unreachable database (`http://127.0.0.1:1`) | build succeeds; one `[content] … could not be loaded` log per collection; page shows the built-in copy |
| C: seed state | the DB-rendered page text is **identical** to the built-in-copy render (144/144 text nodes); the outline and page heights match Phase 11 at all 7 widths |

**Regression on build C:** all pass, no console errors.
- Phase 3 suite (focus trap, Escape, reduced motion) and Phase 6 suite (CTAs, anchors, FAQ keyboard, form validation, live submit, mobile bar/menu).
- Header scroll state at 390/1440.
- Metadata suite (canonical, JSON-LD, admin noindex, no private data in the head, 404s).
- Date picker + admin Select.
- Admin PWA suite (manifest/installability, shortcuts, mobile admin 375–430, status change, worker boundary, offline, sign-out/expired session).
- Public PWA suite (worker, caches with no admin/private data, offline homepage, offline form).

**Leak check:** no table or column names, Supabase URL or cache tag in the HTML or client JS; the content modules aren't in any client chunk.

**Hosted project (after `db push`, dry run first): anonymous checks only, `hosted13.mjs`: 19 checks, 19 pass.**
- Published-only reads.
- Seed counts match the site (1/3/4/3, empty collections, no media).
- The three singletons are readable.
- anon insert/update/delete/singleton update → 42501; `enquiries` and `admin_users` still denied; `is_admin` not exposed.
- Hosted admin and non-admin sessions were **not** tested: no hosted test users were created and I don't have the admin password. The same SQL was verified locally.
- The final `bun run build` with the hosted env loaded all seven collections from the hosted tables (**0** fallback logs). Your dev server (hosted) renders the same homepage.

**Final gate:** `bun install --frozen-lockfile`, typecheck, lint, build and `git diff --check` all pass.

All local test rows, the three local test users and the temp files were deleted; the local database is back to the seed state. My test server (3059) was stopped; your dev server (3000) was untouched. On hosted, only the migrations were applied: no test rows, and the existing enquiry ("Fly Man") wasn't touched.

### Problems found and fixed

1. **The data cache outlived builds.**
   - Build B still showed build A's test rows: with `revalidate = 3600`, the Supabase responses went into `.next/cache/fetch-cache` and the next build reused them (`x-nextjs-cache: HIT`). Production behaves the same way: the data cache survives deploys.
   - Fix: every public content request is now tagged `cms-content`, so content changes can invalidate it precisely (next phase: `revalidateTag(CMS_CONTENT_TAG)` on save).
   - For my test builds I cleared only `.next/cache/fetch-cache`, never `.next`, and your dev server (`.next/dev`) was untouched.
2. **Fallback log was uninformative** for network failures (empty code) → it now logs the message too.
3. **Services with zero items** would have left an empty `<ol>` → the list is omitted and the top rule moved to the column.
4. My first check reported the service "missing" because `&` is `&amp;` in HTML; it wasn't a bug.

### Remaining / deferred

- **Admin CMS screens** (next phase): the routes above; forms with Zod mirroring the DB domains; reordering; publish toggles; `revalidateTag` on save; warn before unpublishing the last FAQ (the nav's "FAQ" link would then point at a missing section).
- **Wire the section copy** (`home_content`, `about_content`, `video_story`) into the public sections once it's editable.
- **Media:** create the `cms-media` bucket with Storage policies (public read, admin write), an upload flow writing `media_assets`, and dimensions. Local `next/image` from `127.0.0.1` is blocked by Next's local-IP guard, so test media against hosted or configure it deliberately.
- **Video embeds:** extend `VideoStory` to render YouTube/Vimeo (privacy-enhanced) when chosen.
- **Hosted admin-session RLS check** after the admin screens exist (as the real admin).

---

## Phase 14 — Admin CMS UI & Content Management

**Date:** Thursday 24 September 2026 · **Timezone:** NPT (UTC+05:45) · **Finished:** ~18:45
**Result:** Commit `feat: build admin cms` (the hash is in the final report; a commit can't contain its own hash). Not pushed. **No database changes this phase:** the Phase 13 schema and RLS were used as-is, so nothing was pushed to hosted.

### Routes created (all under the existing `requireAdmin()` portal layout)

| Route | What it does |
| --- | --- |
| `/admin/content` | Overview: published/draft/total per list, and the state of the homepage, About (founder added or not) and video (none / uploaded / YouTube or Vimeo saved but not shown) |
| `/admin/content/[collection]` | List for `services`, `categories`, `gallery`, `testimonials`, `faqs`, `process`, `principles`: order, Published/Draft and Featured badges, move up/down, Publish/Unpublish, Edit, Delete (dialog). Unknown keys → 404 |
| `/admin/content/[collection]/new` | Create form (starts as a draft, at the end of the list) |
| `/admin/content/[collection]/[id]` | Edit form (non-UUID or missing id → 404) |
| `/admin/content/home`, `/about`, `/video` | Editors for the one-row tables (static segments win over `[collection]`) |

`/admin` is still the enquiries dashboard, so the PWA `start_url` and shortcuts are unchanged.

### Admin navigation

- The portal header now has a second row, "Enquiries | Content" (`src/components/admin/admin-nav.tsx`).
  - The current section is marked with `aria-current="page"`, an underline and bolder text, not colour alone.
  - Tabs are 44px.
- The wordmark reads "Admin" (was "Enquiries").
- Sign out is 44px (was 36) and still a form posting to the same `signOut` action.
- Pages have a 44px "← Content" / "← Services" back link (important in an installed iOS app).

### Architecture

| Part | Files |
| --- | --- |
| DB-mirroring validation | `src/lib/cms/fields.ts`: `line` (1–200, one line), `text` (1–2000), `slug`, `optionalHref` (same regex as `cms_href`), `sortOrder` (int ≥ 0), optional/required ids. Values are trimmed; optional "" → NULL |
| Collections | `src/lib/cms/collections.ts`: per collection its table, labels, Zod schema, `toRow`/`toValues`, list columns, human-readable label. The FAQ schema mirrors `faqs_action_check` |
| Singletons | `src/lib/cms/singletons.ts`: home (column map, 1–3 "Why Canvas" title lines), about (paragraphs separated by a blank line, 1–6, each ≤2000), video (none/upload/youtube/vimeo with the same host rules as `video_story_video_check`; fields that don't belong to the chosen type are saved as NULL) |
| DB error messages | `src/lib/cms/errors.ts`: duplicate slug, photo still used by the gallery, missing photo/category, check failures, permission, row gone. It names what the database rejected instead of a generic failure |
| Admin reads | `src/lib/admin/cms.ts` (server-only, session client so RLS applies) |
| Mutations | `src/app/admin/(portal)/content/actions.ts`: `saveCollectionItem`, `setItemPublished`, `moveItem`, `deleteItem`, `saveHomeContent`, `saveAboutContent`, `saveVideoStory` |
| UI | `src/components/admin/`: `cms-form.tsx` (shared form shell), `cms-fields.tsx`, `collection-forms.tsx` (one typed form per collection), `singleton-forms.tsx`, `collection-list.tsx`, `confirm-dialog.tsx`, badges, back link, nav |
| shadcn | Added `alert-dialog` and `checkbox` (CLI). Imports switched to `@/lib/utils`, animations gated with `motion-safe:`, dialog restyled to the site's tokens. `button.tsx` deliberately **not** overwritten |

- **Every action:**
  - Calls `requireAdmin()` first.
  - Validates the collection key against the registry (never a table name from the browser) and ids as UUIDs.
  - Re-parses values with the same Zod schema as the form.
  - Writes with the signed-in cookie client, so RLS enforces admin-only writes a second time.
  - No service-role key anywhere.
- **Results:** `{ ok, message, id? }` or `{ ok: false, error, fieldErrors?, needsConfirmation? }`.
- **Forms:** React Hook Form + zodResolver.
  - On a client or server error, the fields are highlighted, the first invalid field is focused, and an alert region shows the message.
  - Entered values are kept on failure.
  - On success the form stays populated with a polite status message.
  - Create → the new item's edit page with "Service created."
- **Ordering:** a numeric Order field, plus ↑/↓ in the list. A move swaps with the neighbour, then renumbers the list 1…n (only changed rows are written), so ties can't make the order ambiguous. Drag-and-drop wasn't added.
- **Published vs Featured:** separate, clearly labelled checkboxes ("Published on the website" / "Featured on the homepage — only appears if it's also published"). The list shows both as text badges.

### Public site: section copy is now read from the CMS

- Phase 13 left `home_content`, `about_content` and `video_story` unread, so their editors would have changed nothing. Every section now takes an optional `copy` prop, defaulting to the old local object.
- `src/lib/content/public.ts` adds `getHomeCopy`, `getAboutCopy` and `getVideoSection` (same `fromCms` fallback rules, same `cms-content` tag). `getHomepageContent()` fetches all ten sources in parallel.
- **Stays in code:** link targets (hero second button, About link), the slogan headline, and the enquiry "not set up" notice.
- **Video:** only an uploaded file with a poster is rendered. YouTube/Vimeo are stored and shown in the admin as "saved, not shown on the website yet".
- **Founder:** `AboutFounder` shows "Name, Role" under the text **only when a name has been entered** (currently NULL, so nothing is shown and nothing is invented).
- The rendered homepage is unchanged: the same text, and the same page heights at all 7 widths as Phase 11/13.

### Cache invalidation

- Actions call **`updateTag(CMS_CONTENT_TAG)`**, not `revalidateTag(tag, "max")`.
  - In Next 16, `revalidateTag` with the recommended profile serves **stale** content on the next request while regenerating.
  - `updateTag` (Server Actions only) expires immediately, so the next request renders fresh data.
- They also call `revalidatePath("/admin/content", "layout")` for the admin screens. No site-wide purge.
- **Verified with real requests:** after each save, a plain `fetch("/")` returned the new content (`x-nextjs-cache: MISS`), well inside the 1-hour window:
  - create
  - reorder (categories and process)
  - unpublish
  - delete
  - republish
  - homepage text
  - About founder
  - video

### FAQ safeguard

- When an admin unpublishes or deletes the **last published FAQ**, a dialog explains that the FAQ section will disappear and the menu's FAQ link will go nowhere. It requires "Unpublish and hide FAQ section" / "Delete and hide FAQ section". The same applies to saving the edit form with "Published" unticked.
- The **server** checks it too (`needsConfirmation: "last-faq"` unless confirmed), so it can't be bypassed by a stale page.
- If someone else unpublishes FAQs meanwhile, the dialog asks again explicitly.

### Media limitations (honest)

- There is no Storage bucket or upload flow yet (deferred in Phase 13), and `media_assets` is empty.
  - Photo pickers are disabled with "Photo uploads aren't set up yet…".
  - The Gallery "Add" button is disabled with that explanation; `/gallery/new` shows the explanation instead of a form.
  - "Uploaded video file" isn't offered until video and poster media exist.
- No fake picker, placeholder URLs or external image URLs.
- The pickers already list real `media_assets` rows (by alt text) when they exist, and a gallery item can only point at an image (composite FK).

### Issues found and fixed during testing

1. **Focus lost after moving an item to the top/bottom:** the arrow that was pressed becomes disabled. Focus now moves to the item's other arrow.
2. **Dialogs returned focus to `<body>`:** Radix returns focus to its `Trigger`, and these dialogs are opened from code. `ConfirmDialog` now takes `returnFocus`: the opening button, or the list heading after a delete.
3. **Disabled buttons dropped keyboard focus while saving:** list buttons and the form's Save now stay focusable (`aria-disabled`, with repeat presses ignored).
4. **The sticky Save bar hid focused fields near the bottom of the screen (WCAG 2.4.11):** `html:has([data-cms-form]) { scroll-padding-bottom: 9rem }`. Checked by tabbing through every field of the Home, About and FAQ editors at 375×667, 390×844 and 1280×800 (84/54/54 focus stops, none obscured). A negative control **without** the padding reported obscured fields, so the check is real.
5. **The shadcn CLI prompted to overwrite `button.tsx`:** declined. The generated files were aligned with the project conventions.
6. **Test-harness issues** (not app bugs): the CDP Enter key needed a proper `keyDown` with text; `querySelector("form")` matched the header's sign-out form; a smooth-scroll measurement was read mid-animation; duplicate "Picker Test" rows from an interrupted run broke one older suite's lookup (rows cleaned, suite re-run and passing).

### Tests actually run

**Local production build** (local Supabase, temporary local admin + non-admin, `NEXT_PUBLIC_SITE_URL=https://www.example.com`):

- **`cms14.mjs`, 78/78 pass**, real browser (headless Chrome over CDP):
  - **Navigation:** nav current state, 44px tabs, admin manifest on CMS pages, enquiries list intact.
  - **Overview:** the counts.
  - **Categories:** empty state; create ×2 with slug suggestion → edit page with "Category created."; public shows them in order; move up (keyboard Enter, focus kept, public order changed, DB renumbered); unpublish (Draft badge, gone publicly); delete dialog (opens with the item's name, focus inside, Tab trapped, Escape closes and returns focus, confirm deletes, focus to the heading); public strip absent when empty.
  - **Services validation:** empty submit → errors, focus on first field, `aria-invalid` + `aria-describedby`; bad slug caught in the browser; duplicate slug → the database's rejection explained, values kept, nothing inserted.
  - **FAQs:** unpublish two; the last one's delete dialog warns; unpublish asks; cancel keeps it; edit-form save asks (server-enforced); confirm → the FAQ section disappears publicly; republish all → back in the original order.
  - **Process:** reorder → public order changes → restored.
  - **Home:** loads existing values, no `id` field, required-field error + focus, edit → public changes → restored.
  - **About:** founder shown when added, gone (NULL) when cleared, paragraphs preserved.
  - **Video:** no provider fields for "No video"; upload not offered without media; YouTube URL/title fields; non-YouTube URL rejected; valid link saved; public keeps the empty state; back to none clears the fields.
  - **Gallery:** Add disabled with the explanation; no form on `/new`.
  - **Checkbox:** 16px box with a 40×32 hit area, and the label toggles it.
  - **Responsive:** 7 widths × 7 admin pages with no overflow, no clipped elements, no targets under 24px; the dialog fits at 375 and 1280.
  - **Sign out:** → login; the CMS then redirects to login.
  - **Console:** no errors or warnings.
- **`focus14.mjs`:** the focus-not-obscured check above (plus its negative control).
- **`action14.mjs`, 17/17 pass: server actions called directly over HTTP**, bypassing the UI:
  - With **no session** and with a **signed-in non-admin** (a real Supabase SSR session cookie), all five mutations were refused (redirect to `/admin/login`), and the database was unchanged.
  - Positive control: the same requests as an admin work.
  - An unknown collection key, and invalid values sent straight to the action, are rejected server-side.
- **`rls13.mjs` (database RLS, Phase 13 suite), 141/141 pass:** anon, non-admin and admin on every CMS table.
- **Regression**, all pass, no console errors:
  - Public: 7-width audit (identical page heights), keyboard/menu/reduced-motion suite, CTA/FAQ/form suite, header state.
  - Metadata: admin noindex, no private data in `<head>`, 404s.
  - Date picker + admin status Select.
  - Admin PWA: manifest/installable, shortcuts, mobile enquiries, no admin responses from the worker, no admin/private data in caches, offline, sign-out/expired session.
  - Public PWA: offline homepage, offline form.
- **Leak check:** the service-role/secret key and the string `service_role` are in no client chunk. The public HTML has no table/column names, cache tag, `/admin/content` or action ids. No CMS action code is in the public page's chunks.
- **Final gate:** `bun install --frozen-lockfile`, typecheck, lint, build and `git diff --check` all pass.

**Hosted:**
- `hosted13.mjs`, **19/19** anonymous checks (published-only reads, singletons readable, anon writes 42501, enquiries/admin_users closed).
- The production build with the **normal hosted env** loaded all ten content sources from hosted (**0** fallback logs). Served locally on a spare port, it rendered every section's copy from the hosted singletons, the empty sections stayed absent, and all `/admin/content*` routes redirected to login.
- **Not done on hosted:** admin-session CMS writes. I don't have the real admin's password and didn't create hosted users, so the admin/non-admin write paths were verified **locally only**.
- Your dev server (:3000) wasn't running at the end, so it wasn't used.

**Cleanup:** local test users, enquiries, and CMS test rows were deleted; the local database is back to the seed content. Test servers were stopped and temp files removed. **Hosted content was not modified.**

### Remaining / deferred

- **Media:** the `cms-media` Storage bucket with policies (public read, admin write), an upload flow creating `media_assets` (alt text required), editing alt text, deleting unused media. The pickers are ready for it.
- **Public YouTube/Vimeo rendering** (privacy-enhanced embed, click-to-load).
- **Hosted admin-session check** of the CMS by the real admin once deployed.
- **Enquiry status form (Phase 9):** its button is still `disabled` while saving, so keyboard focus drops to the page. It should get the same `aria-disabled` treatment; left unchanged to keep this phase's scope.
- Not built, as the brief asked: revision history, scheduling, roles, audit log, bulk actions, drag-and-drop.

---

## Phase 15 — Visual Website Editor / Inline CMS

**Date:** Thursday 24 September 2026 · **Timezone:** NPT (UTC+05:45) · **Finished:** ~20:25
**Result:** Commit `feat: add visual website editor` (the hash is in the final report; a commit can't contain its own hash). Not pushed. **No database changes.** The Phase 13 schema and Phase 14 server actions are used as-is (one added line: the actions also revalidate `/admin/editor`).

### What the client does now

```text
/admin → "Edit website" (header) → /admin/editor → the real homepage with editing controls
  hover/Tab to text → press → input in place → Save  → existing CMS action → Supabase → updateTag → public "/"
```

`/admin/content` (Phase 14) stays as the advanced/fallback interface; both edit the same rows through the same actions.

### Architecture: one page composition, two uses

- **`src/components/home/home-sections.tsx` (new):** `HomeSections` renders the 13 homepage sections in order.
  - The public page (`src/app/(site)/page.tsx`) and the editor both use it, so they can't drift apart.
  - `SiteFrame` (header + footer + mobile bar) is shared the same way; the public layout still adds the service-worker registration, and the editor doesn't.
- **Copy as nodes:**
  - The section copy types became `Renderable<…>`: text may be any React node, while `href`/`src`/`alt` stay strings.
  - The public page passes the CMS strings, exactly as before.
  - The editor passes `<EditableText>` client nodes. Section components needed **no editor logic** (only two string `key`s became index keys).
- **Collection slots:** the seven collection sections take one optional prop, `itemSlots` (`src/components/sections/item-slots.tsx`):
  - an `Item` wrapper per item (the editor's controls);
  - an `after` node (the editor's "Add …").
  - The public page never passes it. A section with no items still renders when `after` is given, so items can be added.
- **Why no `?edit=1`, contenteditable or overlays:**
  - The editor is a separate server-protected route.
  - Text is edited in controlled inputs.
  - Editor code lives only in that route's bundle.
  - **Verified:** the public `/` HTML and its 18 JS/CSS files contain no editor markup, code or styles; the editor's own assets do (positive control).

### Routes and entry point

- **`/admin/editor` (new):** `requireAdmin()` in the page, under the existing `/admin` layout, so it's noindex, uses the admin manifest, stays inside the admin PWA scope, and the service worker ignores it.
- **"Edit website":** a 44px primary button in the admin header row, next to the Enquiries | Content tabs, on every admin page including `/admin`.

### Editable fields: `src/lib/editor/fields.ts` (typed registry)

Every page spot maps to an existing CMS field (the form-value names from `src/lib/cms/singletons.ts`) with a friendly label. Field validation comes from the Phase 14 schemas' shapes, so the editor can't be looser than `/admin/content`.

| Section | Inline on the page | In "Edit section" only |
| --- | --- | --- |
| Hero | label, text | second-button text, photo |
| Introduction | label, heading, text | — |
| Services | label, heading, text | enquiry-prompt heading/text (the whole prompt is a link) |
| Categories / Process / FAQ | label, heading | — |
| Gallery | label, heading, empty-state heading/text | Instagram link text |
| Why Canvas | label, heading lines (1–3) | — |
| Testimonials | label | heading (visually hidden, screen-reader only) |
| About | label, heading, story (paragraphs), founder name/role (once saved) | link text, founder name/role, photo |
| Video | label, heading, empty-state text | TikTok link text, video type/URL/title/caption |
| Enquiry / Contact | label, heading, text | — |

**Not editable (code, per Phase 13), explained in the panels:** the hero headline (business slogan), navigation labels and targets, phone and social links, link destinations, the enquiry form's own labels. The brief's "navigation labels" test was done on the CMS-backed **link texts** (hero second button): the text changed and the destination `/#gallery` stayed the same.

**Collections in place:** services, categories, gallery, testimonials, FAQs, process, Why Canvas.
- Each item has **Edit** (the item's Phase 14 form, opened in place) and a **⋯** menu: move up/down, publish/unpublish, delete.
- **Add …** sits under each list.
- Drafts and items not on the homepage (not featured, or over the 3-testimonial/5-photo limits) are labelled and dimmed.

### Components (`src/components/editor/`)

| File | Role |
| --- | --- |
| `editor-context.tsx` | Drafts, saving, unsaved count, preview mode, status. Saves go **one call per record** (home/about/video) through `saveHomeContent`/`saveAboutContent`/`saveVideoStory`, merging all drafts of that record, so two open edits can't overwrite each other. Server field errors are shown on the right field |
| `editable-text.tsx` | `EditableText`: a real `<button>` showing the text. Hover/focus shows a champagne hairline and a pencil. Press → an input/textarea in the same place and typography, with Save/Cancel; Enter / Ctrl+Enter saves, Esc keeps an unsaved draft. `LiveText` shows text that sits inside links (edited in the panel) |
| `editor-section.tsx` | `EditorSection`: an "Edit section" button per section (icon-only with a spoken label on phones) opening a side panel with that section's fields, photo and video settings. Hides sections a visitor wouldn't see in preview |
| `editor-item.tsx` | `EditorItem`, `AddItem`: item controls; the Phase 14 forms shown inline |
| `editor-shell.tsx` | Toolbar ("Editing website", unsaved count or last result, Preview, Save, Exit), leave dialog, `beforeunload`, and the canvas where links scroll instead of navigating and the enquiry form doesn't send |
| `editor.css` | Editor styles from the site's tokens (adapts in dark sections), imported only by the editor |

**Phase 14 code reused, not duplicated:**
- `useItemActions` (new, `src/components/admin/use-item-actions.tsx`) now holds the publish/move/delete logic, the confirmation dialog and the last-FAQ safeguard for **both** `/admin/content` lists (refactored onto it, suite re-run: 78/78) and the editor.
- `CmsForm` gained optional inline options (`inline`, `onSaved`, `onCancel`, `onDirtyChange`), and the collection forms pass them through. Full-page behaviour is unchanged.
- shadcn `dropdown-menu` was added (CLI; `@/lib/utils` import, motion-safe animations, `button.tsx` not overwritten).

### Save model, unsaved changes, preview, cache

- **Nothing auto-saves.**
  - Inline and panel edits are drafts (shown live and marked) until Save: inline Save, "Save section", or the toolbar Save (everything, including open item forms).
  - Cancel discards explicitly; Esc/close keeps the draft.
  - Leaving via Exit with changes opens a dialog: Keep editing / Leave without saving / Save and leave. Reload or close triggers the browser's own warning. No `window.confirm`.
- **Preview:** all editor controls removed (0 `data-editor-control` elements), drafts and not-shown items hidden, sections a visitor wouldn't see hidden. The page text matches the public page. "Back to editing" restores everything.
- **Cache:** the existing actions call `updateTag(CMS_CONTENT_TAG)` (and now also `revalidatePath("/admin/editor")` so the editor refreshes). A plain request to `/` after each save returned the new content, well inside the 1-hour window: hero text, intro heading, link text, service title, FAQ order, draft FAQ not public.

### Issues found and fixed during testing

1. **Gallery empty state didn't show the editor's "Add" slot:** the honest "photo uploads aren't set up" message was missing there. It's now rendered in both gallery branches.
2. **Section panel returned focus to `<body>`:** it's opened from code with no Radix Trigger. It now returns focus to its "Edit section" button.
3. **At 375px the toolbar title was squeezed and "Edit section" covered the hero label:** Preview and Edit section become 44px icon buttons with spoken labels on phones, and the title truncates.
4. **Neighbouring items' dashed outlines overlapped:** the outline is now inside the item.
5. **Deprecated `React.FormEvent` type:** replaced with `SyntheticEvent`.

### Tests actually run

**Local production build** (local Supabase, temporary local admin + non-admin):

**`editor15.mjs`, 68/68 pass**, headless Chrome over CDP, no console errors:

| Area | What was checked |
| --- | --- |
| Auth | anonymous → login; admin lands on `/admin`; "Edit website" link (44px) opens `/admin/editor`; real header, footer and all sections present; noindex + admin manifest; no service worker registered from the editor |
| Hero text | hover shows pencil + outline; click opens a focused textarea in place; no contenteditable anywhere; Save → "Hero text saved.", focus back on the text; public `/` shows it; DB updated; Ctrl+Enter restores |
| Keyboard-only | Tab from the toolbar reaches the intro heading; Enter opens; Enter saves (focus returns); empty heading rejected in place with an alert, DB unchanged |
| Unsaved changes | Esc keeps a marked draft; toolbar "1 unsaved change"; Exit → dialog (focus inside); Keep editing keeps it (focus back on Exit); Leave without saving → `/admin`, DB unchanged; toolbar Save saves drafts |
| Section panel | opens; typing shows live on the page; Save section → public link text changed, `href="/#gallery"` unchanged; opens by keyboard, focus trapped (12 Tabs), Esc closes, focus back on its button |
| Services | Edit opens the Phase 14 form in place with current values; save → public updated; focus returns to Edit; Cancel closes, focus back |
| FAQs | ⋯ menu by keyboard; move down/up → public order changes/restores; unpublish two (Draft labels in place); the last one → safeguard dialog, Cancel keeps it; republish; Add FAQ creates a draft in place, not public; delete dialog names it, focus moves to "Add FAQ" |
| Preview | 0 editor controls, 0 editables, draft hidden, "Previewing website"; text matches the public page; back to editing restores |
| Inert | header link stays in the editor (scrolls); the enquiry form doesn't create an enquiry |
| Gallery | Add disabled with the honest explanation |
| Responsive | at 375/390/430/768/1024/1280/1440: no horizontal overflow, no clipped controls, all controls ≥44px, toolbar title visible, and an inline editor, the section panel and an item menu each fit the screen |

**Other suites:**
- **`iso15.mjs` (7/7):** anonymous and **signed-in non-admin** (a real Supabase session cookie) → `/admin/editor` redirects to login with no editor HTML; admin gets 200, noindex, `no-store`; public `/` has no editor markers, stays ISR (`s-maxage=3600`), and none of its 18 JS/CSS assets contain editor code or CSS.
- **`action14.mjs` (17/17):** every CMS mutation called directly as no-session / non-admin is refused, database unchanged; the admin control works.
- **`rls13.mjs` (141/141):** database RLS unchanged.
- **`cms14.mjs` (78/78):** the Phase 14 `/admin/content` UI on the refactored hook.
- **Regression**, all pass:
  - Public 7-width audit (page heights identical to before).
  - Keyboard/menu/reduced-motion suite; CTA/FAQ/form/mobile-bar suite; header state.
  - Metadata (admin noindex, no private data, 404s).
  - Date picker + admin status Select.
  - Admin PWA (installable, shortcuts, mobile admin, worker boundary, offline, sign-out).
  - Public PWA (offline homepage and form, caches free of admin/private data).
  - Headers, robots.txt and sitemap unchanged.
- **Final gate** with the normal hosted env: `bun install --frozen-lockfile`, typecheck, lint, build and `git diff --check` all pass.

**Hosted:**
- The build loaded every CMS source from hosted (0 fallback logs).
- Served locally on a spare port: `/` renders from hosted with no editor markers, and `/admin/editor` redirects to login.
- `hosted13.mjs`: 18/19. The one "failure" is its **seed-count assumption**: hosted now has **3 published services** (see below). All security checks passed.
- **Not done on hosted:** editor saves as the real admin (no password; no hosted test users created). The editor's write paths were verified **locally only**.

⚠️ **Hosted content changed outside this phase:** two extra published, featured services were created on hosted at ~14:35 UTC today: a second **"Event styling & decoration"** and **"Event styling & decoration456"**. They look like manual CMS testing. They're live on any build using the hosted database. **Not touched by me.** Delete or unpublish them in the editor (⋯ → Delete) or `/admin/content/services` if they were tests.

**Cleanup:** local test users, enquiries and all test edits removed or restored (the local DB equals the seed). Test servers stopped; temp files removed. Your dev server (:3000) wasn't used by my tests and wasn't touched.

### Remaining / deferred

- **Media:** uploads, a library and alt-text editing (the pickers and "Add photo" explain it isn't set up yet).
- **YouTube/Vimeo playback** on the public site (the editor saves the link and says it isn't shown yet).
- **Preview detail:** drafts are hidden in preview, but numbering and the testimonial lead slot are computed from the full editor list, so preview can differ from the public page if a draft sits between published items.
- **Leaving:** browser back to another admin page within the app isn't intercepted; Exit, reload and close are.
- **Enquiry status form (Phase 9):** still disables its button while saving (focus drops).
- **Hosted admin-session check** of the editor by the real admin once deployed.

## Phase 16 — Media Library, Image Uploads & Hybrid Video Architecture

**Date:** Friday 25 September 2026 · **Timezone:** NPT (UTC+05:45)
**Result:** Not committed (the brief names no commit; awaiting instruction). Not pushed. **Database:** one migration, `20260924151332_media_library.sql`, applied locally and, with the owner's approval, **pushed to the hosted project** (it was needed because the dev server on `.env.local` uses hosted and its admin pages failed without it).

### What the client can do now

```text
/admin/content/media  → upload photos (with a description), see where each is used, edit descriptions, delete unused ones
                      → add YouTube / Vimeo links
Any photo field (editor or /admin/content) → picker: choose from the library or upload → saved by id
Public "/"            → photos via next/image from signed URLs; gallery opens in a lightbox;
                        video shows a cover + "Play video" and loads the player only on click
```

### Database (`…_media_library.sql`)

- **`media_assets`** gained `provider` (`supabase` | `youtube` | `vimeo` | `stream`), `external_id`, `source_url`, `title`, `original_filename`, `mime_type` and `file_size`. `storage_path` is now nullable (videos have none).
- **Checks:**
  - An image is a `supabase` file at `images/<use>/<uuid>.(jpg|png|webp)` with alt text, width and height.
  - A video is a link with no file, a title, a valid provider ID (YouTube 11 characters; Vimeo digits with an optional private hash) and a source URL on that provider's host.
  - The same video can't be added twice.
- **Photo foreign keys:** service, hero and About photos went from `SET NULL` to **`RESTRICT`**, like the gallery. A photo in use can't disappear.
- **`video_story`:**
  - Links to a library video through a composite foreign key `(video_media_id, video_kind, provider)`, so the provider must match the video.
  - `embed_url` is retired and must be NULL.
  - An existing `embed_url` would have been carried over into the library; neither database had one.
- **Storage:**
  - Private bucket `cms-media` (10 MB, JPEG/PNG/WebP only).
  - Admins may insert only at `incoming/<uuid>` or `images/<use>/<uuid>.<ext>`, and may delete.
  - There's no update policy, so files can't be overwritten.
  - Reads are allowed when the caller can see the `media_assets` row: the public sees only media used by published content; admins see everything.
- **Bug fixed while writing it:** the carry-over first used one statement with a data-modifying CTE. Its UPDATE couldn't see the rows the INSERT had just added, so it was split into two statements and verified in a rolled-back transaction.

### Upload, processing, delivery

- **Upload flow:**
  1. The browser checks the file, then uploads it with the admin session to `incoming/<uuid>`.
  2. `finalizeImageUpload` (`requireAdmin`) checks the magic bytes, fully decodes the image with sharp (`failOn: error`, 50 MP limit, animated images rejected), and re-encodes it: orientation applied, EXIF and GPS stripped, fitted inside 3000 px.
  3. It stores the result at `images/<use>/<uuid>.<ext>` with its real dimensions.
  4. The incoming file is always removed. The processed file is removed if the database insert fails, and incoming files older than 24 h are swept.
  - `sharp` is now an explicit dependency (it was already installed through Next).
- **Delivery:** a single strategy.
  - Signed URLs: public pages sign with the anon key (1 year, because the page is cached for an hour); admin pages sign with the session (1 hour).
  - Photos go through `next/image`, whose `remotePatterns` allow only `/storage/v1/object/sign/cms-media/images/**`. `dangerouslyAllowLocalIP` is on only when Supabase is local.
  - No Supabase transformations.
- **Video:**
  - Adapters in `src/lib/media/video-providers.ts`, with `youtube-nocookie` and Vimeo `dnt=1`.
  - The click-to-load `VideoPlayer` loads no iframe or third-party request before Play.
  - **Uploaded video ("stream") is NOT configured.** It isn't offered in the admin, and the server refuses it with an explanation. Nothing is faked, and no video is stored in Supabase.
- **CSP:** only `frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com` was added (the stream host only when configured). There are no wildcards.

### Admin UI

- **`/admin/content/media`:**
  - Photos and Videos tabs (links with `aria-current`), with search and an upload dialog.
  - Photo cards show the description, dimensions, size and "Used in: …" or "Unused".
  - "Edit description" dialog.
  - Delete is disabled with an explanation when a photo is used; the database also enforces it.
  - The Videos tab has an add-link form and the honest "uploaded video isn't set up" notice.
- **Picker** (`MediaPicker`/`MediaSlot`):
  - Used by every photo field in the Phase 14 forms and in the editor.
  - Keyboard radio grid, search, and "Upload new photo" inside it.
  - Selection is shown in words, and focus returns to the field.
- **Editor:**
  - "Add photo" / "Change photo" over the hero and About photos saves straight away.
  - The video panel takes a YouTube/Vimeo link plus a poster.
  - The gallery "Add" is no longer disabled.
- **Gallery lightbox:** a Radix dialog on the public page.
  - Prev/Next with wrap-around, arrow keys and Esc, and "Photo X of N".
  - 44 px controls, and focus returns to the photo.
- **shadcn `dialog`** was added with the CLI, then restyled with site tokens and motion-safe animations.

### Issues found and fixed during testing

1. **Stale homepage for visitors with the installed site (Phase 11 bug, found here).**
   - After a content change, the service worker's `fetch("/")` got the **previous** page from the browser's HTTP cache. Chrome applies the page's `stale-while-revalidate` directive to service-worker fetches.
   - Visitors saw old content once after every edit. The server itself was correct (verified by comparing the server HTML with the browser's navigation entry: `transferSize 0`, `deliveryType "cache"`).
   - **Fix:** page fetches in `sw.js` use `cache: "no-cache"` (a cheap 304 via the ETag), and `VERSION` was bumped to `v2` so installed workers update.
2. **Editor stale closure:** choosing a photo then saving saved nothing. `saveScope` now accepts the values directly.
3. **Portal events:** the editor canvas's submit/link interceptor also caught events from dialogs (React portals bubble through the React tree), which would have blocked uploads inside the picker. It now ignores targets outside the page DOM.
4. **Local Storage:**
   - The stack had been started without Storage, so it was restarted with it.
   - The local `storage.objects` indexes lacked `COLLATE "C"` (hosted has it), giving `42P10` on upload.
   - The indexes were rebuilt locally as `supabase_admin`, as a local tooling repair (README).

### Tests actually run

**Local production build** (local Supabase with Storage, temporary local admin + non-admin users; all removed afterwards):

| Suite | Result | What it covers |
| --- | --- | --- |
| `storage16.mjs` (new) | **46/46** | **Uploads:** anon and non-admin can't upload; admin only at app paths (traversal, unknown folder, non-uuid, `.gif`, nested all rejected); non-image type and over-10 MB rejected by the bucket; no overwrite. **Reads:** anon/non-admin can't read an upload in progress or list the bucket; an image used only by a draft can't be signed by anon, and one used by published content can (served 200). **Deletes:** anon/non-admin can't delete objects or rows; RESTRICT on gallery, service and hero photos. **Constraints:** alt, dimensions, app path, provider/kind, YouTube ID and host, `javascript:` rejected, duplicate video, provider-matching FK, `embed_url` retired |
| `media16.mjs` (new, headless Chrome) | **57/57** | **Library and uploads:** honest empty library; JPEG/PNG/WebP uploads; a fake `.jpg` rejected by the server with nothing left behind; 4000×2667 scaled to 3000×2000 with EXIF gone; thumbnails via `next/image`; search; edit description. **Editor and reuse:** picker by keyboard; hero photo saved and shown publicly via a signed `next/image` URL, high priority; one file reused in 3 places; usage list; delete disabled when used; gallery item created from the editor; lazy-loaded gallery with `sizes`. **Lightbox:** keyboard, arrows, wrap, 44 px, Esc, focus return. **Video:** no iframe or YouTube request before Play; uploaded video honestly not offered; bad link rejected; YouTube normalized, and Play loads `youtube-nocookie`; Vimeo `dnt=1` only after Play; exact CSP; video and hero photo removal back to honest fallbacks. **Responsive:** 375–1440 with no overflow |
| `act16.mjs` (new) | **24/24** | Every media server action called directly over HTTP as **no session** and **signed-in non-admin** is refused, with storage and rows unchanged. As admin: path outside `incoming/`, traversal, unknown folder, missing or too-long description, `javascript:` and foreign-host video links are all rejected server-side. Controls: finalize stores `images/gallery/<uuid>.jpg`, sanitizes the filename, scales, and removes the incoming file; description update and delete of an unused photo work |
| `iso16.mjs` (new) | **24/24** | Library pages → login for anon and non-admin (only the static page title, no data); admin 200, noindex, `no-store`. With a published photo and video on `/`: its HTML and 18 scripts contain no library/upload/editor strings or action names, no `incoming/` and no secrets; only signed `images/` paths; no iframe or player script before Play |
| `rls13.mjs` | **141/141** | Updated for Phase 16: valid media paths, RESTRICT (was SET NULL) for service photos, library videos instead of `embed_url`; now cleans up after itself |
| `cms14.mjs` | **78/78** | Updated: video field `videoUrl` stored as a library video (the public page now shows the player); gallery Add is enabled and has the picker (was "uploads aren't set up") |
| `editor15.mjs` | **68/68** | Updated: gallery Add enabled |
| `iso15`, `action14`, `focus14` | 7/7, 17/17, all pass | unchanged |
| **Regression** | same as the Phase 15 baseline | Admin PWA; public PWA (caches now `cc-*-v2`, offline homepage and form, no private data cached); metadata; date picker and status Select; header state; keyboard/menu; 7-width public audit (no overflow; the same 2 not-yet-loaded lazy images at 375 as before); CTA/FAQ/form suite (its `/design-system` preview step is dev-only and errors on production builds, as before) |

**Hosted:**
- **Migration:** pushed after a dry run, with the owner's approval. Checked with anonymous requests: new columns and the video FK resolve; anon upload to `cms-media` → 403. Hosted had no video set, so nothing was carried over.
- **`hosted13.mjs`:** 18/19. The one "failure" is its seed-count assumption: hosted has **2 published services** (the owner's own content; see Phase 15).
- **Final gate** with the normal hosted env: `bun install --frozen-lockfile`, typecheck, lint, build (**0** content/media fallback logs) and `git diff --check` all pass.
- **Hosted build served locally:** `/` 200 with the exact CSP, no iframe before Play, `sw.js` v2; `/admin/content/media` and `/admin/editor` → login.
- **Not done on hosted:** uploads and saves as the real admin (no password; no hosted test users created). Upload, delete and video writes were verified **locally only**. No photos or videos were added to hosted.

**Cleanup:** local test users, enquiries, media rows and Storage objects removed (local content equals the seed); test servers (:3065, :3066) stopped; temp profiles and logs removed. The local Supabase stack is left running **with Storage**. Your dev server (:3000) wasn't touched.

### Remaining / deferred

- **Uploaded video provider:** not configured. It needs a provider decision, `VIDEO_STREAM_CUSTOMER_CODE`, and an upload implementation with server-only credentials.
- **Existing hosted content has no photos yet:** add real photos through the library. Nothing was invented.
- **Signed URLs on the cached homepage last 1 year.** Replacing or deleting a photo updates the page immediately (`updateTag`), but a URL copied from the old page stays valid until it expires.
- **Service worker v2** reaches existing visitors once all their tabs of the site have been closed.

## Phase 17 — Global Theme Engine + Client Design Editor + Rose Pink Refresh

**Date:** Saturday 26 September 2026 · **Timezone:** NPT (UTC+05:45)
**Result:** Committed as `feat: add global theme and design editor`. **Both theme migrations were pushed to hosted with the owner's approval.** A hosted admin Design save was **not** tested.

### Objective

The website's look becomes **global site configuration** that the client manages from the admin: saved once in Supabase, applied by the server to the public website for every visitor. It is not an admin-only preview, a per-user theme or browser-local. Plus a deliberate rose-pink brand refresh as the new default.

```text
/admin/design → draft + live preview → Save → saveSiteTheme (requireAdmin, Zod, WCAG checks)
  → site_theme (singleton, RLS) → updateTag("cms-content")
  → (site) layout → getSiteTheme() (tagged public client) → <style id="site-theme">:root:root{--cc-…}</style>
  → semantic tokens (globals.css) → existing components → every visitor
```

### Audit (before coding)

- **Already themeable:** almost everything.
  - Components consume semantic tokens only (`bg-primary`, `text-emphasis`, `bg-surface-*`, `border-border`, `ring`, `--radius`, `shadow-soft/lift`).
  - Those tokens are mapped from a raw layer-1 palette (`--cc-*`) in `globals.css`, and dark sections re-map them under `[data-tone="dark"]`.
  - All buttons come from one `cva` primitive.
- **Hard-coded, found and left on purpose (developer-controlled):**
  - The lightbox backdrop `#1c1817`.
  - The manifest and `viewport.themeColor` `#ffffff` (static files).
  - The email HTML colours (email clients can't use CSS variables).
  - The offline page in `sw.js`.
- **Hard-coded, made themeable:**
  - The display-heading weight (fixed `font-medium` in 32 places, now `font-title`).
  - Button colours, shape and size.
  - Ad-hoc panels (now the `surface` utility).
  - Shadow recipes.
  - The border and input colours (now layer-1 variables).
- **Stays in code:** fonts, layout, grid, spacing, breakpoints, section order, component structure and motion.

### Architecture decisions

- **One mechanism, layer 1 only.**
  - The theme overrides only the layer-1 variables. `globals.css` stays the single place that says HOW they become semantic tokens, so dark sections, hover shades and every shadcn component follow automatically.
  - There is no second styling system, no runtime Tailwind classes, and no source files rewritten.
- **Colour maths in TypeScript** (`src/lib/theme/palette.ts`).
  - Derived colours are computed from the eleven client colours as concrete hex values, so contrast can be checked exactly: section blush, the dark-section rose (the primary lifted until ≥4.5:1 on charcoal), gold shades, and the input border (≥3:1, else the muted text).
  - The editor (live) and the server (on save) use the same code.
- **Rendering** (`src/lib/theme/css.ts`).
  - The output is built only from validated hex values plus fixed recipe strings keyed by enum, and it is re-validated there, so there's no CSS or HTML injection path.
  - Selector `:root:root` beats `globals.css`'s `:root` regardless of stylesheet order.
  - Tone-dependent variables (button colours, surface background and border) are also declared on `[data-tone="dark"]` containers, so their `var(--primary)` resolves to the dark-section token there.
- **Where it applies:**
  - The `(site)` layout, the root 404 page and the visual editor (`/admin/editor`) render `<SiteThemeStyle />`, so the editor shows the live theme.
  - **The admin chrome keeps the code defaults**, so a theme choice can't make the control panel hard to use.
  - The Design page's preview is scoped with `data-theme-scope`, which `globals.css` now also matches, so the semantic tokens are re-derived on that element.
- **Buttons:** the primary variant reads `--btn-bg/fg/border/hover-*`, every button's radius `--btn-radius`, and the default size `--btn-height/px/text`.
  - Style recipes: filled (the **button colour**, champagne inner edge), outline, soft (blush), ghost.
  - Filled buttons have their own colour setting (client request, see below). Outline and ghost use the rose text colour, because their text sits on the page background.
  - Hover moves away from the button's text colour (lighter under dark text, darker under white), so hovering never lowers contrast.
  - The height never drops below 44px.
  - Other variants are unchanged.
- **Typography:**
  - `--font-weight-title` (the utility `font-title`) replaces the fixed heading weight, and `body` uses `--cc-body-weight`.
  - `cn()` (tailwind-merge) was taught that `font-title` is a weight. Without it, `cn()` dropped `font-display`; this was caught visually on the FAQ questions.
  - Fonts can't be changed.
- **Surfaces:** a `surface` utility (background, border, radius, shadow from the theme) is used only where a panel logically exists: the enquiry form's confirmation and notices. Sections keep their editorial layouts; no cards were added.
- **Caching:**
  - The theme is read through the same tagged, cached public client as the content (`cms-content`), so it's loaded once on the server with no client request.
  - Saving calls `updateTag`, so the next request renders the new theme, and `/` stays static ISR (`s-maxage=3600`).
  - Installed-PWA visitors get it too thanks to the Phase 16 service-worker `no-cache` page fetches.

### Database (`20260926094403_site_theme.sql`)

- **Table:** `public.site_theme`, a singleton (`id boolean primary key default true check (id)`) like `home_content`.
- **Columns:** 11 colours and 11 options (two added by the follow-up migration below).
  - Colours must match `^#[0-9a-f]{6}$` (lowercase, so injection-shaped values are rejected).
  - Options are enum checks.
- **Other:** an `updated_at` trigger, seeded with the rose-pink default.
- **RLS, the same as the CMS singletons:** public (anon and authenticated) `select`; `update` only when `private.is_admin()`; no insert or delete grants.
- **Deliberate gap:** contrast isn't checked in SQL (it needs colour maths). The app checks it on save; the database guarantees the format.

### Rose-pink refresh (new defaults)

| Token | Before | After | Why |
| --- | --- | --- | --- |
| **Button colour** (Enquire Now, Send enquiry) | `#9B605A` with white text | **`#F7889A`** brand pink, **charcoal** text | client's pink; charcoal text 6.0:1 (hover `#F89AA9`, 6.84:1) |
| Rose text (eyebrows, headline accent, links, focus) | `#9B605A` dusty brown-rose | **`#B64762`** | a deeper shade of the button pink: 5.16 / 4.76 / 4.81:1 on white / ivory / blush; white text on it 5.16:1 |
| Soft blush (secondary, selection) | `#FCE4E2` | **`#F9DDE2`** | pinker; charcoal on it 11.06:1 |
| Section blush | `#FFF6F5` | **`#FDF5F6`** (derived) | muted text 4.87:1 on it |
| Dark-section rose | `#D68B7F` | **`#CC7E91`** (derived) | 4.67:1 on charcoal |
| Border | charcoal 12% | **`#EBE1DF`** | warm blush-grey hairline |
| Ivory, white, gold, charcoal, muted | — | unchanged | kept by the brief |

- **Visual changes:**
  - Link underlines are rose (`decoration-primary/40`) instead of gold.
  - The Process section moves from ivory to **blush**.
  - Gold stays for hairlines and ornaments; charcoal stays the text colour.
  - No gradients, no neon, no extra cards or shadows.
- **The brief's example `#C85F78` was rejected as the primary:** white text on it is 3.9:1 (fails AA). The default and the editor's checks prevent it.
- **Client pink `#F7889A` (asked for "as the primary"):** it passes as a button fill with charcoal text (6.0:1), but fails as text (2.34:1 on white; large text needs 3:1) and with white button text (2.34:1). So the theme gained a separate **Button colour** and **Button text** (migration `20260926105017_site_theme_button_color.sql`). The buttons are now `#F7889A`, and text-level rose moved to `#B64762` (same hue, readable).
  - That migration only moves `primary_color` if it was still the untouched old default.
  - Known and accepted: the pink button's edge against white is 2.34:1. WCAG 1.4.11 doesn't require it for buttons identified by their text, and their text is 6.0:1.
  - The first implementation (Primary = buttons and text) was the initial Phase 17 design; its first-round results (46/46, 53/53) are superseded by the reruns below.

### Admin → Design (`/admin/design`)

- **Access and navigation:**
  - Uses `requireAdmin` in the page and the action; there's no new auth layer.
  - The nav is Enquiries | Content | **Design**, plus the existing **Edit website** button (the editor). On phones it shows "Edit" with " website" kept for screen readers, which fixed a 2px overflow the fourth item caused.
- **Colours:** grouped as Buttons (button colour, button text), Brand (rose text and links, text on rose, soft blush, accent gold), Backgrounds, and Text and lines.
- **Tabs** (shadcn tabs added with the CLI and restyled like the admin nav): Colors, Buttons, Surfaces, Typography, Shape.
- **Colors:** each colour has a label, hint, native colour picker (the swatch) and editable hex (a half-typed hex isn't applied). Readability problems are listed at the colour that can fix them. "Button text" and "Text on rose" offer **Use a readable text colour**.
- **Other tabs:** fixed options as native radio groups (arrow keys, 44px, selection shown by ✓ and weight).
- **Readability:** 16 WCAG AA checks with their ratios. Failures are shown in words, Save is refused and focus moves to the list; the server refuses too.
- **Live preview:** the real primitives (Eyebrow, headings, Button filled/secondary/link, Input, a focus ring, the `surface` panel, the gold divider, soft blush, border, and a dark section) under the draft theme.
  - It updates on every change, and nothing is saved.
  - Desktop: sticky beside the controls. Phones: controls → preview → readability.
- **Save bar:** unsaved count, Discard changes, **Reset to defaults** (confirmation; it changes only the draft), **Save changes** (a status message on success, an alert on error).
- **Leaving:** reload or close uses the browser prompt; in-app links open a "Leave with unsaved design changes?" dialog. Reloading discards the draft.

### Design-system page

A new "Global theme" section shows the live theme values, the semantic colour tokens as the real `bg-*` utilities, radius steps, shadows, the surface panel and the focus ring. The rest of the page (buttons, tones, forms) now renders through the theme, because it's under the `(site)` layout. It's still development-only.

### Files

- **New:**
  - `src/lib/theme/schema.ts`, `palette.ts`, `css.ts`, `server.ts`.
  - `src/components/theme/site-theme-style.tsx`.
  - `src/components/design/design-editor.tsx`, `design-controls.tsx`, `theme-preview.tsx`.
  - `src/app/admin/(portal)/design/page.tsx`, `actions.ts`.
  - `src/components/ui/tabs.tsx`.
  - The migration.
- **Changed:**
  - `globals.css`: palette defaults, `[data-theme-scope]`, button, surface, shadow and weight variables, the `surface` utility.
  - `button.tsx`.
  - `utils.ts`: the `font-title` merge rule.
  - The `(site)` layout, `not-found.tsx` and the editor page (theme style).
  - The admin nav and layout.
  - The enquiry form (surface panels), process (blush tone), and link underlines in hero/contact/enquiry/gallery/mobile menu/accordion/field/button.
  - Heading weight classes (32 strings, verified to be the only change in those files).
  - The design-system page, README and `work.md`.

### Tests actually run

**Local production build** (local Supabase with Storage; temporary local admin, second admin and non-admin users):

| Suite | Result | What it covers |
| --- | --- | --- |
| `theme17-unit.ts` (new) | **68/68** | Schema: valid theme; hex rejected (named colours, 3-digit, missing `#`, `url(x)`, `;}`, empty, null); enums; strict (extra key rejected); missing keys. Contrast: 21:1 white/black, symmetric, rounds down; the default passes all 16 checks; `#C85F78` fails as rose text; light pink + white button text fails; `#F7889A` + charcoal passes, + white fails, as text fails; hover never lowers contrast. CSS: scope, no HTML-breaking characters, refuses an invalid theme (no injection), outline/pill/radius/no-shadow/44px. Guards: `globals.css` defaults equal the default theme (no drift); row ⇄ theme round trip; a malformed row → default |
| `api17.mjs` (new) | **46/46** | **Database:** singleton; anon and non-admin read; anon and non-admin updates rejected; no second row, no delete (even as admin); the database's own checks reject invalid hex, uppercase, a CSS-injection string and unknown options even from an admin; admin update works. **`saveSiteTheme` over HTTP:** refused for no session and non-admin (theme unchanged); as admin, malformed, unknown, extra-key, missing-key and unreadable (light pink + white, `#C85F78`) themes rejected server-side; a valid save works. **Routes:** `/admin/design` → login for anon and non-admin; admin 200, noindex, `no-store`. **Isolation:** public `/` stays ISR, carries the theme style, and its HTML and scripts contain no editor code, action names or secrets |
| `e2e17.mjs` (new, headless Chrome) | **55/55** | **The brief's end-to-end check:** public before (pink button, charcoal text, rose eyebrow) → admin Design (tabs, 11 colours, preview, 16 checks; arrow keys) → change the rose to `#C2185B`: the preview changes immediately while the admin chrome, the database and the public site do not → unreadable button text is flagged at the control and in the list, Save is refused and focus moves to the list; "Use a readable text colour" fixes it → outline buttons → the leave dialog on an admin tab, Keep editing → **Save** → a fresh public request has the new theme (cache expired, still ISR) → public: header CTA outline in the new rose, eyebrow and headline accent, link underline, Send button, input border unchanged, **focus outline in the new rose**, dark sections re-derived → **mobile 390** CTA and no overflow → the visual editor and the 404 page use it → reload discards a draft → Reset to defaults (confirmation, draft only) → Save → the public site is back on the default. The Design page at 375/390/430/768/1024/1280/1440: no overflow, controls ≥44px; no console errors |
| Regression, first full run (before the button-colour change) | all pass | `rls13` 141, `storage16` 46, `action14` 17, `act16` 24, `iso15` 7, `iso16` 24, `media16` 57, `editor15` 68, `focus14`, `cms14` 78 (on rerun; the batch run stalled once on a navigation), admin PWA, public PWA (caches `cc-*-v2`, offline homepage styled, 0 broken images), metadata, date picker/Select, header, keyboard/menu, 7-width public audit (no overflow; the same 2 lazy images at 375 as before) |
| Regression, rerun on the final build (pink buttons) | all pass | `rls13` 141, `storage16` 46, `action14` 17, `act16` 24, `iso15` 7, `iso16` 24, `media16` 57, `cms14` 78, `editor15` 68, `focus14`, `controls10` (status Select saved, no console errors), admin and public PWA, metadata, header, keyboard/menu, 7-width audit. **Note:** the first batch rerun started from test data left by earlier runs (a test category, a test video, several copies of the date-picker suite's enquiry), which caused 12 failures in the data-level suites. After resetting the local data to the seed state, each affected suite passed; no code was changed |
| `picker17.mjs` (new) | **11/11** | **Delete photo in the media picker** (asked for during testing): upload in the editor's hero picker → an unused selected photo offers **Delete photo** → confirmation (Cancel keeps it) → the row and the Storage file are deleted, "Photo deleted." is announced and focus stays in the picker → a photo **in use** shows no Delete and says why; no console errors |

**Visual review** (screenshots at 1440 and 390 of `/`, and at 1280 and 390 of `/admin/design`). It found and fixed:
1. **FAQ questions lost the display font:** `cn()` treated `font-title` as a font family.
2. **A 2px horizontal overflow on phones in the admin header** after adding the Design tab.
3. **The preview sat below the readability list on phones:** reordered to controls → preview → readability.

Full-page captures need the scroll-driven `.reveal` disabled, because below-the-fold blocks sit at opacity 0 until scrolled. This is existing behaviour, not a bug.

**Hosted:**
- **Migrations:** both pushed after dry runs, with the owner's approval: `20260926094403_site_theme.sql`, then `20260926105017_site_theme_button_color.sql`.
- **Checked with anonymous requests:** the theme is readable (buttons `#f7889a`/`#302a29`, rose `#b64762`), and anonymous updates → `42501 permission denied`.
- **The owner's dev server** (hosted env) serves the theme style with the pink buttons.
- **Not done on hosted:** a Design save as the real admin (no password; no hosted test users). The save path was verified **locally only**.

### Added during testing: delete from the photo picker

The photo picker (content forms and the visual editor) only allowed choosing or uploading, so an unwanted upload could only be deleted on the Media library page. It now shows **Delete photo** for the selected photo when it's unused, using the same `deleteMedia` action as the library (`requireAdmin`; the database's RESTRICT keys still refuse photos in use).
- A photo in use shows "Used on the website, so it can't be deleted here."
- If the deleted photo was the field's unsaved choice, the field is cleared.
- Files: `src/components/media/media-picker.tsx`, `src/components/editor/editor-media.tsx`.

### Known limitations

- **Pink button edge:** it's 2.34:1 against white. WCAG 1.4.11 doesn't require it for text buttons (their text is 6.0:1).
- **Contrast isn't enforced in SQL:** a direct database write by an admin, bypassing the app, could store readable-format but low-contrast colours. The app, its server action and the checks prevent it through the UI.
- **Developer-controlled colours:** the manifest `theme_color`, the email template, the offline page and the lightbox backdrop don't follow the theme.
- **Fonts are fixed:** only the heading and text weights are adjustable.
- **The admin keeps the code defaults** (deliberate). The visual editor and the Design preview show the saved or draft theme.
- **A new theme reaches installed-PWA visitors on their next online visit** (network-first `/`).

## Phase 18 — Everything Editable + Style Presets

**Date:** Saturday 26 September 2026 · **Timezone:** NPT (UTC+05:45)
**Result:** Committed as `feat: make site details editable and add style presets`. **Both Phase 18 migrations were pushed to hosted** with the owner's approval.

### Why

The owner asked for two things while reviewing the visual editor:
- **"Make everything editable":** the headline "Turning moments into masterpieces" couldn't be edited.
- **"Apply styles here like spacing, font, color, background"** without code changes.

Decisions they chose:
- **All visible text** editable, with link destinations kept in code.
- **Controlled presets**, not free-form CSS.
- **Finish and commit Phase 17 first** (it was committed as `985d8dd`).

### 18a — Site details (`site_settings`)

- **What moved from code to the CMS** (migration `20260926115115_site_settings.sql`, a singleton seeded with the exact current values, so nothing changed visually):
  - the hero headline, plus an optional italic-rose ending;
  - the footer tagline and the six navigation labels;
  - main button, mobile-bar, "Call" and "Menu" labels, and the "Prefer to talk?" prompt;
  - footer headings and "Based in";
  - phone number, address and the Instagram, Facebook and TikTok links (an empty link hides that platform everywhere);
  - enquiry form labels, the "(optional)" marker, the Send button, and the thank-you heading and text.
- **Stays in code:**
  - link destinations and the business name and description;
  - the form's validation and status messages, which always have to explain what happened;
  - the manifests and email template;
  - the 500 error page, which is a client error boundary that can't load data (it uses the code fallback).
- **Database rules:**
  - Text uses the existing `cms_line` / `cms_text` types.
  - The phone must be a number with 8–15 digits; the call link is derived from it (`0426 071 109` → `tel:+61426071109`).
  - Social links must be `https://` on that platform's own host (no `javascript:`, no look-alike domains).
  - The postcode must be 4 digits.
  - Same RLS as the other singletons.
- **Rendering:**
  - `getSiteSettings()` uses the same tagged public client, with `src/data/site.ts` as the fallback.
  - The `(site)` layout loads it once and passes it to `SiteFrame` (header, footer, mobile menu, mobile bar) and `HomeSections` (hero, gallery, video, enquiry, contact).
  - The page title (`generateMetadata`) and the JSON-LD business data use the editable headline, phone, address and links.
- **Editing:**
  - Visual editor: the headline and its ending are edited in place, and an empty optional ending shows a faint "Add …" prompt in edit mode only.
  - Text inside links, buttons and form labels is edited in the section panels (Hero, Enquiry, Contact) and in a new **Header & footer** toolbar panel, which reuses the section panel, generalised.
  - `/admin/content/site` is one grouped form, with a card on the Content overview.
  - Saves go through `saveSiteSettings` (`requireAdmin`, Zod mirroring the database checks, `updateTag`).

### 18b — Style presets (`page_styles`)

- **What the client can set** (migration `20260926120239_page_styles.sql`, a singleton holding two JSON maps; the database guards the shape and size):
  - **Text:** size (Small, Body, Large body, Heading S–XL), font (Cormorant or Manrope), weight, colour (main text, muted, rose), italic and alignment, for 43 editable texts.
  - **Sections:** background (page, ivory, blush, dark) and spacing (compact, normal, spacious), for the 13 homepage sections (the hero has no spacing option; its padding is part of its layout).
- **How it applies (no free CSS, no runtime classes):**
  - **Text:** stylable elements carry `data-sk="<scope>.<field>"`. `textStylesCss()` turns the validated map into rules built only from recipe strings (the type-scale values, `var(--foreground | --muted-foreground | --primary)`, the next/font families), emitted as `<style id="page-styles">` only when something is styled. The rules are unlayered, so they beat Tailwind's layered utilities.
  - **Sections:** the public `HomeSections` wraps a styled section in a `display: contents` div carrying `data-ss-tone` / `data-ss-space`. Unstyled sections render exactly as before. Static rules in `globals.css` set the background and spacing.
  - **Tokens:** a dark tone applies the dark-token block to that section; a light tone re-derives the light semantic tokens on a normally dark section. For this, `globals.css` was split into a palette block (literal theme values, root only) and a semantic block (token references only), so a restyled section never resets the theme's `--radius` or palette.
- **Accessibility:** colours are theme tokens only. The Design page's 16 checks already guarantee main, muted and rose text are readable on white, ivory and blush, and dark sections get the lifted rose and ivory text, so no preset combination can produce unreadable text. Controls are labelled native selects, 44px.
- **Editor UX:**
  - **Style** in the inline editor opens the six choices, each starting at "As designed", plus "Reset style".
  - **Section style** sits in each section panel.
  - Choices apply live, save immediately, and saves are serialised so the database always ends with the last choice; a failed save rolls back with an alert.
  - Preview mode and the public page render the same wrapper.
- **Security:** `savePageStyles` validates the whole map with strict Zod over the fixed keys and options, rejecting unknown keys, CSS in values, extra properties and unknown sections, then drops empty entries.

### Issues found and fixed during testing

1. **A "component created during render" lint error:** the first public section wrapper was a closure. It was replaced with a static `StyledSection` that receives the styles as a prop.
2. **The font recipe referenced `var(--font-display)`:** that doesn't exist at runtime (it's an `@theme inline` value). It now uses the next/font variables directly.
3. **A test expectation:** the old phone number still appears in an FAQ **answer**. That's FAQ content the client writes, not a site detail, so the test was narrowed to the call links.

### Tests actually run

Local production build (local Supabase; temporary test users, all removed afterwards):

| Suite | Result | What it covers |
| --- | --- | --- |
| `site18.mjs` (new) | **14/14** | Headline edited in place → saved → public headline, page title and JSON-LD slogan; Header & footer panel: a menu label updates live and publicly while the link stays the same; form Send label via the Enquiry panel; `/admin/content/site` renders grouped; a bad phone and a `javascript:` link are rejected with messages; phone saved → new `tel:` link and JSON-LD telephone; an empty TikTok hides it everywhere; restored; no console errors |
| `style18.mjs` (new) | **18/18** | Style in the inline editor (6 labelled choices + reset); heading restyled live, saved as fixed options, public (rose, centred, larger); FAQ section Dark + Compact live and public (charcoal background, ivory text: tokens swapped; padding 128→72px); normally dark Gallery → Ivory with dark text; no overflow; reset leaves `{}{}` and the public HTML returns to exactly the original (no style tag, no wrappers) |
| `api18.mjs` (new) | **53/53** | Both tables: one row, public read, anon and non-admin updates rejected, no insert or delete even as admin. The database rejects bad phones, `javascript:` / look-alike / http social links, bad postcodes, multi-line labels, empty headlines and non-object style maps even from an admin. Both actions over HTTP are refused for no session and non-admin. Admin: unknown keys, CSS in values, unknown options, extra properties, unknown sections and tones, and CSS characters in keys are rejected server-side. The generated CSS equals the recipe exactly. Isolation: `/admin/content/site` → login; the public bundle has none of the editor or style code; `/` still ISR |
| Full regression (from a clean seeded state) | all pass | `rls13` 141, `storage16` 46, `action14` 17, `act16` 24, `iso15` 7, `iso16` 24, `media16` 57, `cms14` 78, `editor15` 68, `focus14`, `api17` 46, `e2e17` 55, `picker17` 11; PWA, metadata, date picker and Select, header, keyboard/menu and 7-width audit unchanged from the baseline |

**Hosted:**
- Both migrations were pushed after a dry run, with the owner's approval. The push was needed because the owner's dev server (hosted env) couldn't open the visual editor without the new tables.
- Checked with anonymous requests: `site_settings` has the seeded values, `page_styles` is `{}` / `{}`, and anonymous writes → `42501`.
- Not done on hosted: saves as the real admin (no password).

### Known limitations

- **Still in code:** the form's error and status messages, the 500 error page's wording, the business name, and link destinations.
- **Hero spacing:** no spacing option (its padding is part of the hero layout).
- **FAQ answers** are free text: if they mention the phone number, update them in the FAQ list when the phone changes.

## First deployment — GitHub + Vercel

**Date:** 26–27 September 2026 · **Timezone:** NPT (UTC+05:45)

- **Repository:** the owner created the private GitHub repo `pradeep-coderr/canvas-creations-and-events` and pushed `main`.
  - Verified: the remote matches local.
  - The only env file tracked is `.env.example` (no values; its one "secret" match is a comment). `.env.local` is not in the repo.
- **Commit authorship cleanup (owner's request):**
  - All 20 commits carried a `Co-Authored-By: Claude …` trailer. They were rewritten locally to remove it (messages only).
  - Authors, dates and the code snapshot are unchanged: the tree hash is identical before and after.
  - The owner force-pushed with `--force-with-lease` pinned to the previous head (`3688a22` → `ee5fd74`).
  - Verified on GitHub: 0 mentions of Claude, and the only author is `pradeep-coderr`.
  - The local backup branch and the `refs/original` copy were deleted afterwards, at the owner's request.
  - **From now on, commits carry no AI attribution lines.**
- **Vercel (Hobby):**
  - Project imported from GitHub with the Next.js preset and root `./`.
  - Required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key only) and `NEXT_PUBLIC_SITE_URL` (the Vercel URL until a domain is added; redeploy after changing it).
  - The three Resend variables are optional. The local `.env.local` has an API key but no sender or recipient, so email stays off until a Resend domain is verified; enquiries are still stored and shown in `/admin`.
  - Vercel's Supabase and Resend integrations were **not** used (the existing hosted database is connected through the variables).
- **Hosted database:** all migrations are applied, including `site_theme`, `site_theme_button_color`, `site_settings` and `page_styles`.
- **Live site:** https://canvas-creations-and-events.vercel.app/ (checked from outside on 27 September 2026, no login):

  | Area | Result |
  | --- | --- |
  | Homepage | 200 in ~0.9 s, `x-vercel-cache: HIT`. Content from the hosted database (headline, phone, services, enquiry form); theme style present (buttons `#f7889a`, rose text `#b64762`); no iframes before Play; no text-style overrides set |
  | Security headers | HSTS (preload), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, CSP `frame-ancestors 'none'; frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com` |
  | SEO | Title "Canvas Creations and Events \| Turning moments into masterpieces"; canonical and `og:url` use the live domain; JSON-LD slogan and telephone `+61426071109`; `robots.txt` disallows `/admin` and `/design-system`; the sitemap lists `/` on the live domain |
  | Admin | `/admin`, `/admin/editor`, `/admin/design`, `/admin/content/site` → 307 to `/admin/login`; login 200 with `X-Robots-Tag: noindex, nofollow` and `no-store` |
  | Other | `/design-system` and unknown pages → 404; both manifests, `sw.js` and the icons → 200 |
  | Services | Only one "Event styling & decoration" is published now (the extra test service is no longer shown) |

- **Not verified by me** (needs the owner's login, or would create real data): admin sign-in and a save on the live site, a test enquiry reaching `/admin`, and turning off Supabase sign-ups.
- **Before go-live:**
  - Confirm the owner's login is in `admin_users`.
  - Turn off Supabase sign-ups.
  - Unpublish the extra test service if it isn't real.
  - Upload real photos through the Media library.
  - Set up Resend for email notifications.

## Phase 19 — Fix Global Design Persistence + Add Complete Loading States

**Date:** 27 September 2026 · **Timezone:** NPT (UTC+05:45)
**Result:** Committed. No database changes (no migration). Tested **locally** (production build + local Supabase), as the owner asked; the live site was **not** changed or tested with an admin save.

### A. Design persistence: what was actually happening

- **Diagnosis on hosted (read-only; the owner didn't want live testing):**
  - The `site_theme` row was last updated at **26 Sep 10:57 UTC**, when the button-colour migration ran. **No Design save had ever reached the hosted database**, and the live HTML matched the database exactly. So the problem was never caching.
  - Other admin saves from the same account **did** persist (`page_styles` 14:26, `home_content` 14:00), so auth and sessions work.
  - Running the exact update as the admin inside a rolled-back transaction: 1 row updated, `is_admin() = true`, row untouched afterwards. Hosted RLS and the singleton are correct.
- **Reproduced locally** (the save path works end to end: button colour saved → DB → fresh public HTML). Two ways a save silently doesn't reach the DB:
  1. **A refused save was easy to miss.** Choosing a light pink (e.g. `#F7889A`) as the rose text colour updates the live preview, but Save is refused ("4 colour combinations are too hard to read"). The message only appeared in the bottom bar, so the preview made it look saved.
  2. **Stale admin page after a deploy.** After each Vercel deploy (Hobby has no skew protection), or a dev-server code reload, an open admin tab calls server-action ids that no longer exist. The save failed with a misleading "check your connection" and nothing was written.
- **Fixes:**
  - A **"Not saved yet"** banner at the top of the Design page whenever the draft can't be saved, explaining the website keeps its current design and linking to what to fix.
  - `describeActionFailure()` (`src/lib/admin/action-error.ts`) recognises Next's "Server Action … not found / Failed to find Server Action" and says: "This page is out of date because the website was just updated, so nothing was saved. Reload the page, then save again." The Design page adds a **Reload page** button. It's used by every admin save path (Design, CMS forms, item actions, visual editor, styles, media).
  - **`saveSiteTheme` hardening:** success only if the updated row comes back **and** equals the submitted theme field by field; otherwise an error, and server logs with code/message and mismatched fields.
- **Cache path unchanged and verified:** `updateTag("cms-content")` → the next public request renders the new theme, `/` stays ISR, and the service worker's `no-cache` page fetches don't hold an old theme.

### B. Loading states: one system

- **`Button` `pending` / `pendingLabel`** (`src/components/ui/button.tsx`):
  - A spinner plus e.g. "Saving design…", laid over the normal label in the same grid cell, so the width doesn't jump.
  - Marked `aria-busy` and `aria-disabled` (not `disabled`), so **focus stays**; clicks and submits are ignored while pending, so there's no double submit.
  - The spinner only turns with motion allowed (reduced motion: a still icon plus the text).
  - Tied only to real requests: `useActionState`/`useFormStatus` pending, React Hook Form `isSubmitting`, `useTransition`, and request promises. No timers.
- **Applied to:**
  - Sign in, Sign out (`SubmitButton` + `useFormStatus`), enquiry status update.
  - CMS forms ("Saving…"), Publish/Unpublish, Move up/down (a spinner on the pressed arrow; other actions ignored until done), and confirm dialogs (the dialog stays open with "Deleting…" / "Working…").
  - Visual editor: inline Save, Save section, toolbar Save, photo change/remove ("Saving photo…", "Removing…"), the item menu trigger while its action runs, and "Saving style…" for style presets.
  - Media: upload ("Uploading photo…" → "Processing photo…", the real stages), delete, description save, add video.
  - Design: "Saving design…".
  - Enquiry form: "Sending…", focus kept.
- **Skeletons (shadcn `Skeleton`, token-tinted, pulse only with motion allowed)**, used only where content really loads:
  - the media picker while the library is fetched (photo-card shapes);
  - `src/app/admin/(portal)/loading.tsx` for admin page navigation (heading and list shapes).
  - Not used for the Design preview: it's local draft state and renders instantly.
- **Public bundle:** the public page gets only the small `Button` pending code and the enquiry "Sending…". The public HTML and 18 scripts contain none of the Design, admin loading or pending strings (checked).

### Tests actually run (local)

| Suite | Result | Covers |
| --- | --- | --- |
| `e2e19.mjs` (new, headless Chrome, 1.2 s network latency so pending states are real and observable) | **28/28** | **Persistence:** preview updates without a save → Save shows "Saving design…" (busy, focus kept, stable width) → repeated clicks send **1** request → success only after the server confirms → DB updated → fresh public request and rendered button use it → admin reload shows it → an unsaved draft is discarded on reload. **Refused save:** banner + message, DB unchanged. **Offline save:** "nothing was saved", DB unchanged. Reset restores. **Pending states:** Sign in; Unpublish (1 request); Move down; CMS form Save; upload stages; delete dialog stays open with "Deleting…"; enquiry "Sending…" (1 submission, success); reduced motion stops the spinner. No console errors |
| Stale-page detection | 3/3 | Both Next "action not found" messages → the reload message; a network error → not stale |
| Bundle isolation | 10/10 | No admin, Design or pending strings in the public HTML or scripts |
| Admin smoke | **23/23** | All 11 admin pages load for an admin with no error page, redirect a non-admin to login; public `/` ISR with theme and site details |

**Not re-run this phase:** the earlier regression suites (Phases 10–18). Their test scripts lived in a temporary folder that's no longer available to this session. The changes are UI-level (button states, messages, skeletons); they don't touch data, auth or RLS. Typecheck, lint, build and the suites above pass.

### Known limitations

- **Hosted:** no admin save was tested on the live site (the owner chose local testing). After deploying, an admin tab opened **before** the deploy will show the "page is out of date" message on its next save; reloading fixes it.
- **Deploy skew:** Vercel Skew Protection (paid plans) would remove the stale-page case entirely.

### Follow-up: buttons with nothing to do are disabled (owner's request)

The owner saw a save refused (white text on `#FF7A91`: 2.48:1). Charcoal text on that pink passes at 5.67:1, and "Use a readable text colour" sets it. They then asked that buttons which can't do anything look disabled and not send requests.

- **`Button`:** `aria-disabled` (when no request is running) now looks disabled (50% opacity, not-allowed cursor) and ignores clicks and implicit form submits. It stays focusable, so keyboard focus isn't lost when a save finishes and the button turns disabled.
- **Design:**
  - **Save changes** is disabled when there are no unsaved changes, or while the draft fails a readability check (the "Not saved yet" banner and the Readability list explain why; the button is linked to it via `aria-describedby`).
  - **Reset to defaults** is disabled when the draft already equals the defaults.
- **Visual editor:** the toolbar **Save** and the panel's **Save section** are disabled with nothing unsaved.
- **CMS edit forms:** **Save** is disabled until a field actually differs from the saved record, and turns disabled again if it's changed back. New-item forms keep **Create** enabled, so validation explains empty fields.

**Tests (local):** `disabled19.mjs` **17/17**:
- Design Save and Reset disabled and inert (no request, no dialog) but focusable.
- An unreadable draft keeps Save disabled with the banner; a readable draft enables it.
- After saving, Save is disabled again with focus kept.
- A CMS form's Save is disabled until a change (Enter doesn't submit either) and disabled again when the change is reverted; a new-item Create stays enabled.
- The editor's toolbar Save and Save section are disabled until a change.
- No console errors.

`e2e19.mjs` rerun: **28/28**.

## Phase 20 — Admin Security, Super Admin PWA, Enquiry Alerts, Required Phone, Address Update & Admin Calendar

Everything below was built and tested **locally**: a production build (`next start`) against the local Supabase stack, with Mailpit for email and pg_cron/pg_net running. The code (`77a97df`) is deployed and the migration is on the hosted database. What was checked on the live site is under "Production: what was done". The push keys aren't in Vercel yet, and no feature was tested on a real device. See "Production steps still needed".

### Migration `20260927055717_admin_operations.sql`

1. **Phone required in the database.** The "Public can submit new enquiries" insert policy now also requires `phone is not null and char_length(btrim(phone)) between 6 and 30`. Existing rows without a phone are untouched and can still have their status updated. Only new public inserts need one.
2. **Roles.**
   - `admin_users.role` is `'admin' | 'super_admin'` (default `'admin'`).
   - **Every existing admin becomes `super_admin`**, so the owner keeps full access.
   - `private.is_super_admin()` is added. New admins added later are plain `admin` unless promoted:
     ```sql
     update public.admin_users set role = 'super_admin' where user_id = '…';
     ```
3. **Address.**
   - `address_street` and `address_postcode` are now optional, and the postcode check allows null.
   - The settings row is set to locality `Adelaide`, region `South Australia`, street and postcode null.
   - The seeded FAQ answer "We are based in Munno Para, South Australia." becomes "…Adelaide, South Australia.". This only happens if the answer is still the untouched seed text, so an admin's own edit is never overwritten.
4. **`push_subscriptions`** (endpoint unique and https-only, keys, user agent, `notify_enquiries` / `notify_reminders`, `revoked_at`). RLS: a super admin can manage only their own rows.
5. **`admin_reminders`**:
   - Columns: title, notes, `due_at`, `all_day`, optional `related_enquiry_id` (set null if the enquiry is deleted), `completed_at`, `notified_at`, timestamps with an `updated_at` trigger.
   - RLS: any admin (`is_admin()`).
   - Also adds an index on `enquiries.event_date` for the calendar.
6. **Push dispatch without a Supabase secret key in the app.**
   - `private.app_config` (no grants) holds `push_dispatch_secret` and `reminder_webhook_url` per environment. These values are **not** in the migration or the repo.
   - Three `SECURITY DEFINER` RPCs refuse unless given that secret (≥ 32 chars):
     - `push_targets(secret, kind)`: subscribed super admins' endpoints;
     - `revoke_push_endpoint(secret, endpoint)`: for 404/410;
     - `claim_due_reminders(secret)`: marks reminders due within 10 min (or overdue ≤ 1 day) as notified and returns them, so each is pushed once.
7. **Scheduling.**
   - `pg_net` + `pg_cron` job `canvas-reminder-dispatch` runs every minute.
   - It POSTs to `reminder_webhook_url` with `Authorization: Bearer <secret>`, but **only when a reminder is actually due**, so there's no request every minute otherwise.
   - It does nothing until both config values are set.

`supabase db lint`: no schema errors.

### A. Password reset

- **Login:** "Forgot password?" next to the password label.
- **`/admin/forgot-password`:** email field with "Sending reset link…" pending.
  - Always shows the same message ("If an account exists for that address, a password reset link has been sent…"), so it doesn't reveal which emails exist.
  - An invalid email gets a field message.
- **Link handling:**
  - Supabase sends the link to `/admin/auth/confirm` (a route handler). It handles both `code` (PKCE `exchangeCodeForSession`) and `token_hash` (`verifyOtp`, type `recovery`).
  - `next` is only followed if it's under `/admin/`.
  - A bad, expired or reused link goes to `/admin/forgot-password?link=invalid` ("That reset link has expired or was already used. Request a new one below.").
- **`/admin/reset-password`:** needs the recovery session (otherwise redirects).
  - Fields: new password + confirmation; policy: 8–72 characters, letters and numbers.
  - Handles Supabase's `same_password` / `weak_password`.
  - Pending "Updating password…"; on success it signs out and goes to `/admin/login?reset=done` ("Your password was updated. Sign in with your new password.").
- `supabase/config.toml` redirect URLs gained the local origins, for local testing only.

### B. Design save on production

**Not re-tested on the live site this phase** (the owner asked for local testing in Phase 19). The Phase 19 fixes (verified save, stale-page detection) are unchanged, and `e2e19.mjs` still passes 28/28 locally.

### C. Kind words removed from the website

The Testimonials section is no longer rendered on the home page, and no nav or link points at it. **The CMS data is kept.** The Content → Testimonials description says it isn't shown on the website, so it can be brought back later.

### D. Roles

- `requireSuperAdmin()` (`src/lib/admin/session.ts`) redirects a plain admin to `/admin` on the server. It's used by the Settings page and by every push action.
- Plain admins keep everything else, including the Calendar.
- The nav only shows **Settings** to super admins. The header install button and in-app alerts are only rendered for super admins.

### E. Install app (super admins)

- **Settings → Install the app**, plus a compact header button (icon-only on phones). It uses `beforeinstallprompt` where the browser offers it.
- iOS Safari gets Share → Add to Home Screen steps; other browsers get the browser-menu instructions.
- Hidden once installed (`display-mode: standalone`).
- Manifest shortcuts, all real admin routes: Enquiries `/admin`, New enquiries `/admin?status=new`, Calendar `/admin/calendar`, New reminder `/admin/calendar?new=reminder`.

### F–H. Push notifications (super admins)

- **Settings → Notifications:**
  - Permission is only requested when **Turn on notifications** is clicked, never on load.
  - It registers `/sw.js`, subscribes with the VAPID public key and stores the subscription.
  - Duplicate subscribes are upserted on the endpoint.
  - Controls: "Notify me about" **New enquiries** / **Calendar reminders**, **Send test notification**, **Turn off notifications** (revokes).
  - States: "Notifications are not enabled on this device." / "…enabled…", with honest errors when blocked or unsupported.
  - The page says whether a notification makes a sound depends on the browser and device settings. We send it non-silent (`silent: false`, `renotify`, vibrate), and that's all we can control.
- **New enquiry:**
  - After the enquiry is stored, `after()` sends "New enquiry — <name> · <event date>". It carries no email, phone or message, and opens `/admin/enquiries/<id>` when tapped.
  - It runs after the response, so **a push failure can never fail the enquiry** (tested with a dead endpoint).
  - 404/410 endpoints are revoked.
- **In-app alert:** if the admin app is open, the service worker posts the push to the page, which shows a "New enquiry received" toast with a **View** link.
- **Keys:**
  - `VAPID_PRIVATE_KEY` and `PUSH_DISPATCH_SECRET` are server-only.
  - Only `NEXT_PUBLIC_VAPID_PUBLIC_KEY` reaches the browser.
  - No Supabase secret key is used by the app.
- **Limitations:**
  - iOS delivers web push only to the **installed** app (iOS 16.4+), not to a Safari tab.
  - Delivery timing and sound are up to Apple, Google or Mozilla's push services and the device's focus/do-not-disturb settings.

### I. Phone is required

- The form no longer marks Phone optional (`aria-required`).
- Zod: empty → "Please enter your phone number."; not digits, spaces, `+ ( ) -` with at least 8 digits → "Please enter a valid phone number."
- Enforced again by the server action and by the database policy (see migration).

### J. Address: "Adelaide, South Australia"

- `src/data/site.ts` defaults, the Contact section and the footer (the new `AddressText` skips empty parts), and the admin site settings (street and postcode now optional; "City or suburb").
- JSON-LD `PostalAddress` now has only `addressLocality`, `addressRegion` and `addressCountry`. There's no invented street, postcode or geo.

### K. Admin Calendar `/admin/calendar` (all admins)

- **Month view** (Monday first) shows enquiries on their event dates (with status; archived enquiries hidden) and reminders.
  - Days outside the month are dimmed; today is marked with text, not just colour.
  - "+" per day adds a reminder; chips truncate inside their cell.
  - On phones it becomes a day list instead of a squeezed grid.
- **Agenda view:** next 60 days, grouped by day.
- **Overdue** section at the top.
- **Reminders:**
  - create, edit, mark done / not done, delete (confirm dialog);
  - optional time (all-day = 9:00 am for notifications), notes, linked enquiry;
  - pending labels "Saving reminder…".
- All times are Adelaide time (`src/lib/calendar.ts`, DST-safe). Editing a reminder clears `notified_at`, so a moved reminder notifies again.
- **Reminder notifications:** pg_cron → pg_net → `POST /api/push/reminders` (Bearer secret; 401 otherwise) → claim → push "Reminder — <title>, In N minutes (time)" to super admins who enabled reminders. This works with the app closed; the browser isn't involved in scheduling.

### Tests actually run (local only)

| Suite | Result |
| --- | --- |
| `e2e20.mjs` (new, headless Chrome + local Supabase + Mailpit) | **66/67.** The one "fail" is a test assumption: the scheduler claimed 2 due reminders in one batch (the run's own overdue test reminder too) where the assertion expected exactly 1. The pipeline itself worked: `cron.job_run_details` succeeded, `net._http_response` 200, and the app logged `reminders dispatched { reminders: 2, sent: 2 }`. The assertion was fixed afterwards. |
| `e2e19.mjs` (Phase 19 regression, now fills Phone) | 28/28 |
| `disabled19.mjs` | 17/17 |
| Admin smoke (extended with Calendar/Settings, role checks) | 33/33 |

`e2e20.mjs` covers:
- Kind words gone; address in Contact, footer and JSON-LD.
- Phone: UI, Zod, server, plus RLS refusing a missing or blank phone.
- Enquiry push logged after the response.
- The full reset flow via Mailpit: no enumeration, one email, too short, mismatch, pending, success, new password works, link can't be reused.
- Roles:
  - a plain admin gets no Settings, a server-side redirect, and a refused push action;
  - with no session, or as a non-admin, actions are refused.
- RLS on reminders and subscriptions; the RPC and endpoint refuse without the secret.
- Push:
  - permission not requested on load;
  - a real Chrome subscription is stored and duplicates are handled;
  - a dead endpoint doesn't fail the enquiry;
  - the in-app alert and View link work.
- Calendar: event on its date, today marked, overdue, reminder CRUD with Adelaide time, agenda, mobile list, the `?new=reminder` shortcut, manifest shortcut URLs.
- No console errors.

Final gate (hosted env): `bun install --frozen-lockfile`, typecheck, lint, build, `git diff --check`, `supabase db lint`: all clean.

**Not tested:** real phones (Android/iOS notification sound, installed iOS app), password reset and push on the live site, and the production Design save.

### Production: what was done

- **Code:** the owner pushed `77a97df`, and Vercel deployed it. Checked on the live site: Kind words is gone and `/admin/forgot-password` loads.
- **Migration pushed** (`supabase db push`, after a dry run that listed only `20260927055717_admin_operations.sql`). `supabase migration list` shows local and remote in sync. Checked on the hosted database:
  - the existing admin is now `super_admin`;
  - the address is Adelaide / South Australia with no street or postcode (also confirmed through the public REST API);
  - the FAQ answer says Adelaide;
  - the cron job `canvas-reminder-dispatch` is scheduled;
  - RLS is on for `admin_reminders` and `push_subscriptions`;
  - `private.app_config` is empty, so the job does nothing until step 3 below.
- **Stale address on the live site after the migration, and how it was fixed:**
  - The home page kept showing "Duffield Avenue, Munno Para, SA 5115" in Contact, the footer and the FAQ.
  - **Why:** the page was prerendered at deploy time, before the migration. Vercel's data cache survives deploys and is cleared only when an admin save expires the `cms-content` tag; a migration doesn't do that.
  - **First try:** purging Vercel's caches (Settings → Caches, "All content") didn't help. The page was rebuilt before the data cache was cleared.
  - **Fix:** a second purge of **CDN, ISR, and Image Cache**. The live page now shows "Adelaide, South Australia" everywhere (checked: 0 × "Munno Para", 8 × "Adelaide").
  - **Lesson for future data migrations:** purge **Runtime and Data Cache** first, then **CDN, ISR, and Image Cache**, or make a small admin save.
  - A code change adding `revalidate` to the public Supabase fetches was considered and dropped: the same client also runs the push-dispatch RPC calls (POST), and an explicit `revalidate` would make those cacheable.

### Production steps still needed (in order)

1. ~~Push the migration~~: done (above).
2. **Generate production keys:** `bunx web-push generate-vapid-keys`, plus a random secret of 32+ characters (don't reuse the local ones).
3. **Vercel env (Production):**
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:` the owner's address), `PUSH_DISPATCH_SECRET`;
   - then redeploy.
4. **Hosted DB config** (SQL editor):
   ```sql
   insert into private.app_config (key, value) values
     ('push_dispatch_secret', '<same as PUSH_DISPATCH_SECRET>'),
     ('reminder_webhook_url', 'https://canvas-creations-and-events.vercel.app/api/push/reminders');
   ```
5. **Supabase Auth → URL configuration:** Site URL is the live site; add `https://canvas-creations-and-events.vercel.app/admin/auth/confirm` (or `/**`) to Redirect URLs.
6. **On a phone:**
   - install the admin app, turn on notifications, send a test;
   - submit a test enquiry and create a reminder a few minutes ahead;
   - try a password reset;
   - re-check a Design save.

## Phase 21 — Fix Website Save UX, Enable Enquiry Email Delivery & Make Production Push Notifications Reliable

**Date:** Sunday 27 September 2026, about 6 pm Adelaide time (08:37 UTC).
**Code commit:** `cee177d`.
**Migration:** `20260927080139_notification_checks.sql`, pushed to the hosted database.

**Where it stands:**
- Everything below was built and tested **locally**.
- In production:
  - the migration is pushed;
  - the live push secret and reminder URL are set in `private.app_config`;
  - the Vercel environment variables, the Resend key and all real-device tests are **still pending** (see the end of this entry).

### 1. Website editor: one explicit-save model

**Before:** text was already a draft until Save, but two things wrote to the database the moment they were chosen:
- style presets (a text's style, a section's background/spacing);
- the on-page **Change photo / Remove photo** buttons.

**Now:** every editor change is a draft until a Save action writes it.

- **Style presets are drafts** (`editor-context.tsx`).
  - They're kept as a draft map over the saved styles, applied live on the page and marked "Unsaved".
  - Choosing the saved style again clears the draft.
  - Saved by:
    - the text's inline **Save**: the text and its style in one go;
    - **Save section**: the section's own style and its texts' styles, and only those;
    - toolbar **Save** / **Save and leave**: everything.
  - A style save sends the saved map plus only the chosen presets; the server returns what it stored, and that becomes the saved state. Other unsaved presets stay drafts.
- **Photos on the page are drafts** (`editor-media.tsx`).
  - The choice shows at once, laid over the server-rendered photo (the preview uses the photo's signed URL), with "Unsaved photo" and **Undo**.
  - Removing shows a note that the placeholder appears once saved.
- **Toolbar states** (`editor-shell.tsx`), exactly these four:
  - **Unsaved changes** — "N unsaved changes, not on the website yet"
  - **Saving…** — while a save runs
  - **Saved** — only after the server confirmed
  - **Not saved** — "still on the page", with the reason in the alert line
  - Link and form notices ("Links are turned off while editing") are their own kind, so they never show as "Saved".
- **Server confirms what it stored** (`content/actions.ts`):
  - Singleton saves select back the columns they wrote and compare them (`stableJson`, key-order-safe).
  - Style saves compare the stored jsonb.
  - A mismatch returns "couldn't be confirmed as saved" instead of success.
  - Cache invalidation is unchanged (`updateTag("cms-content")` plus the editor path).
- **Unchanged:**
  - drafts are discarded on reload, with the browser's leave warning;
  - the Exit dialog;
  - Preview mode, keyboard shortcuts and focus return;
  - Save is disabled only when there's nothing unsaved;
  - collection-item forms keep their own Save.
- **Still immediate, as explicit buttons:** Publish/Unpublish, Move, Delete (confirm dialog) and media upload/delete.

### 2. Enquiry email

- The existing Resend path is kept.
  - Order: store first, then email.
  - The visitor always gets success once stored.
  - Reply-To is the visitor.
  - The sender and recipient come only from server env.
  - HTML is escaped.
  - The idempotency key is `enquiry-notification/<id>`, with one retry on transient errors using the same key.
- `deliverEnquiryEmail()` is now the single delivery function, used by enquiries and by the Settings test. It returns Resend's error text (never the key).
- **Settings → Email notifications** (super admins only) shows:
  - Configured / Not configured (with the names of any missing variables);
  - the sender;
  - recipients, masked (`ow•••@example.com`);
  - the last test (stored in the new `notification_checks` table).
- **Send test enquiry email**:
  - sends a real email through the same path;
  - "[Test]" subject, sample details, a `test-<uuid>` reference;
  - Reply-To is the signed-in admin;
  - creates **no enquiry**;
  - shows Sending… → Sent / Failed with Resend's reason.
- **Finding:** Resend rejects the `RESEND_API_KEY` in `.env.local` with **"API key is invalid"**, and the account has **no verified domain**. So production email can't work until a new key is created. The owner chose Resend's test sender (`onboarding@resend.dev`) for now, which only delivers to the Resend account's own address.

### 3–6. Push notifications

- **Settings → Push notifications:**
  - Turn on (the permission prompt only after the click);
  - Notify me about **New enquiries** / **Calendar reminders**;
  - **Send test notification**;
  - Turn off;
  - **Diagnostics for this device**: browser support, service worker registered, permission (Granted / Denied / Not asked yet), push subscription Active/Missing, subscription stored, push keys configured, last test (Delivered / Sent, not confirmed / Failed / Never tested, stored per device in `push_subscriptions.last_test_*`).
- **The test is end to end:**
  1. It checks every step on the device and names the failing step.
  2. The server sends a real push carrying a `testId` and records "sent" only if the push service accepted it.
  3. The service worker reports back once `showNotification()` ran.
  4. Only then does the page say **"Delivered: the test notification was shown on this device."** and record it.
  5. With no confirmation within 20 s it says so and points at the device's notification settings.
  - An expired subscription (404/410) is revoked and explained.
- **New-enquiry push:** unchanged architecture ("New enquiry", name · date, opens `/admin/enquiries/<id>`, sent after the response).
  - Test pushes don't raise the in-app "New enquiry" toast.
- **Sound:** notifications stay non-silent (`silent: false`, `renotify`, vibrate). The Settings text explains that sound, volume, Focus/Do Not Disturb and battery limits are the device's decision, and that a custom sound isn't possible.
- **Logging:**
  - What's logged: subscription saved; targets per kind with count; dispatch attempted; accepted by the push service; delivery failed with status; endpoint revoked; new enquiry alert with the enquiry id; test result; reminders.
  - Only the push service host (e.g. `fcm.googleapis.com`), status codes and ids.
  - Never endpoints, keys, secrets, emails, phones or messages (tested).

### 7. Phone

Unchanged. The Phase 20 rules are still enforced in the form, Zod, the server action and RLS. Tested again: `+61 (400) 123-456` is stored as typed.

### Tests actually run (local: production build + local Supabase)

For these runs, Resend was replaced by a local mock API (`RESEND_BASE_URL`, which records the exact request). Push used the **real** Chrome push service for the headless browser, plus a local HTTPS mock push service for the dispatch and 410 checks.

| Suite | Result | Covers |
| --- | --- | --- |
| `e2e21.mjs` (new) | **69/69** | See the breakdown below. |
| `miss21.mjs` (new; a second server with no email settings) | **5/5** | The enquiry is still stored and successful; no email attempted; logged as skipped with the id only; Settings says Not configured and lists the three missing variables. |
| `stale21.mjs` (new) | **3/3** | The editor Save is sent with an unknown action id (the real server "action not found" path) → "Not saved" plus "This page is out of date… Reload the page"; the draft is kept; the DB is unchanged. |
| `e2e20.mjs` (Phase 20 regression) | 66/67 | The one failure was the Phase 20 assertion on the old push log format (the line now includes the enquiry id). The assertion was updated and matches this run's log; the full suite wasn't re-run afterwards. |
| `e2e19.mjs` | 28/28 | Phase 19 regression. |
| `disabled19.mjs` | 17/17 | Phase 19 regression. |
| Admin smoke | 33/33 | Every admin page loads for the right roles. |

`e2e21.mjs` covers:
- **Editor:**
  - editing: Unsaved changes, no request, DB and public page unchanged;
  - reload: warning, then the draft is discarded;
  - editing back to the saved value: Save disabled;
  - Save: Saving…, repeated clicks send 1 request, Saved only after confirmation, DB and public page updated;
  - offline save: Not saved with the reason, draft kept, Save available, DB unchanged, retry succeeds;
  - text and section styles stay drafts (no request, DB and public unchanged) until Save section or Save;
  - no editor/Settings strings in the public bundle.
- **Email:**
  - status with the recipient masked; the API key never in the page;
  - test email: Sending…, "[Test]" subject, to the business, Reply-To the admin, every row including the event date, no enquiry created, result recorded; failure shows Resend's reason and survives a reload;
  - public enquiry: stored with the phone; exactly one email keyed by the enquiry id; Reply-To the visitor; full content; HTML escaped; the configured sender;
  - a failing email still gives the visitor success; the retry reuses the same key.
- **Push:**
  - no permission request on load; diagnostics before and after;
  - subscription stored, with no duplicate on reload;
  - test: the push service accepted it and the page said Delivered via the service worker (the real push service reached headless Chrome);
  - new-enquiry push is encrypted (aes128gcm), VAPID-signed, urgency high;
  - a 410 endpoint is revoked;
  - logs contain the expected lines and no personal or secret data.
- **Roles:**
  - a plain admin is refused test email and test push server-side and sees no controls;
  - with no session, requests are refused.
- No console errors.

Final gate: `bun install --frozen-lockfile`, typecheck, lint, build, `git diff --check`, `supabase db lint`: all clean.

### Production: done so far

- Migration `20260927080139_notification_checks.sql` pushed (after a dry run).
- Fresh production VAPID keys and a 64-character dispatch secret generated (not the local ones), kept outside the repo.
- The live `private.app_config` now has `push_dispatch_secret` (the same value as Vercel's `PUSH_DISPATCH_SECRET`) and `reminder_webhook_url` = `https://canvas-creations-and-events.vercel.app/api/push/reminders`.
- **Vercel CLI:** the owner logged in and the project was linked (`vercel link`).
  - The link appended a `VERCEL_OIDC_TOKEN` line to `.env.local`; existing values are untouched and the file is still ignored.
  - It also appended `.vercel` / `.env*` to `.gitignore`. Those were reverted: the existing rules already cover them, and the extra `.env*` would have cancelled the `!.env.example` exception.
- **Vercel Production env, set through the CLI (values piped in, never printed):**
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`;
  - `VAPID_PRIVATE_KEY` (sensitive);
  - `PUSH_DISPATCH_SECRET` (sensitive);
  - `RESEND_FROM_EMAIL` = `Canvas Creations <onboarding@resend.dev>` (Resend's test sender, the owner's choice until a domain is verified).
- **Findings in Vercel:**
  - **`RESEND_API_KEY` was never set in Production**, so production could never send enquiry emails (on top of the local key being invalid).
  - `ENQUIRY_NOTIFICATION_EMAIL` exists (Production and Preview), but its value is hidden and hasn't been checked.
- These variables only take effect after the next deploy. **Nothing has been redeployed yet.**

### Production: still needed (not done yet, so not claimed)

1. **From the owner:**
   - the Resend login email → it becomes `ENQUIRY_NOTIFICATION_EMAIL` and `VAPID_SUBJECT` (`mailto:`);
   - a **new Resend API key**, added by the owner in Vercel as `RESEND_API_KEY` (Production, sensitive), so it never passes through the chat.
2. Then `git push` (deploys `cee177d` / `6ea24e9` and later commits with the new variables).
3. **Live tests:**
   - editor draft / reload / Save / style;
   - test email and a real enquiry email (content, Reply-To);
   - on a real phone: install, turn on notifications, test notification with the app open and closed, a real enquiry push (tap opens it), a calendar reminder;
   - on iOS, only from the Home Screen app.

## Phase 22 — Signature Motion, Pricing Packages, Portfolio Gallery & Video Experience

**Date:** Thursday 1 October 2026, about 2:50 am Adelaide time (30 Sep 17:20 UTC).
**Migration:** `20260930164505_pricing_films_portfolio.sql`.

**Status:** built and tested **locally only** (production build + local Supabase).
- The migration has had a **dry run** against the hosted database (it lists only this migration) but has **not been pushed**.
- The code hasn't been deployed.
- No pricing, photo or video content was added anywhere: the live site gets these sections only once the owner adds real content.

### Database (`20260930164505_pricing_films_portfolio.sql`)

- **`pricing_packages`** (new CMS collection).
  - Fields: title, unique slug, optional description, and `price_type` (`fixed` | `starting_from` | `custom_quote`).
  - `price` is `numeric(10,2)` in AUD, > 0 and ≤ 1,000,000. A quote has no price; a fixed or "from" price must have one (`pricing_packages_quote_price_check`).
  - Optional `price_prefix` (≤ 40) and `price_suffix` (≤ 60).
  - `features text[]`: 0–12 single lines of ≤ 200 characters, checked by `public.cms_line_list_ok`.
  - Optional `cta_label`, `is_featured`, `sort_order`, `is_published`, timestamps.
  - The brief's `order` / `published` / `featured` use the project's existing names (`sort_order` / `is_published` / `is_featured`).
  - **Nothing is seeded.** No HTML/CSS is stored.
- **`films`** (new collection): a YouTube/Vimeo library video plus a title, caption, featured flag, order and published flag.
  - `unique (video_media_id)`: the same video can't be listed twice.
  - A trigger copies the video's provider. A composite FK to `media_assets (id, kind, provider)` plus a check allows YouTube/Vimeo only. `on delete restrict`: a video in use can't be deleted.
- **`media_assets.poster_media_id`**: a video's cover image, chosen from the library.
  - FK to `(id, kind='image')`, `on delete restrict`; only allowed on videos.
  - The cover belongs to the video, so it's the same wherever that video appears.
- **Old single video:** a video set in `video_story` would be carried into `films` (published, featured) with its poster moved onto the video, and the old columns cleared. Hosted and local had no video, so this was a no-op; it's kept for safety. `video_story` now holds only the Films section's wording.
- **RLS** for both new tables, identical to the other collections:
  - visitors read published rows only;
  - admins read/insert/update/delete;
  - no public writes.
- **Public media access** extended to films' videos, and to covers of *published* films via `private.is_published_film_poster()`. That helper is `SECURITY DEFINER` because a policy on `media_assets` can't query `media_assets` without recursing.
- **New wording:**
  - `home_content`: `pricing_eyebrow` ('Pricing'), `pricing_title` ('Packages'), `pricing_description` (null), `gallery_intro` (null), `gallery_filter_all` ('All');
  - `site_settings`: `nav_pricing` ('Pricing'), `nav_films` ('Films').
- **PostgREST limitation found:** it can't embed `media_assets` in itself through that composite FK (`PGRST200`), so covers are loaded with a second query by id (public loader, editor, media library).

### A. Hero signature animation (pure CSS, `globals.css` "Hero signature")

- **Sequence:**
  - text rises in (existing `animate-rise`, staggered);
  - the photo is revealed through a soft upward clip wipe while settling from scale 1.03 to 1;
  - the gold hairline frame draws in from its corner;
  - desktop only (≥ 1024 px, where scroll timelines are supported): the photo drifts up about 2 rem over the first 70 vh of scrolling. It's a scroll-driven CSS animation, with no scroll listeners.
- **Mobile:** reveal and settle only, no parallax.
- **Reduced motion:** none of it runs; everything is static and visible.
- Only transform, opacity and clip-path are animated. The image loading strategy is unchanged (eager, high priority). The server HTML has no inline `opacity:0`, and the hero renders complete with JavaScript disabled.

### B. Pricing

- **Admin:** `/admin/content/pricing` comes from the existing generic collection pages, with list, add, edit, reorder, publish/unpublish, delete (confirm dialog), unsaved and pending states, and validation. Form (`PricingForm`):
  - the price type select hides the amount for quotes;
  - the amount is typed as text ("1,500", "$1,500.50");
  - "included" takes one item per line;
  - optional button text;
  - "Highlight this package".
- **Public** (`sections/pricing.tsx`), `#pricing` after Services:
  - editorial columns: Cormorant titles and prices, Manrope text, hairline borders, one highlighted package (ivory with a gold inner hairline), no shadows or gradients;
  - 2 packages sit side by side, 3+ in threes; one package gets a single two-column feature layout; zero packages render nothing;
  - on phones everything stacks.
- **Price rules** (`formatPackagePrice`): `$1,500` · `From $1,500` · `Custom quote`.
  - Optional words go before/after; never `$0`.
  - Amounts carry "(Australian dollars)" for screen readers.
  - Every package links to `#enquire`.

### C. Portfolio (gallery)

- **Content:** every published photo (up to 24), featured first (the first is the large lead), from the media library with its alt text.
  - "Featured" for gallery photos now means "shown first and larger", no longer "on the homepage".
- **Layouts:**
  - Desktop: lead photo (7 columns, 2 rows), two beside it, a pair beneath, then threes with varied shapes.
  - Tablet and phone: lead full width, the rest in pairs; a trailing single photo spans the width.
  - One photo: a centred single composition. Two photos: a pair.
  - `next/image` with specific `sizes`; lazy below the fold.
- **Category filter:**
  - Only shown with **three or more** categories that actually have photos (none are seeded).
  - `aria-pressed` buttons, 44 px targets, a live "Showing N photos: …" message.
  - Filters in place without a reload (a CSS rule keyed to the chosen slug). While filtered the grid becomes even, so there are no gaps. Remaining photos fade in lightly (not with reduced motion).
- **Wording:** the "All" label and an optional intro under the heading.

### D. Lightbox (`sections/gallery-lightbox.tsx`, Radix dialog, no new library)

- Accessible dialog:
  - labelled "Photo N of M" plus the photo's title;
  - visible Close; Escape closes;
  - focus trap; focus returns to the photo that opened it;
  - scroll lock.
- **Navigation:**
  - ArrowLeft/ArrowRight and Previous/Next (icon-only on phones, with spoken names, 44 px), wrapping from last to first;
  - **swipe** on touch;
  - steps only through the photos currently shown by the filter;
  - each change is announced in a live region.
- Only the current photo is loaded. A tap on the dim area closes it. The backdrop is now opaque (the page used to show through).

### E. Films (`#films`)

- The featured film is shown large and plays in place (existing click-to-load player).
- Other films are cover cards. **Play** opens a dialog with the provider's player, 16:9, sized to fit both portrait and landscape phones.
  - Closing it (button, Escape, backdrop) **unmounts the iframe**; focus returns to the card.
- No iframe exists before Play. YouTube uses the privacy-enhanced domain, Vimeo uses `dnt=1`, and nothing autoplays with sound.
- A film without a cover shows the Canvas monogram (no third-party thumbnail).
- The section and its menu link only appear once a film is published.
- The admin page `/admin/content/video` now edits only the section's wording, pointing to Content → Films.

### F. Media library

- **Photos:** new **Replace**. You upload a new file for the same library entry, so every use shows it. The alt text is kept (editable), and the old file is removed from storage.
- **Videos:** each shows its cover, with **Choose/Change cover photo** (the existing media picker, including upload), **Remove cover** and **Edit title**.
- **"Used by"** now includes `Homepage Films: <title>` (with "(draft)") and `Cover of the video "<title>"`. Delete stays blocked while anything uses an item, and the database enforces it too.

### G–I. Editor, styles and menu

- **Visual editor:**
  - Pricing section: label, heading, optional text; packages edited in place like other lists.
  - Portfolio: optional intro and the "All" label.
  - Films: label, heading, and films edited in place.
  - Section panels have **list-wide text styles**: package names, prices, package text, package buttons, film titles, film captions. They're drafts until **Save section** or the toolbar **Save** (the Phase 21 rule; nothing auto-saves).
- **Style keys added:** `home.pricingEyebrow/Title/Description`, `pricing.packageTitle/Price/Body`, `pricing.cta`, `home.galleryIntro`, `gallery.filter`, `films.title`, `films.caption`; and section key `pricing`.
- **Menu:** Pricing (after Services) and Films (after Gallery) appear only while they have published content.
  - The public layout checks with two count-only queries (`getSectionAvailability`).
  - The editor uses the same rule, and the labels are editable in Site details.

### Tests actually run (local only)

- **Test content:** created by `seed22.mjs` (local only): generated test-pattern images labelled "TEST n" (not photos), 3 "Test …" categories, 3 test packages, 3 test films on public YouTube/Vimeo ids. It was removed afterwards; local content is back to empty.
- **Screenshots** were taken at 1440/768/390 for pricing, portfolio, filtered portfolio, films, the lightbox and the film dialog. The layout was reviewed from these. The only issue found (see-through dialog backdrop) was fixed.

| Suite | Result |
| --- | --- |
| `e2e22.mjs` (new) | **74/74** — animation, pricing, portfolio, films, media library, editor, bundle (breakdown below) |
| Phase 20 `e2e20.mjs` | 67/67 (server run without email settings, as that suite expects) |
| Phase 19 `e2e19.mjs` / `disabled19.mjs` | 28/28 · 17/17 |
| Admin smoke | 33/33 |
| Stale action (`stale21.mjs`) | 3/3 |
| Phase 21 `e2e21.mjs` | **not re-run**: it needs the local Resend and push stand-ins, which Claude Code stopped for low memory and which weren't restarted. The editor code it covers was re-tested through `e2e19`, `stale21` and `e2e22`. |

`e2e22.mjs` covers:
- **Animation:**
  - desktop sequence (reveal, settle, frame, depth); ends at opacity 1 and scale 1;
  - mobile has no parallax; reduced motion runs no animation;
  - server HTML has the hero text; everything renders with JavaScript disabled;
  - no overflow at 375/390/430/768/1024/1280/1440.
- **Pricing:**
  - 3 / 1 / 0 packages (and the menu link);
  - fixed, from and quote formats, never `$0`; enquiry links; features as a list;
  - RLS: drafts hidden and anon insert refused; a non-admin create is refused server-side; the database refuses a missing or 0 price;
  - admin create with both validation messages, then edit, reorder, publish, delete, and the delete confirmation.
- **Portfolio:**
  - lead layout, alt text, lazy loading;
  - filter (only that category, no reload, announced, even grid);
  - lightbox: filtered count, label and count, close control, one image, focus inside, scroll lock, arrows both ways, wrap, Next button, Escape with focus restored;
  - mobile swipe and fit;
  - one photo and no photos.
- **Films:**
  - featured and cards, covers, Canvas cover fallback;
  - YouTube player only after Play;
  - Vimeo dialog, iframe removed on close, focus restored; phone fit at 16:9;
  - duplicate link gives the same entry; invalid link refused; duplicate film refused;
  - one film and no films (with menu); cover removed and re-set;
  - anon sees a published film's cover but not unused images.
- **Media library:** covers, "Used by", disabled delete; Replace keeps the id, stores a new file and deletes the old one.
- **Editor:**
  - pricing heading draft (no request, DB and public unchanged), reload discards, offline "Not saved", then Save reaches the DB and the public page;
  - portfolio intro and films heading saved;
  - a package edited in place;
  - package-name style stays a draft until Save section, then appears in the public CSS.
- **Bundle and console:** no admin/editor strings in the public bundle; no console errors.

Final gate (hosted env): `bun install --frozen-lockfile`, typecheck, lint, build, `git diff --check`, `supabase db lint`: all clean.

### Production: migration pushed

The owner approved it. After a dry run (listing only this migration), it was pushed with `supabase db push`, and `migration list` shows local and remote in sync. Checked on the hosted database:
- RLS is on for `pricing_packages` and `films`, with the five policies each (public reads published; admins add/read all/edit/delete).
- Both tables are empty: no content invented.
- New wording: Pricing / Packages / All; menu labels Pricing / Films; `media_assets.poster_media_id` exists.
- Anonymous REST reads of both tables return `[]`. Anonymous inserts into both are refused (`42501`).
- The live site (old code, additive migration) still returns 200 with the Adelaide address.

### Production: not done yet (not claimed)

1. Deploy the code (`git push`). The migration it needs is now live.
2. After deploy, check the live homepage, menu and editor. Pricing and Films stay hidden and the portfolio shows its empty state until the owner publishes real content.
3. With real content, verify on a phone: gallery layout, lightbox (swipe), filter (once there are three or more categories), video playback, pricing layout, and the editor's Save behaviour.

### Remaining limitations

- The scroll-depth drift needs CSS scroll timelines. Browsers without them (e.g. Firefox today) simply don't drift; the entrance still runs. Tested in Chrome.
- The filter hides at fewer than three categories, by design.
- Uploaded video ("stream") still isn't configured, so films are YouTube/Vimeo only.
- The portfolio shows up to 24 photos on the homepage.

### Follow-up: Home link and logo scroll back to the top (owner's report)

**Problem:** on the homepage, clicking the logo or "Home" did nothing. The header, logo and footer used Next's `<Link href="/">`, which ignores a link to the page you're already on (for example at `/#gallery`, or after scrolling). The mobile menu's Home did a full page reload instead.

**Fix:**
- `SiteLink` now renders `HomeLink` (`src/components/shared/home-link.tsx`) for `/`. On the homepage it scrolls to the top: smoothly, or instantly with reduced motion, following the page's existing `scroll-behavior`.
- It also drops any `#section` from the address. From any other page it navigates normally.
- The mobile menu uses the same helper (`scroll-home.ts`) after the menu closes.

**Tested locally** (`home22.mjs`, 6/6):
- logo, header Home and footer Home, from a scrolled `/#gallery`: top, address `/`, no reload;
- mobile menu Home from `/#faq`: menu closes, top, no reload;
- logo from another page: goes to the homepage;
- keyboard Enter on the logo.

Typecheck, lint and build are clean. Not yet checked on the live site; it needs the next deploy.

### Follow-up: hero monogram without its panel (owner's request)

**Request:** the hero placeholder shown while no hero photo is set (ivory panel, gold frame, small CC monogram): remove the background and show only the CC logo, larger.

**Change:**
- **No panel or frame:** the placeholder is now just the monogram on the page background. The gold hairline frame renders only when a real hero photo is set.
- **Larger:** about 433px wide at 1440, 345 at 1024, 424 at 768 and 277 at 390, up from about 185px at 1440. Its reveal animation is unchanged.
- **Truly transparent image:** the original `canvas-creations-monogram.png` has an opaque near-white background (78% of its pixels are opaque), which is the light box the ivory panel used to hide.
  - The new asset, `public/images/logo/canvas-creations-cc-mark.png` (775×533), was made from it by converting white to transparency, which keeps the gold and pink edges smooth on the white hero background.
  - It was then trimmed to the artwork, and 192 near-invisible specks of noise were removed, including one visible above the top-right leaf.
  - The original file is untouched and still used elsewhere (About placeholder, film cover fallback).
- **Limitation:** this artwork is made for a light background. If the hero section's style were set to the dark tone in the editor, the colour-to-alpha conversion would make the pink look deeper.

**Tested locally:**
- Screenshots at 1440/1024/768/390: no box, no frame, no overflow.
- `e2e22.mjs` still passes 74/74 (hero check updated: the frame is absent when there's no photo).
- Typecheck and lint are clean.

## Phase 23 — Realistic Sample Content, Editorial Event Showcase & Bi-Directional Scroll Motion

**Date:** 1 October 2026 (Adelaide).
**Migrations (both pushed to the hosted database; local and remote in sync):**
- `20260930175156_event_stories_sample_content.sql`
- `20260930182828_set_story_images.sql` (code-review fix)

**Code:** committed and pushed to GitHub with this entry, so Vercel deploys it together with Phases 21–22 and the follow-ups (they were unpushed until now).

### Why the owner saw "nothing" before this push

- GitHub/Vercel were still on `298d1e2` (Phase 20); seven local commits hadn't been pushed.
- The live database had no pricing, photos or films, and Pricing, Films and Stories only appear with published content.
- The local dev server (port 3000) uses `.env.local`, which points at the **live** database, so it was empty too.

### Database

- **Sample flag (`is_demo`)** on `gallery_items`, `categories`, `films` and the new `event_stories`:
  - the admin shows **SAMPLE / DEMO CONTENT**;
  - the site shows a small **"Sample"** label, which screen readers hear as "Sample image, not a Canvas Creations event";
  - a note under the portfolio and stories headings reads "Sample imagery is shown while our portfolio is being prepared." (editable).
- **`media_assets.credit` / `credit_url`:** where a library photo came from. Shown in the media library ("Source: Pexels") and the lightbox caption.
- **`event_stories`:**
  - title, unique slug, description, category, main photo (FK, `on delete restrict`), optional location, styling notes (0–12 lines), optional testimonial (FK to `testimonials`), `is_demo`, featured, order, published;
  - **`event_story_images`:** ordered extra photos, FK `on delete restrict`;
  - RLS: public reads published stories and their photos; admins manage them; no public writes;
  - public media access includes photos of published stories.
- **Wording:** `home_content.stories_eyebrow` ("Event stories"), `stories_title` ("A celebration, up close") and `sample_notice`.
- **Review fix:** `public.set_story_images(story, media[])` (`SECURITY INVOKER`, so admin RLS applies) replaces a story's photos in one transaction. Previously a failed save could lose them.

### Sample content (live and local): licensed stock, clearly marked

- **Source:** 18 photos from **Pexels** (free to use; each photo's Pexels page is stored as its credit). All are decor only: no identifiable people, no one else's names or monograms, no religious figures. Picked for one coherent blush, gold and ivory look: birthdays, weddings, mandaps, an engagement neon sign and a rose wall, baby shower balloons, dessert tables. One photo was cropped to remove a blurred arm at the edge.
- **Processing:** like the app's own uploads (≤ 2400 px, metadata stripped, JPEG q82), with factual alt text.
- **Content, all `is_demo`:**
  - 5 categories: Birthdays, Weddings, Cultural celebrations, Engagements, Baby showers;
  - 16 portfolio photos;
  - 3 event stories: "Blush and gold birthday", "Garden-inspired wedding reception", "Floral mandap ceremony". Each has a factual description of what the photos show and styling notes, and **no testimonial, client, date, place or claim**.
- **No sample films:** there's no licensed sample video in the supported YouTube/Vimeo form, and using someone else's channel would misrepresent it. The Films section stays hidden until real films are added.
- **No sample pricing:** no invented prices. The section appears when real packages are published.
- **How it got to live:**
  - photos uploaded with `supabase storage cp --linked` (the CLI's own access; no key in any file);
  - rows inserted in one transaction with `supabase db query --linked`.
  - Checked on the live database: 18 photos (credit Pexels), 16 portfolio items, 3 stories with 8 extra photos, 5 categories.
- **To remove all sample content later:** unpublish or delete it in the admin, or run the prepared clean-up SQL (`prodsample.mjs cleansql`: sample stories, gallery items, categories and Pexels photos).
- **Replacing it with the real thing:** edit the item, swap the photo, title and description, attach a real testimonial, and untick "Sample / demo content". Tested (see below).

### Event stories (`sections/event-stories.tsx`)

- **Magazine-style layout:**
  - a large main photo opening through a soft mask;
  - text beside it (category, title, description, "Styling" notes, optional location);
  - photo and text swap sides on alternate stories (desktop);
  - supporting photos below, drifting at two rates on desktop;
  - an editorial hairline drawn between stories.
- **Testimonial:** "What they said" appears **only when a published testimonial is attached**. This reuses the existing testimonials list, not a second system; the old standalone "Kind words" section stays removed.
- **Lightbox:** each story's photos open in the existing lightbox, with "Sample image · Pexels" in the caption.
- **Admin:** Content → Event stories (list, create, edit, reorder, publish, delete, sample badge). The form has a main photo, **"More photos"** (an ordered list with add, move and remove, via the existing picker including upload), a styling list, and a testimonial select (drafts marked "not shown").
- **Editor:** in-place editing with the section's wording and list-wide text styles (category, title, text, quote), all drafts until Save.

### Homepage order (Discover → Explore → Trust → Enquire)

Hero → Intro → Services → Pricing (when published) → Categories → Portfolio → **Event stories** → Films (when published) → Process → Why Canvas → **About** (moved after Why Canvas) → FAQ → Enquiry → Contact.

### Scroll motion: linked to scroll position, in both directions (`globals.css` "Scroll motion")

Every effect is a CSS scroll-driven animation (`animation-timeline: view()` / `scroll(root)`). Scroll progress *is* animation progress, so scrolling back up reverses it exactly. There are no scroll listeners, no React scroll state and no new client components.

| Effect | Where |
| --- | --- |
| `.reveal`: fade and rise (32 px desktop, 16 px phones; entry → 30 % cover) | all sections (services rows stagger naturally by position) |
| `.reveal-mask`: clip opens 14 % → 0 while the image settles 1.07 → 1 | portfolio lead photo, story main photos, About photo |
| `.reveal-line`: hairline draws across | between stories, intro divider (from the centre) |
| `.drift` / `.drift-slow`: ±24 / ±12 px while crossing the viewport (desktop only) | portfolio and story supporting photos |
| Hero: text eases up 2.5 rem and softens to 0.55 opacity over the first 85 vh (0.75 rem on phones); photo drifts up 2.5 rem and frame 1 rem the other way (desktop) | hero |

Hero on load (time-based, unchanged): text rises, photo mask and settle, gold frame draws.

**Safety:**
- Only opacity, transform, translate, scale and clip-path are animated.
- Everything is inside `@media (prefers-reduced-motion: no-preference)` and `@supports (animation-timeline: …)`. With reduced motion, or in browsers without scroll timelines (e.g. Firefox today), nothing animates and the page is fully visible.
- Content is complete in the server HTML; it works with JavaScript disabled.

### Code review (medium) and fixes

1. **Story photo save not atomic** (delete, then insert): a failure lost photos, left the page stale, and could duplicate a new story on retry. **Fixed:**
   - `set_story_images` runs as one transaction;
   - a new story whose photos fail is removed again;
   - for an existing story, its details keep and the cache is refreshed.
2. **Mask animation held `scale`**, blocking the portfolio lead photo's hover zoom. **Fixed:** the settle animates `transform`, which composes with the hover's `scale`.

### Tests actually run (local production build + local Supabase)

| Suite | Result |
| --- | --- |
| `e2e23.mjs` (new; run twice, the second time after the review fixes) | **42/42** — breakdown below |
| `e2e22.mjs` (Phase 22) | 74/74. One failure on the first run found a real compatibility issue: the new sample flag was required, so saves without it were refused. It now defaults to "not sample". |
| `e2e19` / `disabled19` / smoke / `stale21` | 28/28 · 17/17 · 33/33 · 3/3 |
| `home22.mjs` (Home link) | 6/6. The mobile-menu case needed a longer wait: the page is now much longer, so the smooth scroll to the top takes longer. |

`e2e23.mjs` covers:
- **Page and sample content:**
  - page order;
  - 16 portfolio photos and all story photos labelled Sample; the notice shown;
  - 3 stories, featured first; no testimonial and no invented claims; alt text everywhere.
- **Testimonials and replacing sample content:**
  - a draft testimonial stays hidden, a published one shows in its story;
  - replacing sample content (title, description, photo, category, testimonial, sample flag) and reordering or trimming extra photos: saved in order, "Sample" label gone.
- **Publishing and permissions:**
  - publish/unpublish (the section disappears and returns);
  - RLS on draft story photos; anon can't write;
  - a photo used by a story can't be deleted.
- **Lightbox:** story lightbox (count, arrows, "Sample image" and Pexels credit link, Escape, focus back).
- **Admin:** sample badges in lists, story form (sample flag, main/more photos, testimonial), editor, media library source and usage.
- **Motion:**
  - the mask progresses with scroll (closed → 7.6 % → open), and scrolling back up returns *identical* values at the same positions;
  - hero text eases and returns;
  - fast jumps across the page leave no stuck state;
  - reveals use view timelines; drift and line run on desktop;
  - phones: no drift, no hero depth, 16 px rise, 0.75 rem hero movement;
  - no overflow at 7 widths, also mid-scroll;
  - reduced motion: nothing animates, all visible;
  - all scroll-linked CSS sits under `@supports`;
  - JavaScript disabled: everything renders.
- **Performance:** public bundle has no admin code; below-the-fold images lazy; no gallery preload. Homepage scripts: 18 files, about 1.3 MB uncompressed (the framework; this phase adds no new client components).

Final gate: `bun install --frozen-lockfile`, typecheck, lint, build, `git diff --check`, `supabase db lint`: all clean.

### Still open

- **Production visual check after deploy:** homepage, stories, sample labels, lightbox, motion on a phone.
- **Phase 21:** a new `RESEND_API_KEY`, the Resend login email for `ENQUIRY_NOTIFICATION_EMAIL`, and `VAPID_SUBJECT` are still missing in Vercel. Until then, enquiry emails and push notifications stay "not configured"; enquiries are still saved.
- **Replace sample content with the client's own photos and stories.** Stories stay labelled "Sample" until each is unticked.

## Phase 23 follow-up — In/out scroll motion, Lenis smooth scrolling & strict review

The owner's report: the motion "doesn't look like an animation"; elements should visibly **come in and go out** with the scroll. They also asked for **Lenis** (`lenis` 1.3.26) for the scroll itself. The Lenis docs were read first, a plan was approved, then implemented.

### Motion now comes in AND goes out (`globals.css` "Scroll motion")

Each element has two scroll-linked animations on its own view timeline: one for coming in (entry) and one for going out (exit). Scrolling back up replays both in reverse.

| Effect | In (entry) | Out (exit) |
| --- | --- | --- |
| `.reveal` | fade + rise 64 px desktop / 28 px phones, entry 0 % → cover 35 % | fade + move up 40 / 18 px, exit 25 % → 100 % |
| `.reveal-in` (FAQ, About text, Contact, film player, single package) | as `.reveal` | **none**: tall or interactive blocks never fade while being read or watched |
| `.reveal-mask` | clip opens 22 % → 0, opacity 0.4 → 1, image settles 1.14 → 1 | clip closes from the bottom to 22 %, opacity 0.35 |
| `.reveal-line` | hairline draws across | retracts |
| `.drift` / `.drift-slow` (desktop) | ±48 / ±24 px while crossing the viewport | — |
| Hero (scroll) | — | text moves up 4 rem (1.5 rem phones) and fades to 0.2 over 85 vh; photo / frame depth on desktop |

Measured (desktop, story text block): below 0.04 / +62 px → entering 0.51 / +31 px → in 1 / 0 → gone 0 / −40 px, and identical values on the way back.

### Lenis smooth scrolling (`components/motion/smooth-scroll.tsx`)

- **Where it runs:** public site only, mounted in the `(site)` layout. Not in the admin area or the visual editor.
- **Settings:** `autoRaf`, `lerp 0.1`, `smoothWheel`. `syncTouch` is off, so phones keep native touch scrolling (the Lenis docs flag smoothed touch as unstable on older iOS). Keyboard scrolling stays native.
- **CSS:** `lenis/dist/lenis.css` is imported. CSS `scroll-behavior: smooth` was removed so it doesn't fight Lenis's easing.
- **Reduced motion:** Lenis is never started, and it is torn down if the setting changes while the page is open. Links jump.
- **In-page links** (`/#faq`, also a second click on the same link): glide via `lenis.scrollTo`.
  - They land below the fixed header. Lenis honours `html`'s `scroll-padding-top` itself, so no extra offset is passed (an extra offset doubled it — caught by the test).
  - Focus moves to the section (`tabindex=-1`, no ring) so Tab continues from there.
  - Home/logo and the mobile menu use the same helper (`scrollPageTo`). Without Lenis it falls back to the browser's smooth scroll, or a jump with reduced motion.
- **Pop-ups** (lightbox, film dialog, mobile menu):
  - Radix's `body[data-scroll-locked]` pauses Lenis (`stop()`), and Lenis resumes on close.
  - Dialogs, menus and listboxes are excluded via Lenis's `prevent`, so their own content still scrolls (a stopped Lenis otherwise swallows the wheel).

### Firefox upgrade: scroll-linked there too (`components/motion/scroll-motion.tsx`)

Before, browsers without CSS scroll timelines got a one-shot IntersectionObserver fade. That is replaced. On every scroll frame (Lenis's `scroll` event, plus the native event for keyboard, touch and pages without Lenis), `ScrollMotion` computes each element's progress through the **same `view()` ranges** as the CSS: entry / cover / exit, using layout positions that ignore transforms.

It writes that progress as CSS variables (`--cc-in`, `--cc-out`, `--cc-settle`, `--cc-cover`, plus `--cc-hero` / `--cc-hero-depth` on `html`). `html.js-motion` rules map them to the same opacity, transform and clip values.

So Firefox gets the same in/out, reversible motion, eased by Lenis:
- one read pass and one write pass per frame, and a value is written only when it changes;
- no React state;
- nothing runs where native scroll timelines exist, or with reduced motion;
- the variables default to "in view", so the server HTML stays fully visible.

### Strict code review (high) — findings fixed

1. **Test push confirmation race:** the panel now listens for the service worker's `cc-push` message *before* sending the test push, and removes the listener on every path.
2. **Photo replace in the media library:**
   - reads the old path first and updates only if it is unchanged (`.eq("storage_path", oldPath)`);
   - clears the stock credit, since the new photo is the owner's;
   - removes the old file only after the row is updated.
3. **Pricing form:** switching a package to "custom quote" clears a stale price, which would otherwise fail the quote/price constraint.
4. **Editor visibility notes:** gallery, stories and films are now counted in the public page's order (featured first), so "not shown (limit)" marks the same items visitors don't see.
5. **Dead code removed:** `uploadedVideoConfigured` (editor) and the unused `VideoContent` / `videoStory.video` types.
6. **Missing style key:** the gallery filter buttons' style key is now editable in the Gallery panel.
7. **One source for the menu:** the layout's section availability. The page's copy of the settings no longer recomputes section links.
8. **Fallback load flash and stale observers:** the IntersectionObserver issues (an element near the bottom fading out on load; removed nodes still observed) are moot now that the scroll-linked fallback replaced it.

### Tests actually run (local production build + local Supabase with the sample content)

| Suite | Result |
| --- | --- |
| `lenis23.mjs` (new) | **21/21** — see below |
| `motion23.mjs` | **12/12**: desktop and phone in → out, exact reversal, mask open/close, hero, reduced motion static, fallback writes progress for elements above / in / below |
| `e2e23.mjs` | 42/42 |
| `home22.mjs` (Home link / logo) | 6/6 |
| smoke | 33/33 |

`lenis23.mjs` covers:
- **Smooth scrolling:**
  - Lenis runs on the public site, and CSS smooth scroll is off;
  - a wheel step is eased (12 samples: 47 → 480 px) and settles;
  - wheeling back up returns to the top.
- **Links:**
  - a header link glides to `#faq` (0 → 4386 → 7325 … px) and lands 1 px from the header;
  - the hash updates and focus moves without a ring;
  - a repeat click works;
  - the logo returns to the top and clears the hash.
- **Pop-ups:** with the lightbox open, Lenis is paused and the page does not move under the wheel; it resumes after Escape and scrolling works again.
- **Phone:** the mobile menu pauses Lenis, and its link lands exactly below the header (72 px).
- **Reduced motion:** no Lenis, and links jump straight there.
- **Fallback** (scroll timelines disabled):
  - progress below 0 → entering 0.31 → 1 → out 1, identical on the way back;
  - CSS maps 0.31 to opacity 0.31 and +44 px;
  - the hero progress eases with the Lenis wheel.
- No console errors.

Typecheck and lint: clean. Production build: OK.

### Still open

- Production visual check after this deploy (wheel smoothness, motion in/out on a phone and in Firefox).
- Everything still open in Phase 23 above (Resend / VAPID settings in Vercel; replacing sample content).

## Phase 24 — Calendar & date picker for phone and desktop, client requests

The owner reported two problems: the date picker only had month arrows, so changing the month or year was slow, and the admin calendar didn't work well on phones.

### Date picker (`components/ui/date-picker.tsx`, `ui/month-year-panel.tsx`)

- **Month heading opens a month-and-year grid.** Tapping "October 2026 ▾" shows a year stepper over 12 months, so any month or year is one or two taps away. The arrows still step one month.
- **Limits.** On the enquiry form, past dates, past months and past years are disabled (it keeps `disablePast`). Dates can be chosen up to 5 years ahead.
- **Shortcuts.** "Go to today" appears while another month is shown. "Clear date" appears when a date is set; reminders turn it off.
- **Re-tapping the chosen day** keeps it and closes the picker.
- **Phones (< 640 px):** a bottom sheet titled with the field name, with 50 px days and 48 px month buttons. It is safe-area aware.
- **Wider screens:** a popover under the field.
- **Keyboard:** focus starts on the chosen day, and the arrow keys move between days. Escape closes and returns focus to the field.
- **Where it's used:** the public enquiry form, and now the admin reminder dialog. It replaces the browser's native date input there, so all admin and public date fields look and work the same. Past dates are allowed for reminders.

### Admin calendar (`components/admin/calendar-view.tsx`)

- **Month heading (all sizes)** opens the month-and-year picker and jumps there.
- **Phones (< 768 px).** A compact month grid replaces the old "list of busy days":
  - 48 px day buttons;
  - up to 3 dots per day: rose = enquiry, gold = reminder, red = overdue, grey = done;
  - today is outlined and the chosen day is filled;
  - arrow keys, Home and End move between days;
  - **swiping left or right changes month**;
  - the chosen day's enquiries and reminders are listed under the grid, with "Add" for that day.
- **Desktop and tablet grid:**
  - "+N more" opens a popover with all of that day's items (it used to say "see Agenda");
  - the per-day "+" is always visible on touch screens (`pointer-coarse`), since hover can't reveal it there.
- No sideways scroll at 320, 375, 768 or 1024 px.

### Client requests

- **"Corporate events" in "What we style":** migration `20261001090000_contact_email_corporate_events.sql` adds it as a real, published category (not sample), after the existing ones. It is idempotent.
- **Email `ccandevents2242@gmail.com`:**
  - The same migration adds `site_settings.contact_email`, with a format check (≤ 254 chars).
  - It is editable in **Site details → Contact details** and in the visual editor (Contact panel, Header & footer). An empty value hides it everywhere.
  - It is shown in the Contact section (Email row), the footer, the mobile menu, the enquiry form's "couldn't send" message, the error page, and Google's business details (JSON-LD `email`).
- **One place for contact details** (owner's question): phone, email, address and social links all come from Site details. The public error page used to read the built-in defaults. It now gets them from the layout through a small context (`components/shared/site-contact.tsx`), so nothing on the public site hard-codes them any more.
  - FAQ answers are written text: if the number changes, edit those answers too.

### Tests actually run (local production build + local Supabase)

| Suite | Result |
| --- | --- |
| `cal24.mjs` (new) | **42/42** — see below |
| `client24.mjs` (new) | **12/12** — see below |
| `e2e23.mjs` | 42/42 (after re-seeding the sample content; the suite trims a sample story's photos and can't simply be re-run) |
| `lenis23` / `home22` / smoke | 21/21 · 6/6 · 33/33 |
| `e2e20.mjs` (calendar part) | Calendar checks pass. Its reminder step was updated for the new picker, and its phone check for the compact grid. Its other failures were stale test state: it changes the local test admin's password (restored) and needs a freshly reset database. |

`cal24.mjs` covers:
- **Date picker, desktop:** popover, month/year grid, past months and years disabled, picking a day, reopening on that month, "Go to today", keyboard, Escape, "Clear date".
- **Date picker, phone:** bottom sheet at full width, 50 px days, 48 px months, pick and close.
- **Admin calendar, desktop:**
  - full grid, "+2 more" popover with all 5 items, month/year jump;
  - reminder dialog: the new picker, a day picked and saved on that day.
- **Admin calendar, phone:**
  - compact grid; today selected and listed; 3 dots on a busy day; tap lists all 5;
  - arrow keys; "Add" on the chosen day; the date sheet over the dialog;
  - swipe to the next month and back; no sideways scroll at four widths.

`client24.mjs` covers: Contact / footer / mobile-menu email, JSON-LD email, the Site details field, an invalid email refused, empty hides it everywhere, and Corporate events listed once the cache refreshes.

Typecheck, lint, `supabase db lint`, build: clean.

### Production notes

- **Order matters:** push the migration **before** the code deploy. The new code reads `contact_email`; without the column the site falls back to built-in details until it exists.
- **After the deploy, open Admin → Site details and press Save once.** That refreshes the cached content, so "Corporate events" and the email show straight away instead of after the hourly refresh.
- **Optional:** set Vercel's `ENQUIRY_NOTIFICATION_EMAIL` to the client's address, so enquiry emails go there.

### Follow-up: Corporate events missing from "Our work" (owner's report)

**What was missing:**
- The portfolio filter only lists categories that have photos, and Corporate events had none.
  - "Our work" had no Corporate events button or photos.
  - Event stories had no corporate story.
- Only "What we style" showed the new category.

**What was added (sample content, like Phase 23):**
- 5 licensed Pexels photos in the portfolio under the real Corporate events category:
  - gala table with candelabra and stage lighting;
  - dinner table with roses, gold chargers and gift boxes;
  - banquet room with blue uplighting;
  - candlelit marquee dinner;
  - outdoor reception tables, cropped to the tables.
- One sample story, "Evening gala dinner" (main photo + 2), with a factual description of what the photos show.
- All of it is `is_demo` (labelled "Sample") and credited to Pexels. The client's own corporate photos replace them later.

**How the photos were chosen:**
- No identifiable people, and no readable company branding or monograms.
- Rejected: 35042459 (photos of people on its screens), 16120243 (someone's monogram), 16985187 (company branding), 35042249 (an event emblem), 14636315 (the same room as 14636319).

**Script:** `$TEMP/p19/corp24.mjs` builds the files and `insert.sql`. The SQL is idempotent: it replaces its own previous copy and needs the Corporate events category. `corp24.mjs cleansql` removes just this content.
- Gotcha: `sample23.mjs clean` (local) also deletes these photos' files, since they are Pexels files too. Re-seed in this order: sample23 → `insert.sql` → upload the files.

**Tests (local):**
- `corpcheck.mjs` 10/10, desktop and phone:
  - the filter shows Corporate events, and filtering shows exactly its 5 photos, all labelled Sample;
  - the story is shown with its category and the Sample label;
  - no sideways scroll; "What we style" lists it.
- `e2e23.mjs` 42/42. Its counts now come from the database (21 portfolio photos, 4 stories) instead of being fixed at 16 / 3.

**Production:**
- The 5 photo files are uploaded to live storage (`cms-media/images/gallery/`).
- **The database rows are not inserted yet.** The insert was held back for the owner's approval, so the files are unused until then.
- After the insert, saving any item in the admin refreshes the cache so the change shows immediately.
