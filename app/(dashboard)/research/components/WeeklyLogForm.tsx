"use client";

import { useState, useRef, useCallback, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import {
  getWeekStart,
  getWeekEnd,
  formatWeekHeader,
  computeWeekNumber,
} from "@/lib/utils/weekCalculations";

const DEBOUNCE_MS = 500;

interface Props {
  positionId: string;
  positionStartDate?: string; // for "Week N" label
  /** If a log already exists for this week, pass its week_start so the
   *  upsert targets the correct DB row (avoids creating duplicates when
   *  the stored week_start differs slightly from getWeekStart(now)). */
  existingWeekStart?: string;
  existingLog?: {
    hours_worked: number | null;
    accomplishments: string[];
    learnings: string[];
    blockers?: string[];
    next_week_plan: string[];
    meeting_notes: string | null;
  };
}

// Bullet textarea: display as lines, store as array
function BulletTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );
  return (
    <TextareaAutosize
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      minRows={3}
      className={className}
    />
  );
}

function WeeklyLogFormInner({
  positionId,
  positionStartDate,
  existingWeekStart,
  existingLog,
}: Props) {
  const router = useRouter();

  // Week boundaries for the CURRENT week
  const weekStart = getWeekStart(new Date());
  const weekEnd = getWeekEnd(new Date());
  const weekNumber = positionStartDate
    ? computeWeekNumber(weekStart, positionStartDate)
    : 1;

  // The week_start to send to the API.  If an existing log exists for this
  // week (with its own week_start stored in DB), re-use that exact value so
  // the upsert (on position_id,week_start) matches the existing row.
  const apiWeekStart = existingWeekStart ?? weekStart.toISOString();

  const [hoursWorked, setHoursWorked] = useState(
    existingLog?.hours_worked != null
      ? String(existingLog.hours_worked)
      : ""
  );
  const [accomplishments, setAccomplishments] = useState(
    existingLog?.accomplishments?.length
      ? existingLog.accomplishments.join("\n")
      : ""
  );
  const [learnings, setLearnings] = useState(
    existingLog?.learnings?.length ? existingLog.learnings.join("\n") : ""
  );
  const [nextSteps, setNextSteps] = useState(
    existingLog?.next_week_plan?.length
      ? existingLog.next_week_plan.join("\n")
      : ""
  );
  const [meetingNotes, setMeetingNotes] = useState(
    existingLog?.meeting_notes || ""
  );

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedPayloadRef = useRef<string>("");
  const mountedRef = useRef(false);

  const buildPayload = useCallback(() => {
    const acc = accomplishments
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const learn = learnings
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const next = nextSteps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      weekStart: apiWeekStart,
      weekEnd: weekEnd.toISOString(),
      weekNumber,
      hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
      accomplishments: acc,
      learnings: learn,
      nextWeekPlan: next,
      meetingNotes: meetingNotes || null,
    };
  }, [
    apiWeekStart,
    weekEnd,
    weekNumber,
    hoursWorked,
    accomplishments,
    learnings,
    nextSteps,
    meetingNotes,
  ]);

  const saveToApi = useCallback(
    async (payload: ReturnType<typeof buildPayload>) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/research/${positionId}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weekStart: payload.weekStart,
            // Tell the API to use the weekStart as-is when it came from an
            // existing DB row, so the upsert conflict key matches exactly.
            useExact: !!existingWeekStart,
            hoursWorked: payload.hoursWorked,
            accomplishments: payload.accomplishments,
            learnings: payload.learnings,
            blockers: [],
            nextWeekPlan: payload.nextWeekPlan,
            meetingNotes: payload.meetingNotes,
          }),
        });
        if (res.ok) {
          lastSavedPayloadRef.current = JSON.stringify(payload);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2500);
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    },
    [positionId]
  );

  // Initialize lastSavedPayloadRef on mount so we don't auto-save unchanged data
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      lastSavedPayloadRef.current = JSON.stringify(buildPayload());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced auto-save: 500ms after last change
  useEffect(() => {
    if (!mountedRef.current) return;

    const payload = buildPayload();
    const str = JSON.stringify(payload);
    if (str === lastSavedPayloadRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      saveToApi(payload);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [buildPayload, saveToApi]);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#500000] focus:outline-none focus:ring-1 focus:ring-[#500000] resize-none";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="space-y-4">
      {/* Auto-save indicator */}
      <div className="flex justify-end" data-tutorial="auto-save-indicator">
        {saveStatus === "saving" && (
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            All changes saved
          </span>
        )}
        {saveStatus === "error" && (
          <span className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            Failed to save. Retrying...
          </span>
        )}
      </div>

      {/* Date header: Week of Feb 9–15, 2026 · Week N */}
      <div
        className="flex items-center justify-between border-b border-gray-100 pb-3"
        data-tutorial="stats-overview"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {formatWeekHeader(new Date())}
        </h2>
        <span className="text-sm font-medium text-gray-500">Week {weekNumber}</span>
      </div>

      {/* Hours this week */}
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
            placeholder=""
            className={`${inputClass} w-24`}
          />
          <span className="text-sm text-gray-600">hours</span>
        </div>
      </div>

      {/* What did you accomplish? */}
      <div>
        <label className={labelClass}>What did you accomplish?</label>
        <BulletTextarea
          value={accomplishments}
          onChange={setAccomplishments}
          placeholder={"• Finished preprocessing the dataset\n• Debugged training loop\n• Met with PI about results"}
          className={inputClass}
        />
      </div>

      {/* What did you learn? */}
      <div>
        <label className={labelClass}>What did you learn?</label>
        <BulletTextarea
          value={learnings}
          onChange={setLearnings}
          placeholder="• How to use PyTorch DataLoader\n• Best practices for validation sets"
          className={inputClass}
        />
      </div>

      {/* Next steps */}
      <div>
        <label className={labelClass}>Next steps</label>
        <BulletTextarea
          value={nextSteps}
          onChange={setNextSteps}
          placeholder="• Start building the model architecture\n• Run baseline experiments"
          className={inputClass}
        />
      </div>

      {/* Meeting notes (optional) */}
      <div>
        <label className={labelClass}>
          Meeting notes{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <TextareaAutosize
          value={meetingNotes}
          onChange={(e) => setMeetingNotes(e.target.value)}
          placeholder="Any notes from meetings with your PI..."
          minRows={2}
          className={inputClass}
        />
      </div>

      {/* Back button */}
      <div className="flex justify-end border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export const WeeklyLogForm = memo(WeeklyLogFormInner);
