import { WaxSeal } from "./wax-seal";

/*
 * Shown once an enquiry is sent: a small invitation card slips down into an
 * envelope, the flap folds shut over it and the studio's wax seal is
 * pressed on (globals.css "Sent envelope"), under three seconds in all. With
 * reduced motion it is simply the sealed envelope. Decorative only: the
 * thank-you text beside it carries the message.
 */
export function SentEnvelope() {
  return (
    <div aria-hidden="true" className="sent-env relative mx-auto">
      <div className="sent-env-body absolute inset-x-0 bottom-0">
        {/* The back of the envelope. */}
        <span className="absolute inset-0 bg-[#efe0cb] shadow-[0_18px_30px_-16px_rgb(70_40_15/0.45)]" />
        {/* The card going in: a few gold lines, like printed text. */}
        <span className="sent-env-card absolute bg-[#fffdf8] shadow-[0_2px_6px_rgb(70_40_15/0.15)]">
          <span className="absolute inset-1.5 border border-[#d29a49]/50" />
          <span className="absolute top-[22%] left-1/2 h-[3px] w-[42%] -translate-x-1/2 rounded-full bg-[#d29a49]/70" />
          <span className="absolute top-[38%] left-1/2 h-[2px] w-[60%] -translate-x-1/2 rounded-full bg-[#c9b49a]/70" />
          <span className="absolute top-[48%] left-1/2 h-[2px] w-[52%] -translate-x-1/2 rounded-full bg-[#c9b49a]/70" />
        </span>
        {/* The pocket's folded front: left, right and bottom panels. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sent-env-pocket absolute inset-0 size-full">
          <path d="M0 0 L 50 56 L 0 100 Z" fill="#f8eedf" />
          <path d="M100 0 L 50 56 L 100 100 Z" fill="#f6ebdb" />
          <path d="M0 100 L 50 50 L 100 100 Z" fill="#f3e5d1" />
          <path d="M0 100 L 50 50 L 100 100" fill="none" stroke="rgb(150 110 70 / 0.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* The flap, hinged on the top edge: open (folded up) at first. */}
        <span className="sent-env-flap absolute inset-x-0 top-0 drop-shadow-[0_4px_4px_rgb(70_40_15/0.22)]">
          <span className="absolute inset-0 bg-[linear-gradient(180deg,#fbf4ea,#f1e2cc)] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        </span>
        <WaxSeal className="sent-env-seal absolute drop-shadow-[0_4px_5px_rgb(110_30_50/0.35)]" />
      </div>
    </div>
  );
}
