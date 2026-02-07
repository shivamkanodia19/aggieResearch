"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { OpportunityList } from "./components/OpportunityList";
import { OpportunityPreview } from "./components/OpportunityPreview";
import {
  FilterSidebar,
  ResultsHeader,
  type FilterState,
  type FilterMeta,
} from "./components/FilterSidebar";
import { useOpportunities } from "@/hooks/use-opportunities";

const DEFAULT_FILTER_STATE: FilterState = {
  majors: [],
  disciplines: [],
  whoCanJoin: [],
  timeCommitments: [],
};

export default function OpportunitiesPage() {
  const searchParams = useSearchParams();
  const initialMajor = searchParams.get("major") ?? "";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"relevance" | "recent" | "alphabetical">("recent");
  const [filterState, setFilterState] = useState<FilterState>(() =>
    initialMajor
      ? { ...DEFAULT_FILTER_STATE, majors: [initialMajor] }
      : DEFAULT_FILTER_STATE
  );

  const {
    opportunities: rawOpportunities,
    isLoading,
    error,
    trackedIds,
    toggleTrack,
    meta,
  } = useOpportunities({
    search: search || undefined,
    filterState,
  });

  const opportunities = useMemo(() => {
    if (sort === "recent") {
      return [...rawOpportunities].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (sort === "alphabetical") {
      return [...rawOpportunities].sort((a, b) =>
        (a.title ?? "").localeCompare(b.title ?? "")
      );
    }
    return rawOpportunities;
  }, [rawOpportunities, sort]);

  const filterMeta: FilterMeta = useMemo(
    () =>
      meta ?? {
        majors: [],
        disciplines: [],
        whoCanJoin: [],
        timeCommitments: [],
      },
    [meta]
  );

  // Auto-select first item when opportunities load
  useEffect(() => {
    if (opportunities.length > 0 && !selectedId) {
      setSelectedId(opportunities[0].id);
    }
  }, [opportunities, selectedId]);

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
    if (selectedId) await toggleTrack(selectedId);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col -mx-4 -my-6 sm:-mx-6 lg:-mx-8 bg-gray-100">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">
          Browse Opportunities
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          From Aggie Collaborate — filter by major, discipline, and more
        </p>
        {/* Search (optional: can add a search input here) */}
        <div className="mt-3 max-w-md">
          <input
            type="search"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-maroon-900 focus:outline-none focus:ring-1 focus:ring-maroon-900"
          />
        </div>
      </div>

      {/* Main: sidebar + results */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="sticky top-[88px] h-fit shrink-0">
          <FilterSidebar
            filterState={filterState}
            meta={filterMeta}
            onFilterChange={setFilterState}
            resultCount={opportunities.length}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <ResultsHeader
            resultCount={opportunities.length}
            sortValue={sort}
            onSortChange={(v) =>
              setSort(
                v === "alphabetical" ? "alphabetical" : v === "recent" ? "recent" : "relevance"
              )
            }
          />

          <div className="flex-1 flex overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="w-[400px] border-r border-gray-200 overflow-y-auto bg-gray-50 shrink-0">
              <OpportunityList
                opportunities={opportunities}
                selectedId={selectedId}
                onSelect={setSelectedId}
                loading={isLoading}
              />
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {selectedOpportunity ? (
                <OpportunityPreview
                  opportunity={selectedOpportunity}
                  isTracked={trackedIds.has(selectedOpportunity.id)}
                  onTrack={handleTrack}
                  onSelectSimilar={(id) => {
                    setSelectedId(id);
                    const previewPanel = document.querySelector(
                      '[class*="overflow-y-auto"]'
                    );
                    if (previewPanel) {
                      previewPanel.scrollTo({ top: 0, behavior: "smooth" });
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
      </div>

      {error && (
        <div className="mx-6 mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}
    </div>
  );
}
