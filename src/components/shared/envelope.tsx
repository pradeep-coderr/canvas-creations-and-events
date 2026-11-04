import { WaxSeal } from "./wax-seal";

/*
 * A sealed invitation envelope around a story's main photo, opened by the
 * scroll (globals.css "Envelope"): the wax seal breaks, the flap lifts open
 * to show its lining, the photo rises out of the pocket and the envelope
 * drops away. Scrolling back tucks the photo in and seals it again. In a
 * relative `.envelope-story` element, put EnvelopeBack before the photo
 * (marked `.env-card`) and EnvelopeFront after it, so the photo sits between
 * them. Hidden entirely with reduced motion or without scroll animation (the
 * photo simply shows), so it never hides content. Decorative only.
 */

// Behind the photo: the envelope's inside, and the open flap's lined face.
export function EnvelopeBack() {
  return (
    <span aria-hidden="true" className="envelope pointer-events-none absolute inset-0 z-[1]">
      <span className="absolute inset-0 bg-[#efe0cb] shadow-[0_24px_40px_-20px_rgb(70_40_15/0.45)]" />
      <span className="env-flap-in absolute inset-x-0 top-0 h-[48%] drop-shadow-[0_6px_6px_rgb(70_40_15/0.22)]">
        <span className="absolute inset-0 bg-[#f4e7d4] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <span className="absolute inset-0 bg-[linear-gradient(0deg,#f9dfe4,#f2bfca)] [clip-path:polygon(7%_0,93%_0,50%_90%)]" />
      </span>
    </span>
  );
}

// In front of the photo: the pocket, the flap's outer face and the seal.
export function EnvelopeFront() {
  return (
    <span aria-hidden="true" className="envelope pointer-events-none absolute inset-0 z-[3]">
      {/* The pocket's folded front (left, right and bottom panels). */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path d="M0 0 L 50 46 L 0 100 Z" fill="#f8eedf" />
        <path d="M100 0 L 50 46 L 100 100 Z" fill="#f6ebdb" />
        <path d="M0 100 L 50 42 L 100 100 Z" fill="#f3e5d1" />
        <path d="M0 100 L 50 42 L 100 100" fill="none" stroke="rgb(150 110 70 / 0.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* The flap, hinged on the top edge. It reaches past the pocket's edges, so no photo shows at the join. */}
      <span className="env-flap absolute inset-x-0 top-0 h-[48%] drop-shadow-[0_6px_6px_rgb(70_40_15/0.22)]">
        <span className="absolute inset-0 bg-[linear-gradient(180deg,#fbf4ea,#f4e7d4)] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      </span>
      {/* The seal, on the flap's point. */}
      <WaxSeal className="env-seal absolute top-[48%] left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_5px_6px_rgb(110_30_50/0.35)] sm:size-20" />
    </span>
  );
}
