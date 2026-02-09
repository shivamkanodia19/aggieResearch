"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResearchDashboard } from "./components/ResearchDashboard";
import { Loader2 } from "lucide-react";

interface Position {
  id: string;
  title: string;
  pi_name: string;
  pi_email: string | null;
  start_date: string;
  is_active: boolean;
  stats: {
    totalHours: number;
    totalWeeks: number;
    avgHoursPerWeek: string;
  };
  logs: any[];
}

export default function ResearchPage() {
  const [positions, setPositions] = useState<Position[]>([]);
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
        if (result.ok && Array.isArray(result.data)) {
          setPositions(result.data as Position[]);
        } else {
          setPositions([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load positions:", err);
          setPositions([]);
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

  const list = Array.isArray(positions) ? positions : [];
  if (list.length === 0) {
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
          href="/opportunities"
          className="inline-flex items-center gap-2 rounded-lg bg-[#500000] px-6 py-3 font-medium text-white transition-colors hover:bg-[#6B1D1D]"
        >
          Find Research
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

      <div className="space-y-6">
        {list.map((position) => (
          <ResearchDashboard key={position.id} position={position} />
        ))}
      </div>
    </div>
  );
}
