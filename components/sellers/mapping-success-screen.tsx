import { Check } from "lucide-react";
import { useMappingContext } from "./mapping-context";
import { useRouter } from "next/navigation";

export default function MappingSuccessScreen() {
  const { resetMapping } = useMappingContext();
  const router = useRouter(); 
  
  const handleViewMappings = () => {
    router.push("/mapping");
  };

  const handleCreateNew = () => {
    resetMapping();
    router.push("/mapexistingfile");
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 w-full px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Mapping Created Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Your product mapping has been saved. You can now view it in the
                mappings list or create a new one.
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleViewMappings}
                  className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View All Mappings
                </button>
                <button
                  onClick={handleCreateNew}
                  className="cursor-pointer px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-colors"
                >
                  Create New Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
