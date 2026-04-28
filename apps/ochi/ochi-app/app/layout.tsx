import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "OCHI Dashboard | Pacific City",
  description: "Oregon Coastal Hospitality Intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F8F9FA] text-[#1A1A1A] antialiased`}>
        {/* MCOS Shell will be injected here during build/deployment */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
