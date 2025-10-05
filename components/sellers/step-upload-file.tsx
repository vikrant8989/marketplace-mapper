"use client"

import SellerFileUploader from "./seller-file-uploader"
import { useToast } from "../toast-1"
import { sellerFileAPI, ApiError } from "@/lib/api/client"
import { ERROR_MESSAGES } from "@/lib/constants"
import { useMappingContext } from "./mapping-context"
import type { SellerFileData } from "@/lib/types"

export default function StepUploadFile() {
  const { showToast } = useToast()
  const { setUploadedFileData, setSellerFileId } = useMappingContext()

  const handleFileUpload = async (data: SellerFileData) => {
    setUploadedFileData(data)
    try {
      const response: any = await sellerFileAPI.create({
        filename: data.file.name,
        columns: data.columns,
        rowCount: data.rowCount,
      })
      if (response?.id) {
        setSellerFileId(response.id)
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : ERROR_MESSAGES.SAVE_ERROR
      showToast(message, "error", "bottom-right")
    }
  }

  return <SellerFileUploader onFileUpload={handleFileUpload} />
}
