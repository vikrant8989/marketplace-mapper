"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, type ReactNode } from "react"
import type { SellerFileData, Marketplace } from "@/lib/types"

const MappingContext = createContext<
  | {
      uploadedFileData: SellerFileData | null
      setUploadedFileData: (data: SellerFileData | null) => void
      selectedMarketplace: Marketplace | null
      setSelectedMarketplace: (marketplace: Marketplace | null) => void
      columnMapping: Record<string, string>
      setColumnMapping: (mapping: Record<string, string>) => void
      marketplaces: Marketplace[]
      setMarketplaces: (marketplaces: Marketplace[]) => void
      resetMapping: () => void
    }
  | undefined
>(undefined)

export function MappingProvider({ children }: { children: ReactNode }) {
  const [uploadedFileData, setUploadedFileData] = useState<SellerFileData | null>(null)
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])

  const resetMapping = () => {
    setUploadedFileData(null)
    setSelectedMarketplace(null)
    setColumnMapping({})
  }

  return (
    <MappingContext.Provider
      value={{
        uploadedFileData,
        setUploadedFileData,
        selectedMarketplace,
        setSelectedMarketplace,
        columnMapping,
        setColumnMapping,
        marketplaces,
        setMarketplaces,
        resetMapping,
      }}
    >
      {children}
    </MappingContext.Provider>
  )
}

export function useMappingContext() {
  const context = useContext(MappingContext)
  if (context === undefined) {
    throw new Error("useMappingContext must be used within a MappingProvider")
  }
  return context
}
