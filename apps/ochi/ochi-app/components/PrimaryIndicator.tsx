import React from "react";
import { MultiplierData } from "../lib/types";

interface PrimaryIndicatorProps {
  data: MultiplierData;
}

export function PrimaryIndicator({ data }: PrimaryIndicatorProps) {
  return (
    <section className="bg-black text-white p-8 space-y-6" aria-labelledby="primary-indicator-title">
      <div className="flex justify-between items-start">
        <div>
          <p id="primary-indicator-title" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Multiplier</p>
          <h2 className="text-7xl font-black mt-2" aria-label={`Multiplier value ${data.value}`}>{data.value}</h2>
        </div>
        <div className="bg-green-500 text-black px-3 py-1 text-[10px] font-black uppercase">
          {data.label}
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-full h-2 bg-gray-800 overflow-hidden" aria-hidden="true">
          <div className="w-[82%] h-full bg-green-500" />
        </div>
        <p className="text-[10px] text-gray-500 font-medium italic">{data.description}</p>
      </div>
    </section>
  );
}
