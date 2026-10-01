"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  saveAboutContent,
  saveHomeContent,
  savePageStyles,
  saveSiteSettings,
  saveVideoStory,
  type CmsResult,
} from "@/app/admin/(portal)/content/actions";
import type { HomeSectionKey } from "@/components/home/home-sections";
import type { CategoryOption, CollectionKey } from "@/lib/cms/collections";
import type { MediaImage, MediaVideo } from "@/lib/media/types";
import type { SiteValues } from "@/lib/cms/site-settings";
import type { AboutValues, HomeValues, VideoValues } from "@/lib/cms/singletons";
import { describeActionFailure } from "@/lib/admin/action-error";
import { fieldDef, type EditorScope } from "@/lib/editor/fields";
import { sameJson } from "@/lib/stable-json";
import {
  compactStyles,
  type PageStyles,
  type SectionStyle,
  type SectionStyleKey,
  type StyleKey,
  type TextStyle,
} from "@/lib/styles/schema";

/*
 * Visual editor state. Page text lives in the four one-row CMS records
 * (home, about, video, site details). Edits are kept as drafts (shown in place, marked
 * unsaved) until saved; saving sends the whole record through the existing
 * Phase 14 server action, one call per record, so two open edits can never
 * overwrite each other. Collection items are saved by their own forms and
 * report unsaved changes here too.
 *
 * One rule for everything: a change is a draft (shown on the page, marked
 * unsaved) until a Save action writes it. That includes style presets and
 * photos; nothing is written to the database as it's chosen.
 */

export type EditorMode = "edit" | "preview";

export interface SavedValues {
  home: HomeValues;
  about: AboutValues;
  video: VideoValues;
  site: SiteValues;
}

/** A collection item as the editor needs it (plain data from the server). */
export interface EditorItemMeta {
  id: string;
  label: string;
  published: boolean;
  featured: boolean;
  /** Temporary sample content (is_demo). */
  demo?: boolean;
  /** Would a visitor see it on the homepage right now? */
  visibleOnSite: boolean;
  /** Why a published item isn't on the homepage (not featured, over the limit). */
  note?: string;
  /** Current values for the item's edit form. */
  values: Record<string, unknown>;
}

export interface EditorData {
  saved: SavedValues;
  /** Saved style presets (text and section styles). */
  styles: PageStyles;
  items: Record<CollectionKey, EditorItemMeta[]>;
  /** The media library (signed URLs), for photo fields. */
  imageOptions: MediaImage[];
  videoOptions: MediaVideo[];
  categoryOptions: CategoryOption[];
  /** Sections a visitor wouldn't see (nothing published in them). */
  hiddenInPreview: HomeSectionKey[];
}

/** success/error: the result of a save; info: a notice that isn't about saving. */
type StatusKind = "success" | "error" | "info";
type Status = { kind: StatusKind; text: string; at: number } | null;

/** One style preset: a text's style or a section's style. */
export type StyleRef = { kind: "text"; key: StyleKey } | { kind: "section"; key: SectionStyleKey };

const styleOf = (styles: PageStyles, ref: StyleRef) =>
  ref.kind === "text" ? styles.text[ref.key] : styles.sections[ref.key];

/** The style presets that differ between two maps. */
function changedStyles(current: PageStyles, saved: PageStyles): StyleRef[] {
  const a = compactStyles(current);
  const b = compactStyles(saved);
  const refs: StyleRef[] = [];
  for (const key of new Set([...Object.keys(a.text), ...Object.keys(b.text)]) as Set<StyleKey>) {
    if (!sameJson(a.text[key] ?? {}, b.text[key] ?? {})) refs.push({ kind: "text", key });
  }
  for (const key of new Set([...Object.keys(a.sections), ...Object.keys(b.sections)]) as Set<SectionStyleKey>) {
    if (!sameJson(a.sections[key] ?? {}, b.sections[key] ?? {})) refs.push({ kind: "section", key });
  }
  return refs;
}

