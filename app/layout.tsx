import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/common/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastProvider } from "@/components/toast-1";
import { Roboto_Mono } from "next/font/google";
const geistSans = Roboto_Mono({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketplace Mapper",
  description:
    "Map your product data to different marketplace formats seamlessly"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <Header />
          <ScrollArea className="h-[calc(100vh-70px)]">{children}</ScrollArea>
        </ToastProvider>
      </body>
    </html>
  );
}
