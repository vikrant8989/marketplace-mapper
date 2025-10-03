/**
 * File upload constraints
 */
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: [".csv"],
  MAX_SAMPLE_ROWS: 3,
} as const

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  MARKETPLACE: "/api/marketplace",
  SELLER: "/api/seller",
  MAPPING: "/api/mapping",
} as const

/**
 * Toast notification durations (in ms)
 */
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size should not exceed ${FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: "Please upload a CSV file",
  PARSE_ERROR: "Failed to parse CSV file. Please check the file format.",
  FETCH_ERROR: "Failed to fetch data. Please try again.",
  SAVE_ERROR: "Failed to save. Please try again.",
  DELETE_ERROR: "Failed to delete. Please try again.",
  VALIDATION_ERROR: "Validation failed. Please check your inputs.",
} as const
