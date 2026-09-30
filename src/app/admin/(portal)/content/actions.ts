"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { collections, isCollectionKey, singularTitle, type CollectionKey } from "@/lib/cms/collections";
import { describeDbError } from "@/lib/cms/errors";
import { siteSchema, siteToRow } from "@/lib/cms/site-settings";
import { compactStyles, pageStylesSchema, type PageStyles } from "@/lib/styles/schema";
import {
  aboutSchema,
  aboutToRow,
  homeSchema,
  homeToRow,
  videoSchema,
  videoToRow,
} from "@/lib/cms/singletons";
import { sameJson } from "@/lib/stable-json";
import { createClient } from "@/lib/supabase/server";
import { CMS_CONTENT_TAG } from "@/lib/supabase/public";

/*
 * CMS mutations. Every action re-checks the admin (requireAdmin) and writes
 * with the signed-in session, so RLS enforces the same rule in the
 * database. Nothing here trusts the browser: collection keys, ids and
 * values are validated again with the same schemas the forms use.
 *
 * After a successful change: updateTag(CMS_CONTENT_TAG) expires the public
 * content cache immediately (the next homepage request renders fresh data),
 * and the admin content pages and visual editor are refreshed.
 */

export type CmsResult =
  | { ok: true; message: string; id?: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string>;
      /** Unpublishing/deleting the last published FAQ needs an explicit confirmation. */
      needsConfirmation?: "last-faq";
    };

const uuid = z.uuid();

function contentChanged() {
  updateTag(CMS_CONTENT_TAG);
  revalidatePath("/admin/content", "layout");
  revalidatePath("/admin/editor");
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    out[path] ??= issue.message;
  }
  return out;
}

function invalidTarget(): CmsResult {
  return { ok: false, error: "That item couldn't be found. Refresh the page and try again." };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** True when `id` is the only published FAQ, so hiding it empties the FAQ section. */
async function isLastPublishedFaq(supabase: Supabase, id: string) {
  const { data } = await supabase.from("faqs").select("id").eq("is_published", true);
  return data?.length === 1 && data[0].id === id;
}

const lastFaqWarning: CmsResult = {
  ok: false,
  needsConfirmation: "last-faq",
  error: "This is the only published FAQ. Confirm to remove the FAQ section from the website.",
};

const visibilityNote = (published: boolean) =>
  published ? "It's published on the website." : "It's a draft, hidden from the website.";

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function saveCollectionItem(
  key: CollectionKey,
  id: string | null,
  input: unknown,
  confirmLastFaq = false,
): Promise<CmsResult> {
  await requireAdmin();
  if (!isCollectionKey(key) || (id !== null && !uuid.safeParse(id).success)) return invalidTarget();
  const def = collections[key];
  const parsed = def.schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  // Each collection's toRow matches its own schema; the union needs a cast.
  const row = (def.toRow as (v: unknown) => Record<string, unknown>)(parsed.data);
  const published = row.is_published === true;
  const name = singularTitle(key);

  const supabase = await createClient();
  if (key === "faqs" && id && !published && !confirmLastFaq && (await isLastPublishedFaq(supabase, id))) {
    return lastFaqWarning;
  }

  const query = id
    ? supabase.from(def.table).update(row).eq("id", id).select("id").single()
    : supabase.from(def.table).insert(row).select("id").single();
  const { data, error } = await query;
  if (error || !data) {
    console.error("[cms] save failed", { table: def.table, code: error?.code });
    return { ok: false, error: describeDbError(error, `save this ${def.singular}`) };
  }

  contentChanged();
  return {
    ok: true,
    id: data.id,
    message: `${name} ${id ? "saved" : "created"}. ${visibilityNote(published)}`,
  };
}

export async function setItemPublished(
  key: CollectionKey,
  id: string,
  publish: boolean,
  confirmLastFaq = false,
): Promise<CmsResult> {
  await requireAdmin();
  if (!isCollectionKey(key) || !uuid.safeParse(id).success || typeof publish !== "boolean") return invalidTarget();
  const def = collections[key];
  const supabase = await createClient();
  if (key === "faqs" && !publish && !confirmLastFaq && (await isLastPublishedFaq(supabase, id))) {
    return lastFaqWarning;
  }

  const { data, error } = await supabase
    .from(def.table)
    .update({ is_published: publish })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !data) {
    console.error("[cms] publish failed", { table: def.table, code: error?.code });
    return { ok: false, error: describeDbError(error, publish ? "publish it" : "unpublish it") };
  }

  contentChanged();
  const name = singularTitle(key);
  return { ok: true, message: publish ? `${name} published.` : `${name} unpublished. It's now a draft.` };
}

