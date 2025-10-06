"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Step {
  number: number
  title: string
  description: string
  cta: string
}

interface Flows {
  getStarted: Step[]
  separate: Step[]
}

type FlowType = keyof Flows

const flows: Flows = {
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
      title: "Create a Marketplace Template By click on marketplaces",
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
  const [activeFlow, setActiveFlow] = useState<FlowType>("getStarted")

  return (
    <section aria-labelledby="quick-start" className="w-full px-4 pb-16">
      <div className="mx-auto max-w-4xl">
        <h2 id="quick-start" className="text-2xl font-semibold mb-4">
          Quick Start Guide
        </h2>
        <p className="text-muted-foreground mb-8">
          Follow these steps to go from raw seller data to a marketplace-ready file.
        </p>

        {/* Flow Selector */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Button
            size="sm"
            variant={activeFlow === "getStarted" ? "default" : "secondary"}
            className={
              activeFlow === "getStarted" 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
            }
            onClick={() => setActiveFlow("getStarted")}
          >
            Get Started Flow
          </Button>
          <Button
            size="sm"
            variant={activeFlow === "separate" ? "default" : "secondary"}
            className={
              activeFlow === "separate" 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
            }
            onClick={() => setActiveFlow("separate")}
          >
            Separate Flow
          </Button>
        </div>

        <ol className="space-y-4">
          {flows[activeFlow].map((step) => (
            <li key={step.number} className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10 text-sm font-semibold text-primary flex-shrink-0"
              >
                {step.number}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default QuickStartGuide