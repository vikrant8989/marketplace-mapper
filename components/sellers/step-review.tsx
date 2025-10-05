"use client"

import { FileText, ShoppingCart, GitBranch, ArrowRight } from "lucide-react"
import { useMappingContext } from "./mapping-context"

export default function StepReview() {
  const { uploadedFileData, selectedMarketplace, columnMapping } = useMappingContext()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Review Your Configuration</h3>
        <p className="text-gray-600 dark:text-gray-400">Verify all details before saving</p>
      </div>

      <div className="space-y-4">
        {/* Uploaded file */}
        <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Uploaded File</div>
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {uploadedFileData?.file.name || "No file"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {uploadedFileData?.rowCount || 0} products • {uploadedFileData?.columns.length || 0} columns
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace */}
        <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Marketplace</div>
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {selectedMarketplace?.name || "None selected"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedMarketplace?.attributes.length || 0} total attributes
              </div>
            </div>
          </div>
        </div>

        {/* Mapping summary */}
        <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Column Mappings</div>
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {Object.keys(columnMapping).filter((key) => columnMapping[key]).length} columns mapped
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedMarketplace?.attributes.filter((attr) => attr.required).length || 0} required fields
              </div>
            </div>
          </div>
        </div>

        {/* Detailed list */}
        {Object.keys(columnMapping).filter((key) => columnMapping[key]).length > 0 && (
          <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Mapping Details</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(columnMapping)
                .filter(([_, value]) => value)
                .map(([sellerCol, marketplaceAttr]) => (
                  <div
                    key={sellerCol}
                    className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded"
                  >
                    <span className="font-mono text-gray-700 dark:text-gray-300">{sellerCol}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{marketplaceAttr}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
