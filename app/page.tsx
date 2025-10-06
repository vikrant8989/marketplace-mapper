import { FeatureGrid } from "@/components/common/feature-grid";
import { Hero } from "@/components/common/hero";
import { QuickStartGuide } from "@/components/common/quick-start-guide";

export default function Home() {
  return (
    <div className="h-full w-full">
      <Hero />
      <FeatureGrid />
      <QuickStartGuide />
    </div>
  )
}
