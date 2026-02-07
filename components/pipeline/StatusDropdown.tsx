"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Minus, X } from "lucide-react";
import { ApplicationStage, ApplicationWithOpportunity } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

const STAGE_LABELS: Record<ApplicationStage, string> = {
  Saved: "Saved",
  "First Email": "Contacted",
  Responded: "Responded",
  Interview: "Interview",
  Accepted: "Accepted",
  Rejected: "Rejected",
  Withdrawn: "Withdrawn",
};

const ACTIVE_STAGES: ApplicationStage[] = [
  "Saved",
  "First Email",
  "Responded",
  "Interview",
];

const OUTCOME_STAGES: ApplicationStage[] = ["Accepted", "Rejected", "Withdrawn"];

const STATUS_DOT_COLORS: Record<string, string> = {
  Saved: "var(--gray-400)",
  "First Email": "#ca8a04",
  Responded: "#3b82f6",
  Interview: "#8b5cf6",
};

interface StatusDropdownProps {
  value: ApplicationStage;
  onChange: (stage: ApplicationStage) => void;
  /** When true, only show active pipeline stages (no outcomes). */
  activeOnly?: boolean;
  disabled?: boolean;
  /** Called when user selects Accepted (show confirmation modal before updating). */
  onRequestAccepted?: () => void;
  /** Called when user selects Rejected (show confirmation modal before updating). */
  onRequestRejected?: () => void;
}

export function StatusDropdown({
  value,
  onChange,
  activeOnly = false,
  disabled = false,
  onRequestAccepted,
  onRequestRejected,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (stage: ApplicationStage) => {
    if (["Accepted", "Rejected", "Withdrawn"].includes(stage)) {
      if (stage === "Withdrawn") {
        onChange("Withdrawn");
        setOpen(false);
      } else if (stage === "Accepted" && onRequestAccepted) {
        onRequestAccepted();
        setOpen(false);
      } else if (stage === "Rejected" && onRequestRejected) {
        onRequestRejected();
        setOpen(false);
      } else {
        onChange(stage);
        setOpen(false);
      }
    } else {
      onChange(stage);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          "flex h-8 min-w-[100px] items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
          "border-[var(--gray-200)] bg-[var(--gray-50)] text-[var(--gray-700)]",
          "hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-2 focus:ring-[var(--maroon-100)]",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span>{STAGE_LABELS[value]}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-[var(--gray-200)] bg-white shadow-lg"
          role="listbox"
        >
          {activeOnly ? (
            <div className="p-1.5">
              {ACTIVE_STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  role="option"
                  aria-selected={value === stage}
                  onClick={() => handleSelect(stage)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    value === stage
                      ? "bg-[var(--maroon-50)] font-medium text-[var(--maroon-900)]"
                      : "text-gray-700 hover:bg-[var(--gray-100)]"
                  )}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_DOT_COLORS[stage] ?? "var(--gray-400)" }}
                  />
                  {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="p-1.5">
                <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--gray-400)]">
                  Status
                </p>
                {ACTIVE_STAGES.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    role="option"
                    aria-selected={value === stage}
                    onClick={() => handleSelect(stage)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      value === stage
                        ? "bg-[var(--maroon-50)] font-medium text-[var(--maroon-900)]"
                        : "text-gray-700 hover:bg-[var(--gray-100)]"
                    )}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_DOT_COLORS[stage] ?? "var(--gray-400)" }}
                    />
                    {STAGE_LABELS[stage]}
                  </button>
                ))}
              </div>
              <div className="h-px bg-[var(--gray-200)]" />
              <div className="p-1.5">
                <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--gray-400)]">
                  Outcomes
                </p>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === "Accepted"}
                  onClick={() => handleSelect("Accepted")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    value === "Accepted"
                      ? "bg-green-50 font-medium text-green-700"
                      : "text-green-700 hover:bg-green-50"
                  )}
                >
                  <Check className="h-4 w-4 shrink-0 stroke-[2.5]" />
                  Accepted
                </button>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === "Rejected"}
                  onClick={() => handleSelect("Rejected")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    value === "Rejected"
                      ? "bg-red-50 font-medium text-red-700"
                      : "text-red-700 hover:bg-red-50"
                  )}
                >
                  <X className="h-4 w-4 shrink-0 stroke-[2.5]" />
                  Rejected
                </button>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === "Withdrawn"}
                  onClick={() => handleSelect("Withdrawn")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    value === "Withdrawn"
                      ? "bg-[var(--maroon-50)] font-medium text-[var(--gray-700)]"
                      : "text-[var(--gray-500)] hover:bg-[var(--gray-100)]"
                  )}
                >
                  <Minus className="h-4 w-4 shrink-0 stroke-[2]" />
                  Withdrawn
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { STAGE_LABELS };
