"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { WeeklyLogForm } from "../components/WeeklyLogForm";
import { EditWeekLogModal } from "../components/EditWeekLogModal";
import { Loader2 } from "lucide-react";
import {
  getWeekStart,
  getWeekEnd,
  isSameWeek,
  formatUTC,
  formatWeekRange,
  computeWeekNumber,
} from "@/lib/utils/weekCalculations";

interface Log {
  id: string;
  week_start: string;
  week_end: string | null;
  week_number: number | null;
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

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params?.positionId as string;
  const [position, setPosition] = useState<Position | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [showAddWeek, setShowAddWeek] = useState(false);
  const [addWeekDate, setAddWeekDate] = useState("");

  const refetchLogs = () => {
    fetch(`/api/research/${positionId}/logs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
      });
  };

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
  const currentWeekLog = logs.find((log) => isSameWeek(log.week_start, new Date()));

  const previousLogs = logs
    .filter((log) => {
      const logWeek = getWeekStart(new Date(log.week_start));
      return logWeek.getTime() < thisWeekStart.getTime();
    })
    .sort((a, b) => new Date(b.week_start).getTime() - new Date(a.week_start).getTime());

  // Compute which Sundays already have a log (to avoid duplicates when adding)
  const existingWeekStarts = new Set(
    logs.map((log) => {
      const ws = getWeekStart(new Date(log.week_start));
      return ws.toISOString();
    })
  );

  const handleAddPreviousWeek = async () => {
    if (!addWeekDate) return;
    // addWeekDate is a YYYY-MM-DD string from <input type="date">
    // Parse as local date (which is what the user intends)
    const [y, m, d] = addWeekDate.split("-").map(Number);
    const selectedDate = new Date(y, m - 1, d);
    const weekStart = getWeekStart(selectedDate);

    if (existingWeekStarts.has(weekStart.toISOString())) {
      alert("A log for that week already exists. You can edit it instead.");
      return;
    }
    if (weekStart.getTime() >= thisWeekStart.getTime()) {
      alert("Use the current week form above to log this week's progress.");
      return;
    }

    const weekEnd = getWeekEnd(selectedDate);
    const weekNumber = computeWeekNumber(weekStart, position.start_date);

    try {
      const res = await fetch(`/api/research/${positionId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: weekStart.toISOString(),
          weekNumber,
          hoursWorked: null,
          accomplishments: [],
          learnings: [],
          blockers: [],
          nextWeekPlan: [],
          meetingNotes: null,
        }),
      });
      if (res.ok) {
        const newLog = await res.json();
        refetchLogs();
        setShowAddWeek(false);
        setAddWeekDate("");
        // Open the edit modal for the newly created week
        setEditingLog(newLog);
      }
    } catch {
      alert("Failed to create log. Please try again.");
    }
  };

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
            {formatUTC(new Date(position.start_date), "MMM yyyy")}
          </p>
        </div>
        <span className="shrink-0 text-lg font-bold text-gray-500">
          Week {computeWeekNumber(thisWeekStart, position.start_date)}
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

      {/* Edit Week Log Modal */}
      {editingLog && position && (
        <EditWeekLogModal
          open={!!editingLog}
          onClose={() => setEditingLog(null)}
          log={editingLog}
          positionId={positionId}
          weekLabel={formatWeekRange(getWeekStart(new Date(editingLog.week_start)))}
          onSaved={refetchLogs}
        />
      )}

      {/* Previous Weeks – accordion */}
      <div className="space-y-4" data-tutorial="previous-weeks">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm font-medium text-gray-500">
            Previous Weeks
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Add Previous Week button */}
        {!showAddWeek ? (
          <button
            type="button"
            onClick={() => setShowAddWeek(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-[#500000]/50 hover:text-[#500000]"
          >
            <Plus className="h-4 w-4" />
            Add a Previous Week
          </button>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Select any date within the week you want to log:
            </p>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={addWeekDate}
                onChange={(e) => setAddWeekDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#500000] focus:outline-none focus:ring-1 focus:ring-[#500000]"
              />
              <button
                type="button"
                onClick={handleAddPreviousWeek}
                disabled={!addWeekDate}
                className="rounded-lg bg-[#500000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B1D1D] disabled:opacity-50"
              >
                Add Week
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddWeek(false);
                  setAddWeekDate("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
            {addWeekDate && (() => {
              const [y, m, d] = addWeekDate.split("-").map(Number);
              const selDate = new Date(y, m - 1, d);
              const ws = getWeekStart(selDate);
              return (
                <p className="mt-2 text-xs text-gray-500">
                  This will create a log for: {formatWeekRange(ws)}
                </p>
              );
            })()}
          </div>
        )}

        {previousLogs.length === 0 && !showAddWeek ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 py-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              No Previous Weeks Yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Your weekly logs will appear here once a new week begins. You can
              also add past weeks using the button above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {previousLogs.map((log) => {
              const logWeekStart = getWeekStart(new Date(log.week_start));
              const weekNum =
                log.week_number ??
                computeWeekNumber(logWeekStart, position.start_date);
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
                      {formatWeekRange(logWeekStart)}
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
                      {log.accomplishments?.length > 0 && (
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
                      {log.learnings?.length > 0 && (
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
                      {log.blockers?.length > 0 && (
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
                      {log.next_week_plan?.length > 0 && (
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
                      <button
                        type="button"
                        onClick={() => setEditingLog(log)}
                        className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      >
                        Edit
                      </button>
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
