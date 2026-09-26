import { createCn } from "cn/config";

/**
 * Class merger that knows the custom theme scales in globals.css. Without
 * this, `text-eyebrow` (a font size) and `text-emphasis` (a colour) look like
 * the same utility group and one is silently dropped.
 *
 * Always import `cn` from "@/lib/utils" — including in shadcn components,
 * which the CLI generates with `from "cn"`.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "display-md",
            "display-sm",
            "lead",
            "eyebrow",
          ],
        },
      ],
      shadow: [{ shadow: ["soft", "lift"] }],
      // `font-title` is the themeable heading WEIGHT (globals.css), not a
      // family: without this it would replace `font-display`.
      "font-weight": [{ font: ["title"] }],
    },
  },
});
