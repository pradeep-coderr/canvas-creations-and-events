import type { Metadata } from "next";
import Link from "next/link";
import { EditableText, LiveText } from "@/components/editor/editable-text";
import { AddItem, EditorItem } from "@/components/editor/editor-item";
import { EditorSection } from "@/components/editor/editor-section";
import { EditorShell } from "@/components/editor/editor-shell";
import { HomeSections, type HomeContent, type HomeEditorSlots } from "@/components/home/home-sections";
import { SiteFrame } from "@/components/layout/site-frame";
import { about as localAbout, enquirySection, hero as localHero } from "@/data/home";
import { loadEditorPage } from "@/lib/admin/editor-content";
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
        <h1 className="font-display text-display-md font-medium">The editor couldn&apos;t load</h1>
        <p role="alert" className="mt-4 text-muted-foreground">
          The website content couldn&apos;t be loaded. Please refresh the page, or use Content instead.
        </p>
        <Link href="/admin" className="mt-6 inline-block font-semibold underline underline-offset-4">
          Back to the admin
        </Link>
      </main>
    );
  }

  const content: HomeContent = {
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
      gallery: {
        eyebrow: t("home", "galleryEyebrow"),
        title: t("home", "galleryTitle"),
        emptyTitle: t("home", "galleryEmptyTitle"),
        emptyText: t("home", "galleryEmptyText"),
        instagramCta: live("home", "galleryInstagramCta"),
      },
      process: { eyebrow: t("home", "processEyebrow"), title: t("home", "processTitle") },
      whyCanvas: { eyebrow: t("home", "whyEyebrow"), titleLines: [t("home", "whyTitleLines")] },
      // The heading is visually hidden (screen readers only): edited in the panel.
      testimonials: { eyebrow: t("home", "testimonialsEyebrow"), title: live("home", "testimonialsTitle") },
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
      body: [t("about", "body")],
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
      video: page.video,
    },
    services: page.collections.services,
    categories: page.collections.categories,
    gallery: page.collections.gallery,
    testimonials: page.collections.testimonials,
    faqs: page.collections.faqs,
    processSteps: page.collections.process,
    principles: page.collections.principles,
  };

  const slots: HomeEditorSlots = {
    Section: EditorSection,
    services: itemSlots("services"),
    categories: itemSlots("categories"),
    gallery: itemSlots("gallery"),
    testimonials: itemSlots("testimonials"),
    faqs: itemSlots("faqs"),
    process: itemSlots("process"),
    principles: itemSlots("principles"),
  };

  return (
    <EditorShell data={page.data}>
      <SiteFrame>
        <main id="main">
          <HomeSections content={content} slots={slots} />
        </main>
      </SiteFrame>
    </EditorShell>
  );
}
