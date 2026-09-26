"use client";

import { ArrowRight } from "lucide-react";
import { DecorativeDivider } from "@/components/shared/decorative-divider";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { themeCss } from "@/lib/theme/css";
import type { SiteTheme } from "@/lib/theme/schema";

/*
 * Live preview of a (draft) theme with the website's real primitives —
 * Button, Input, Eyebrow, the `surface` panel, section tones — not a mock.
 * The draft is applied as CSS variables to this element only
 * (data-theme-scope makes globals.css re-derive the semantic tokens here),
 * so nothing is saved and the admin around it is unaffected.
 */
export function ThemePreview({ theme }: { theme: SiteTheme }) {
  return (
    <div
      data-theme-scope=""
      data-theme-preview=""
      className="overflow-hidden border border-border bg-background text-foreground"
    >
      <style>{themeCss(theme, "[data-theme-preview][data-theme-preview]")}</style>

      <div className="px-5 py-8 sm:px-8">
        <Eyebrow>Luxury event styling</Eyebrow>
        <p className="mt-3 font-display text-display-md font-title">
          Turning moments into <em className="font-normal text-primary italic">masterpieces</em>
        </p>
        <p className="mt-3 max-w-prose">
          Body text in Manrope. Weddings, birthdays and celebrations styled with care.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Muted text for captions and supporting details.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="button">Enquire now</Button>
          <Button type="button" variant="secondary">
            View gallery
          </Button>
          <Button type="button" variant="link">
            See our services <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="border-t border-border bg-surface-ivory px-5 py-8 sm:px-8">
        <p className="font-display text-display-sm font-title">Subheading on a surface section</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="preview-input">Form field</Label>
            <Input id="preview-input" defaultValue="Wedding reception" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Keyboard focus</p>
            <Button
              type="button"
              variant="secondary"
              tabIndex={-1}
              className="self-start ring-2 ring-ring ring-offset-2 ring-offset-surface-ivory"
            >
              Focused button
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-surface-blush px-5 py-8 sm:px-8">
        <Eyebrow>Blush section</Eyebrow>
        <div className="mt-4 surface p-5 text-sm">
          <p className="font-semibold">Surface panel</p>
          <p className="mt-1 text-muted-foreground">Used for notices and confirmations, like after an enquiry.</p>
        </div>
        <DecorativeDivider className="mt-6" />
        <p className="mt-2 text-center text-xs text-muted-foreground">Accent gold: hairlines and ornaments</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex h-11 items-center bg-secondary px-4 text-sm text-secondary-foreground">
            Soft blush
          </span>
          <span className="inline-flex h-11 items-center border border-border bg-background px-4 text-sm">Border</span>
        </div>
      </div>

      <div data-tone="dark" className="bg-background px-5 py-8 text-foreground sm:px-8">
        <Eyebrow>Dark section</Eyebrow>
        <p className="mt-3 font-display text-display-sm font-title">Celebrations, in motion.</p>
        <p className="mt-2 text-sm text-muted-foreground">Dark sections derive their colours from the same theme.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button">Enquire now</Button>
          <Button type="button" variant="link">
            Watch on TikTok
          </Button>
        </div>
      </div>
    </div>
  );
}
