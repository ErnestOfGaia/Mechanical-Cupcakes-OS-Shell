"use client";

import React, { useState } from "react";
import { TopBar } from "./TopBar";
import { HootPanel } from "./HootPanel";
import { DirectoryDropdown } from "./DirectoryDropdown";

export const ShellWrapper: React.FC<{ children: React.ReactNode; appName: string }> = ({
  children,
  appName,
}) => {
  const [isHootOpen, setIsHootOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  return (
    <>
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

      <main className="pt-12 min-h-screen">
        {children}
      </main>
    </>
  );
};
