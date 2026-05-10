"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "@/components/shell/TopBar";
import { HootPanel } from "@/components/shell/HootPanel";
import { DirectoryDropdown } from "@/components/shell/DirectoryDropdown";
import { HootProvider } from "@/components/shell/HootProvider";
import { getAppByRoute } from "@/lib/appRegistry";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isHootOpen, setIsHootOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  const appEntry = getAppByRoute(pathname);
  const appName = appEntry.name;

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
