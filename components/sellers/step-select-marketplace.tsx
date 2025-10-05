"use client"

import { Check } from "lucide-react"
import { useMappingContext } from "./mapping-context"

export default function StepSelectMarketplace() {
  const { marketplaces, selectedMarketplace, setSelectedMarketplace, setColumnMapping } = useMappingContext()

  const handleSelect = (marketplace: (typeof marketplaces)[number]) => {
    setSelectedMarketplace(marketplace)
    setColumnMapping({})
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Choose Your Marketplace</h3>
        <p className="text-gray-600 dark:text-gray-400">Select where you want to list your products</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marketplaces.length === 0 ? (
          <div className="col-span-2 text-center p-8 text-gray-500 dark:text-gray-400">
            No marketplaces available. Please upload marketplace templates first.
          </div>
        ) : (
          marketplaces.map((marketplace) => (
            <button
              key={marketplace.id}
              onClick={() => handleSelect(marketplace)}
              className={`p-6 border-2 rounded-lg transition-all text-left ${
                selectedMarketplace?.id === marketplace.id
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{marketplace.name}</div>
                {selectedMarketplace?.id === marketplace.id && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{marketplace.attributes.length} attributes</p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
