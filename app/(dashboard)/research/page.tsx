"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResearchDashboard } from "./components/ResearchDashboard";
import { ArchivedPositions } from "./components/ArchivedPositions";
import { AddResearchPositionModal } from "./components/AddResearchPositionModal";
import { BookOpen, Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Position {
  id: string;
  title: string;
  pi_name: string;
  pi_email: string | null;
  start_date: string;
  is_active: boolean;
  is_archived?: boolean;
  archived_at?: string | null;
  stats: {
    totalHours: number;
    totalWeeks: number;
    avgHoursPerWeek: string;
  };
  logs: any[];
}

interface ResearchResponse {
  active: Position[];
  archived: Position[];
  positions: Position[];
}

export default function ResearchPage() {
  const [activePositions, setActivePositions] = useState<Position[]>([]);
  const [archivedPositions, setArchivedPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/research")
      .then(async (res) => {
        const data = await res.json();
        return { ok: res.ok, data } as { ok: boolean; data: unknown };
      })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setActivePositions([]);
          setArchivedPositions([]);
          return;
        }

        const data = result.data as ResearchResponse | Position[];

        // Handle both new format { active, archived } and legacy array format
        if (Array.isArray(data)) {
          setActivePositions(data);
          setArchivedPositions([]);
        } else if (data && typeof data === "object" && "active" in data) {
          setActivePositions(data.active ?? []);
          setArchivedPositions(data.archived ?? []);
        } else {
          setActivePositions([]);
          setArchivedPositions([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load positions:", err);
          setActivePositions([]);
          setArchivedPositions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-0 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 flex items-center justify-between px-4 sm:px-0">
          <div>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-2 h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="space-y-6 px-4 sm:px-0">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const hasNoPositions = activePositions.length === 0 && archivedPositions.length === 0;

  if (hasNoPositions) {
    return (
      <>
        <div className="mx-auto max-w-2xl py-16 px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            No active research yet
          </h2>
          <p className="mb-8 text-gray-600 max-w-md mx-auto">
            Add a research position you&apos;re currently working on, or accept one
            from your applications to start tracking your progress.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#500000] px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#6B1D1D] hover:shadow-md active:scale-[0.98]"
            >
              <Plus size={18} />
              Add Research Position
            </button>
            <Link
              href="/applications"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm active:scale-[0.98]"
            >
              Check your applications
            </Link>
          </div>
        </div>
        <AddResearchPositionModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-0 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Research</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">Track your progress and generate reports</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#500000] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B1D1D]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Position</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Active Positions */}
      {activePositions.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <p className="text-gray-600 mb-4">No active research positions</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm font-medium text-[#500000] hover:underline"
          >
            Add a research position
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activePositions.map((position) => (
            <ResearchDashboard key={position.id} position={position} />
          ))}
        </div>
      )}

      {/* Archived Positions (collapsed by default) */}
      <ArchivedPositions positions={archivedPositions} />

      <AddResearchPositionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
