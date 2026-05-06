import React from 'react';
import PellitoChat from '@/components/shared/PellitoChat';

export default function PrepView() {
  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen text-[#444444]">
      <h1 className="text-3xl font-bold text-[#526a8d] mb-4">Prep Station</h1>
      <p className="mb-6">Focus: Precise weights, measurements, and bulk yields.</p>

      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#526a8d]/20">
          <h2 className="text-xl font-semibold text-[#526a8d]">Current Yields</h2>
          <ul className="list-disc pl-5 mt-2">
            <li>House Ale Cheese Sauce: 5 Gallons (Prep Time: 45m)</li>
            <li>Salmon Portions: 6oz cuts (Yield: 24 portions)</li>
          </ul>
          <PellitoChat defaultPrompt="How do I scale the House Ale Cheese Sauce for a double batch?" />
        </div>
      </div>
    </div>
  );
}
