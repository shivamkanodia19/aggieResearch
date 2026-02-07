"use client";

import Link from "next/link";
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
    className: string;
    labelClass: string;
    iconColor: string;
  }
> = {
  Accepted: {
    label: "Accepted",
    icon: Check,
    className: "bg-maroon-50 border-maroon-100",
    labelClass: "text-maroon-900",
    iconColor: "var(--maroon-900)",
  },
  Rejected: {
    label: "Rejected",
    icon: X,
    className: "bg-red-50 border-red-200",
    labelClass: "text-red-800",
    iconColor: "#991b1b",
  },
  Withdrawn: {
    label: "Withdrawn",
    icon: Minus,
    className: "bg-gray-100 border-gray-200",
    labelClass: "text-gray-600",
    iconColor: "#737373",
  },
};

interface OutcomeSectionProps {
  applicationsByStage: Record<ApplicationStage, ApplicationWithOpportunity[]>;
  onAddToResearch?: (app: ApplicationWithOpportunity) => void;
}

export function OutcomeSection({ applicationsByStage, onAddToResearch }: OutcomeSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-gray-600">
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
                config.className
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={2.5}
                  style={{ color: config.iconColor }}
                />
                <span className={cn("text-[13px] font-semibold", config.labelClass)}>
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
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
                    >
                      <Link
                        href={`/applications/${app.id}`}
                        className="min-w-0 flex-1 text-[13px] font-medium text-gray-700 transition-colors hover:text-maroon-700"
                      >
                        {app.opportunity?.title ?? "Unknown"}
                      </Link>
                      {onAddToResearch && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onAddToResearch(app);
                          }}
                          className="shrink-0 rounded px-2 py-1 text-[11px] font-medium text-maroon-700 hover:bg-maroon-50"
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
