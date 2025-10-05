/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState } from "react"
import StepSelectMarketplace from "./step-select-marketplace"
import StepUploadFile from "./step-upload-file"
import StepColumnMapping from "./step-column-mapping"
import StepReview from "./step-review"
import SellerStepper from "./seller-stepper"
import { useMappingContext } from "./mapping-context"
import { useToast } from "../toast-1"
import { marketplaceAPI, sellerFileAPI, mappingAPI, ApiError } from "@/lib/api/client"
import { ERROR_MESSAGES } from "@/lib/constants"
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

interface UploadSellerFileFlowProps {
  onMappingSaved: () => void
}

export default function UploadSellerFileFlow({ onMappingSaved }: UploadSellerFileFlowProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { showToast } = useToast()
  const {
    uploadedFileData,
    selectedMarketplace,
    columnMapping,
    setColumnMapping,
    setMarketplaces,
    currentStep,
    setCurrentStep,
    setStepTitles,
    sellerFileId,
  } = useMappingContext()

  const [templateToSeller, setTemplateToSeller] = useState<Record<string, string>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [incompleteOptionalCount, setIncompleteOptionalCount] = useState(0)

  useEffect(() => {
    setStepTitles(["Select Marketplace", "Upload File", "Create Mapping", "Review & Save"])
  }, [setStepTitles])

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
    setTemplateToSeller({})
  }, [uploadedFileData?.file?.name])



  const saveMappingToDatabase = async () => {
    if (!uploadedFileData || !selectedMarketplace) return

    setIsSaving(true)
    try {
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
      setCurrentStep(currentStep+1);
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep-1);
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create Product Mapping</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your product file and map it to marketplace attributes
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <SellerStepper />
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
            <>
              {currentStep === 0 && <StepSelectMarketplace/>}

              {currentStep === 1 && <StepUploadFile/>}

              {currentStep === 2 && (
                <div className="max-w-5xl mx-auto">
                  <StepColumnMapping
                    value={templateToSeller}
                    onChange={(next) => {
                      setTemplateToSeller(next)
                      const inverted: Record<string, string> = {}
                      Object.entries(next).forEach(([templateName, sellerName]) => {
                        if (sellerName) inverted[sellerName] = templateName
                      })
                      setColumnMapping(inverted)
                    }}
                  />
                </div>
              )}

              {currentStep === 3 && <StepReview />}
            </>
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
            <AlertDialogCancel className="cursor-pointer" disabled={isSaving}>
              Cancel
            </AlertDialogCancel>
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
