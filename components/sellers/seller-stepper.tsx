"use client"

import { Check } from "lucide-react"
import { useMappingContext } from "./mapping-context"

export default function SellerStepper() {
  const { currentStep, stepTitles } = useMappingContext()

  if (!stepTitles || stepTitles.length === 0) return null

  return (
    <div className="flex justify-between items-start mb-12">
      {stepTitles.map((title, index) => {
        const isComplete = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={title} className="relative flex flex-1 items-center">
            <div className="flex flex-col items-center gap-3 text-center flex-1">
              <div
                className={`flex justify-center items-center shrink-0 rounded-full font-semibold w-12 h-12 text-sm border-2 transition-all ${
                  isComplete
                    ? "bg-blue-600 text-white border-blue-600"
                    : isCurrent
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700"
                }`}
              >
                {isComplete ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
              </div>
              <span
                className={`text-sm font-semibold ${
                  index > currentStep ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {title}
              </span>
            </div>

            {index < stepTitles.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-colors ${
                  isComplete ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
