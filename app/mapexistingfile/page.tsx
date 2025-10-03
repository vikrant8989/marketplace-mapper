"use client";
import MapExistingFile from "@/components/mapping/map-existing-file";
import MappingExistingSuccesScreen from "@/components/mapping/mapping-success";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MappingListPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const handleMappingSaved = () => {
    setShowSuccess(true);
  };
  return (
    <div className="bg-background">
      <div className="container">
        {showSuccess ? (
          <MappingExistingSuccesScreen />
        ) : (
          <MapExistingFile
            onSave={handleMappingSaved}
            onCancel={() => router.back()}
          />
        )}
      </div>
    </div>
  );
}
