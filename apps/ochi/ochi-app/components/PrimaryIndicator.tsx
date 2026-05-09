import React from "react";
import { MasterMultiplierData } from "../lib/types";

interface PrimaryIndicatorProps {
  data: MasterMultiplierData;
}

export function PrimaryIndicator({ data }: PrimaryIndicatorProps) {
  return (
    <section className="bg-black text-white p-8 space-y-6" aria-labelledby="primary-indicator-title">
      <div className="flex justify-between items-start">
        <div>
          <p id="primary-indicator-title" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Multiplier</p>
          <h2 className="text-7xl font-black mt-2" aria-label={`Multiplier value ${data.score}`}>{data.score}</h2>
        </div>
        <div className={`text-black px-3 py-1 text-[10px] font-black uppercase ${data.color === 'green' ? 'bg-green-500' : data.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}>
          {data.label}
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-full h-2 bg-gray-800 overflow-hidden" aria-hidden="true">
          <div
            className={`h-full ${data.color === 'green' ? 'bg-green-500' : data.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${data.barWidthPercent}%` }}
            role="progressbar"
            aria-valuenow={data.barWidthPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="text-[10px] text-gray-500 font-medium italic">Forecasting {data.barWidthPercent}% efficiency for the current period.</p>
      </div>
    </section>
  );
}
