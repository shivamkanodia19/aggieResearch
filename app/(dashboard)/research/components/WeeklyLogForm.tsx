"use client";

import { useState, useRef, useCallback, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { startOfWeek, format, endOfWeek } from "date-fns";
import { Check, Loader2, AlertCircle } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

const DEBOUNCE_MS = 500;

interface Props {
  positionId: string;
  positionStartDate?: string; // for "Week N" label
  existingLog?: {
    hours_worked: number | null;
    accomplishments: string[];
    learnings: string[];
    blockers?: string[];
    next_week_plan: string[];
    meeting_notes: string | null;
  };
}

function getWeekNumber(weekStart: Date, positionStartDate?: string): number {
  if (!positionStartDate) return 1;
  const start = startOfWeek(new Date(positionStartDate), { weekStartsOn: 0 });
  const diff = weekStart.getTime() - start.getTime();
  const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, weeks + 1);
}

// Bullet textarea: display as lines, store as array; no per-item re-renders so focus is kept
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
  const lines = value ? value.split("\n") : [];
  const displayValue = lines.length ? lines.join("\n") : "";
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );
  return (
    <TextareaAutosize
      value={displayValue}
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
  existingLog,
}: Props) {
  const router = useRouter();
  // Week starts on Sunday
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
  const weekNumber = getWeekNumber(weekStart, positionStartDate);

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
      weekStart: weekStart.toISOString(),
      hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
      accomplishments: acc,
      learnings: learn,
      nextWeekPlan: next,
      meetingNotes: meetingNotes || null,
    };
  }, [
    weekStart,
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
            hoursWorked: payload.hoursWorked,
            accomplishments: payload.accomplishments,
            learnings: payload.learnings,
            blockers: [], // deprecated, no longer from form
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

  // Debounced auto-save: 500ms after last change
  useEffect(() => {
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
      {/* Auto-save indicator - top right */}
      <div className="flex justify-end">
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

      {/* Date header: Week of Feb 2-8, 2026 · Week N */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Week of {format(weekStart, "MMM d")}–{format(weekEnd, "d, yyyy")}
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

      {/* No Save button - auto-save only. Keep Back. */}
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
