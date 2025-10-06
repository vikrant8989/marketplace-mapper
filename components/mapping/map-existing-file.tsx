"use client";
import { useState, useEffect } from "react";
import { ArrowRight, FileText, Layout } from "lucide-react";
import { useToast } from "../toast-1";
import LoadingScreen from "../common/loading";
import {
  marketplaceAPI,
  sellerFileAPI,
  mappingAPI,
  ApiError,
} from "@/lib/api/client";
import { ERROR_MESSAGES } from "@/lib/constants";
import type {
  Marketplace,
  MarketplaceAttribute,
  SellerFile,
  SellerColumn,
} from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ColumnMappingPanel from "../sellers/column-mapping";

export default function MapExistingFile({
  onSave,
  onCancel,
}: {
  onSave?: (mapping: {
    sellerFileId: string;
    templateId: string;
    mappings: { templateColumn: MarketplaceAttribute; sellerColumn: string }[];
  }) => void;
  onCancel?: () => void;
}) {
  const [sellerFiles, setSellerFiles] = useState<SellerFile[]>([]);
  const [templates, setTemplates] = useState<Marketplace[]>([]);
  const [selectedSellerFile, setSelectedSellerFile] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateToSeller, setTemplateToSeller] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [incompleteOptionalCount, setIncompleteOptionalCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [files, templates] = await Promise.all([
        sellerFileAPI.getAll(),
        marketplaceAPI.getAll(),
      ]);
      setSellerFiles(Array.isArray(files) ? files : []);
      setTemplates(Array.isArray(templates) ? templates : []);
    } catch (error) {
      setSellerFiles([]);
      setTemplates([]);
      const message =
        error instanceof ApiError ? error.message : ERROR_MESSAGES.FETCH_ERROR;
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };


  const performSave = async () => {
    setIsSaving(true);
    try {
      const selectedFileData = sellerFiles.find(
        (f) => f.id === selectedSellerFile
      );
      if (!selectedFileData) {
        showToast("Selected file not found", "error");
        return;
      }

      const columnMapping: Record<string, string> = {};
      Object.entries(templateToSeller).forEach(([templateName, sellerName]) => {
        if (sellerName) columnMapping[sellerName] = templateName;
      });

      await mappingAPI.create({
        marketplaceId: selectedTemplate,
        sellerFileId: selectedSellerFile,
        columnMapping,
      });

      if (onSave) {
        const selectedTemplateData = templates.find(
          (t) => t.id === selectedTemplate
        );
        const mappingsList =
          selectedTemplateData?.attributes
            .filter((a) => !!templateToSeller[a.name])
            .map((a) => ({
              templateColumn: a as MarketplaceAttribute,
              sellerColumn: templateToSeller[a.name],
            })) || [];
        onSave({
          sellerFileId: selectedSellerFile,
          templateId: selectedTemplate,
          mappings: mappingsList,
        });
      }

      showToast("Mapping saved successfully!", "success");
    } catch (error) {
      const message =
      error instanceof ApiError ? error.message : ERROR_MESSAGES.SAVE_ERROR;
      showToast(`Failed to save mapping: ${message}`, "error");
    } finally {
      setIsSaving(false);
      setConfirmOpen(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSellerFile || !selectedTemplate) {
      showToast("Please select both seller file and template", "error");
      return;
    }
    const selectedTemplateData = templates.find(
      (t) => t.id === selectedTemplate
    );
    if (!selectedTemplateData) return;

    const requiredUnmapped = selectedTemplateData.attributes.filter(
      (a) => a.required && !templateToSeller[a.name]
    );
    if (requiredUnmapped.length > 0) {
      showToast(
        `Please map all required fields: ${requiredUnmapped
          .map((m) => m.name)
          .join(", ")}`,
        "error"
      );
      return;
    }

    const incomplete = selectedTemplateData.attributes.filter(
      (a) => !templateToSeller[a.name]
    );
    if (incomplete.length > 0) {
      setIncompleteOptionalCount(incomplete.length);
      setConfirmOpen(true);
      return;
    }

    await performSave();
  };

  const selectedFile = sellerFiles.find((f) => f.id === selectedSellerFile);
  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  const totalColumns = selectedTemplateData?.attributes?.length || 0;
  const mappedCount = Object.values(templateToSeller).filter(Boolean).length;
  const totalRequired =
    selectedTemplateData?.attributes?.filter((a) => a.required).length || 0;
  const requiredMappedCount =
    selectedTemplateData?.attributes?.filter(
      (a) => a.required && !!templateToSeller[a.name]
    ).length || 0;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Column Mapping</h1>
            <p className="text-gray-600">
              Map your seller file columns to the marketplace template columns
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Select Seller File</h2>
              </div>
              <select
                value={selectedSellerFile}
                onChange={(e) => setSelectedSellerFile(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              >
                <option value="">Choose a seller file...</option>
                {sellerFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.filename} ({file.columns?.length || 0} columns)
                  </option>
                ))}
              </select>
              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Rows:</span>{" "}
                    {selectedFile.rowCount || 0}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Columns:</span>{" "}
                    {selectedFile.columns?.length || 0}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Layout className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">
                  Select Marketplace Template
                </h2>
              </div>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSaving}
              >
                <option value="">Choose a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplateData && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Columns:</span>{" "}
                    {selectedTemplateData.attributes?.length || 0}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Required:</span>{" "}
                    {selectedTemplateData.attributes?.filter((a) => a.required)
                      .length || 0}
                  </p>
                </div>
              )}
            </div>
          </div>

          {selectedSellerFile && selectedTemplate && selectedTemplateData && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ColumnMappingPanel
                templateAttributes={
                  selectedTemplateData.attributes as MarketplaceAttribute[]
                }
                sellerColumns={(selectedFile?.columns || []) as SellerColumn[]}
                value={templateToSeller}
                onChange={setTemplateToSeller}
                autoMap
                disabled={isSaving}
              />

              <div className="flex justify-end space-x-4 pt-6 border-t">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="cursor-pointer px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={requiredMappedCount < totalRequired || isSaving}
                  className={`cursor-pointer px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                    requiredMappedCount < totalRequired || isSaving
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Mapping"
                  )}
                </button>
              </div>
            </div>
          )}

          {(!selectedSellerFile || !selectedTemplate) && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Files to Start Mapping
                </h3>
                <p className="text-gray-600">
                  Choose both a seller file and a marketplace template to begin
                  creating your column mappings
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Proceed with incomplete mapping?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {incompleteOptionalCount} optional column
              {incompleteOptionalCount === 1 ? "" : "s"} are not mapped. You can
              still save the mapping and fill these later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer" onClick={performSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save anyway"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
