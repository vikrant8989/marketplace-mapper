"use client"

import { Steps } from "@ark-ui/react/steps"
import { Check, Upload, ShoppingCart, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FileUploader from "./marketplace-file-uploader"
import { marketplaceAPI } from "@/lib/api/client"
import type { MarketplaceAttribute } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useToast } from "../toast-1"

interface UploadedFileData {
  file: File
  columns: MarketplaceAttribute[]
}

interface Marketplace {
  id: string
  name: string
  description?: string
}

export default function UploadMarketplaceFile() {
  const [selectedMarketplace, setSelectedMarketplace] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFileData, setUploadedFileData] = useState<UploadedFileData | null>(null)
  const [marketplaceId, setMarketplaceId] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [isLoadingMarketplaces, setIsLoadingMarketplaces] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newMarketplaceName, setNewMarketplaceName] = useState("")
  const [newMarketplaceDesc, setNewMarketplaceDesc] = useState("")
  const router = useRouter()
  const [isTemplateValid, setIsTemplateValid] = useState(false)
  const { showToast: toast } = useToast()

  useEffect(() => {
    fetchMarketplaces()
  }, [])

  const fetchMarketplaces = async () => {
    try {
      setIsLoadingMarketplaces(true)
      const response = await marketplaceAPI.getAll()
      setMarketplaces(response)
    } catch (error) {
      console.error("Failed to fetch marketplaces:", error)
      toast("Failed to load marketplaces, Please try again in a moment.", "error")
    } finally {
      setIsLoadingMarketplaces(false)
    }
  }

  const handleMarketplaceSelect = (marketplaceName: string) => {
    setSelectedMarketplace(marketplaceName)
    setUploadedFileData(null)
    setMarketplaceId(null)
    setIsTemplateValid(false)
    setIsCompleted(false)
  }

  const handleAddNewMarketplace = () => {
    if (!newMarketplaceName.trim()) {
      toast("Marketplace name required. Please enter a marketplace name.", "error")
      return
    }

    const newMarketplace: Marketplace = {
      id: `custom-${Date.now()}`,
      name: newMarketplaceName.trim(),
      description: newMarketplaceDesc.trim() || "Custom marketplace",
    }

    setMarketplaces([...marketplaces, newMarketplace])
    setSelectedMarketplace(newMarketplace.name)
    setNewMarketplaceName("")
    setNewMarketplaceDesc("")
    setShowAddDialog(false)
  }

  const handleFileUpload = async (file: File, attributes: MarketplaceAttribute[]) => {
    setUploadedFileData({ file, columns: attributes })
    setIsTemplateValid(true)

    try {
      setIsLoading(true)

      const marketplace = await marketplaceAPI.create({
        name: selectedMarketplace,
        attributes: attributes,
      })

      console.log(`${selectedMarketplace} template created successfully!`)
      setMarketplaceId(marketplace.id)
    } catch (error: unknown) {
      console.error("Error saving marketplace template:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save marketplace template"

      setUploadedFileData(null)
      setIsTemplateValid(false)

      toast(`Template not saved: ${errorMessage}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const getMarketplaceColor = (index: number) => {
    const colors = [
      "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
      "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    ]
    return colors[index % colors.length]
  }

  const steps = [
    {
      title: "Select Marketplace",
      icon: ShoppingCart,
      content: (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Choose Your Marketplace</h3>
            <p className="text-gray-600 dark:text-gray-400">Select the platform template you want to create</p>
          </div>

          {isLoadingMarketplaces ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading marketplaces...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketplaces.map((marketplace, index) => (
                <button
                  key={marketplace.id}
                  onClick={() => handleMarketplaceSelect(marketplace.name)}
                  className={`p-6 border-2 rounded-lg transition-all text-left ${
                    selectedMarketplace === marketplace.name
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                      : `${getMarketplaceColor(index)} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{marketplace.name}</div>
                    {selectedMarketplace === marketplace.name && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{marketplace.description}</p>
                </button>
              ))}

              <button
                onClick={() => setShowAddDialog(true)}
                className="cursor-pointer p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex flex-col items-center justify-center gap-3 min-h-[120px]"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-gray-100">Add New Marketplace</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create a custom marketplace</p>
                </div>
              </button>
            </div>
          )}
          <div className="mt-8 flex justify-end">
            <Steps.NextTrigger
              disabled={!selectedMarketplace || isLoading}
              className="cursor-pointer px-6 py-3 text-sm font-semibold text-white bg-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </Steps.NextTrigger>
          </div>
        </div>
      ),
    },
    {
      title: "Upload Template File",
      icon: Upload,
      content: (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Upload {selectedMarketplace} Template
            </h3>
          </div>
          <FileUploader onFileUpload={handleFileUpload} onValidationChange={setIsTemplateValid} />
          <div className="mt-8 flex justify-between items-center">
            <Steps.PrevTrigger className="cursor-pointer px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
              Previous
            </Steps.PrevTrigger>
            <Steps.NextTrigger
              disabled={isLoading || !uploadedFileData || !marketplaceId || !isTemplateValid}
              onClick={(e) => {
                if (isLoading || !uploadedFileData || !marketplaceId || !isTemplateValid) {
                  e.preventDefault()
                  toast(
                    "Cannot continue, Please upload a valid CSV and ensure the template is saved before proceeding.",
                    "error",
                  )
                  return
                }
                setIsCompleted(true)
              }}
              className="cursor-pointer px-6 py-3 text-sm font-semibold text-white bg-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Saving Template..." : "Next"}
            </Steps.NextTrigger>
          </div>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen px-4 py-10">
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create Marketplace Template</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a marketplace template CSV to define the required fields
          </p>
        </div>

        <Steps.Root count={2} defaultStep={0} className="w-full max-w-7xl mx-auto">
          <Steps.List className="flex justify-between items-start mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Steps.Item key={index} index={index} className="relative flex not-last:flex-1 items-center">
                  <Steps.Trigger className="flex flex-col items-center gap-3 text-center group cursor-pointer">
                    <Steps.Indicator className="flex justify-center items-center shrink-0 rounded-full font-semibold w-12 h-12 text-sm border-2 transition-all data-complete:bg-blue-600 data-complete:text-white data-complete:border-blue-600 data-current:bg-blue-600 data-current:text-white data-current:border-blue-600 data-current:shadow-lg data-incomplete:bg-white data-incomplete:text-gray-400 data-incomplete:border-gray-300 dark:data-incomplete:bg-gray-800 dark:data-incomplete:text-gray-500 dark:data-incomplete:border-gray-700 relative">
                      <span className="group-data-complete:hidden group-data-current:hidden">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="group-data-complete:hidden group-data-current:block hidden">{index + 1}</span>
                      <Check className="w-5 h-5 group-data-complete:block hidden" />
                    </Steps.Indicator>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-data-incomplete:text-gray-500 group-data-incomplete:dark:text-gray-400">
                      {step.title}
                    </span>
                  </Steps.Trigger>
                  <Steps.Separator
                    hidden={index === steps.length - 1}
                    className="flex-1 bg-gray-300 dark:bg-gray-700 h-0.5 mx-4 mt-[-24px] data-complete:bg-blue-600 transition-colors"
                  />
                </Steps.Item>
              )
            })}
          </Steps.List>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
            {steps.map((step, index) => (
              <Steps.Item key={index} index={index}>
                <Steps.Content index={index}>{step.content}</Steps.Content>
              </Steps.Item>
            ))}

            <Steps.CompletedContent className="text-center p-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Template Created Successfully!</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  <strong>{selectedMarketplace}</strong> marketplace template has been created.
                  <br />
                  <strong>{uploadedFileData?.columns.length}</strong> attributes detected from{" "}
                  <strong>{uploadedFileData?.file.name}</strong>
                </p>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg w-full max-w-md">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Detected Attributes:</h4>
                  <div className="text-sm text-left space-y-1 max-h-40 overflow-y-auto">
                    {uploadedFileData?.columns.map((col, idx) => (
                      <div key={idx} className="text-gray-600 dark:text-gray-400">
                        • {col.name} <span className="text-blue-600">({col.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    className="bg-blue-500 hover:bg-blue-700 text-white cursor-pointer"
                    onClick={() => {
                      router.push("/seller")
                    }}
                  >
                    Create Mapping
                  </Button>
                </div>
              </div>
            </Steps.CompletedContent>
          </div>
        </Steps.Root>
      </div>

      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Marketplace</AlertDialogTitle>
            <AlertDialogDescription>Enter the details for your custom marketplace template.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="marketplace-name">Marketplace Name *</Label>
              <Input
                id="marketplace-name"
                placeholder="e.g., Etsy, eBay, Custom Store"
                value={newMarketplaceName}
                onChange={(e) => setNewMarketplaceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketplace-desc">Description (Optional)</Label>
              <Input
                id="marketplace-desc"
                placeholder="e.g., Handmade goods marketplace"
                value={newMarketplaceDesc}
                onChange={(e) => setNewMarketplaceDesc(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => {
                setNewMarketplaceName("")
                setNewMarketplaceDesc("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer" onClick={handleAddNewMarketplace}>
              Add Marketplace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
