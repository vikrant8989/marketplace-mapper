import type { MarketplaceAttribute, SellerColumn, SellerFileData } from "@/lib/types"
import { FILE_CONSTRAINTS } from "@/lib/constants"

/**
 * Parses a CSV line handling quoted values correctly
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ""))
      current = ""
    } else {
      current += char
    }
  }
  values.push(current.trim().replace(/^"|"$/g, ""))
  return values
}

/**
 * Parses marketplace template CSV into MarketplaceAttribute array
 */
export async function parseMarketplaceTemplate(file: File): Promise<MarketplaceAttribute[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          reject(new Error("CSV file must have header and at least one attribute"))
          return
        }

        // Parse header row to get column positions
        const headerRow = lines[0].toLowerCase()
        const headers = parseCSVLine(headerRow)

        const nameIdx = headers.findIndex((h) => h.includes("attribute") || h.includes("name"))
        const typeIdx = headers.findIndex((h) => h.includes("type") || h.includes("data_type"))
        const requiredIdx = headers.findIndex((h) => h.includes("required"))
        const maxLengthIdx = headers.findIndex((h) => h.includes("max") || h.includes("length"))
        const allowedValuesIdx = headers.findIndex(
          (h) => h.includes("allowed") || h.includes("enum") || h.includes("values"),
        )
        const validationIdx = headers.findIndex((h) => h.includes("validation") || h.includes("rules"))

        if (nameIdx === -1 || typeIdx === -1) {
          reject(new Error('CSV must have "attribute_name" and "data_type" columns'))
          return
        }

        const attributes: MarketplaceAttribute[] = []

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const values = parseCSVLine(line)
          const attributeName = values[nameIdx]?.trim()
          const dataType = values[typeIdx]?.trim().toLowerCase()

          if (!attributeName || !dataType) continue

          const attribute: MarketplaceAttribute = {
            name: attributeName,
            type: (dataType === "integer" ? "number" : dataType) as MarketplaceAttribute["type"],
            required: requiredIdx !== -1 ? values[requiredIdx]?.trim().toUpperCase() === "TRUE" : false,
          }

          if (maxLengthIdx !== -1 && values[maxLengthIdx]) {
            const maxLength = Number.parseInt(values[maxLengthIdx])
            if (!isNaN(maxLength)) attribute.maxLength = maxLength
          }

          if (allowedValuesIdx !== -1 && values[allowedValuesIdx]) {
            const allowedValues = values[allowedValuesIdx]
              .split(/[,|;]/)
              .map((v) => v.trim())
              .filter((v) => v)
            if (allowedValues.length > 0) attribute.enumValues = allowedValues
          }

          if (validationIdx !== -1 && values[validationIdx]) {
            const validationRule = values[validationIdx].trim()
            attribute.validationRules = validationRule

            const minMatch = validationRule.match(/>=\s*(\d+)/)
            if (minMatch) attribute.minValue = Number.parseInt(minMatch[1])

            if (!attribute.description) attribute.description = validationRule
          }

          attributes.push(attribute)
        }

        if (attributes.length === 0) {
          reject(new Error("No valid attributes found in CSV"))
          return
        }

        resolve(attributes)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

/**
 * Parses seller product CSV into SellerFileData
 */
export async function parseSellerFile(file: File): Promise<SellerFileData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          reject(new Error("CSV file must have header row and at least one data row"))
          return
        }

        const headerRow = lines[0]
        const columnNames = parseCSVLine(headerRow)

        if (columnNames.length === 0 || columnNames.every((col) => !col)) {
          reject(new Error("No valid column headers found"))
          return
        }

        const sampleRows: string[][] = []
        const maxSampleRows = Math.min(FILE_CONSTRAINTS.MAX_SAMPLE_ROWS + 1, lines.length - 1)

        for (let i = 1; i <= maxSampleRows; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const values = parseCSVLine(line)

          while (values.length < columnNames.length) {
            values.push("")
          }

          sampleRows.push(values)
        }

        const columns: SellerColumn[] = columnNames.map((name, index) => ({
          name,
          sampleData: sampleRows.map((row) => row[index] || "").filter((val) => val),
        }))

        resolve({
          file,
          columns,
          rowCount: lines.length - 1,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

/**
 * Validates file before processing
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
    return {
      valid: false,
      error: `File size should not exceed ${FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB`,
    }
  }

  if (!file.name.endsWith(".csv")) {
    return {
      valid: false,
      error: "Please upload a CSV file",
    }
  }

  return { valid: true }
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
