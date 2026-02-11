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

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"relevance" | "recent" | "alphabetical">(
    "recent"
  );

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
    // Auto-select first opportunity if nothing selected, or if current selection
    // is no longer in the list (e.g. after tracking, it gets excluded from results)
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

  const handleTrack = async () => {
    if (!selectedId) return;
    try {
      const result = await toggleTrack(selectedId);
      if (result?.didEnablePipeline) {
        setSavedToastOpen(true);
        window.setTimeout(() => setSavedToastOpen(false), 5000);
      }
    } catch (e: any) {
      // Guest mode: prompt sign-in instead of hard redirect.
      if (String(e?.message ?? e).toLowerCase().includes("not authenticated")) {
        setSignInOpen(true);
        return;
      }
      throw e;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col -mx-4 -my-6 sm:-mx-6 lg:-mx-8 bg-gray-100">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">
          Find Research Opportunities
        </h1>
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

      <div className="flex-1 flex overflow-hidden">
        <FilterSidebar />

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

          <div className="flex-1 flex overflow-hidden rounded-lg border border-gray-200 bg-white mx-6 mb-6">
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
        <div className="mx-6 mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
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
        <div className="fixed bottom-4 left-1/2 z-50 w-[92vw] max-w-[520px] -translate-x-1/2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">Saved to your applications</div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                View and manage everything in <span className="font-medium">My Applications</span>.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/applications"
                className="rounded-lg bg-maroon-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-maroon-700"
              >
                View →
              </Link>
              <button
                type="button"
                onClick={() => setSavedToastOpen(false)}
                className="rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                ✕
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
