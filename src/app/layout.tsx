"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "@/components/shell/TopBar";
import { HootPanel } from "@/components/shell/HootPanel";
import { DirectoryDropdown } from "@/components/shell/DirectoryDropdown";
import { HootProvider } from "@/components/shell/HootProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isHootOpen, setIsHootOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  
  // Map path to App Name
  const getAppName = (path: string) => {
    if (path === "/") return "Hoot Dashboard";
    if (path.includes("/ochi")) return "OCHI Dashboard";
    if (path.includes("/pelican")) return "Pelican";
    if (path.includes("/postcards")) return "Postcards";
    return "MCOS Shell";
  };

  const appName = getAppName(pathname);

  // Auto-open logic for Hoot
  useEffect(() => {
    const hasVisited = localStorage.getItem(`mcos_visited_${appName}`);
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsHootOpen(true);
        localStorage.setItem(`mcos_visited_${appName}`, "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [appName]);

  return (
    <html lang="en">
      <body className="antialiased bg-dot-pattern min-h-screen">
        <HootProvider>
          <div className="scanline-overlay" />
          <TopBar
            appName={appName}
            onOpenDirectory={() => setIsDirectoryOpen(!isDirectoryOpen)}
            onOpenHoot={() => setIsHootOpen(!isHootOpen)}
          />

          <DirectoryDropdown
            isOpen={isDirectoryOpen}
            onClose={() => setIsDirectoryOpen(false)}
          />

          <HootPanel
            isOpen={isHootOpen}
            onClose={() => setIsHootOpen(false)}
            appName={appName}
          />

          <main className="pt-12 min-h-screen relative z-0">
            {children}
          </main>
        </HootProvider>
      </body>
    </html>
  );
}
