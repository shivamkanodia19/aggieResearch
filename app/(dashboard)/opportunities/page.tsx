"use client";

import { useState, useCallback } from "react";
import { LayoutList, LayoutGrid } from "lucide-react";
import { SearchBar } from "@/components/opportunities/search-bar";
import { FilterPills } from "@/components/opportunities/filter-pills";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { useOpportunities } from "@/hooks/use-opportunities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [field, setField] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const {
    opportunities,
    isLoading,
    error,
    trackedIds,
    toggleTrack,
  } = useOpportunities({ search, field });

  const handleTrack = useCallback(
    (opportunityId: string) => {
      toggleTrack(opportunityId).catch((err) => {
        console.error("Failed to track:", err);
        if (err.message?.toLowerCase().includes("authenticated")) {
          window.location.href = "/login?redirectTo=/opportunities";
        }
      });
    },
    [toggleTrack]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Browse Opportunities</h1>
        <p className="text-muted-foreground mt-1">
          Discover research positions with AI summaries tailored to your major
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1 w-full">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground shrink-0">
            Filters
          </div>
        </div>
        <FilterPills selected={field} onSelect={setField} />
      </div>

      {/* Results bar + view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Showing {opportunities.length} opportunity{opportunities.length !== 1 ? "ies" : ""}
        </p>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            <LayoutList className="h-4 w-4 mr-1.5" />
            List
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" />
            Grid
          </Button>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load opportunities. Please try again.
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 py-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-lg border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && !error && opportunities.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No opportunities found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {!isLoading && !error && opportunities.length > 0 && (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid"
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          )}
        >
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isTracked={trackedIds.has(opp.id)}
              onTrack={() => handleTrack(opp.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
