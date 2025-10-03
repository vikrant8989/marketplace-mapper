"use client"
import { useState } from "react"
import SellerFileUploader from "@/components/sellers/seller-file-uploader"
import { useToast } from "../toast-1"
import { CheckCircle, FileText, ArrowRight, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { sellerFileAPI, ApiError } from "@/lib/api/client"
import { ERROR_MESSAGES } from "@/lib/constants"

interface SellerColumn {
  name: string
  sampleData: string[]
}

interface SellerFileData {
  file: File
  columns: SellerColumn[]
  rowCount: number
}

export default function UploadSellerFilePageOnly() {
  const { showToast } = useToast()
  const [uploadedFile, setUploadedFile] = useState<SellerFileData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const handleFileUpload = async (data: SellerFileData) => {
    setIsUploading(true)
    try {
      await sellerFileAPI.create({
        filename: data.file.name,
        columns: data.columns,
        rowCount: data.rowCount,
      })

      setUploadedFile(data)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : ERROR_MESSAGES.SAVE_ERROR
      showToast(message, "error", "bottom-right")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateMapping = () => {
    console.log("Create mapping for file:", uploadedFile)
    router.push("/mapexistingfile")
  }

  const handleGoHome = () => {
    console.log("Go to home")
    router.push("/")
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {!uploadedFile ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Upload Seller File</h1>
              <p className="text-gray-600 mb-8">Upload your seller file to get started</p>
              <SellerFileUploader onFileUpload={handleFileUpload} />
            </>
          ) : (
            <div className="text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">File Uploaded Successfully!</h2>
                <p className="text-gray-600">Your file has been uploaded and processed</p>
              </div>

              {/* File Details Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
                <div className="flex items-start space-x-4">
                  <FileText className="w-10 h-10 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{uploadedFile.file.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Rows:</span> {uploadedFile.rowCount}
                      </p>
                      <p>
                        <span className="font-medium">Columns:</span> {uploadedFile.columns.length}
                      </p>
                      <div className="mt-2">
                        <span className="font-medium">Column Names:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {uploadedFile.columns.map((col, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {col.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleCreateMapping}
                  className="cursor-pointer flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <span>Create Mapping</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleGoHome}
                  className="cursor-pointer flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Home className="w-5 h-5" />
                  <span>Go to Home</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
