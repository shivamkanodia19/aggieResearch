"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Plus, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { WeeklyLogForm } from "../components/WeeklyLogForm";
import { Loader2 } from "lucide-react";
import { getWeekStart, getWeekEnd, isSameWeek } from "@/lib/utils/weekCalculations";

interface Log {
  id: string;
  week_start: string;
  hours_worked: number | null;
  accomplishments: string[];
  learnings: string[];
  blockers: string[];
  next_week_plan: string[];
  meeting_notes: string | null;
}

interface Position {
  id: string;
  title: string;
  pi_name: string;
  pi_email: string | null;
  start_date: string;
}

function getWeekNumber(weekStart: Date, positionStartDate: string): number {
  const start = getWeekStart(new Date(positionStartDate));
  const diff = weekStart.getTime() - start.getTime();
  const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, weeks + 1);
}

export default function PositionDetailPage() {
  const params = useParams();
  const positionId = params?.positionId as string;
  const [position, setPosition] = useState<Position | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!positionId) return;

    Promise.all([
      fetch(`/api/research/${positionId}`)
        .then((res) => res.json())
        .then((data) => setPosition(data)),
      fetch(`/api/research/${positionId}/logs`)
        .then((res) => res.json())
        .then((data) => setLogs(data)),
    ]).finally(() => setLoading(false));
  }, [positionId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#500000]" />
      </div>
    );
  }

  if (!position) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Position not found.</p>
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Research
        </Link>
      </div>
    );
  }

  // Week starts on Sunday - use normalized week calculation
  const thisWeekStart = getWeekStart(new Date());
  const currentWeekLog = logs.find((log) => {
    return isSameWeek(log.week_start, new Date());
  });

  const previousLogs = logs.filter((log) => {
    const logWeek = getWeekStart(new Date(log.week_start));
    return logWeek.getTime() < thisWeekStart.getTime();
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/research"
        data-tutorial="export-options"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Research
      </Link>

      {/* Page header: title, subtitle, week indicator */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-gray-900">
            {position.title}
          </h1>
          <p className="mt-1 text-gray-600">
            with {position.pi_name} · Started{" "}
            {format(new Date(position.start_date), "MMM yyyy")}
          </p>
        </div>
        <span className="shrink-0 text-lg font-bold text-gray-500">
          Week {getWeekNumber(thisWeekStart, position.start_date)}
        </span>
      </div>

      {/* Current week – always show form (editable) */}
      <div
        data-tutorial="current-week-entry"
        className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <WeeklyLogForm
          positionId={positionId}
          positionStartDate={position.start_date}
          existingLog={
            currentWeekLog
              ? {
                  hours_worked: currentWeekLog.hours_worked,
                  accomplishments: currentWeekLog.accomplishments,
                  learnings: currentWeekLog.learnings,
                  blockers: currentWeekLog.blockers,
                  next_week_plan: currentWeekLog.next_week_plan,
                  meeting_notes: currentWeekLog.meeting_notes,
                }
              : undefined
          }
        />
      </div>

      {/* Previous Weeks – accordion */}
      <div className="space-y-4" data-tutorial="previous-weeks">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm font-medium text-gray-500">
            Previous Weeks
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {previousLogs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 py-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Start Your Research Journal
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Track your weekly progress, accomplishments, and learnings. Logs
              help you prepare for PI meetings and build your research portfolio.
            </p>
            <Link
              href={`/research/${positionId}/log`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#500000] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#6B1D1D]"
            >
              <Plus className="h-4 w-4" />
              Log Your First Week
            </Link>
            <p className="mt-4 text-xs text-gray-500">
              Tip: Most students log 5–10 minutes weekly
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {previousLogs.map((log) => {
              const logWeekStart = getWeekStart(new Date(log.week_start));
              const logWeekEnd = getWeekEnd(new Date(log.week_start));
              const weekNum = getWeekNumber(logWeekStart, position.start_date);
              const isExpanded = expandedLogId === log.id;

              return (
                <div
                  key={log.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedLogId(isExpanded ? null : log.id)
                    }
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-100/80"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      Week of {format(logWeekStart, "MMM d")}–{" "}
                      {format(logWeekEnd, "d, yyyy")}
                    </span>
                    <span className="flex items-center gap-3 text-sm text-gray-600">
                      {log.hours_worked != null && (
                        <span>{log.hours_worked} hours</span>
                      )}
                      <span>Week {weekNum}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-white px-4 py-4">
                      {log.accomplishments.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-1 text-sm font-medium text-gray-700">
                            Accomplished
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {log.accomplishments.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {log.learnings.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-1 text-sm font-medium text-gray-700">
                            Learned
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {log.learnings.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {log.blockers.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-1 text-sm font-medium text-gray-700">
                            Blockers
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {log.blockers.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {log.next_week_plan.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-1 text-sm font-medium text-gray-700">
                            Next steps
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {log.next_week_plan.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {log.meeting_notes && (
                        <div className="mt-3 rounded bg-gray-50 p-3">
                          <h4 className="mb-1 text-sm font-medium text-gray-700">
                            Meeting Notes
                          </h4>
                          <p className="text-sm text-gray-600">
                            {log.meeting_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
