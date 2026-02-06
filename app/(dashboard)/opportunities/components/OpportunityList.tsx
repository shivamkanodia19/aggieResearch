"use client";

import { OpportunityListItem } from "./OpportunityListItem";
import type { Opportunity } from "@/lib/types/database";

interface Props {
  opportunities: Opportunity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export function OpportunityList({
  opportunities,
  selectedId,
  onSelect,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-[#500000] border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-gray-500 mt-2">Loading opportunities...</p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No opportunities found.</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Keyboard hint */}
      <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500">
        Tip: Use ↑↓ arrow keys to navigate
      </div>

      {opportunities.map((opp) => (
        <OpportunityListItem
          key={opp.id}
          opportunity={opp}
          isSelected={selectedId === opp.id}
          onClick={() => onSelect(opp.id)}
        />
      ))}
    </div>
  );
}
