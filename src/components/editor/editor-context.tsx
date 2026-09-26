"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  saveAboutContent,
  saveHomeContent,
  saveVideoStory,
  type CmsResult,
} from "@/app/admin/(portal)/content/actions";
import type { HomeSectionKey } from "@/components/home/home-sections";
import type { CategoryOption, CollectionKey } from "@/lib/cms/collections";
import type { MediaImage, MediaVideo } from "@/lib/media/types";
import type { AboutValues, HomeValues, VideoValues } from "@/lib/cms/singletons";
import { fieldDef, type EditorScope } from "@/lib/editor/fields";

/*
 * Visual editor state. Page text lives in the three one-row CMS records
 * (home, about, video). Edits are kept as drafts (shown in place, marked
 * unsaved) until saved; saving sends the whole record through the existing
 * Phase 14 server action, one call per record, so two open edits can never
 * overwrite each other. Collection items are saved by their own forms and
 * report unsaved changes here too.
 */

export type EditorMode = "edit" | "preview";

export interface SavedValues {
  home: HomeValues;
  about: AboutValues;
  video: VideoValues;
}

/** A collection item as the editor needs it (plain data from the server). */
export interface EditorItemMeta {
  id: string;
  label: string;
  published: boolean;
  featured: boolean;
  /** Would a visitor see it on the homepage right now? */
  visibleOnSite: boolean;
  /** Why a published item isn't on the homepage (not featured, over the limit). */
  note?: string;
  /** Current values for the item's edit form. */
  values: Record<string, unknown>;
}

export interface EditorData {
  saved: SavedValues;
  items: Record<CollectionKey, EditorItemMeta[]>;
  /** The media library (signed URLs), for photo fields. */
  imageOptions: MediaImage[];
  videoOptions: MediaVideo[];
  /** Is an uploaded-video provider configured on this deployment? */
  uploadedVideoConfigured: boolean;
  categoryOptions: CategoryOption[];
  /** Sections a visitor wouldn't see (nothing published in them). */
  hiddenInPreview: HomeSectionKey[];
}

type Status = { kind: "success" | "error"; text: string; at: number } | null;

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
  /** Save everything unsaved: text drafts and open item forms. */
  saveAll: () => Promise<boolean>;
  discardAll: () => void;
  unsavedCount: number;
  saving: boolean;
  status: Status;
  announce: (kind: "success" | "error", text: string) => void;
  /** Item forms report unsaved changes (submit = null when clean). */
  registerForm: (id: string, submit: (() => void) | null) => void;
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
};

export function EditorProvider({ data, children }: { data: EditorData; children: React.ReactNode }) {
  const [mode, setMode] = useState<EditorMode>("edit");
  const [drafts, setDrafts] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forms, setForms] = useState<Record<string, () => void>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  // Values saved in this session, until the server's refreshed data arrives
  // (a new `data.saved` object replaces them).
  const [override, setOverride] = useState<{ base: SavedValues; values: Partial<SavedValues> } | null>(null);

  const saved: SavedValues = useMemo(
    () => (override && override.base === data.saved ? { ...data.saved, ...override.values } : data.saved),
    [override, data.saved],
  );

  const announce = useCallback(
    (kind: "success" | "error", text: string) => setStatus({ kind, text, at: Date.now() }),
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

      setSaving(true);
      let result: CmsResult;
      try {
        result = await actions[scope](values as never);
      } catch {
        result = { ok: false, error: "Couldn't reach the server, so nothing was saved. Check your connection and try again." };
      }
      setSaving(false);

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

  const saveAll = useCallback(async () => {
    const scopes = (["home", "about", "video"] as const).filter((s) =>
      Object.keys(drafts).some((k) => k.startsWith(`${s}.`)),
    );
    let ok = true;
    for (const scope of scopes) ok = (await saveScope(scope)) && ok;
    // Open item forms submit themselves (their own validation and messages).
    for (const submit of Object.values(forms)) submit();
    return ok;
  }, [drafts, forms, saveScope]);

  const discardAll = useCallback(() => {
    setDrafts({});
    setErrors({});
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
    saveAll,
    discardAll,
    unsavedCount: Object.keys(drafts).length + Object.keys(forms).length,
    saving,
    status,
    announce,
    registerForm,
    findItem: (collection, id) => data.items[collection].find((i) => i.id === id),
  };

  return <EditorContext.Provider value={ctx}>{children}</EditorContext.Provider>;
}
