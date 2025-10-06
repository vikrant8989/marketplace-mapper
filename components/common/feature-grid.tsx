"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Database, File, Link2, List } from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: "database",
    title: "Marketplaces",
    description: "Manage marketplace templates",
    color: "#5B7FFF",
    route: "/marketplaces",
  },
  {
    icon: "file",
    title: "Seller Files",
    description: "Upload product CSV files",
    color: "#6EDBAF",
    route: "/uploadfile",
  },
  {
    icon: "link",
    title: "Create Mapping",
    description: "Map columns to marketplace",
    color: "#9B6FFF",
    route: "/mapexistingfile",
  },
  {
    icon: "list",
    title: "View Mappings",
    description: "Browse saved mappings",
    color: "#FFB84D",
    route: "/mapping",
  },
];

export function FeatureGrid() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconMap: Record<string, any> = {
    database: Database,
    file: File,
    link: Link2,
    list: List,
  };

  return (
    <div className="container mt-10 mb-24 flex justify-center px-4">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const IconComponent = IconMap[feature.icon];
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-accent/50 rounded-lg transition"
                  onClick={() => router.push(feature.route)}
                >
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
                    style={{ backgroundColor: feature.color }}
                  >
                    <IconComponent className="h-8 w-8" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
