"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OpportunityList } from "./components/OpportunityList";
import { OpportunityPreview } from "./components/OpportunityPreview";
import { FilterSidebar, ResultsHeader } from "./components/FilterSidebar";
import { useOpportunities } from "@/hooks/use-opportunities";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Filter, ArrowLeft, X } from "lucide-react";

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"relevance" | "recent" | "alphabetical">(
    "recent"
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const filterState = useMemo(
    () => ({
      majors: searchParams.getAll("major"),
      disciplines: [] as string[],
      whoCanJoin: searchParams.getAll("eligibility"),
      timeCommitments: [] as string[],
      sources: searchParams.getAll("source"),
    }),
    [searchParams]
  );

  const {
    opportunities: rawOpportunities,
    isLoading,
    error,
    trackedIds,
    toggleTrack,
  } = useOpportunities({
    search: search || undefined,
    filterState,
  });

  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [savedToastOpen, setSavedToastOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setIsAuthed(Boolean(user));
    }
    loadAuth();
    return () => {
      cancelled = true;
    };
  }, []);

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

  useEffect(() => {
    if (opportunities.length === 0) return;
    if (!selectedId || !opportunities.some((o) => o.id === selectedId)) {
      setSelectedId(opportunities[0].id);
    }
  }, [opportunities, selectedId]);

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

  // On mobile, when user selects an opportunity from the list, open preview
  const handleMobileSelect = (id: string) => {
    setSelectedId(id);
    // Only open preview on mobile
    if (window.innerWidth < 768) {
      setMobilePreviewOpen(true);
    }
  };

  const handleTrack = async () => {
    if (!selectedId) return;
    try {
      const result = await toggleTrack(selectedId);
      if (result?.didEnablePipeline) {
        setSavedToastOpen(true);
        window.setTimeout(() => setSavedToastOpen(false), 5000);
      }
    } catch (e: any) {
      if (String(e?.message ?? e).toLowerCase().includes("not authenticated")) {
        setSignInOpen(true);
        return;
      }
      throw e;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col -mx-4 -my-4 sm:-mx-6 sm:-my-6 lg:-mx-8 bg-gray-100">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Find Research
          </h1>
          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 active:bg-gray-100"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
        <div className="mt-3">
          <input
            type="search"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-maroon-900 focus:outline-none focus:ring-1 focus:ring-maroon-900"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <FilterSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <ResultsHeader
            resultCount={opportunities.length}
            sortValue={sort}
            onSortChange={(v) =>
              setSort(
                v === "alphabetical"
                  ? "alphabetical"
                  : v === "recent"
                    ? "recent"
                    : "relevance"
              )
            }
          />

          {/* Desktop: split pane layout | Mobile: full-width list */}
          <div className="flex-1 flex overflow-hidden rounded-lg border border-gray-200 bg-white mx-4 sm:mx-6 mb-4 sm:mb-6">
            {/* List — full width on mobile, fixed width on desktop */}
            <div className="w-full md:w-[400px] md:border-r border-gray-200 overflow-y-auto bg-gray-50 md:shrink-0">
              <OpportunityList
                opportunities={opportunities}
                selectedId={selectedId}
                onSelect={handleMobileSelect}
                loading={isLoading}
              />
            </div>
            {/* Preview — hidden on mobile, shown on desktop */}
            <div className="hidden md:block flex-1 overflow-y-auto bg-white">
              {selectedOpportunity ? (
                <OpportunityPreview
                  opportunity={selectedOpportunity}
                  isTracked={trackedIds.has(selectedOpportunity.id)}
                  onTrack={handleTrack}
                  userStatus={(selectedOpportunity as any).userStatus ?? null}
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
        <div className="mx-4 sm:mx-6 mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full rounded-lg bg-[#500000] py-3 text-sm font-semibold text-white active:bg-[#600000]"
              >
                Show {opportunities.length} Opportunities
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile preview drawer — full screen from bottom */}
      {mobilePreviewOpen && selectedOpportunity && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setMobilePreviewOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-2xl shadow-2xl h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-base font-semibold text-gray-900 truncate">
                {selectedOpportunity.title}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <OpportunityPreview
                opportunity={selectedOpportunity}
                isTracked={trackedIds.has(selectedOpportunity.id)}
                onTrack={handleTrack}
                userStatus={(selectedOpportunity as any).userStatus ?? null}
                onSelectSimilar={(id) => {
                  setSelectedId(id);
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Guest gating */}
      <Dialog.Root open={signInOpen} onOpenChange={setSignInOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Sign in to track opportunities
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              Browsing is open to everyone. Create an account to save opportunities and manage your
              applications pipeline.
            </Dialog.Description>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Not now
                </button>
              </Dialog.Close>
              <Button asChild className="rounded-lg">
                <Link href={`/login?redirectTo=/opportunities`}>Sign in</Link>
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* First-save toast */}
      {savedToastOpen && isAuthed && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 z-50 w-[92vw] max-w-[520px] -translate-x-1/2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-foreground">Saved to your applications</div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                View and manage everything in <span className="font-medium">My Applications</span>.
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/applications"
                className="rounded-lg bg-maroon-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-maroon-700"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => setSavedToastOpen(false)}
                className="rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <OpportunitiesContent />
    </Suspense>
  );
}
