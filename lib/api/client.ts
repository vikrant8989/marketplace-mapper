import type { ApiResponse, Marketplace, SellerFile, MappingItem } from "@/lib/types"
import { API_ENDPOINTS } from "@/lib/constants"

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.error || data.message || "Request failed", response.status, data.details)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error instanceof Error ? error.message : "Unknown error occurred")
  }
}

/**
 * Marketplace API client
 */
export const marketplaceAPI = {
  async getAll(): Promise<Marketplace[]> {
    const response = await fetchAPI<Marketplace[]>(API_ENDPOINTS.MARKETPLACE)
    return Array.isArray(response.data) ? response.data : []
  },

  async create(data: { name: string; attributes: unknown[] }): Promise<Marketplace> {
    const response = await fetchAPI<Marketplace>(API_ENDPOINTS.MARKETPLACE, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data!
  },

  async delete(id: string): Promise<void> {
    await fetchAPI(`${API_ENDPOINTS.MARKETPLACE}?id=${id}`, {
      method: "DELETE",
    })
  },
}

/**
 * Seller file API client
 */
export const sellerFileAPI = {
  async getAll(): Promise<SellerFile[]> {
    const response = await fetchAPI<SellerFile[]>(API_ENDPOINTS.SELLER)
    return Array.isArray(response.data) ? response.data : []
  },

  async create(data: { filename: string; columns: unknown[]; rowCount?: number }): Promise<SellerFile> {
    const response = await fetchAPI<SellerFile>(API_ENDPOINTS.SELLER, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data!
  },

  async delete(id: string): Promise<void> {
    await fetchAPI(`${API_ENDPOINTS.SELLER}?id=${id}`, {
      method: "DELETE",
    })
  },
}

/**
 * Mapping API client
 */
export const mappingAPI = {
  async getAll(): Promise<MappingItem[]> {
    const response = await fetchAPI<MappingItem[]>(API_ENDPOINTS.MAPPING)
    return Array.isArray(response.data) ? response.data : []
  },

  async getById(id: string): Promise<MappingItem> {
    const response = await fetchAPI<MappingItem>(`${API_ENDPOINTS.MAPPING}?id=${id}`)
    return response as unknown as MappingItem
  },

  async create(data: {
    marketplaceId: string
    sellerFileId: string
    columnMapping: Record<string, string>
  }): Promise<MappingItem> {
    const response = await fetchAPI<MappingItem>(API_ENDPOINTS.MAPPING, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response as unknown as MappingItem
  },

  async delete(id: string): Promise<void> {
    await fetchAPI(`${API_ENDPOINTS.MAPPING}?id=${id}`, {
      method: "DELETE",
    })
  },
}
