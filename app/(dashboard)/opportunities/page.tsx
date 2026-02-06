"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { OpportunityList } from "./components/OpportunityList";
import { OpportunityPreview } from "./components/OpportunityPreview";
import { FilterBar } from "./components/FilterBar";
import { useOpportunities } from "@/hooks/use-opportunities";

export default function OpportunitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMajor = searchParams.get("major") || "";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [majorFilter, setMajorFilter] = useState(initialMajor);
  const [search, setSearch] = useState("");
  const [hasInitializedFilter, setHasInitializedFilter] = useState(false);

  const {
    opportunities,
    isLoading,
    error,
    trackedIds,
    toggleTrack,
  } = useOpportunities({
    search,
    major: majorFilter || undefined,
  });

  // Auto-select first item when opportunities load
  useEffect(() => {
    if (opportunities.length > 0 && !selectedId) {
      setSelectedId(opportunities[0].id);
    }
  }, [opportunities, selectedId]);

  // Update URL when major filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (majorFilter) {
      params.set("major", majorFilter);
    } else {
      params.delete("major");
    }
    router.replace(`/opportunities?${params.toString()}`, { scroll: false });
  }, [majorFilter, router, searchParams]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!opportunities.length) return;

      const currentIndex = opportunities.findIndex((o) => o.id === selectedId);

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, opportunities.length - 1);
        setSelectedId(opportunities[nextIndex].id);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        setSelectedId(opportunities[prevIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [opportunities, selectedId]);

  const selectedOpportunity = opportunities.find((o) => o.id === selectedId);

  const handleTrack = async () => {
    if (selectedId) {
      await toggleTrack(selectedId);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col -mx-4 -my-6 sm:-mx-6 lg:-mx-8">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Browse Opportunities
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {opportunities.length} opportunities available
            </p>
          </div>
        </div>
        <FilterBar 
          selected={majorFilter} 
          onChange={(major) => {
            setMajorFilter(major);
            setHasInitializedFilter(true);
          }}
          autoApply={!hasInitializedFilter}
        />
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - List */}
        <div className="w-[400px] border-r border-gray-200 overflow-y-auto bg-gray-50">
          <OpportunityList
            opportunities={opportunities}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={isLoading}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 overflow-y-auto bg-white">
          {selectedOpportunity ? (
            <OpportunityPreview
              opportunity={selectedOpportunity}
              isTracked={trackedIds.has(selectedOpportunity.id)}
              onTrack={handleTrack}
              onSelectSimilar={(id) => {
                setSelectedId(id);
                // Scroll to top of preview panel
                const previewPanel = document.querySelector('[class*="overflow-y-auto"]');
                if (previewPanel) {
                  previewPanel.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select an opportunity to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
