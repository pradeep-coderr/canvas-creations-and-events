import { CategoryStrip } from "@/components/sections/category-strip";
import { GalleryPreview } from "@/components/sections/gallery-preview";
import { Hero } from "@/components/sections/hero";
import { Intro } from "@/components/sections/intro";
import { Services } from "@/components/sections/services";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Intro />
      <Services />
      <CategoryStrip />
      <GalleryPreview />
    </main>
  );
}
