import React from 'react';
import PellitoChat from '@/components/shared/PellitoChat';

export default function CookView() {
  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen text-[#444444]">
      <h1 className="text-3xl font-bold text-[#526a8d] mb-4">The Line</h1>
      <p className="mb-6">Focus: Fire times, assembly order, and internal temperatures.</p>

      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#526a8d]/20">
          <h2 className="text-xl font-semibold text-[#526a8d]">Active Tickets</h2>
          <div className="mt-2 text-sm">
            <strong>Table 12:</strong> Deckhand Burger (Med-Rare)
            <br />
            <span className="text-orange-600">Fire time: 14:02 — Assembly: Patty, Cheese, Bun</span>
          </div>
          <PellitoChat defaultPrompt="What is the internal temp for a med-rare burger?" />
        </div>
      </div>
    </div>
  );
}
