import type { Metadata } from "next";
import Link from "next/link";
import { getCollectionCounts, getSingleton } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { collectionKeys, collections } from "@/lib/cms/collections";

export const metadata: Metadata = { title: "Content" };

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function Card({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href as never}
        className="flex h-full flex-col gap-2 border border-transparent bg-background p-6 transition-colors hover:border-foreground/20"
      >
        <span className="font-display text-display-sm font-title">{title}</span>
        {children}
      </Link>
    </li>
  );
}

export default async function ContentOverviewPage() {
  await requireAdmin();
  const [counts, home, about, video] = await Promise.all([
    getCollectionCounts(),
    getSingleton("home_content"),
    getSingleton("about_content"),
    getSingleton("video_story"),
  ]);

  const films = counts.films;
  const videoStatus = !video
    ? "Couldn't load. Refresh to try again."
    : !films || films.published === 0
      ? "No published films yet, so the section isn't shown."
      : `Shown with ${films.published} published ${films.published === 1 ? "film" : "films"}.`;

  return (
    <>
      <h1 className="font-display text-display-md font-title">Website content</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Edit the words and lists on the website. Changes appear on the website as soon as they&apos;re saved. Drafts
        stay here until you publish them.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card href="/admin/content/media" title="Media library">
          <span className="text-sm text-muted-foreground">
            Photos and videos. Upload once, then use them anywhere on the website.
          </span>
        </Card>
        <Card href="/admin/content/site" title="Site details">
          <span className="text-sm text-muted-foreground">
            Headline, menu and button wording, phone, address, social links and enquiry form wording.
          </span>
        </Card>
      </ul>

      <h2 className="mt-10 text-eyebrow font-semibold text-emphasis uppercase">Page sections</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card href="/admin/content/home" title="Homepage text">
          <span className="text-sm text-muted-foreground">Headings and text for every homepage section.</span>
          <span className="text-sm font-medium">{home ? "All sections have text." : "Couldn't load. Refresh to try again."}</span>
        </Card>
        <Card href="/admin/content/about" title="About">
          <span className="text-sm text-muted-foreground">The About section and optional founder details.</span>
          <span className="text-sm font-medium">
            {!about
              ? "Couldn't load. Refresh to try again."
              : about.founder_name
                ? `Founder: ${String(about.founder_name)}`
                : "Founder details not added yet."}
          </span>
        </Card>
        <Card href="/admin/content/video" title="Films section">
          <span className="text-sm text-muted-foreground">The Films section&apos;s heading. The videos are under Films below.</span>
          <span className="text-sm font-medium">{videoStatus}</span>
        </Card>
      </ul>

      <h2 className="mt-12 text-eyebrow font-semibold text-emphasis uppercase">Lists</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collectionKeys.map((key) => {
          const count = counts[key];
          const { title, plural: noun, description } = collections[key];
          return (
            <Card key={key} href={`/admin/content/${key}`} title={title}>
              <span className="text-sm text-muted-foreground">{description}</span>
              <span className="text-sm font-medium">
                {!count
                  ? "Couldn't load. Refresh to try again."
                  : count.published + count.draft === 0
                    ? `No ${noun} yet.`
                    : `${count.published} published · ${plural(count.draft, "draft", "drafts")} · ${count.published + count.draft} in total`}
              </span>
            </Card>
          );
        })}
      </ul>
    </>
  );
}
