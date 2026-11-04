import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { site } from "@/data/site";
import { getSiteSettings } from "@/lib/content/public";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `What ${site.name} collects when you chat with us or send an enquiry, and why.`,
};

/*
 * The privacy policy: what the enquiry form and the website chat record
 * (lib/visitor, the chat and enquiry tables) and why. Keep it in step with
 * lib/visitor/assess.ts when that changes. Plain words, Australian context
 * (Australian Privacy Principles).
 */
export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const email = settings.email;
  const updated = "20 October 2026";

  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <Eyebrow>Your privacy</Eyebrow>
      <h1 className="mt-4 font-display text-display-md font-title">Privacy policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated {updated}</p>

      <div className="mt-10 space-y-10 leading-relaxed [&_h2]:font-display [&_h2]:text-display-sm [&_h2]:font-title [&_li]:mt-2 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
        <section>
          <p>
            {site.name} styles celebrations in and around Adelaide. This page explains what we collect when you send an enquiry or chat
            with us on this website, why, and what you can ask us to do with it.
          </p>
        </section>

        <section>
          <h2>What you tell us</h2>
          <ul>
            <li>Your name, email address and phone number.</li>
            <li>Your event details (occasion, date, venue, guests, theme, budget) and your messages, including in the website chat.</li>
          </ul>
        </section>

        <section>
          <h2>What the website notes when you send something</h2>
          <p className="mt-4">
            When you send an enquiry or start a chat, the website also records a few details about the visit. We use them to reply
            well and to tell real enquiries from spam.
          </p>
          <ul>
            <li>
              Your approximate location (country, state, city and postcode), worked out from your internet connection. Never your
              exact address.
            </li>
            <li>
              Your device and browser (for example &ldquo;iPhone, Safari&rdquo;, or a phone model and system version where your
              browser shares it), screen size, language, time zone, light or dark mode, connection type (for example 4G), and
              whether your browser asks sites not to track you.
            </li>
            <li>
              How you arrived (for example from Google or Instagram, or a campaign link), the pages and parts of the home page you
              viewed on this visit, how long you spent on the site, and whether this is your first visit or a return visit.
            </li>
            <li>
              Whether you scrolled, moved the mouse or tapped before sending (counts only, never what you clicked on other sites),
              how long each part of the form took, and whether the message was typed, corrected or pasted.
            </li>
            <li>
              Checks of the contact details you give: whether your email address&apos;s domain can receive mail, and whether a phone
              number is an Australian mobile or landline.
            </li>
            <li>A scrambled code made from your internet connection, so we can see repeated messages from one place. It can&apos;t be turned back into your address.</li>
          </ul>
          <p className="mt-4">
            We don&apos;t use advertising or tracking cookies, and we don&apos;t follow you around other websites. Your browser keeps
            a few notes for this website only: a random key so your chat is still there when you come back, the date of your first
            visit and how many visits you&apos;ve made, and this visit&apos;s pages. Clearing your browser data removes them.
          </p>
        </section>

        <section>
          <h2>Why we use it</h2>
          <ul>
            <li>To reply to you, prepare quotes and look after your booking.</li>
            <li>To keep spam and misuse out of our inbox.</li>
            <li>To understand how people find us, so we can improve the website.</li>
          </ul>
        </section>

        <section>
          <h2>Who sees it</h2>
          <p className="mt-4">
            Only our team. We never sell your information or share it for marketing. It is stored securely with the services that run
            this website: hosting (Vercel), our database (Supabase) and email delivery (Resend). Some of these may store data outside
            Australia.
          </p>
        </section>

        <section>
          <h2>How long we keep it</h2>
          <p className="mt-4">
            Enquiries and chats are kept while we&apos;re planning or delivering your event and for our business records afterwards.
            Spam is deleted. You can ask us to delete your chat or enquiry at any time.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p className="mt-4">
            You can ask to see, correct or delete the information we hold about you, or ask a question about this policy
            {email ? (
              <>
                {" "}
                by emailing{" "}
                <a href={email.href} className="font-semibold underline decoration-primary/40 underline-offset-4 hover:text-primary">
                  {email.address}
                </a>
              </>
            ) : null}
            {" "}or calling{" "}
            <a href={settings.phone.href} className="font-semibold underline decoration-primary/40 underline-offset-4 hover:text-primary">
              {settings.phone.display}
            </a>
            . If you&apos;re not happy with how we handle it, you can contact the Office of the Australian Information Commissioner
            (oaic.gov.au).
          </p>
        </section>
      </div>
    </Container>
  );
}
