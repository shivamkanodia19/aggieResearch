"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ExportModal } from "./ExportModal";
import { EmailModal } from "./EmailModal";

interface Props {
  position: {
    id: string;
    title: string;
    pi_name: string;
    pi_email: string | null;
    start_date: string;
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
  const [showEmail, setShowEmail] = useState(false);
  const stats = position?.stats && typeof position.stats === "object"
    ? { ...defaultStats, ...position.stats }
    : defaultStats;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{position.title}</h2>
              <p className="mt-1 text-gray-600">
                {position.pi_name} · Started {format(new Date(position.start_date), "MMM yyyy")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExport(true)}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Export PDF
              </button>
              {position.pi_email && (
                <button
                  onClick={() => setShowEmail(true)}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Email PI
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-[#500000]">{stats.totalHours}</div>
            <div className="mt-1 text-sm text-gray-600">Hours Logged</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-[#500000]">{stats.totalWeeks}</div>
            <div className="mt-1 text-sm text-gray-600">Weeks Tracked</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-[#500000]">{stats.avgHoursPerWeek}</div>
            <div className="mt-1 text-sm text-gray-600">Avg hrs/week</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-gray-50 p-6">
          <Link
            href={`/research/${position.id}`}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            View all logs →
          </Link>
          <Link
            href={`/research/${position.id}/log`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#500000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B1D1D]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Log This Week
          </Link>
        </div>
      </div>

      {showExport && (
        <ExportModal
          positionId={position.id}
          positionTitle={position.title}
          onClose={() => setShowExport(false)}
        />
      )}

      {showEmail && (
        <EmailModal
          positionId={position.id}
          positionTitle={position.title}
          piEmail={position.pi_email!}
          piName={position.pi_name}
          onClose={() => setShowEmail(false)}
        />
      )}
    </>
  );
}
