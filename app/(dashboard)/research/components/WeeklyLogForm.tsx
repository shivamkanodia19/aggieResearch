"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startOfWeek, format } from "date-fns";

interface Props {
  positionId: string;
  existingLog?: {
    hours_worked: number | null;
    accomplishments: string[];
    learnings: string[];
    blockers: string[];
    next_week_plan: string[];
    meeting_notes: string | null;
  };
}

export function WeeklyLogForm({ positionId, existingLog }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [hoursWorked, setHoursWorked] = useState(
    existingLog?.hours_worked?.toString() || ""
  );
  const [accomplishments, setAccomplishments] = useState<string[]>(
    existingLog?.accomplishments?.length ? existingLog.accomplishments : [""]
  );
  const [learnings, setLearnings] = useState<string[]>(
    existingLog?.learnings?.length ? existingLog.learnings : [""]
  );
  const [blockers, setBlockers] = useState<string[]>(
    existingLog?.blockers?.length ? existingLog.blockers : [""]
  );
  const [nextWeekPlan, setNextWeekPlan] = useState<string[]>(
    existingLog?.next_week_plan?.length ? existingLog.next_week_plan : [""]
  );
  const [meetingNotes, setMeetingNotes] = useState(
    existingLog?.meeting_notes || ""
  );

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/research/${positionId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: weekStart.toISOString(),
          hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
          accomplishments: accomplishments.filter((a) => a.trim()),
          learnings: learnings.filter((l) => l.trim()),
          blockers: blockers.filter((b) => b.trim()),
          nextWeekPlan: nextWeekPlan.filter((n) => n.trim()),
          meetingNotes: meetingNotes || null,
        }),
      });

      if (res.ok) {
        router.push(`/research/${positionId}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save log:", error);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const updateItem = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const removeItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    items: string[]
  ) => {
    if (items.length > 1) {
      setter((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const BulletList = ({
    items,
    setItems,
    placeholder,
  }: {
    items: string[];
    setItems: React.Dispatch<React.SetStateAction<string[]>>;
    placeholder: string;
  }) => (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <span className="mt-2.5 text-gray-400">•</span>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value, setItems)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#500000]"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(index, setItems, items)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addItem(setItems)}
        className="text-sm font-medium text-[#500000] hover:text-[#6B1D1D]"
      >
        + Add another
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-lg border border-[#F5E6E6] bg-[#FBF5F5] p-4">
        <p className="text-sm text-[#500000]">
          Logging week of <strong>{format(weekStart, "MMMM d, yyyy")}</strong>
        </p>
      </div>

      {/* Hours */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Hours worked this week
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          value={hoursWorked}
          onChange={(e) => setHoursWorked(e.target.value)}
          placeholder="0"
          className="w-32 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#500000]"
        />
      </div>

      {/* Accomplishments */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          What did you accomplish? ✓
        </label>
        <BulletList
          items={accomplishments}
          setItems={setAccomplishments}
          placeholder="e.g., Finished preprocessing the dataset"
        />
      </div>

      {/* Learnings */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          What did you learn? 📚
        </label>
        <BulletList
          items={learnings}
          setItems={setLearnings}
          placeholder="e.g., How to use PyTorch DataLoader"
        />
      </div>

      {/* Blockers */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Any blockers? 🚧
        </label>
        <BulletList
          items={blockers}
          setItems={setBlockers}
          placeholder="e.g., Waiting on labeled test data"
        />
      </div>

      {/* Next Week */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Plan for next week 📋
        </label>
        <BulletList
          items={nextWeekPlan}
          setItems={setNextWeekPlan}
          placeholder="e.g., Try transfer learning approach"
        />
      </div>

      {/* Meeting Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Meeting notes <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={meetingNotes}
          onChange={(e) => setMeetingNotes(e.target.value)}
          placeholder="Any notes from meetings with your PI..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#500000]"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#500000] px-6 py-2 font-medium text-white transition-colors hover:bg-[#6B1D1D] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Log"}
        </button>
      </div>
    </form>
  );
}
