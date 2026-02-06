"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, startOfWeek } from "date-fns";
import { ArrowLeft, Plus } from "lucide-react";
import { WeeklyLogForm } from "../components/WeeklyLogForm";
import { Loader2 } from "lucide-react";

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

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.positionId as string;
  const [position, setPosition] = useState<Position | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

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

  const currentWeekLog = logs.find((log) => {
    const logWeek = startOfWeek(new Date(log.week_start), { weekStartsOn: 1 });
    const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    return logWeek.getTime() === thisWeek.getTime();
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/research"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Research
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{position.title}</h1>
        <p className="mt-1 text-gray-600">
          {position.pi_name} · Started {format(new Date(position.start_date), "MMM yyyy")}
        </p>
      </div>

      {editingLogId ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <WeeklyLogForm
            positionId={positionId}
            existingLog={
              logs.find((l) => l.id === editingLogId)
                ? {
                    hours_worked: logs.find((l) => l.id === editingLogId)!
                      .hours_worked,
                    accomplishments:
                      logs.find((l) => l.id === editingLogId)!.accomplishments,
                    learnings: logs.find((l) => l.id === editingLogId)!.learnings,
                    blockers: logs.find((l) => l.id === editingLogId)!.blockers,
                    next_week_plan:
                      logs.find((l) => l.id === editingLogId)!.next_week_plan,
                    meeting_notes:
                      logs.find((l) => l.id === editingLogId)!.meeting_notes,
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          {!currentWeekLog && (
            <div className="mb-6 rounded-lg border border-[#F5E6E6] bg-[#FBF5F5] p-4">
              <p className="mb-3 text-sm text-[#500000]">
                No log for this week yet. Start tracking your progress!
              </p>
              <Link
                href={`/research/${positionId}/log`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#500000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B1D1D]"
              >
                <Plus className="h-4 w-4" />
                Log This Week
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Log History</h2>
              <Link
                href={`/research/${positionId}/log`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#500000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B1D1D]"
              >
                <Plus className="h-4 w-4" />
                New Log
              </Link>
            </div>

            {logs.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <p className="text-gray-600">No logs yet.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Week of {format(new Date(log.week_start), "MMM d, yyyy")}
                    </h3>
                    {log.hours_worked && (
                      <span className="text-sm text-gray-600">
                        {log.hours_worked} hours
                      </span>
                    )}
                  </div>

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
                        Next Week
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
                      <p className="text-sm text-gray-600">{log.meeting_notes}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setEditingLogId(log.id)}
                    className="mt-4 text-sm text-[#500000] hover:text-[#6B1D1D]"
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

