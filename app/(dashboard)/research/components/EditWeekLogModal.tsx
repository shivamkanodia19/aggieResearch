"use client";

import { useState } from "react";

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

interface Props {
  open: boolean;
  onClose: () => void;
  log: Log;
  positionId: string;
  weekLabel: string;
  onSaved?: () => void;
}

export function EditWeekLogModal({
  open,
  onClose,
  log,
  positionId,
  weekLabel,
  onSaved,
}: Props) {
  const [hoursWorked, setHoursWorked] = useState(
    log.hours_worked != null ? String(log.hours_worked) : ""
  );
  const [accomplishments, setAccomplishments] = useState(
    (log.accomplishments ?? []).join("\n")
  );
  const [learnings, setLearnings] = useState(
    (log.learnings ?? []).join("\n")
  );
  const [nextSteps, setNextSteps] = useState(
    (log.next_week_plan ?? []).join("\n")
  );
  const [meetingNotes, setMeetingNotes] = useState(log.meeting_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/research/${positionId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: log.week_start,
          weekNumber: log.week_number,
          hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
          accomplishments: accomplishments
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          learnings: learnings
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          blockers: [],
          nextWeekPlan: nextSteps
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          meetingNotes: meetingNotes || null,
        }),
      });

      if (response.ok) {
        onSaved?.();
        onClose();
      } else {
        const data = await response.json().catch(() => ({}));
        setError(
          (data as { error?: string }).error ?? "Failed to save changes"
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#500000] focus:outline-none focus:ring-1 focus:ring-[#500000] resize-none";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit {weekLabel}
          </h2>
          {log.week_number && (
            <p className="mt-0.5 text-sm text-gray-500">
              Week {log.week_number}
            </p>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Hours */}
          <div>
            <label className={labelClass}>Hours this week</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min={0}
                max={168}
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className={`${inputClass} w-24`}
              />
              <span className="text-sm text-gray-600">hours</span>
            </div>
          </div>

          {/* Accomplishments */}
          <div>
            <label className={labelClass}>What did you accomplish?</label>
            <textarea
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="One item per line..."
            />
          </div>

          {/* Learnings */}
          <div>
            <label className={labelClass}>What did you learn?</label>
            <textarea
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="One item per line..."
            />
          </div>

          {/* Next Steps */}
          <div>
            <label className={labelClass}>Next steps</label>
            <textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="One item per line..."
            />
          </div>

          {/* Meeting Notes */}
          <div>
            <label className={labelClass}>
              Meeting notes{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Any notes from meetings with your PI..."
            />
          </div>
        </div>

        {/* Footer */}
        {error && (
          <p className="px-6 pb-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#500000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B1D1D] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
