"use client";

import React from "react";
import { Activity, Map, Fuel, Search, TrendingUp, Info } from "lucide-react";

export default function OchiDashboard() {
  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 space-y-6">
      {/* Pilot Header */}
      <header className="py-4 border-b border-gray-200">
        <h1 className="text-2xl font-black tracking-tight uppercase">OCHI</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pacific City Pilot | Live Data Feed</p>
        </div>
      </header>

      {/* Primary Indicator */}
      <section className="bg-black text-white rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Multiplier</p>
            <h2 className="text-7xl font-black mt-2">0.82</h2>
          </div>
          <div className="bg-green-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
            High Vol
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="w-[82%] h-full bg-green-500" />
          </div>
          <p className="text-[10px] text-gray-500 font-medium italic">Forecasting 82% efficiency for the current period.</p>
        </div>
      </section>

      {/* The Data Five */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Gatekeeper Pulse</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: "hwy6", label: "Hwy 6 Status", value: "OPEN", icon: Map, color: "text-green-600", bg: "bg-green-50" },
            { id: "gas", label: "Gas Index", value: "$4.12", icon: Fuel, color: "text-green-600", bg: "bg-green-50" },
            { id: "search", label: "Search Intent", value: "HIGH", icon: Search, color: "text-green-600", bg: "bg-green-50" },
            { id: "tlt", label: "TLT Pulse", value: "MODERATE", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between group hover:border-gray-300 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-lg font-black text-black leading-none mt-1">{item.value}</p>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors cursor-pointer" />
            </div>
          ))}
        </div>
      </section>

      {/* Loud AI Logic */}
      <section className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="px-2 py-0.5 bg-black text-white text-[8px] font-black rounded uppercase tracking-widest">Logic</div>
          <span className="text-[10px] font-bold text-black uppercase tracking-wider">Forecast Annotation</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed font-medium">
          The Multiplier is anchored by **Hwy 6 Fluidity**. Historical modeling indicates that a "Closed" status on Hwy 6 restricts Pacific City volume to 40% regardless of secondary metrics. Current status is "Open," allowing Search Interest and Gas Prices to exert positive pressure on the 48h forecast.
        </p>
      </section>

      <footer className="text-center pt-8 pb-12">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">Utilitarian Intelligence Framework</p>
      </footer>
    </div>
  );
}
