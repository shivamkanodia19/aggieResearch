"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface ArchivedPosition {
  id: string;
  title: string;
  pi_name: string;
  pi_email: string | null;
  start_date: string;
  archived_at?: string | null;
  stats: {
    totalHours: number;
    totalWeeks: number;
    avgHoursPerWeek: string;
  };
}

interface Props {
  positions: ArchivedPosition[];
}

export function ArchivedPositions({ positions }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (positions.length === 0) return null;

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 text-left"
      >
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm font-medium text-gray-500">
          Archived ({positions.length}){" "}
          <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {positions.map((position) => (
            <ArchivedPositionCard key={position.id} position={position} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArchivedPositionCard({ position }: { position: ArchivedPosition }) {
  const router = useRouter();
  const [unarchiving, setUnarchiving] = useState(false);

  const handleUnarchive = async () => {
    setUnarchiving(true);
    try {
      const response = await fetch(`/api/research/${position.id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unarchive: true }),
      });

      if (response.ok) {
        router.refresh();
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to unarchive:", err);
    } finally {
      setUnarchiving(false);
    }
  };

  const stats = position.stats;
  const statsLine =
    stats.totalWeeks === 0
      ? "0 hrs across 0 weeks"
      : `${stats.totalHours} hrs across ${stats.totalWeeks} weeks`;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-gray-700">
            {position.title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {position.pi_name} · {statsLine}
            {position.archived_at && (
              <span>
                {" "}
                · Archived{" "}
                {format(new Date(position.archived_at), "MMM d, yyyy")}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleUnarchive}
          disabled={unarchiving}
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-50"
        >
          {unarchiving ? "Restoring..." : "Unarchive"}
        </button>
      </div>
    </div>
  );
}
