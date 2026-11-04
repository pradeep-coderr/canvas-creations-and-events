import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { site } from "@/data/site";
import { getSiteSettings } from "@/lib/content/public";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The booking, payment, cancellation and hire terms for ${site.name} event styling, decoration and equipment hire.`,
};

/*
 * The client's Terms & Conditions (revised 23 October 2026), word for word
 * from the PDF they supplied. The PDF's closing "Legal review note" was for
 * the client, not customers, so it isn't shown. Section ids (#section-5 …)
 * let other pages link to one clause.
 */

type Block = string | { heading: string } | { list: string[] };
interface Clause {
  title: string;
  blocks: Block[];
}

const UPDATED = "23 October 2026";

const intro: Block[] = [
  "Canvas Creations and Events (“we”, “us” or “our”) provides event styling, decoration, equipment hire and related services. “You” or “customer” means the person or entity entering into the booking.",
  "These terms apply together with the quote, invoice, written approvals and booking confirmation. A booking is governed by the specific scope, inclusions, price and schedule agreed in writing. If there is an inconsistency, the specific booking document prevails only to the extent of that inconsistency, subject to applicable law.",
  "By accepting a quote or booking confirmation and paying the required deposit, you acknowledge that you have had an opportunity to read these terms. We will make these terms available before the booking is confirmed.",
];

const clauses: Clause[] = [
  {
    title: "Services and scope",
    blocks: [
      "We provide event styling, decoration, equipment hire and related services for weddings, receptions, engagements, showers, birthdays, anniversaries, graduations, corporate functions, private celebrations and other occasions.",
      "The exact items, quantities, colours, design concept, venue, delivery, setup, pack-down, hire period and exclusions are those listed in the accepted quote or written booking confirmation. Items shown in inspiration photographs, online galleries or social media are examples and are not included unless expressly listed.",
    ],
  },
  {
    title: "Quotes and availability",
    blocks: [
      "Quotes are based on the information supplied by you and are valid for 14 days unless the quote states otherwise. A quote does not reserve a date. Availability is confirmed only after we accept the booking and receive the required deposit.",
      "If information changes, a supplier changes availability, or you request work outside the agreed scope, we may issue a revised quote. We will explain material additional charges and obtain your approval before undertaking the additional work, except where urgent action is reasonably necessary to protect people or property.",
    ],
  },
  {
    title: "Booking and deposit",
    blocks: [
      "A deposit equal to 25% of the total quoted booking price is required to secure the event date. The booking is confirmed when we accept your booking in writing and the deposit has cleared. The deposit is credited against the total booking price; it is not an additional fee.",
      "The remaining balance is due on the date specified in the quote or invoice. If no date is specified, the balance is due no later than the event date and before setup begins. Any alternative payment schedule must be agreed in writing.",
      "Please check the date, venue, package, inclusions, design details and customer contact information before confirming. The cancellation and cost-recovery rules in section 5 apply subject to applicable law.",
    ],
  },
  {
    title: "Prices, payments and overdue amounts",
    blocks: [
      "All prices are in Australian dollars. The quote or invoice will state whether GST is included and identify any other known charges. You must pay the agreed price and any additional amount you have approved by the due date.",
      "We may pause planning, purchasing, delivery or setup if a payment is overdue, after giving written notice and a reasonable opportunity to remedy the overdue payment where practicable. If a delay caused by overdue payment affects delivery or setup, we are not responsible for the resulting delay to the extent it was reasonably caused by that non-payment. This does not limit any rights that cannot be excluded by law.",
      "Any late-payment interest or recovery cost will only be charged if expressly disclosed in the quote or invoice, legally recoverable and reasonable. We will not impose undisclosed fees or duplicate charges.",
    ],
  },
  {
    title: "Customer cancellations and refunds",
    blocks: [
      "Cancellation requests must be made in writing by email or another written channel accepted by us. A cancellation takes effect when we receive the notice. Please include your name, event date and booking reference.",
      { heading: "5.1 Cancellation costs and deposit" },
      "If you cancel after the booking has been confirmed, we may retain from the deposit, or recover from amounts already paid, an amount that reasonably reflects the loss and costs caused by the cancellation. This may include planning and administration already performed, the value of work completed, non-refundable supplier commitments, and reasonable loss arising from reserving the event date. We will take account of costs avoided, refunds or credits received, and any reasonable opportunity to re-book the date or reuse materials.",
      "The 25% deposit is not automatically forfeited in every circumstance. If the reasonable cancellation amount is less than the deposit paid, the unused balance will be refunded. If the reasonable cancellation amount exceeds the deposit, we may request payment of the documented difference, to the extent permitted by law. We will provide an itemised explanation on request.",
      { heading: "5.2 Special-order and customised items" },
      "Where, after discussion with you, you approve in writing the purchase, order, customisation or arrangement of items or third-party services specifically for your event, you are responsible for the reasonable costs that cannot reasonably be cancelled, returned, resold, reused or recovered if you cancel. Examples include personalised signage, custom-made decorations, special-order materials and supplier bookings.",
      "Where practicable, we will confirm the item, price or cost basis, and any cancellation or return limitation before placing the order. We will take reasonable steps to limit avoidable loss. Any recoverable supplier refund, credit, resale value or avoided expense will be taken into account.",
      { heading: "5.3 No double recovery; refunds" },
      "The deposit and all other amounts already paid will be credited against any amount properly payable. We will not charge twice for the same cost. Any remaining refund due will be paid within a reasonable period, normally to the original payment method where practicable.",
      { heading: "5.4 Consumer rights" },
      "Nothing in this section limits any cancellation, refund, compensation or other remedy available under the Australian Consumer Law or other applicable law. If we fail to meet a consumer guarantee or cannot provide the agreed services, your legal rights may include a refund or other remedy depending on the circumstances.",
    ],
  },
  {
    title: "Rescheduling and booking variations",
    blocks: [
      "Requests to change the date, venue, design, package, guest requirements or setup schedule must be made in writing and are subject to our written acceptance and availability.",
      "If we agree to reschedule, the deposit and payments already made may be transferred to the new date, less any reasonable costs already incurred or non-recoverable supplier commitments, subject to applicable law. Additional costs caused by the change will be quoted and require your approval before being incurred where practicable.",
      "If the new date is unavailable and no alternative is agreed, section 5 applies. A date change is not confirmed until we have confirmed it in writing.",
    ],
  },
  {
    title: "Design, substitutions and approvals",
    blocks: [
      "We will use reasonable care and skill to deliver the agreed design and inclusions. Exact colours, flower varieties, balloon shades, product finishes and appearance may vary due to lighting, venue conditions, seasonal availability, supplier variation and screen settings.",
      "If a listed item becomes unavailable, we will, where practicable, consult you about a reasonably comparable alternative before making a material substitution. We will seek approval for any material change to price or scope.",
      "You must carefully check names, spelling, dates and wording supplied for customised items and approve proofs by the requested deadline. Your approval confirms the supplied details, but does not remove any rights you have under applicable law.",
    ],
  },
  {
    title: "Delivery, access, setup and pack-down",
    blocks: [
      "Delivery address, access time, setup window, event time, pack-down and collection arrangements will be stated in the booking confirmation. You must provide accurate venue details and advise us of access restrictions, stairs, lifts, loading zones, parking, venue rules, permits and any safety requirements.",
      "You are responsible for obtaining venue permissions and ensuring that the venue allows the agreed decorations and equipment. If access is delayed or restricted for reasons outside our reasonable control, we will take reasonable steps to complete the work, but setup may be delayed and reasonable extra labour or waiting costs may apply if disclosed and approved where practicable.",
      "We may refuse to install an item or structure if, acting reasonably, we consider the proposed installation unsafe or prohibited by the venue. We will discuss a safe alternative where practicable.",
    ],
  },
  {
    title: "Hire items, loss and damage",
    blocks: [
      "All hired items remain the property of Canvas Creations and Events or the relevant owner. You must take reasonable care of them, use them only for their intended purpose, and not alter, relocate or dismantle them without permission.",
      "You may be liable for reasonable repair or replacement costs for loss, theft or damage beyond ordinary wear and tear occurring while hired items are in your care or control, except to the extent caused by our acts or omissions, ordinary wear, a pre-existing defect or circumstances for which you are not legally responsible. We will consider the circumstances and provide a reasonable basis for any claim.",
      "The hire period, return arrangements, any security deposit and any disclosed late-return charges will be stated in the booking documents. Any late-return charge must be reasonable and proportionate to the loss or additional cost caused.",
    ],
  },
  {
    title: "Outdoor events and weather",
    blocks: [
      "You should consider weather exposure when choosing outdoor styling and tell us about the venue conditions. Some items may be unsuitable for rain, high winds, extreme heat or other adverse conditions.",
      "If weather or site conditions create a reasonable safety risk or risk of damage, we may recommend modifying, relocating or removing affected items. We will consult you where practicable. Any additional costs require approval where practicable. Cancellation, rescheduling and refunds will be assessed under sections 5, 6 and 12 and applicable law.",
    ],
  },
  {
    title: "Customer responsibilities",
    blocks: [
      "You agree to:",
      {
        list: [
          "provide accurate booking, venue and contact information and notify us of changes promptly;",
          "review the quote and booking confirmation and raise errors before approving the booking;",
          "provide timely approvals and decisions, particularly for customised items;",
          "obtain necessary venue permissions and disclose relevant restrictions;",
          "provide safe and reasonable access for delivery, setup and pack-down;",
          "pay agreed amounts by the due dates and approve additional work in writing; and",
          "treat our staff, contractors and suppliers respectfully and comply with reasonable safety directions.",
        ],
      },
    ],
  },
  {
    title: "Circumstances beyond reasonable control",
    blocks: [
      "Neither party is responsible for a delay or failure to perform to the extent it is caused by an event beyond that party’s reasonable control, such as severe weather, fire, flood, government restrictions, venue closure, transport disruption or supplier failure that could not reasonably be avoided. The affected party must notify the other as soon as reasonably practicable and take reasonable steps to reduce the impact.",
      "The parties will first try to agree on a practical alternative, such as a revised setup, substitute item or new date. If the event cannot reasonably proceed, payments, refunds and any cancellation costs will be dealt with fairly by reference to work already performed, unavoidable commitments, costs avoided and applicable law. This clause does not automatically entitle either party to keep all amounts paid.",
    ],
  },
  {
    title: "Cancellation or non-performance by us",
    blocks: [
      "If we cannot provide an agreed service, we will notify you as soon as reasonably practicable and discuss an appropriate alternative. If we cancel and no suitable alternative is agreed, we will refund amounts paid for services not provided, subject to any lawful adjustment for services already supplied and any rights you have under applicable law.",
      "We may terminate a booking if you materially breach the agreement, including failing to pay an amount due or failing to provide essential access or approvals, and do not remedy the breach within a reasonable period after written notice where the breach can be remedied. Any resulting cost recovery must be reasonable, evidenced and subject to applicable law.",
    ],
  },
  {
    title: "Liability and consumer guarantees",
    blocks: [
      "We will provide services with due care and skill and comply with consumer guarantees that apply under the Australian Consumer Law. Nothing in these terms excludes, restricts or modifies any right or remedy that cannot lawfully be excluded.",
      "To the extent permitted by law, you are responsible for loss directly caused by your breach of the booking agreement or negligent act. Neither party is liable under these terms for loss to the extent it was caused by the other party or by circumstances for which the first party is not legally responsible. This clause does not exclude liability for fraud, wilful misconduct, or any liability that cannot lawfully be excluded or limited.",
    ],
  },
  {
    title: "Photography and marketing",
    blocks: [
      "We may ask for permission to photograph completed styling for our portfolio, website or social media. We will seek appropriate permission before using images that identify you, show identifiable guests, or disclose private event details. If you do not want promotional photography, please notify us in writing before the event. Refusing promotional use will not affect your booking.",
    ],
  },
  {
    title: "Intellectual property and website",
    blocks: [
      "Our original branding, text, logos, photographs and designs remain owned by us or the relevant rights holder unless otherwise agreed. You must not reproduce or commercially use them without permission, except as permitted by law.",
      "Online photographs and descriptions are for illustration unless incorporated into your written quote. The accepted quote and booking confirmation set out the specific deliverables for your event.",
    ],
  },
  {
    title: "Privacy",
    blocks: [
      "We collect personal information reasonably needed to respond to enquiries, prepare quotes, manage bookings and provide our services. We will handle that information in accordance with applicable privacy laws. Please use the official contact details published on our website for privacy enquiries.",
    ],
  },
  {
    title: "Complaints and dispute resolution",
    blocks: [
      "Please contact us in writing with details of any concern and any supporting information. We will acknowledge the complaint within a reasonable time and make a genuine effort to resolve it. If it remains unresolved, either party may seek assistance from an appropriate consumer protection body or use any legal remedy available.",
      "Nothing in this section requires you to give up a legal right or prevents you from contacting Consumer and Business Services South Australia, the ACCC or another relevant authority.",
    ],
  },
  {
    title: "Changes to terms",
    blocks: [
      "The version of these terms provided to you before booking confirmation applies to that booking. We may update terms for future bookings, but a change will not alter an existing booking unless both parties agree in writing or the change is required by law.",
    ],
  },
  {
    title: "Governing law and severability",
    blocks: [
      "These terms are governed by the laws of South Australia and the applicable laws of the Commonwealth of Australia. Any mandatory rights or laws that apply to the booking continue to apply.",
      "If a provision is unlawful or unenforceable, it is to be read down to the minimum extent necessary or severed where legally permitted. The remaining provisions continue to operate to the extent they can do so lawfully.",
    ],
  },
];

const linkClass = "font-semibold underline decoration-primary/40 underline-offset-4 hover:text-primary";

function Blocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, i) =>
    typeof block === "string" ? (
      <p key={i} className="mt-4">
        {block}
      </p>
    ) : "heading" in block ? (
      <h3 key={i} className="mt-6 font-semibold text-primary">
        {block.heading}
      </h3>
    ) : (
      <ul key={i}>
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  );
}

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const email = settings.email;
  const contactNumber = clauses.length + 1;

  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <Eyebrow>Event styling · Decoration · Equipment hire</Eyebrow>
      <h1 className="mt-4 font-display text-display-md font-title">Terms &amp; Conditions</h1>
      <p className="mt-4 text-muted-foreground">Revised {UPDATED}</p>
      <p className="mt-6 text-lead text-muted-foreground">
        Please read these terms before confirming a booking. Your accepted quote, booking confirmation and these terms together
        describe the services, payment arrangements and responsibilities for your event. These terms operate subject to mandatory
        Australian law.
      </p>

      <nav aria-labelledby="terms-contents" className="mt-10 rounded-lg border border-border p-5 sm:p-6">
        <h2 id="terms-contents" className="text-sm font-semibold">
          Contents
        </h2>
        <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
          {[...clauses.map((c) => c.title), "Contact"].map((title, i) => (
            <li key={title}>
              <a href={`#section-${i + 1}`} className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
                {i + 1}. {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-10 leading-relaxed [&_h2]:font-display [&_h2]:text-display-sm [&_h2]:font-title [&_li]:mt-2 [&_section]:scroll-mt-28 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
        <section>
          <h2>Introduction and application</h2>
          <Blocks blocks={intro} />
        </section>

        {clauses.map((clause, i) => (
          <section key={clause.title} id={`section-${i + 1}`}>
            <h2>
              {i + 1}. {clause.title}
            </h2>
            <Blocks blocks={clause.blocks} />
          </section>
        ))}

        <section id={`section-${contactNumber}`}>
          <h2>{contactNumber}. Contact</h2>
          <dl className="mt-4 grid gap-1">
            <div>
              <dt className="inline font-semibold">Business: </dt>
              <dd className="inline">{site.name}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Website: </dt>
              <dd className="inline">
                <a href="https://www.canvascreation.com.au/" className={linkClass}>
                  https://www.canvascreation.com.au/
                </a>
              </dd>
            </div>
            {email && (
              <div>
                <dt className="inline font-semibold">Email: </dt>
                <dd className="inline">
                  <a href={email.href} className={linkClass}>
                    {email.address}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-4">
            Send booking changes, cancellation notices and other formal booking communications to the official email address
            published on our website. Please retain your quote, invoice, written approvals and payment records.
          </p>
        </section>
      </div>
    </Container>
  );
}
