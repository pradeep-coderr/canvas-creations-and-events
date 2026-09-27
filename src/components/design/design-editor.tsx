"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, RotateCw, X } from "lucide-react";
import { saveSiteTheme } from "@/app/admin/(portal)/design/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { describeActionFailure } from "@/lib/admin/action-error";
import { checkTheme, readableOn } from "@/lib/theme/palette";
import { colorLabels, defaultTheme, optionLabels, type ColorKey, type SiteTheme } from "@/lib/theme/schema";
import { ColorField, OptionGroup } from "./design-controls";
import { ThemePreview } from "./theme-preview";

/*
 * Admin → Design. Edits a DRAFT of the global site theme: the preview and
 * the readability checks update as you change things, nothing is written
 * until Save. Saving stores the theme in Supabase (site_theme) and the
 * public website uses it for every visitor from the next request.
 * Reloading the page discards the draft.
 */

type Status = { kind: "success" | "error"; text: string; stale?: boolean } | null;

const colorGroups: { title: string; keys: ColorKey[] }[] = [
  { title: "Buttons", keys: ["button", "buttonForeground"] },
  { title: "Brand", keys: ["primary", "primaryForeground", "blush", "accent"] },
  { title: "Backgrounds", keys: ["background", "surface"] },
  { title: "Text and lines", keys: ["foreground", "mutedForeground", "border"] },
];

const same = (a: SiteTheme, b: SiteTheme) => (Object.keys(a) as (keyof SiteTheme)[]).every((k) => a[k] === b[k]);

