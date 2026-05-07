"use client";

import React from "react";
import { Header } from "../components/Header";
import { PrimaryIndicator } from "../components/PrimaryIndicator";
import { SignalGrid } from "../components/SignalGrid";
import { LogicAnnotation } from "../components/LogicAnnotation";
import { buildMultiplierData } from "../lib/multiplier";

export default function OchiDashboard() {
  const multiplierData = buildMultiplierData();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-7 space-y-6">
          <PrimaryIndicator data={multiplierData} />
          <SignalGrid />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <LogicAnnotation />
        </div>
      </div>
      <footer className="mt-auto text-center pt-8 pb-4">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]" aria-label="Utilitarian Intelligence Framework">Utilitarian Intelligence Framework</p>
      </footer>
    </div>
  );
}
