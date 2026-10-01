import type { Metadata } from "next";
import Link from "next/link";
import { EditableText, LiveText } from "@/components/editor/editable-text";
import { AddItem, EditorItem } from "@/components/editor/editor-item";
import { EditPhotoButton } from "@/components/editor/editor-media";
import { EditorSection } from "@/components/editor/editor-section";
import { EditorShell } from "@/components/editor/editor-shell";
import { HomeSections, type HomeContent, type HomeEditorSlots } from "@/components/home/home-sections";
import { SiteFrame } from "@/components/layout/site-frame";
import { ScrollMotion } from "@/components/motion/scroll-motion";
import { SiteThemeStyle } from "@/components/theme/site-theme-style";
import { about as localAbout, enquirySection, hero as localHero } from "@/data/home";
import { loadEditorPage } from "@/lib/admin/editor-content";
import { getApprovedReviews } from "@/lib/content/public";
import { settingsFromValues, withSectionLinks, type SiteCopy } from "@/lib/cms/site-settings";
import { requireAdmin } from "@/lib/admin/session";
import type { CollectionKey } from "@/lib/cms/collections";
import type { EditorScope } from "@/lib/editor/fields";

export const metadata: Metadata = { title: "Edit website" };

// Text editable where it appears / text inside a link (edited in the section panel).
const t = (scope: EditorScope, field: string) => <EditableText scope={scope} field={field} />;
const live = (scope: EditorScope, field: string) => <LiveText scope={scope} field={field} />;

/** Wraps a collection's items with editor controls and adds "Add …" after them. */
function itemSlots<T extends { id: string }>(collection: CollectionKey) {
  return {
    Item: function Item({ item, children }: { item: T; children: React.ReactNode }) {
      return (
        <EditorItem collection={collection} id={item.id}>
          {children}
        </EditorItem>
      );
    },
    after: <AddItem collection={collection} />,
  };
}

/**
 * The visual editor: the real homepage (same sections, header and footer as
 * the public site) with editing controls. Admin only: requireAdmin() here,
 * RLS behind every read and write, and every save goes through the existing
 * CMS server actions.
 */
