import React from 'react';
import PellitoChat from '@/components/shared/PellitoChat';

export default function ServerView() {
  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen text-[#444444]">
      <h1 className="text-3xl font-bold text-[#526a8d] mb-4">Front of House</h1>
      <p className="mb-6">Focus: The Story, beer pairings, and dietary/allergen info.</p>

      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#526a8d]/20">
          <h2 className="text-xl font-semibold text-[#526a8d]">Table 12 Details</h2>
          <p className="mt-2 text-sm">
            <strong>Deckhand Burger</strong><br />
            <em>Pairing:</em> House Pilsner or Craft Cream Ale.<br />
            <em>Allergens:</em> Gluten, Dairy.<br />
            <em>Marketing Lore:</em> &ldquo;Our classic burger crafted with the spirit of the coast.&rdquo;
          </p>
          <PellitoChat defaultPrompt="What beer pairs best with the Deckhand Burger?" />
        </div>
      </div>
    </div>
  );
}