/** `base` with the given presets taken from `from`. */
function withStyles(base: PageStyles, from: PageStyles, refs: StyleRef[]): PageStyles {
  const next: PageStyles = { text: { ...base.text }, sections: { ...base.sections } };
  for (const ref of refs) {
    const value = styleOf(from, ref);
    if (ref.kind === "text") {
      if (value) next.text[ref.key] = value as TextStyle;
      else delete next.text[ref.key];
    } else if (value) next.sections[ref.key] = value as SectionStyle;
    else delete next.sections[ref.key];
  }
  return next;
}

interface EditorContextValue {
  data: EditorData;
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  /** Current value: the draft if there is one, else the saved value. */
  value: (scope: EditorScope, field: string) => unknown;
  hasDraft: (scope: EditorScope, field: string) => boolean;
  setDraft: (scope: EditorScope, field: string, value: unknown) => void;
  discardDraft: (scope: EditorScope, field: string) => void;
  error: (scope: EditorScope, field: string) => string | undefined;
  /**
   * Save drafts of one record (optionally only some fields). `values` saves
   * those values directly (e.g. a photo just chosen), without waiting for
   * a draft to be stored first.
   */
  saveScope: (scope: EditorScope, fields?: string[], values?: Record<string, unknown>) => Promise<boolean>;
  /** Save style drafts (only the given presets, or all of them). */
  saveStyles: (refs?: StyleRef[]) => Promise<boolean>;
  /** Save everything unsaved: text, photo and style drafts, and open item forms. */
  saveAll: () => Promise<boolean>;
  discardAll: () => void;
  unsavedCount: number;
  saving: boolean;
  status: Status;
  announce: (kind: StatusKind, text: string) => void;
  /** Item forms report unsaved changes (submit = null when clean). */
  registerForm: (id: string, submit: (() => void) | null) => void;
  /** Style presets as shown: the saved ones plus any unsaved choices. */
  styles: PageStyles;
  /** Is this preset changed but not saved? */
  hasStyleDraft: (ref: StyleRef) => boolean;
  /** Style choices are drafts, like text: applied on the page, saved by Save. */
  setTextStyle: (key: StyleKey, style: TextStyle | undefined) => void;
  setSectionStyle: (key: SectionStyleKey, style: SectionStyle | undefined) => void;
  findItem: (collection: CollectionKey, id: string) => EditorItemMeta | undefined;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside <EditorProvider>");
  return ctx;
}

const keyOf = (scope: EditorScope, field: string) => `${scope}.${field}`;

const actions: Record<EditorScope, (values: never) => Promise<CmsResult>> = {
  home: saveHomeContent,
  about: saveAboutContent,
  video: saveVideoStory,
  site: saveSiteSettings,
};