export default async function EditorPage() {
  await requireAdmin();
  const page = await loadEditorPage();

  if (!page) {
    return (
      <main id="main" className="mx-auto max-w-xl px-5 py-24">
        <h1 className="font-display text-display-md font-title">The editor couldn&apos;t load</h1>
        <p role="alert" className="mt-4 text-muted-foreground">
          The website content couldn&apos;t be loaded. Please refresh the page, or use Content instead.
        </p>
        <Link href="/admin" className="mt-6 inline-block font-semibold underline underline-offset-4">
          Back to the admin
        </Link>
      </main>
    );
  }

  // Site details: text editable in place (or in a panel when it sits inside a
  // link or a form label); links come from the saved values.
  const saved = settingsFromValues(page.data.saved.site);
  const navFields = ["navHome", "navServices", "navGallery", "navAbout", "navFaq", "navContact"];
  const base: SiteCopy = {
    ...saved,
    headline: { lead: t("site", "headlineLead"), emphasis: t("site", "headlineEmphasis") },
    footerTagline: t("site", "footerTagline"),
    navigation: saved.navigation.map((item, i) => ({ href: item.href, label: live("site", navFields[i]) })),
    sectionLinks: {
      pricing: { href: saved.sectionLinks.pricing.href, label: live("site", "navPricing") },
      films: { href: saved.sectionLinks.films.href, label: live("site", "navFilms") },
    },
    enquiry: { href: saved.enquiry.href, label: live("site", "enquireLabel") },
    mobileEnquireLabel: live("site", "mobileEnquireLabel"),
    mobileCallLabel: live("site", "mobileCallLabel"),
    menuLabel: live("site", "menuLabel"),
    callPrompt: t("site", "callPrompt"),
    footerHeadings: {
      explore: t("site", "footerExploreHeading"),
      contact: t("site", "footerContactHeading"),
      follow: t("site", "footerFollowHeading"),
    },
    basedInLabel: t("site", "basedInLabel"),
    phone: { href: saved.phone.href, display: live("site", "phoneDisplay") },
    email: saved.email ? { href: saved.email.href, address: live("site", "contactEmail") } : null,
    address: {
      street: t("site", "addressStreet"),
      locality: t("site", "addressLocality"),
      region: t("site", "addressRegion"),
      postcode: t("site", "addressPostcode"),
    },
    form: {
      name: live("site", "formNameLabel"),
      email: live("site", "formEmailLabel"),
      phone: live("site", "formPhoneLabel"),
      eventType: live("site", "formEventTypeLabel"),
      eventDate: live("site", "formEventDateLabel"),
      venue: live("site", "formVenueLabel"),
      message: live("site", "formMessageLabel"),
      submit: live("site", "formSubmitLabel"),
      optional: live("site", "formOptionalLabel"),
      successTitle: live("site", "formSuccessTitle"),
      successText: live("site", "formSuccessText"),
    },
  };
  // Same menu as visitors get: Pricing and Films only while something is published.
  const settings = withSectionLinks(base, {
    pricing: page.data.items.pricing.some((i) => i.visibleOnSite),
    films: page.data.items.films.some((i) => i.visibleOnSite),
  });

  const content: HomeContent = {
    settings,
    copy: {
      hero: {
        eyebrow: t("home", "heroEyebrow"),
        description: t("home", "heroDescription"),
        secondaryCta: { label: live("home", "heroSecondaryCtaLabel"), href: localHero.secondaryCta.href },
        image: page.heroImage,
      },
      intro: { eyebrow: t("home", "introEyebrow"), title: t("home", "introTitle"), body: t("home", "introBody") },
      services: {
        eyebrow: t("home", "servicesEyebrow"),
        title: t("home", "servicesTitle"),
        description: t("home", "servicesDescription"),
        enquiry: { title: live("home", "servicesEnquiryTitle"), text: live("home", "servicesEnquiryText") },
      },
      categories: { eyebrow: t("home", "categoriesEyebrow"), title: t("home", "categoriesTitle") },
      stories: {
        eyebrow: t("home", "storiesEyebrow"),
        title: t("home", "storiesTitle"),
        sampleNotice: t("home", "sampleNotice"),
      },
      pricing: {
        eyebrow: t("home", "pricingEyebrow"),
        title: t("home", "pricingTitle"),
        description: t("home", "pricingDescription"),
      },
      gallery: {
        eyebrow: t("home", "galleryEyebrow"),
        title: t("home", "galleryTitle"),
        intro: t("home", "galleryIntro"),
        // Inside the filter button: edited in the section panel.
        filterAll: live("home", "galleryFilterAll"),
        emptyTitle: t("home", "galleryEmptyTitle"),
        emptyText: t("home", "galleryEmptyText"),
        instagramCta: live("home", "galleryInstagramCta"),
      },
      process: { eyebrow: t("home", "processEyebrow"), title: t("home", "processTitle") },
      whyCanvas: { eyebrow: t("home", "whyEyebrow"), titleLines: [<EditableText key="whyTitleLines" scope="home" field="whyTitleLines" />] },
      // The heading is visually hidden (screen readers only): edited in the panel.
      testimonials: { eyebrow: t("home", "testimonialsEyebrow"), title: live("home", "testimonialsTitle") },
      reviews: {
        eyebrow: t("home", "reviewsEyebrow"),
        title: t("home", "reviewsTitle"),
        description: t("home", "reviewsDescription"),
        emptyText: t("home", "reviewsEmptyText"),
        // Inside the button: edited in the section panel.
        ctaLabel: live("home", "reviewsCtaLabel"),
      },
      faq: { eyebrow: t("home", "faqEyebrow"), title: t("home", "faqTitle") },
      enquiry: {
        eyebrow: t("home", "enquiryEyebrow"),
        title: t("home", "enquiryTitle"),
        description: t("home", "enquiryDescription"),
        offlineNotice: enquirySection.offlineNotice,
      },
      contact: {
        eyebrow: t("home", "contactEyebrow"),
        title: t("home", "contactTitle"),
        description: t("home", "contactDescription"),
      },
    },
    about: {
      eyebrow: t("about", "eyebrow"),
      title: t("about", "title"),
      body: [<EditableText key="body" scope="about" field="body" />],
      image: page.aboutImage,
      cta: { label: live("about", "ctaLabel"), href: localAbout.cta.href },
      // The credit line appears once a founder name is saved (never invented).
      founder: page.hasFounder
        ? { name: t("about", "founderName"), role: page.hasFounderRole ? t("about", "founderRole") : undefined }
        : null,
    },
    video: {
      copy: {
        eyebrow: t("video", "eyebrow"),
        title: t("video", "title"),
        emptyText: t("video", "emptyText"),
        tiktokCta: live("video", "tiktokCta"),
      },
    },
    services: page.collections.services,
    pricing: page.collections.pricing,
    categories: page.collections.categories,
    gallery: page.collections.gallery,
    galleryCategories: page.galleryCategories,
    stories: page.collections.stories,
    films: page.collections.films,
    testimonials: page.collections.testimonials,
    reviews: await getApprovedReviews(),
    // The form doesn't send from the editor (it's a preview of the page).
    reviewsEnabled: false,
    faqs: page.collections.faqs,
    processSteps: page.collections.process,
    principles: page.collections.principles,
  };

  const slots: HomeEditorSlots = {
    Section: EditorSection,
    heroImage: <EditPhotoButton scope="home" field="heroImageId" label="Hero photo" use="hero" />,
    aboutImage: <EditPhotoButton scope="about" field="imageId" label="About photo" use="founder" />,
    services: itemSlots("services"),
    pricing: itemSlots("pricing"),
    categories: itemSlots("categories"),
    gallery: itemSlots("gallery"),
    films: itemSlots("films"),
    stories: itemSlots("stories"),
    testimonials: itemSlots("testimonials"),
    faqs: itemSlots("faqs"),
    process: itemSlots("process"),
    principles: itemSlots("principles"),
  };

  return (
    <EditorShell data={page.data}>
      {/* The page is shown in the live global theme (admin → Design). */}
      <SiteThemeStyle />
      <SiteFrame settings={settings}>
        <main id="main">
          <HomeSections content={content} slots={slots} />
        </main>
      </SiteFrame>
      <ScrollMotion />
    </EditorShell>
  );
}
