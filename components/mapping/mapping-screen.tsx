"use client"
import { useState, useEffect } from "react"
import { FileText, ShoppingCart, GitBranch, Eye, Trash2, Calendar, ArrowRight, Plus, Loader2 } from "lucide-react"
import LoadingScreen from "../common/loading"
import { useToast } from "../toast-1"
import type { MappingItem } from "@/lib/types"
import { mappingAPI } from "@/lib/api/client"
import { formatDate } from "@/lib/utils/date"
import { useRouter } from "next/navigation"

export default function MappingsPage() {
  const { showToast } = useToast()
  const [mappings, setMappings] = useState<MappingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMapping, setSelectedMapping] = useState<MappingItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mappingToDelete, setMappingToDelete] = useState<MappingItem | null>(null)
  const router = useRouter();
  useEffect(() => {
    fetchMappings()
  }, [])

  const fetchMappings = async () => {
    try {
      setIsLoading(true)
      const data = await mappingAPI.getAll()
      console.log("Fetched Mappings:", data)  
      setMappings(data)
    } catch (error) {
      console.error("Error fetching mappings:", error)
      showToast("Failed to fetch mappings", "error", "bottom-right")
    } finally {
      setIsLoading(false)
    }
  }

  const openDeleteModal = (mapping: MappingItem) => {
    setMappingToDelete(mapping)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setMappingToDelete(null)
  }

  const confirmDelete = async () => {
    if (!mappingToDelete) return

    try {
      setDeletingId(mappingToDelete.id)
      await mappingAPI.delete(mappingToDelete.id)

      setMappings(mappings.filter((m) => m.id !== mappingToDelete.id))
      showToast("Mapping deleted successfully", "success", "bottom-right")
      closeDeleteModal()
    } catch (error) {
      showToast("Failed to delete mapping", "error", "bottom-right")
    } finally {
      setDeletingId(null)
    }
  }

  const viewMappingDetails = async (mapping: MappingItem) => {
    try {
      setViewingId(mapping.id)
      const result : any = await mappingAPI.getById(mapping.id)
      const detailedData = result.data;
      console.log("Detailed Mapping Data:", detailedData);
      const safeColumnMapping =
        detailedData && typeof detailedData.columnMapping === "object" && detailedData.columnMapping !== null
          ? (detailedData.columnMapping as Record<string, string>)
          : {}
      console.log("Safe Column Mapping:", safeColumnMapping);
      setSelectedMapping({
        ...mapping,
        columnMapping: safeColumnMapping,
      })
      setShowDetailModal(true)
    } catch (error) {
      showToast("Failed to load mapping details", "error", "bottom-right")
    } finally {
      setViewingId(null)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Product Mappings</h1>
            <p className="text-gray-600 dark:text-gray-400">View and manage your seller to marketplace mappings</p>
          </div>
          <button
            onClick={() => router.push("/mapexistingfile")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create New Mapping
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Mappings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mappings.length}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Marketplaces</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Set(mappings.map((m) => m.marketplaceName)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Seller Files</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Set(mappings.map((m) => m.sellerFilename)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mappings List */}
        {mappings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No mappings yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first mapping to get started</p>
            <button
              onClick={() => router.push("/mapexistingfile")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Create Mapping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mappings.map((mapping) => (
              <div
                key={mapping.id}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{mapping.sellerFilename}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {mapping.marketplaceName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        <span>{mapping.mappingCount} columns mapped</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(mapping.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewMappingDetails(mapping)}
                      disabled={viewingId === mapping.id}
                      className="p-2 cursor-pointer text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View details"
                    >
                      {viewingId === mapping.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => openDeleteModal(mapping)}
                      disabled={deletingId === mapping.id}
                      className="p-2 cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete mapping"
                    >
                      {deletingId === mapping.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && mappingToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeDeleteModal}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3">
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Are you sure you want to delete this mapping?
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {mappingToDelete.sellerFilename}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <ShoppingCart className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {mappingToDelete.marketplaceName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deletingId === mappingToDelete.id}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingId === mappingToDelete.id}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingId === mappingToDelete.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMapping && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mapping Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-500">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Seller File</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedMapping.sellerFilename}</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">Marketplace</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedMapping.marketplaceName}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Column Mappings</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(() => {
                    const safe =
                      selectedMapping?.columnMapping && typeof selectedMapping.columnMapping === "object"
                        ? (selectedMapping.columnMapping as Record<string, string>)
                        : {}
                    const entries = Object.entries(safe).filter(([_, value]) => Boolean(value))

                    if (entries.length === 0) {
                      return (
                        <div className="p-4 text-sm text-gray-600 dark:text-gray-400">No column mappings found.</div>
                      )
                    }

                    return entries.map(([sellerCol, marketplaceAttr]) => (
                      <div key={sellerCol} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Seller Column</div>
                            <div className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {sellerCol}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Marketplace Attribute</div>
                            <div className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                              {marketplaceAttr}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Created: {formatDate(selectedMapping.createdAt)}</span>
                  <span>Mapping ID: {selectedMapping.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
