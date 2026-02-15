"use client";

import { OpportunityListItem } from "./OpportunityListItem";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="divide-y divide-gray-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-1 pt-1">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          </div>
        ))}
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
      {/* Keyboard hint — desktop only */}
      <div className="hidden md:block px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500">
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
