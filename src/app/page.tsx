import { site } from "@/data/site";

// Temporary placeholder — the real homepage is a separate task.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface-ivory px-6 text-center">
      <h1 className="font-display text-5xl">{site.name}</h1>
      <p className="text-muted-foreground">{site.slogan}</p>
    </main>
  );
}