export function EditorProvider({ data, children }: { data: EditorData; children: React.ReactNode }) {
  const [mode, setMode] = useState<EditorMode>("edit");
  const [drafts, setDrafts] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forms, setForms] = useState<Record<string, () => void>>({});
  // Saves in flight (a Save can run several one after another).
  const [savingCount, setSavingCount] = useState(0);
  const saving = savingCount > 0;
  const [status, setStatus] = useState<Status>(null);
  // Style presets: what the database has, and the draft on top of it.
  const [savedStyles, setSavedStyles] = useState<PageStyles>(data.styles);
  const [styleDraft, setStyleDraft] = useState<PageStyles | null>(null);
  const styles = styleDraft ?? savedStyles;
  const styleChanges = useMemo(() => changedStyles(styles, savedStyles), [styles, savedStyles]);
  // Values saved in this session, until the server's refreshed data arrives
  // (a new `data.saved` object replaces them).
  const [override, setOverride] = useState<{ base: SavedValues; values: Partial<SavedValues> } | null>(null);

  const saved: SavedValues = useMemo(
    () => (override && override.base === data.saved ? { ...data.saved, ...override.values } : data.saved),
    [override, data.saved],
  );

  const announce = useCallback(
    (kind: StatusKind, text: string) => setStatus({ kind, text, at: Date.now() }),
    [],
  );

  const value = useCallback(
    (scope: EditorScope, field: string) => {
      const key = keyOf(scope, field);
      return key in drafts ? drafts[key] : (saved[scope] as Record<string, unknown>)[field];
    },
    [drafts, saved],
  );

  const setDraft = useCallback(
    (scope: EditorScope, field: string, next: unknown) => {
      const key = keyOf(scope, field);
      const current = (saved[scope] as Record<string, unknown>)[field];
      setDrafts((d) => {
        const copy = { ...d };
        // Back to the saved value = no longer a change.
        if (JSON.stringify(current) === JSON.stringify(next)) delete copy[key];
        else copy[key] = next;
        return copy;
      });
      setErrors((e) => {
        if (!(key in e)) return e;
        const copy = { ...e };
        delete copy[key];
        return copy;
      });
    },
    [saved],
  );

  const discardDraft = useCallback((scope: EditorScope, field: string) => {
    const key = keyOf(scope, field);
    setDrafts((d) => {
      const copy = { ...d };
      delete copy[key];
      return copy;
    });
    setErrors((e) => {
      const copy = { ...e };
      delete copy[key];
      return copy;
    });
  }, []);

  const saveScope = useCallback(
    async (scope: EditorScope, fields?: string[], direct?: Record<string, unknown>) => {
      const prefix = `${scope}.`;
      const own = [
        ...new Set([
          ...Object.keys(drafts)
            .filter((k) => k.startsWith(prefix))
            .map((k) => k.slice(prefix.length))
            .filter((f) => !fields || fields.includes(f)),
          ...Object.keys(direct ?? {}),
        ]),
      ];
      if (own.length === 0) return true;

      const values = { ...(saved[scope] as Record<string, unknown>) };
      for (const f of own) values[f] = direct && f in direct ? direct[f] : drafts[keyOf(scope, f)];

      setSavingCount((n) => n + 1);
      let result: CmsResult;
      try {
        result = await actions[scope](values as never);
      } catch (error) {
        result = { ok: false, error: describeActionFailure(error).text };
      }
      setSavingCount((n) => n - 1);

      if (result.ok) {
        setOverride((prev) => ({
          base: data.saved,
          values: { ...(prev?.base === data.saved ? prev.values : {}), [scope]: values },
        }));
        setDrafts((d) => {
          const copy = { ...d };
          for (const f of own) delete copy[keyOf(scope, f)];
          return copy;
        });
        const labels = own.map((f) => fieldDef(scope, f)?.label).filter(Boolean);
        announce("success", labels.length === 1 ? `${labels[0]} saved.` : result.message);
        return true;
      }

      // Server rules win: show its messages on the fields it names.
      const fieldErrors: Record<string, string> = {};
      for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
        fieldErrors[keyOf(scope, path.split(".")[0])] ??= message;
      }
      setErrors((e) => ({ ...e, ...fieldErrors }));
      const first = Object.keys(fieldErrors)[0];
      const label = first ? fieldDef(scope, first.slice(prefix.length))?.label : undefined;
      announce("error", label ? `Couldn't save: ${label}: ${Object.values(fieldErrors)[0]}` : result.error);
      return false;
    },
    [drafts, saved, data.saved, announce],
  );

  // Style drafts: one request with the saved map plus the chosen presets;
  // the server returns what it stored, and that becomes the saved state.
  const saveStyles = useCallback(
    async (refs?: StyleRef[]) => {
      const base = savedStyles;
      const current = styles;
      const changed = changedStyles(current, base);
      const target = refs ? changed.filter((c) => refs.some((r) => r.kind === c.kind && r.key === c.key)) : changed;
      if (target.length === 0) return true;
      setSavingCount((n) => n + 1);
      let result: Awaited<ReturnType<typeof savePageStyles>>;
      try {
        result = await savePageStyles(withStyles(base, current, target));
      } catch (error) {
        result = { ok: false, error: describeActionFailure(error).text };
      }
      setSavingCount((n) => n - 1);
      if (!result.ok || !result.styles) {
        announce("error", result.ok ? "The style couldn't be confirmed as saved. Try again." : result.error);
        return false;
      }
      const stored = result.styles;
      setSavedStyles(stored);
      // Keep any other unsaved presets (including ones chosen while saving)
      // as a draft on top of what's stored now.
      setStyleDraft((prev) => {
        const latest = prev ?? base;
        const rest = changedStyles(latest, stored).filter((c) => !target.some((t) => t.kind === c.kind && t.key === c.key));
        return rest.length ? withStyles(stored, latest, rest) : null;
      });
      announce("success", target.length === 1 ? "Style saved." : "Styles saved.");
      return true;
    },
    [announce, savedStyles, styles],
  );

  const saveAll = useCallback(async () => {
    const scopes = (["home", "about", "video", "site"] as const).filter((s) =>
      Object.keys(drafts).some((k) => k.startsWith(`${s}.`)),
    );
    let ok = true;
    for (const scope of scopes) ok = (await saveScope(scope)) && ok;
    ok = (await saveStyles()) && ok;
    // Open item forms submit themselves (their own validation and messages).
    for (const submit of Object.values(forms)) submit();
    return ok;
  }, [drafts, forms, saveScope, saveStyles]);

  const discardAll = useCallback(() => {
    setDrafts({});
    setErrors({});
    setStyleDraft(null);
  }, []);

  const registerForm = useCallback((id: string, submit: (() => void) | null) => {
    setForms((f) => {
      if (!submit && !(id in f)) return f;
      const copy = { ...f };
      if (submit) copy[id] = submit;
      else delete copy[id];
      return copy;
    });
  }, []);

  // A style choice only changes the draft; choosing the saved style again
  // clears it.
  const changeStyles = useCallback(
    (change: (current: PageStyles) => PageStyles) =>
      setStyleDraft((prev) => {
        const next = change(prev ?? savedStyles);
        return changedStyles(next, savedStyles).length ? next : null;
      }),
    [savedStyles],
  );

  const setTextStyle = useCallback(
    (key: StyleKey, style: TextStyle | undefined) =>
      changeStyles((current) => {
        const text = { ...current.text };
        if (style && Object.values(style).some((v) => v !== undefined)) text[key] = style;
        else delete text[key];
        return { ...current, text };
      }),
    [changeStyles],
  );

  const setSectionStyle = useCallback(
    (key: SectionStyleKey, style: SectionStyle | undefined) =>
      changeStyles((current) => {
        const sections = { ...current.sections };
        if (style && Object.values(style).some((v) => v !== undefined)) sections[key] = style;
        else delete sections[key];
        return { ...current, sections };
      }),
    [changeStyles],
  );

  const ctx: EditorContextValue = {
    data,
    mode,
    setMode,
    value,
    hasDraft: (scope, field) => keyOf(scope, field) in drafts,
    setDraft,
    discardDraft,
    error: (scope, field) => errors[keyOf(scope, field)],
    saveScope,
    saveStyles,
    saveAll,
    discardAll,
    unsavedCount: Object.keys(drafts).length + Object.keys(forms).length + styleChanges.length,
    saving,
    status,
    announce,
    registerForm,
    findItem: (collection, id) => data.items[collection].find((i) => i.id === id),
    styles,
    hasStyleDraft: (ref) => styleChanges.some((c) => c.kind === ref.kind && c.key === ref.key),
    setTextStyle,
    setSectionStyle,
  };

  return <EditorContext.Provider value={ctx}>{children}</EditorContext.Provider>;
}
