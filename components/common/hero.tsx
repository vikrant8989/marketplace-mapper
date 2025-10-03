"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Hero() {
  const router = useRouter();
  return (
    <div className="hero-gradient relative overflow-hidden py-24 text-center">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-5xl font-bold text-white mb-6 text-balance">
          Welcome to Marketplace Mapper
        </h1>
        <p className="text-xl text-white/90 mb-8 text-pretty">
          Map your product data to marketplace formats seamlessly
        </p>
        <Button
          size="lg"
          className="bg-[oklch(0.5_0.2_264)] hover:bg-[oklch(0.45_0.2_264)] cursor-pointer text-white px-8 py-6 text-lg rounded-xl"
          onClick={() => {
            router.push("/seller");
          }}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
