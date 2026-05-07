import React from "react";
import { MultiplierData } from "../lib/types";

interface PrimaryIndicatorProps {
  data: MultiplierData;
}

const STATUS_BADGE_COLOR: Record<string, string> = {
  HIGH: "bg-green-500 text-black",
  MODERATE: "bg-amber-400 text-black",
  LOW: "bg-red-500 text-white",
};

export function PrimaryIndicator({ data }: PrimaryIndicatorProps) {
  const badgeColor = STATUS_BADGE_COLOR[data.status] ?? "bg-gray-500 text-white";
  const barWidthPct = `${Math.round(data.value * 100)}%`;

  return (
    <section className="bg-black text-white p-8 space-y-6" aria-labelledby="primary-indicator-title">
      <div className="flex justify-between items-start">
        <div>
          <p id="primary-indicator-title" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Multiplier</p>
          <h2 className="text-7xl font-black mt-2" aria-label={`Multiplier value ${data.value}`}>{data.value}</h2>
        </div>
        <div className={`${badgeColor} px-3 py-1 text-[10px] font-black uppercase`}>
          {data.label}
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-full h-2 bg-gray-800 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-green-500" style={{ width: barWidthPct }} />
        </div>
        <p className="text-[10px] text-gray-500 font-medium italic">{data.description}</p>
      </div>
    </section>
  );
}
