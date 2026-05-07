import React from "react";

export function LogicAnnotation() {
  return (
    <section className="bg-gray-100 p-6 border border-gray-200 h-full flex flex-col" aria-labelledby="logic-annotation-title">
      <div className="flex items-center gap-2 mb-4">
        <div className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest">Logic</div>
        <span id="logic-annotation-title" className="text-[10px] font-bold text-black uppercase tracking-wider">Forecast Annotation</span>
      </div>
      <div className="flex-1 space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          The forecast is strongly anchored by <strong>Hwy 6 Fluidity</strong>. Based on past seasonal trends, a &quot;Closed&quot; status severely limits coastal day-trippers, dropping Pacific City visitor volume to 40% even on sunny weekends.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          With the highway currently &quot;Open&quot; and gas prices stabilizing, we&apos;re seeing strong search intent for coastal dining and weekend getaways over the next 48 hours.
        </p>
        <div className="p-4 bg-white border border-gray-200 mt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Recommendation</p>
          <p className="text-sm text-gray-800 font-medium">Boost local ad spend for lunch and dinner specials by 15% to capture the incoming wave of weekend tourists.</p>
        </div>
      </div>
    </section>
  );
}