export function DesignEditor({ saved: initialSaved }: { saved: SiteTheme }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [draft, setDraft] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [leaveHref, setLeaveHref] = useState<string | null>(null);
  const checksRef = useRef<HTMLDivElement>(null);

  const checks = useMemo(() => checkTheme(draft), [draft]);
  const failing = checks.filter((c) => !c.pass);
  const dirty = !same(draft, saved);
  const changed = (Object.keys(draft) as (keyof SiteTheme)[]).filter((k) => draft[k] !== saved[k]).length;

  const set = <K extends keyof SiteTheme>(key: K, value: SiteTheme[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setStatus(null);
  };

  // Reload / close with unsaved changes: the browser's own prompt.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // In-app links (admin tabs, Edit website…) with unsaved changes: ask first.
  useEffect(() => {
    if (!dirty) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveHref(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  const save = async () => {
    if (!dirty || saving) return;
    if (failing.length) {
      setStatus({
        kind: "error",
        text: `${failing.length} colour combination${failing.length === 1 ? " is" : "s are"} too hard to read. Fix ${failing.length === 1 ? "it" : "them"} before saving.`,
      });
      checksRef.current?.focus();
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const result = await saveSiteTheme(draft);
      if (result.ok) {
        setSaved(result.theme);
        setDraft(result.theme);
        setStatus({ kind: "success", text: result.message });
      } else {
        setStatus({ kind: "error", text: result.error });
      }
    } catch (error) {
      // No result came back: nothing was saved (e.g. the page is out of date after an update).
      const failure = describeActionFailure(error);
      setStatus({ kind: "error", text: failure.text, stale: failure.stale });
    } finally {
      setSaving(false);
    }
  };

  const colorProblems = (key: ColorKey) => failing.filter((c) => c.fix === key);

  return (
    <div data-cms-form="" className="flex flex-col">
      <header className="max-w-2xl">
        <h1 className="font-display text-display-md font-title">Design</h1>
        <p className="mt-3 text-muted-foreground">
          Customize the visual identity of your website. The preview updates as you go; when you save, the whole public
          website changes for every visitor.
        </p>
      </header>

      {/* A refused save must be impossible to miss: the preview shows the draft, but the website can't use it yet. */}
      {dirty && failing.length > 0 && (
        <div className="mt-6 flex max-w-3xl items-start gap-3 border-l-2 border-destructive bg-background p-4 text-sm">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p>
            <span className="font-semibold">Not saved yet.</span> {failing.length} colour combination
            {failing.length === 1 ? " is" : "s are"} too hard to read, so these changes can&apos;t be saved and the website
            keeps its current design. The preview shows your draft.{" "}
            <button
              type="button"
              className="font-semibold underline underline-offset-4"
              onClick={() => checksRef.current?.focus()}
            >
              Show what to fix
            </button>
          </p>
        </div>
      )}

      {/* Phones: settings → preview → readability. Desktop: settings and readability on the left, the preview sticky on the right. */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start xl:gap-x-14">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <Tabs defaultValue="colors">
            <TabsList aria-label="Design settings">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="shape">Shape</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="flex flex-col gap-8">
              {colorGroups.map((group) => (
                <section key={group.title} aria-labelledby={`colors-${group.title}`} className="flex flex-col gap-6">
                  <h2 id={`colors-${group.title}`} className="text-eyebrow font-semibold text-emphasis uppercase">
                    {group.title}
                  </h2>
                  {group.keys.map((key) => (
                    <ColorField
                      key={key}
                      name={key}
                      label={colorLabels[key].label}
                      hint={colorLabels[key].hint}
                      value={draft[key]}
                      onChange={(v) => set(key, v)}
                      problems={colorProblems(key)}
                      suggestion={
                        key === "primaryForeground"
                          ? { label: "Use a readable text colour", value: readableOn(draft.primary, draft.foreground) }
                          : key === "buttonForeground"
                            ? { label: "Use a readable text colour", value: readableOn(draft.button, draft.foreground) }
                            : undefined
                      }
                    />
                  ))}
                </section>
              ))}
            </TabsContent>

            <TabsContent value="buttons" className="flex flex-col gap-8">
              <OptionGroup
                name="buttonStyle"
                legend="Button style"
                hint="The main call-to-action buttons (Enquire, Send enquiry…)."
                value={draft.buttonStyle}
                options={optionLabels.buttonStyle}
                onChange={(v) => set("buttonStyle", v)}
              />
              <OptionGroup
                name="buttonRadius"
                legend="Button corners"
                hint="Every button on the website."
                value={draft.buttonRadius}
                options={optionLabels.buttonRadius}
                onChange={(v) => set("buttonRadius", v)}
              />
              <OptionGroup
                name="buttonSize"
                legend="Button size"
                hint="Buttons stay at least 44 pixels tall at every size, so they're easy to tap."
                value={draft.buttonSize}
                options={optionLabels.buttonSize}
                onChange={(v) => set("buttonSize", v)}
              />
            </TabsContent>

            <TabsContent value="surfaces" className="flex flex-col gap-8">
              <p className="text-sm text-muted-foreground">
                Surfaces are panels such as the enquiry form&apos;s confirmation and notices. The website&apos;s sections
                keep their editorial layout.
              </p>
              <OptionGroup
                name="surfaceBackground"
                legend="Surface background"
                value={draft.surfaceBackground}
                options={optionLabels.surfaceBackground}
                onChange={(v) => set("surfaceBackground", v)}
              />
              <OptionGroup
                name="surfaceBorder"
                legend="Surface border"
                value={draft.surfaceBorder}
                options={optionLabels.surfaceBorder}
                onChange={(v) => set("surfaceBorder", v)}
              />
              <OptionGroup
                name="surfaceRadius"
                legend="Surface corners"
                value={draft.surfaceRadius}
                options={optionLabels.radius}
                onChange={(v) => set("surfaceRadius", v)}
              />
              <OptionGroup
                name="surfaceShadow"
                legend="Surface shadow"
                value={draft.surfaceShadow}
                options={optionLabels.shadow}
                onChange={(v) => set("surfaceShadow", v)}
              />
            </TabsContent>

            <TabsContent value="typography" className="flex flex-col gap-8">
              <p className="text-sm text-muted-foreground">
                The brand fonts stay the same: Cormorant Garamond for headings and Manrope for text.
              </p>
              <OptionGroup
                name="headingWeight"
                legend="Heading weight"
                value={draft.headingWeight}
                options={optionLabels.headingWeight}
                onChange={(v) => set("headingWeight", v)}
              />
              <OptionGroup
                name="bodyWeight"
                legend="Text weight"
                value={draft.bodyWeight}
                options={optionLabels.bodyWeight}
                onChange={(v) => set("bodyWeight", v)}
              />
            </TabsContent>

            <TabsContent value="shape" className="flex flex-col gap-8">
              <OptionGroup
                name="radius"
                legend="Corner radius"
                hint="Form fields, menus, dialogs and other rounded elements."
                value={draft.radius}
                options={optionLabels.radius}
                onChange={(v) => set("radius", v)}
              />
              <OptionGroup
                name="shadow"
                legend="Shadows"
                hint="Floating elements: the header when scrolling, menus, dialogs, the video Play button."
                value={draft.shadow}
                options={optionLabels.shadow}
                onChange={(v) => set("shadow", v)}
              />
            </TabsContent>
          </Tabs>
        </div>

        <section
          aria-labelledby="preview-title"
          className="min-w-0 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <h2 id="preview-title" className="mb-4 text-eyebrow font-semibold text-emphasis uppercase">
            Live preview{dirty ? " (not saved)" : ""}
          </h2>
          <ThemePreview theme={draft} />
        </section>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <section
            ref={checksRef}
            tabIndex={-1}
            aria-labelledby="checks-title"
            className="border-t border-border pt-8 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
          >
            <h2 id="checks-title" className="font-display text-display-sm font-title">
              Readability
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {failing.length
                ? `${failing.length} of ${checks.length} checks fail. The design can't be saved until every check passes.`
                : `All ${checks.length} checks pass (WCAG AA contrast).`}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {checks.map((c) => (
                <li key={c.id} data-check={c.id} data-pass={c.pass} className="flex items-start gap-2">
                  {c.pass ? (
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emphasis" />
                  ) : (
                    <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
                  )}
                  <span>
                    <span className={c.pass ? "sr-only" : "font-semibold text-destructive"}>
                      {c.pass ? "Passes: " : "Too low: "}
                    </span>
                    {c.label} — {c.ratio.toFixed(2)}:1 <span className="text-muted-foreground">(needs {c.min}:1)</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Always reachable, like the content forms' save bar. */}
      <div className="sticky bottom-0 z-10 -mx-5 mt-10 flex flex-col gap-3 border-t border-border bg-background px-5 py-4 sm:mx-0 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <p role="status" className="min-w-0 flex-1 text-sm">
          {status?.kind === "success" ? (
            <span className="font-semibold">{status.text}</span>
          ) : dirty ? (
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-primary" />
              {changed} unsaved change{changed === 1 ? "" : "s"}
            </span>
          ) : (
            <span className="text-muted-foreground">No unsaved changes. The website uses this design.</span>
          )}
        </p>
        <p role="alert" className="text-sm font-semibold text-destructive empty:hidden sm:order-last sm:basis-full">
          {status?.kind === "error" ? status.text : ""}
          {status?.kind === "error" && status.stale && (
            <Button type="button" variant="outline" size="sm" className="ml-3 h-11" onClick={() => window.location.reload()}>
              <RotateCw data-icon="inline-start" aria-hidden="true" />
              Reload page
            </Button>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {dirty && (
            <Button type="button" variant="ghost" onClick={() => {
                setDraft(saved);
                setStatus(null);
              }}>
              Discard changes
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => setResetOpen(true)}>
            Reset to defaults
          </Button>
          <Button type="button" aria-disabled={!dirty || undefined} pending={saving} pendingLabel="Saving design…" onClick={save}>
            Save changes
          </Button>
        </div>
      </div>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to the default design?</AlertDialogTitle>
            <AlertDialogDescription>
              This puts the original Canvas Creations rose-pink design back in the editor and replaces your unsaved
              changes. Nothing changes on the website until you press Save changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my changes</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDraft(defaultTheme);
                setStatus(null);
              }}
            >
              Reset to defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={leaveHref !== null} onOpenChange={(open) => !open && setLeaveHref(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave with unsaved design changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {changed} unsaved change{changed === 1 ? "" : "s"}. If you leave without saving, they&apos;ll be
              lost and the website keeps its current design.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const href = leaveHref;
                setLeaveHref(null);
                setDraft(saved);
                if (href) router.push(href as never);
              }}
            >
              Leave without saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
