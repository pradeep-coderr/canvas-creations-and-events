import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { whyCanvas, type Principle, type WhyCanvasCopy } from "@/data/home";
import { SlotItem, type ItemSlots } from "./item-slots";
import { cn } from "@/lib/utils";

/*
 * An easel: two splayed front legs and a rear leg (SVG, behind), a ledge,
 * and the board itself: ivory, with a fine gold frame. As it scrolls in
 * the legs draw, the ledge appears and the board is set down on it with a
 * small settle; on hover the board tips forward on its ledge. Static and
 * complete with reduced motion.
 */
function Easel({ children }: { children: React.ReactNode }) {
  return (
    <div className="easel group relative flex h-full flex-col pt-5 pb-16">
      <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        {/* The rear leg, then the two front legs from the mast top. */}
        <path className="easel-leg" d="M50 0 L 50 97" pathLength={1} stroke="#6e4826" strokeWidth="5" vectorEffect="non-scaling-stroke" />
        <path className="easel-leg" d="M50 0 L 12 100" pathLength={1} stroke="#a8713c" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path className="easel-leg" d="M50 0 L 88 100" pathLength={1} stroke="#9a6534" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* The board. */}
      <div className="easel-board relative z-[1] mx-[9%] flex-1 bg-[#fbf7f0] p-6 shadow-[0_18px_30px_-12px_rgb(0_0_0/0.55)] sm:p-7">
        <span aria-hidden="true" className="pointer-events-none absolute inset-2 border border-[#d29a49]/55" />
        <div className="relative">{children}</div>
      </div>
      {/* The ledge the board rests on. */}
      <span aria-hidden="true" className="easel-ledge relative z-[1] mx-[5%] block h-2.5 rounded-[2px] bg-[linear-gradient(180deg,#c48a52,#9a6534)] shadow-[0_3px_4px_rgb(0_0_0/0.4)]" />
    </div>
  );
}

// Columns by count: the principles always fill the row on desktop.
const columns: Record<number, string> = {
  2: "md:grid-cols-2",
  4: "md:grid-cols-2 xl:grid-cols-4",
};

export function WhyCanvas({
  principles = whyCanvas.principles,
  copy = whyCanvas,
  itemSlots,
}: {
  principles?: Principle[];
  copy?: WhyCanvasCopy;
  itemSlots?: ItemSlots<Principle>;
}) {
  if (principles.length === 0 && !itemSlots?.after) return null;

  return (
    <Section id="why-canvas" tone="dark" aria-labelledby="why-title">
      <Container>
        <SectionHeading
          styleKeys={{ eyebrow: "home.whyEyebrow", title: "home.whyTitleLines" }}
          id="why-title"
          eyebrow={copy.eyebrow}
          title={copy.titleLines.map((line, i) => (
            // The space keeps the sentences apart in the accessible name.
            <span key={i} className="block">
              {i > 0 && " "}
              {line}
            </span>
          ))}
          align="start"
          className="max-w-3xl"
        />

        {/* Each reason is a small canvas board on a wooden easel, side by
            side on larger screens, stacked on phones (globals.css "Easels"). */}
        <ol className={cn("mt-14 grid gap-x-10 gap-y-14 sm:mt-16 lg:mt-20 xl:gap-x-16", columns[principles.length] ?? "md:grid-cols-3")}>
          {principles.map((principle, i) => (
            <li key={principle.id} className="mx-auto w-full max-w-sm md:max-w-none">
              <SlotItem slots={itemSlots} item={principle}>
                <Easel>
                  <span aria-hidden="true" className="block font-display text-display-md leading-none text-[#c08a3e] tabular-nums italic">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-display-sm font-title text-[#2b2320]">{principle.title}</h3>
                  <p className="mt-3 text-[#6b5d55]">{principle.description}</p>
                </Easel>
              </SlotItem>
            </li>
          ))}
        </ol>
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
