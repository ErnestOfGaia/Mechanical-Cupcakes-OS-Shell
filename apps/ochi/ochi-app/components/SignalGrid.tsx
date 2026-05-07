import React from "react";
import { Activity, Map, Fuel, Search, Info } from "lucide-react";

export function SignalGrid() {
  const signals = [
    { id: "hwy6", label: "Hwy 6 Status", value: "OPEN", icon: Map, color: "text-green-600", bg: "bg-green-50" },
    { id: "gas", label: "Gas Index", value: "$4.12", icon: Fuel, color: "text-green-600", bg: "bg-green-50" },
    { id: "search", label: "Search Intent", value: "HIGH", icon: Search, color: "text-green-600", bg: "bg-green-50" },
    { id: "tlt", label: "TLT Pulse", value: "MODERATE", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <section className="space-y-3" aria-labelledby="signal-grid-title">
      <h3 id="signal-grid-title" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Gatekeeper Pulse</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {signals.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 p-5 flex items-center justify-between group hover:border-gray-300 transition-all" aria-label={`${item.label} ${item.value}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${item.bg} flex items-center justify-center ${item.color}`} aria-hidden="true">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-lg font-black text-black leading-none mt-1">{item.value}</p>
              </div>
            </div>
            <Info className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors cursor-pointer" aria-label={`More info about ${item.label}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
