"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const flows : any = {
    getStarted: [
    {
      number: 1,
      title: "Select a Marketplace",
      description: "Choose the marketplace you want to map your data to.",
      cta: "Select Marketplace",
    },
    {
      number: 2,
      title: "Upload Seller File",
      description: "Upload your seller CSV so we can read your product data.",
      cta: "Upload Seller File",
    },
    {
      number: 3,
      title: "Choose Mapping",
      description: "Map your seller columns to the marketplace fields.",
      cta: "Choose Mapping",
    },
    {
      number: 4,
      title: "Save Mapping",
      description: "Save your mapping for future use and export the marketplace-ready file.",
      cta: "Save Mapping",
    },
  ],
  separate: [
    {
      number: 1,
      title: "Create a Marketplace Template By click on marketplacs",
      description: "Define the required columns and formats for a marketplace in your file before uploading marketplace data.",
      cta: "Create Template",
    },
    {
      number: 2,
      title: "Upload Seller Product File by clicking on Seller Files",
      description: "Upload your seller CSV so we can read your product data and prepare it for mapping.",
      cta: "Upload Seller File",
    },
    {
      number: 3,
      title: "Map Columns to Template by clicking on Create Mapping",
      description: "Connect your seller columns to the marketplace fields. Save mappings for reuse.",
      cta: "Create Mapping",
    },
    {
      number: 4,
      title: "Review by clicking on View Mappings",
      description: "Validate the result and export in the marketplace-ready format when everything looks good.",
      cta: "View Mappings",
    },
  ]

}

export function QuickStartGuide() {
  const [activeFlow, setActiveFlow] = useState("getStarted")

  return (
    <section aria-labelledby="quick-start" className="container mx-auto px-4 pb-16">
      <div className="mx-auto max-w-4xl">
        <h2 id="quick-start" className="text-2xl font-semibold mb-4">
          Quick Start Guide
        </h2>
        <p className="text-muted-foreground mb-8">
          Follow these steps to go from raw seller data to a marketplace-ready file.
        </p>

        {/* Flow Selector */}
        <div className="mb-8 flex gap-4">
          <Button
            size="sm"
            className={activeFlow === "getStarted" ? "cursor-pointer bg-blue-600 hover:bg-blue-700" : " cursor-pointer bg-gray-300 hover:bg-gray-400 text-black"}
            onClick={() => setActiveFlow("getStarted")}
          >
            Get Started Flow
          </Button>
          <Button
            size="sm"
            className={activeFlow === "separate" ? "cursor-pointer bg-blue-600 hover:bg-blue-700" : " cursor-pointer bg-gray-300 hover:bg-gray-400 text-black"}
            onClick={() => setActiveFlow("separate")}
          >
            Separate Flow
          </Button>

        </div>

        <ol className="space-y-4">
          {flows[activeFlow].map((step : any) => (
            <li key={step.number} className="flex items-start gap-4 rounded-lg border bg-card p-4">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold"
              >
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default QuickStartGuide
