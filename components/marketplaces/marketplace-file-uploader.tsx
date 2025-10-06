"use client"

import type React from "react"
import { useRef, useState, useCallback } from "react"
import { Upload, FileText, X, Download } from "lucide-react"
import type { MarketplaceAttribute } from "@/lib/types"
import { parseMarketplaceTemplate, validateFile, formatFileSize } from "@/lib/utils/csv-parser"
import { ERROR_MESSAGES } from "@/lib/constants"
import { useToast } from "../toast-1"

interface FileUploaderProps {
  onFileUpload: (file: File, attributes: MarketplaceAttribute[]) => void
  onValidationChange?: (valid: boolean) => void
}

const FileUploader = ({ onFileUpload, onValidationChange }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { showToast: toast } = useToast()

  const handleFileSelect = async (files: FileList) => {
    if (files.length > 0) {
      const file = files[0]

      const validation = validateFile(file)
      if (!validation.valid) {
        onValidationChange?.(false)
        toast(validation.error || "Invalid file", "error")
        return
      }

      setIsProcessing(true)

      try {
        const attributes = await parseMarketplaceTemplate(file)

        setUploadedFile(file)
        onValidationChange?.(true)
        onFileUpload(file, attributes)
      } catch (error) {
        console.error("Error parsing CSV:", error)
        onValidationChange?.(false)
        toast(error instanceof Error ? error.message : ERROR_MESSAGES.PARSE_ERROR, "error")
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = () => {
    setUploadedFile(null)
    onValidationChange?.(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const downloadFile = () => {
    if (!uploadedFile) return
    const url = URL.createObjectURL(uploadedFile)
    const link = document.createElement("a")
    link.href = url
    link.download = uploadedFile.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full">
        {!uploadedFile ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 
            ${isDragOver ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-300"} 
            hover:scale-[1.01]`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files!)}
              className="hidden"
              accept=".csv"
              disabled={isProcessing}
            />

            <div className="relative z-10">
              <div
                className={`cursor-pointer w-16 h-16 mx-auto mb-6 p-4 rounded-full 
                ${isDragOver ? "bg-blue-500" : "bg-gray-400"} transition-colors duration-300`}
              >
                <Upload className="w-full h-full text-white" />
              </div>

              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {isProcessing ? "Processing template..." : "Upload Marketplace Template"}
              </h3>

              <p className="mb-6 text-lg text-gray-600">
                {isProcessing
                  ? "Parsing attributes and validation rules..."
                  : "Drag and drop your template CSV here, or click to browse"}
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 
                font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 
                disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Choose File"}
              </button>

              <div className="mt-6 text-sm text-gray-500 bg-gray-100 p-4 rounded-lg max-w-2xl mx-auto">
                <p className="font-semibold mb-2">Expected CSV Format:</p>
                <p className="text-left">
                  • <strong>attribute_name</strong>: Field name (e.g., title, brand)
                  <br />• <strong>data_type</strong>: string, number, enum, array, boolean
                  <br />• <strong>required</strong>: TRUE or FALSE
                  <br />• <strong>max_length</strong>: Maximum length for strings
                  <br />• <strong>allowed_values</strong>: Comma-separated values for enums
                  <br />• <strong>validation_rules</strong>: Additional validation info
                </p>
              </div>

              <div className="mt-4 text-sm text-gray-500">Supports only CSV file types • Maximum 100MB per file</div>
            </div>

            {isDragOver && <div className="absolute inset-0 bg-blue-500/10 rounded-2xl animate-pulse" />}
          </div>
        ) : (
          <div className="p-6 border rounded-2xl bg-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(uploadedFile.size)} • CSV template</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={downloadFile}
                className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors duration-200"
                title="Download file"
              >
                <Download className="w-5 h-5" />
              </button>

              <button
                onClick={removeFile}
                className="p-2 rounded-lg text-gray-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUploader
