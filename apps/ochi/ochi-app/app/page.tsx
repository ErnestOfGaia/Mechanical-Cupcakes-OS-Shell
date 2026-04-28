"use client";

import React from "react";
import { Activity, Map, Fuel, Search, TrendingUp, Info } from "lucide-react";

export default function OchiDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      {/* Pilot Header */}
      <header className="py-4 border-b border-gray-200">
        <h1 className="text-2xl font-black tracking-tight uppercase">OCHI</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pacific City Pilot | Live Data Feed</p>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Indicators */}
        <div className="lg:col-span-7 space-y-6">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>

        {/* Right Column: Commentary & Logic */}
        <div className="lg:col-span-5 space-y-6">
          {/* Loud AI Logic */}
          <section className="bg-gray-100 rounded-2xl p-6 border border-gray-200 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-2 py-0.5 bg-black text-white text-[8px] font-black rounded uppercase tracking-widest">Logic</div>
              <span className="text-[10px] font-bold text-black uppercase tracking-wider">Forecast Annotation</span>
            </div>
            <div className="flex-1 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                The forecast is strongly anchored by <strong>Hwy 6 Fluidity</strong>. Based on past seasonal trends, a "Closed" status severely limits coastal day-trippers, dropping Pacific City visitor volume to 40% even on sunny weekends.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                With the highway currently "Open" and gas prices stabilizing, we're seeing strong search intent for coastal dining and weekend getaways over the next 48 hours.
              </p>
              <div className="p-4 bg-white rounded-xl border border-gray-200 mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Recommendation</p>
                <p className="text-sm text-gray-800 font-medium">Boost local ad spend for lunch and dinner specials by 15% to capture the incoming wave of weekend tourists.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-auto text-center pt-8 pb-4">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">Utilitarian Intelligence Framework</p>
      </footer>
    </div>
  );
}
