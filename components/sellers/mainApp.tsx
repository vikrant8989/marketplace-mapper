"use client";
import { useState } from "react";
import { MappingProvider } from "./mapping-context";
import UploadSellerFileFlow from "./upload-seller-file-flow";
import MappingSuccessScreen from "./mapping-success-screen";

export default function SellerMappingApp() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMappingSaved = () => {
    setShowSuccess(true);
  };

  return (
    <MappingProvider>
      {showSuccess ? (
        <MappingSuccessScreen />
      ) : (
        <UploadSellerFileFlow onMappingSaved={handleMappingSaved} />
      )}
    </MappingProvider>
  );
}