export async function moveItem(key: CollectionKey, id: string, direction: "up" | "down"): Promise<CmsResult> {
  await requireAdmin();
  if (!isCollectionKey(key) || !uuid.safeParse(id).success || (direction !== "up" && direction !== "down")) {
    return invalidTarget();
  }
  const { table, singular } = collections[key];
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from(table)
    .select("id, sort_order")
    .order("sort_order")
    .order("created_at");
  if (error || !rows) return { ok: false, error: describeDbError(error, "change the order") };

  const from = rows.findIndex((r) => r.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0) return invalidTarget();
  if (to < 0 || to >= rows.length) {
    return { ok: true, message: `That ${singular} is already ${direction === "up" ? "first" : "last"}.` };
  }

  // Swap, then renumber 1…n so the order is explicit (no ties), writing only
  // the rows whose position changed.
  [rows[from], rows[to]] = [rows[to], rows[from]];
  for (const [index, row] of rows.entries()) {
    if (row.sort_order === index + 1) continue;
    const { error: updateError } = await supabase.from(table).update({ sort_order: index + 1 }).eq("id", row.id);
    if (updateError) {
      console.error("[cms] reorder failed", { table, code: updateError.code });
      contentChanged(); // Some rows may have moved already.
      return { ok: false, error: describeDbError(updateError, "change the order") };
    }
  }

  contentChanged();
  return { ok: true, message: `${singularTitle(key)} moved ${direction}.` };
}

export async function deleteItem(key: CollectionKey, id: string, confirmLastFaq = false): Promise<CmsResult> {
  await requireAdmin();
  if (!isCollectionKey(key) || !uuid.safeParse(id).success) return invalidTarget();
  const def = collections[key];
  const supabase = await createClient();
  if (key === "faqs" && !confirmLastFaq && (await isLastPublishedFaq(supabase, id))) return lastFaqWarning;

  const { data, error } = await supabase.from(def.table).delete().eq("id", id).select("id");
  if (error) {
    console.error("[cms] delete failed", { table: def.table, code: error.code });
    return { ok: false, error: describeDbError(error, `delete this ${def.singular}`) };
  }
  if (!data?.length) return invalidTarget();

  contentChanged();
  return { ok: true, message: `${singularTitle(key)} deleted.` };
}

// ---------------------------------------------------------------------------
// Singletons (update the one existing row; never insert or delete)
// ---------------------------------------------------------------------------

/** Columns whose stored value differs from what was sent (null = missing row). */
function mismatchedColumns(sent: Record<string, unknown>, stored: Record<string, unknown> | null) {
  if (!stored) return null;
  return Object.keys(sent).filter((key) => !sameJson(sent[key] ?? null, stored[key] ?? null));
}

async function saveSingleton(
  table: "home_content" | "about_content" | "video_story" | "site_settings",
  row: Record<string, unknown>,
  what: string,
): Promise<CmsResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).update(row).eq("id", true).select(Object.keys(row).join(",")).single();
  if (error || !data) {
    console.error("[cms] singleton save failed", { table, code: error?.code });
    return { ok: false, error: describeDbError(error, `save the ${what}`) };
  }
  // Only report "saved" when the row that came back is what was sent.
  const mismatched = mismatchedColumns(row, data as unknown as Record<string, unknown>);
  if (mismatched?.length) {
    console.error("[cms] singleton save not confirmed", { table, columns: mismatched });
    return { ok: false, error: `The ${what} couldn't be confirmed as saved. Reload the editor and try again.` };
  }
  contentChanged();
  return { ok: true, message: `${what.charAt(0).toUpperCase()}${what.slice(1)} saved.` };
}

const invalid = (error: z.ZodError): CmsResult => ({
  ok: false,
  error: "Check the highlighted fields.",
  fieldErrors: fieldErrors(error),
});

export async function saveHomeContent(input: unknown): Promise<CmsResult> {
  await requireAdmin();
  const parsed = homeSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  return saveSingleton("home_content", homeToRow(parsed.data), "homepage content");
}

export async function saveAboutContent(input: unknown): Promise<CmsResult> {
  await requireAdmin();
  const parsed = aboutSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  return saveSingleton("about_content", aboutToRow(parsed.data), "About section");
}

export async function saveSiteSettings(input: unknown): Promise<CmsResult> {
  await requireAdmin();
  const parsed = siteSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  return saveSingleton("site_settings", siteToRow(parsed.data), "site details");
}

/**
 * Style presets from the visual editor. The whole map is validated against
 * the fixed option lists (unknown keys or values are rejected), emptied
 * entries are dropped, and the row is written with the admin's session.
 */
export async function savePageStyles(input: unknown): Promise<CmsResult & { styles?: PageStyles }> {
  await requireAdmin();
  const parsed = pageStylesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Those style choices aren't available. Refresh the editor and try again." };
  const styles = compactStyles(parsed.data);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_styles")
    .update({ text_styles: styles.text, section_styles: styles.sections })
    .eq("id", true)
    .select("text_styles, section_styles")
    .single();
  if (error || !data) {
    console.error("[cms] page styles save failed", { code: error?.code });
    return { ok: false, error: describeDbError(error, "save the style") };
  }
  if (!sameJson(data.text_styles, styles.text) || !sameJson(data.section_styles, styles.sections)) {
    console.error("[cms] page styles save not confirmed");
    return { ok: false, error: "The style couldn't be confirmed as saved. Reload the editor and try again." };
  }
  contentChanged();
  return { ok: true, message: "Style saved.", styles };
}

export async function saveVideoStory(input: unknown): Promise<CmsResult> {
  await requireAdmin();
  const parsed = videoSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  return saveSingleton("video_story", videoToRow(parsed.data), "films section");
}
