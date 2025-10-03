import { FeatureGrid } from "@/components/common/feature-grid";
import { Hero } from "@/components/common/hero";

export default function Home() {
  return (
    <div className="h-full w-full">
      <Hero />
      <FeatureGrid />
    </div>
  )
}
