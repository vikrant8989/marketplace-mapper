"use client"

import ColumnMappingPanel from "./column-mapping"
import { useMappingContext } from "./mapping-context"
import type { MarketplaceAttribute, SellerColumn } from "@/lib/types"

export interface StepColumnMappingProps {
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
}

export default function StepColumnMapping({ value, onChange }: StepColumnMappingProps) {
  const { uploadedFileData, selectedMarketplace, setColumnMapping } = useMappingContext()

  return (
    <>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Map Your Columns</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your CSV columns to {selectedMarketplace?.name || "marketplace"} attributes
        </p>
      </div>

      {uploadedFileData && selectedMarketplace && (
        <div className="space-y-4">
          <ColumnMappingPanel
            templateAttributes={selectedMarketplace.attributes as MarketplaceAttribute[]}
            sellerColumns={(uploadedFileData.columns || []) as SellerColumn[]}
            value={value}
            onChange={(next) => {
              onChange(next)
              const inverted: Record<string, string> = {}
              Object.entries(next).forEach(([templateName, sellerName]) => {
                if (sellerName) inverted[sellerName] = templateName
              })
              setColumnMapping(inverted)
            }}
            autoMap
          />
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Tip:</strong> Make sure to map all required (*) attributes before proceeding.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
