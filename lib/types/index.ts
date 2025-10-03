/**
 * Represents a marketplace template attribute with validation rules
 */
export interface MarketplaceAttribute {
  name: string
  type: "string" | "number" | "enum" | "array" | "boolean"
  required: boolean
  maxLength?: number
  minValue?: number
  enumValues?: string[]
  description?: string
  validationRules?: string
}

/**
 * Represents a column in a seller's CSV file with sample data
 */
export interface SellerColumn {
  name: string
  sampleData: string[]
}

/**
 * Represents uploaded seller file data
 */
export interface SellerFileData {
  file: File
  columns: SellerColumn[]
  rowCount: number
}

/**
 * Represents a marketplace template
 */
export interface Marketplace {
  id: string
  name: string
  attributes: MarketplaceAttribute[]
  createdAt?: string
  updatedAt?: string
}

/**
 * Represents a seller file record in the database
 */
export interface SellerFile {
  id: string
  filename: string
  columns: SellerColumn[]
  rowCount?: number
  uploadedAt?: string
}

/**
 * Represents a column mapping between seller and marketplace
 */
export interface ColumnMapping {
  templateColumn: MarketplaceAttribute
  sellerColumn: string
}

/**
 * Represents a saved mapping record
 */
export interface MappingItem {
  id: string
  marketplaceId: string
  marketplaceName: string
  sellerFileId: string
  sellerFilename: string
  columnMapping: Record<string, string>
  mappingCount?: number
  createdAt: string
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: unknown
}
