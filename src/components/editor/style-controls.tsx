"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import {
  sectionSpacings,
  sectionTones,
  styleLabels,
  textAligns,
  textColors,
  textFonts,
  textSizes,
  textStyles,
  textWeights,
  type SectionStyle,
  type SectionStyleKey,
  type StyleKey,
  type TextStyle,
} from "@/lib/styles/schema";
import { useEditor } from "./editor-context";

/*
 * Style presets in the visual editor. Every control is a choice from a
 * fixed list ("As designed" = no override), applied on the page at once and
 * saved immediately. Colours are theme colours that are readable on every
 * background, so no combination here can make text unreadable.
 */

function Choice<K extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: K | undefined;
  options: readonly K[];
  labels: Record<K, string>;
  onChange: (value: K | undefined) => void;
}) {
  const id = useId();
  return (
    <span className="cc-style-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value ?? ""} onChange={(e) => onChange((e.target.value || undefined) as K | undefined)}>
        <option value="">As designed</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
    </span>
  );
}

/** Size, font, weight, colour, italic and alignment for one text on the page. */
export function TextStyleControls({ styleKey, label }: { styleKey: StyleKey; label: string }) {
  const editor = useEditor();
  const style: TextStyle = editor.styles.text[styleKey] ?? {};
  const set = <K extends keyof TextStyle>(key: K, value: TextStyle[K]) =>
    void editor.setTextStyle(styleKey, { ...style, [key]: value });

  return (
    <span className="cc-style-panel" role="group" aria-label={`Style: ${label}`}>
      <Choice label="Size" value={style.size} options={textSizes} labels={styleLabels.size} onChange={(v) => set("size", v)} />
      <Choice label="Font" value={style.font} options={textFonts} labels={styleLabels.font} onChange={(v) => set("font", v)} />
      <Choice label="Weight" value={style.weight} options={textWeights} labels={styleLabels.weight} onChange={(v) => set("weight", v)} />
      <Choice label="Colour" value={style.color} options={textColors} labels={styleLabels.color} onChange={(v) => set("color", v)} />
      <Choice label="Italic" value={style.style} options={textStyles} labels={styleLabels.style} onChange={(v) => set("style", v)} />
      <Choice label="Align" value={style.align} options={textAligns} labels={styleLabels.align} onChange={(v) => set("align", v)} />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-11 self-end"
        aria-disabled={Object.keys(style).length === 0 || undefined}
        onClick={() => Object.keys(style).length > 0 && void editor.setTextStyle(styleKey, undefined)}
      >
        Reset style
      </Button>
    </span>
  );
}

/** Background and spacing for one homepage section. */
export function SectionStyleControls({ section, spacing = true }: { section: SectionStyleKey; spacing?: boolean }) {
  const editor = useEditor();
  const style: SectionStyle = editor.styles.sections[section] ?? {};
  const set = <K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) =>
    void editor.setSectionStyle(section, { ...style, [key]: value });

  return (
    <fieldset className="grid gap-3 border-t border-border pt-5">
      <legend className="text-sm font-semibold">Section style</legend>
      <p className="-mt-1 text-sm text-muted-foreground">Applied on the page and saved as soon as you choose.</p>
      <div className="cc-style-panel">
        <Choice label="Background" value={style.tone} options={sectionTones} labels={styleLabels.tone} onChange={(v) => set("tone", v)} />
        {spacing && (
          <Choice label="Spacing" value={style.spacing} options={sectionSpacings} labels={styleLabels.spacing} onChange={(v) => set("spacing", v)} />
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-11 self-end"
          aria-disabled={Object.keys(style).length === 0 || undefined}
          onClick={() => Object.keys(style).length > 0 && void editor.setSectionStyle(section, undefined)}
        >
          Reset section style
        </Button>
      </div>
    </fieldset>
  );
}
