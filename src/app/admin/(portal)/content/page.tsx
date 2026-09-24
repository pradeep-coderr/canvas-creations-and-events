import type { Metadata } from "next";
import Link from "next/link";
import { getCollectionCounts, getSingleton } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { collectionKeys, collections } from "@/lib/cms/collections";
import { videoProviderLabels, type VideoProvider } from "@/lib/cms/singletons";

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
        <span className="font-display text-display-sm font-medium">{title}</span>
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

  const provider = (video?.provider ?? null) as Exclude<VideoProvider, "none"> | null;
  const videoStatus = !video
    ? "Couldn't load. Refresh to try again."
    : provider === null
      ? "No video yet. The section shows its text and a TikTok link."
      : provider === "upload"
        ? "An uploaded video is set."
        : `${videoProviderLabels[provider]} video saved. Not shown on the website yet.`;

  return (
    <>
      <h1 className="font-display text-display-md font-medium">Website content</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Edit the words and lists on the website. Changes appear on the website as soon as they&apos;re saved. Drafts
        stay here until you publish them.
      </p>

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
        <Card href="/admin/content/video" title="Video">
          <span className="text-sm text-muted-foreground">The video section.</span>
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
