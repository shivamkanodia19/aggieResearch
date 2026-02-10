"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResearchDashboard } from "./components/ResearchDashboard";
import { ArchivedPositions } from "./components/ArchivedPositions";
import { Loader2 } from "lucide-react";

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
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#500000]" />
      </div>
    );
  }

  const hasNoPositions = activePositions.length === 0 && archivedPositions.length === 0;

  if (hasNoPositions) {
    return (
      <div className="mx-auto max-w-2xl py-16 px-4 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          No active research yet
        </h2>
        <p className="mb-8 text-gray-600">
          Once you accept a research position, you can track your weekly progress here.
          Log accomplishments, learnings, and generate reports for your PI.
        </p>
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 rounded-lg bg-[#500000] px-6 py-3 font-medium text-white transition-colors hover:bg-[#6B1D1D]"
        >
          Check your applications
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Research</h1>
          <p className="mt-1 text-gray-600">Track your progress and generate reports</p>
        </div>
      </div>

      {/* Active Positions */}
      {activePositions.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <p className="text-gray-600 mb-4">No active research positions</p>
          <Link
            href="/applications"
            className="text-sm font-medium text-[#500000] hover:underline"
          >
            Check your applications →
          </Link>
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
    </div>
  );
}
