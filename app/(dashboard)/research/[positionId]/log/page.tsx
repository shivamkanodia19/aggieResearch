"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WeeklyLogForm } from "../../components/WeeklyLogForm";
import { Loader2 } from "lucide-react";
import { isSameWeek } from "@/lib/utils/weekCalculations";

export default function LogEntryPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.positionId as string;
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentWeekLog, setCurrentWeekLog] = useState<any>(null);

  useEffect(() => {
    if (!positionId) return;
    Promise.all([
      fetch(`/api/research/${positionId}`).then((res) => res.json()),
      fetch(`/api/research/${positionId}/logs`).then((res) => res.json()),
    ])
      .then(([posData, logsData]) => {
        setPosition(posData);
        const current = Array.isArray(logsData)
          ? logsData.find((log: { week_start: string }) => {
              return isSameWeek(log.week_start, new Date());
            })
          : null;
        setCurrentWeekLog(current ?? null);
      })
      .finally(() => setLoading(false));
  }, [positionId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#500000]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-0 sm:px-4 py-4 sm:py-8">
      <div className="px-4 sm:px-0">
        <Link
          href={`/research/${positionId}`}
          className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {position?.title || "Position"}
        </Link>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Log Weekly Progress</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 line-clamp-1">{position?.title}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <WeeklyLogForm
          positionId={positionId}
          positionStartDate={position?.start_date}
          existingWeekStart={currentWeekLog?.week_start}
          existingLog={
            currentWeekLog
              ? {
                  hours_worked: currentWeekLog.hours_worked,
                  accomplishments: currentWeekLog.accomplishments || [],
                  learnings: currentWeekLog.learnings || [],
                  next_week_plan: currentWeekLog.next_week_plan || [],
                  meeting_notes: currentWeekLog.meeting_notes,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
