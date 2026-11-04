import { CircleAlert, CircleCheck, CircleX, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { SECTION_LABELS, VERDICT_LABELS, duration, source, type Assessment, type Verdict, type VisitorMeta } from "@/lib/visitor/assess";
import { cn } from "@/lib/utils";

/*
 * "Looks real / Check this / Likely spam" and the visitor info behind it,
 * for chats and enquiries (Admin). Spam is only labelled, never hidden.
 */

const VERDICT_STYLE: Record<Verdict, { icon: typeof ShieldCheck; className: string }> = {
  real: { icon: ShieldCheck, className: "border-[#cfe5d8] bg-[#eef6f1] text-[#2f6b4c]" },
  check: { icon: ShieldAlert, className: "border-highlight/60 bg-surface-ivory text-[#8a6427]" },
  spam: { icon: ShieldX, className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

/** The verdict as a small badge (lists show it for "Check this" and "Likely spam"; "Looks real" stays quiet). */
export function VerdictBadge({ assessment, quietWhenReal = false, className }: { assessment: Assessment | null | undefined; quietWhenReal?: boolean; className?: string }) {
  if (!assessment || (quietWhenReal && assessment.verdict === "real")) return null;
  const { icon: Icon, className: tone } = VERDICT_STYLE[assessment.verdict];
  return (
    <span
      title={assessment.reasons.map((r) => r.text).join("\n")}
      className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold", tone, className)}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {VERDICT_LABELS[assessment.verdict]}
    </span>
  );
}

const REASON_ICON = { good: CircleCheck, warn: CircleAlert, bad: CircleX } as const;
const REASON_TONE = { good: "text-[#2f6b4c]", warn: "text-[#8a6427]", bad: "text-destructive" } as const;

/** The verdict, why, and the visitor info itself. */
export function VisitorInfo({ view }: { view: { meta: VisitorMeta; assessment: Assessment } | null }) {
  if (!view) {
    return <p className="text-sm text-muted-foreground">No visitor info (sent before it was recorded).</p>;
  }
  const { meta, assessment } = view;
  const place = [[meta.city, meta.region, meta.postcode].filter(Boolean).join(" "), meta.country].filter(Boolean).join(", ");
  const device = [
    meta.model || (meta.device && meta.device !== "unknown" ? meta.device[0].toUpperCase() + meta.device.slice(1) : null),
    [meta.os, meta.osVersion].filter(Boolean).join(" "),
    meta.browser,
  ]
    .filter(Boolean)
    .join(" · ");
  const settings = [
    meta.darkMode ? "Dark mode" : meta.darkMode === false ? "Light mode" : null,
    meta.connection ? `${meta.connection.toUpperCase()} connection` : null,
    meta.privacySignal ? "Privacy signal on (Do Not Track)" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const activity =
    meta.scrolls !== undefined
      ? `${meta.scrolls} scroll${meta.scrolls === 1 ? "" : "s"} · ${meta.pointer ?? 0} mouse moves · ${meta.taps ?? 0} taps/clicks${meta.activeSeconds !== undefined ? ` · active ${duration(meta.activeSeconds)}` : ""}`
      : undefined;
  const fields = meta.fieldSeconds && Object.entries(meta.fieldSeconds).map(([k, v]) => `${k} ${duration(v)}`).join(" · ");
  const rows: [string, string | undefined][] = [
    ["Location", place ? `${place} (approximate)` : "Unknown (not available when testing locally)"],
    ["Device", device || undefined],
    ["Screen, language", [meta.screen, meta.language, meta.timeZone].filter(Boolean).join(" · ") || undefined],
    ["Settings", settings || undefined],
    [
      "Visits",
      meta.visits !== undefined
        ? meta.visits > 1
          ? `Visit ${meta.visits}${meta.firstSeen ? ` · first came ${new Date(meta.firstSeen).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}` : ""}`
          : "First visit"
        : undefined,
    ],
    ["Came from", source(meta)],
    ["First page", meta.landing],
    ["Wrote from", meta.page],
    ["This visit", meta.pages !== undefined ? `${meta.pages} page${meta.pages === 1 ? "" : "s"}${meta.secondsOnSite !== undefined ? ` · ${duration(meta.secondsOnSite)} on the site` : ""}` : undefined],
    ["Pages", meta.paths && meta.paths.length > 1 ? meta.paths.join(" → ") : undefined],
    ["Sections seen", meta.sections?.length ? meta.sections.map((id) => SECTION_LABELS[id] ?? id).join(", ") : undefined],
    ["Activity", activity],
    ["Time to send", meta.secondsToSend !== undefined ? duration(meta.secondsToSend) : undefined],
    ["Time per field", fields || undefined],
    [
      "Message",
      meta.keystrokes !== undefined
        ? `${meta.keystrokes ? "Typed" : "Not typed"}${meta.corrections ? `, ${meta.corrections} correction${meta.corrections === 1 ? "" : "s"}` : ""}${meta.pastes ? `, pasted ${meta.pastes}×` : ""}`
        : undefined,
    ],
  ];
  return (
    <div className="space-y-3 text-sm">
      <VerdictBadge assessment={assessment} className="text-xs" />
      {assessment.reasons.length > 0 && (
        <ul className="space-y-1.5">
          {assessment.reasons.map((r, i) => {
            const Icon = REASON_ICON[r.tone];
            return (
              <li key={i} className="flex gap-2">
                <Icon className={cn("mt-0.5 size-4 shrink-0", REASON_TONE[r.tone])} aria-hidden="true" />
                <span>
                  <span className="sr-only">{r.tone === "good" ? "Good sign: " : r.tone === "warn" ? "Check: " : "Spam sign: "}</span>
                  {r.text}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-border pt-3">
        {rows
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-[13px] wrap-break-word">{value}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}
