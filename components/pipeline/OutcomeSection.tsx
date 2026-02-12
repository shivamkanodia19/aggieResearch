"use client";

import { Check, Minus, X } from "lucide-react";
import { ApplicationWithOpportunity, ApplicationStage } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

const OUTCOME_STAGES = ["Accepted", "Rejected", "Withdrawn"] as const;
type OutcomeStage = (typeof OUTCOME_STAGES)[number];

const OUTCOME_CONFIG: Record<
  OutcomeStage,
  {
    label: string;
    icon: typeof Check;
    /** Tailwind classes for the card wrapper */
    card: string;
    /** Tailwind classes for the icon */
    iconColor: string;
    /** Tailwind classes for the heading text */
    labelColor: string;
  }
> = {
  Accepted: {
    label: "Accepted",
    icon: Check,
    card: "border-green-200 bg-green-50",
    iconColor: "text-green-600",
    labelColor: "text-green-900",
  },
  Rejected: {
    label: "Rejected",
    icon: X,
    card: "border-red-200 bg-red-50",
    iconColor: "text-red-600",
    labelColor: "text-red-900",
  },
  Withdrawn: {
    label: "Withdrawn",
    icon: Minus,
    card: "border-gray-200 bg-white",
    iconColor: "text-gray-500",
    labelColor: "text-gray-700",
  },
};

interface OutcomeSectionProps {
  applicationsByStage: Record<ApplicationStage, ApplicationWithOpportunity[]>;
  onAddToResearch?: (app: ApplicationWithOpportunity) => void;
  /** When provided, outcome items open in the pipeline side panel instead of navigating away. */
  onOpenApplication?: (app: ApplicationWithOpportunity) => void;
}

export function OutcomeSection({
  applicationsByStage,
  onAddToResearch,
  onOpenApplication,
}: OutcomeSectionProps) {
  function formatOutcomeDate(updatedAt: string, stage: OutcomeStage): string {
    const d = new Date(updatedAt);
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return stage === "Accepted" ? `Accepted ${dateStr}` : dateStr;
  }

  return (
    <section
      data-tutorial="outcomes-section"
      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
    >
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
        Outcomes
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {OUTCOME_STAGES.map((stage) => {
          const apps = applicationsByStage[stage] ?? [];
          const config = OUTCOME_CONFIG[stage];
          const Icon = config.icon;
          return (
            <div
              key={stage}
              className={cn(
                "min-h-[120px] rounded-[10px] border p-4",
                config.card,
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon
                  className={cn("h-5 w-5 shrink-0", config.iconColor)}
                  strokeWidth={2.5}
                />
                <span className={cn("text-[13px] font-semibold", config.labelColor)}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-500">({apps.length})</span>
              </div>
              {apps.length === 0 ? (
                <p className="text-[13px] italic text-gray-500">
                  {stage === "Accepted"
                    ? "No acceptances yet — keep going!"
                    : "Nothing here"}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {apps.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-lg bg-white/80 px-3 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                    >
                      <div className="text-[13px] font-medium text-gray-900">
                        {onOpenApplication ? (
                          <button
                            type="button"
                            onClick={() => onOpenApplication(app)}
                            className="block w-full text-left transition-colors hover:text-maroon-700"
                          >
                            {app.opportunity?.title ?? "Unknown"}
                          </button>
                        ) : (
                          <span>{app.opportunity?.title ?? "Unknown"}</span>
                        )}
                      </div>
                      <div className="mt-1 text-[12px] text-gray-500">
                        {app.opportunity?.leader_name ?? "—"} ·{" "}
                        {formatOutcomeDate(app.updated_at, stage)}
                      </div>
                      {stage === "Accepted" && onAddToResearch && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToResearch(app);
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="relative z-10 mt-2 shrink-0 rounded px-2 py-1 text-[11px] font-medium text-maroon-700 hover:bg-maroon-50"
                        >
                          Add to My Research
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
