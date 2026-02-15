"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUTC } from "@/lib/utils/weekCalculations";
import { ExportModal } from "./ExportModal";
import { RemoveConfirmDialog } from "./RemoveConfirmDialog";
import { ArchiveConfirmDialog } from "./ArchiveConfirmDialog";

interface Props {
  position: {
    id: string;
    title: string;
    pi_name: string;
    pi_email: string | null;
    start_date: string;
    is_archived?: boolean;
    stats: {
      totalHours: number;
      totalWeeks: number;
      avgHoursPerWeek: string;
    };
    logs: any[];
  };
}

const defaultStats = {
  totalHours: 0,
  totalWeeks: 0,
  avgHoursPerWeek: "0",
};

export function ResearchDashboard({ position }: Props) {
  const [showExport, setShowExport] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const stats =
    position?.stats && typeof position.stats === "object"
      ? { ...defaultStats, ...position.stats }
      : defaultStats;

  const avgNum = parseFloat(stats.avgHoursPerWeek) || 0;
  const statsLine =
    stats.totalWeeks === 0
      ? "0 hrs logged across 0 weeks"
      : `${stats.totalHours} hrs logged across ${stats.totalWeeks} weeks`;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:border-[#500000]/30 hover:shadow-md">
        {/* Title + PI + management actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-gray-900">
              {position.title}
            </h2>
            <p className="mt-0.5 text-sm text-gray-600">
              {position.pi_name} · Started{" "}
              {formatUTC(new Date(position.start_date), "MMM yyyy")}
            </p>
          </div>
          {/* Archive / Remove buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowArchiveDialog(true)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={() => setShowRemoveDialog(true)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-lg font-bold text-gray-900">{stats.totalHours}</p>
            <p className="text-[11px] text-gray-500">Total Hours</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-lg font-bold text-gray-900">{stats.totalWeeks}</p>
            <p className="text-[11px] text-gray-500">Weeks Logged</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-lg font-bold text-gray-900">{avgNum > 0 ? stats.avgHoursPerWeek : "—"}</p>
            <p className="text-[11px] text-gray-500">Avg Hrs/Week</p>
          </div>
        </div>

        {/* Actions — stack on mobile, inline on desktop */}
        <div className="mt-4 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-2 xs:gap-3 border-t border-gray-100 pt-4">
          <Link
            href={`/research/${position.id}/log`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#500000] px-3 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#6B1D1D] hover:shadow-md active:scale-[0.98]"
          >
            Log This Week
          </Link>
          <Link
            href={`/research/${position.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 active:scale-[0.98]"
          >
            View logs
          </Link>
          <button
            onClick={() => setShowExport(true)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 active:scale-[0.98]"
          >
            Export PDF
          </button>
        </div>
      </div>

      {showExport && (
        <ExportModal
          positionId={position.id}
          positionTitle={position.title}
          onClose={() => setShowExport(false)}
        />
      )}

      <RemoveConfirmDialog
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        positionId={position.id}
        positionTitle={position.title}
      />

      <ArchiveConfirmDialog
        open={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        positionId={position.id}
        positionTitle={position.title}
      />
    </>
  );
}
