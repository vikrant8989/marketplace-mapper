/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState } from "react"
import { Check, Upload, ArrowRight, FileText, ShoppingCart, GitBranch, Eye } from "lucide-react"
import SellerFileUploader from "./seller-file-uploader"
import { useMappingContext } from "./mapping-context"
import { useToast } from "../toast-1"
import { marketplaceAPI, sellerFileAPI, mappingAPI, ApiError } from "@/lib/api/client"
import { ERROR_MESSAGES } from "@/lib/constants"
import type { SellerFileData, Marketplace, MarketplaceAttribute, SellerColumn } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ColumnMappingPanel from "./column-mapping"

interface UploadSellerFileFlowProps {
  onMappingSaved: () => void
}

export default function UploadSellerFileFlow({ onMappingSaved }: UploadSellerFileFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const { showToast } = useToast()
  const {
    uploadedFileData,
    setUploadedFileData,
    selectedMarketplace,
    setSelectedMarketplace,
    columnMapping,
    setColumnMapping,
    marketplaces,
    setMarketplaces,
  } = useMappingContext()

  const [templateToSeller, setTemplateToSeller] = useState<Record<string, string>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [incompleteOptionalCount, setIncompleteOptionalCount] = useState(0)
  const [sellerFileId, setSellerFileId] = useState<string>("")
  // Fetch marketplaces on component mount
  const fetchMarketplaces = async () => {
    try {
      const data = await marketplaceAPI.getAll()
      setMarketplaces(Array.isArray(data) ? data : [])
    } catch (error) {
      setMarketplaces([])
      const message = error instanceof ApiError ? error.message : ERROR_MESSAGES.FETCH_ERROR
      showToast(message, "error", "bottom-right")
    }
  }

  useEffect(() => {
    fetchMarketplaces()
  }, [])

  useEffect(() => {
    // reset auto-mapping when file changes
    setTemplateToSeller({})
  }, [uploadedFileData?.file?.name])

  const handleFileUpload = async (data: SellerFileData) => {
    setUploadedFileData(data)
    try {
     const response : any = await sellerFileAPI.create({
        filename: data.file.name,
        columns: data.columns,
        rowCount: data.rowCount,
      })
      console.log("Created seller file:", response)
      if (response?.id) {
        setSellerFileId(response.id)
      } 
    } catch (error) {
      const message = error instanceof ApiError ? error.message : ERROR_MESSAGES.SAVE_ERROR
      showToast(message, "error", "bottom-right")
    }
  }

  const handleMarketplaceSelect = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace)
    setTemplateToSeller({})
    setColumnMapping({}) // keep context clean
  }

  const saveMappingToDatabase = async () => {
    if (!uploadedFileData || !selectedMarketplace) return

    setIsSaving(true)
    try {
      // Optional: small delay for UX consistency
      await new Promise((resolve) => setTimeout(resolve, 500))

      await mappingAPI.create({
        marketplaceId: selectedMarketplace.id,
        sellerFileId: sellerFileId,
        columnMapping,
      })

      return true
    } catch (error) {
      const message = error instanceof ApiError ? error.message : ERROR_MESSAGES.SAVE_ERROR
      showToast(message, "error", "bottom-right")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalSave = async () => {
    if (!selectedMarketplace) return
    // Compute required vs optional completeness using templateToSeller
    const requiredUnmapped = selectedMarketplace.attributes.filter((a) => a.required && !templateToSeller[a.name]) || []
    if (requiredUnmapped.length > 0) {
      showToast(
        `Please map all required fields: ${requiredUnmapped.map((m) => m.name).join(", ")}`,
        "error",
        "bottom-right",
      )
      return
    }

    const incomplete = selectedMarketplace.attributes.filter((a) => !templateToSeller[a.name]) || []
    if (incomplete.length > 0) {
      setIncompleteOptionalCount(incomplete.length)
      setConfirmOpen(true)
      return
    }

    const success = await saveMappingToDatabase()
    if (success) onMappingSaved()
  }

  const handleNext = async () => {
    if (currentStep === 3) {
      await handleFinalSave()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const steps = [
    {
      title: "Select Marketplace",
      icon: ShoppingCart,
      content: (
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
                  onClick={() => handleMarketplaceSelect(marketplace)}
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
      ),
    },
    {
      title: "Upload File",
      icon: Upload,
      content: <SellerFileUploader onFileUpload={handleFileUpload} />,
    },
    {
      title: "Create Mapping",
      icon: GitBranch,
      content: (
        <div className="max-w-5xl mx-auto">
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
                value={templateToSeller}
                onChange={(next) => {
                  setTemplateToSeller(next)
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
        </div>
      ),
    },
    {
      title: "Review & Save",
      icon: Eye,
      content: (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Review Your Configuration</h3>
            <p className="text-gray-600 dark:text-gray-400">Verify all details before saving</p>
          </div>

          <div className="space-y-4">
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

            {/* Show mapping details */}
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
      ),
    },
  ]

  return (
    <div className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create Product Mapping</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your product file and map it to marketplace attributes
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-between items-start mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isComplete = index < currentStep
            const isCurrent = index === currentStep
            const isIncomplete = index > currentStep

            return (
              <div key={index} className="relative flex flex-1 items-center">
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
                    {isComplete ? (
                      <Check className="w-5 h-5" />
                    ) : isCurrent ? (
                      <span>{index + 1}</span>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isIncomplete ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {index < steps.length - 1 && (
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

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
          {isSaving ? (
            <div className="text-center p-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Saving Mapping...</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Please wait while we save your configuration
                </p>
              </div>
            </div>
          ) : (
            steps[currentStep].content
          )}
        </div>

        {/* Navigation Buttons */}
        {!isSaving && (
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="cursor-pointer px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !selectedMarketplace) ||
                (currentStep === 1 && !uploadedFileData) ||
                (currentStep === 2 && Object.keys(columnMapping).filter((k) => columnMapping[k]).length === 0)
              }
              className="cursor-pointer px-6 py-3 text-sm font-semibold text-white bg-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === 3 ? "Save Mapping" : "Continue"}
            </button>
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Proceed with incomplete mapping?</AlertDialogTitle>
            <AlertDialogDescription>
              {incompleteOptionalCount} optional column{incompleteOptionalCount === 1 ? "" : "s"} are not mapped. You
              can save now and complete them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSaving}
              onClick={async () => {
                const success = await saveMappingToDatabase()
                if (success) onMappingSaved()
              }}
              className="cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save anyway"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
