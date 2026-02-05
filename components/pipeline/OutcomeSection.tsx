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
    className: "bg-pipeline-success-bg border-[#bbf7d0]",
    labelClass: "text-pipeline-success",
    iconColor: "var(--success)",
  },
  Rejected: {
    label: "Rejected",
    icon: X,
    className: "bg-pipeline-danger-bg border-[#fecaca]",
    labelClass: "text-pipeline-danger",
    iconColor: "var(--danger)",
  },
  Withdrawn: {
    label: "Withdrawn",
    icon: Minus,
    className: "bg-pipeline-muted-bg border-gray-200",
    labelClass: "text-pipeline-muted",
    iconColor: "var(--muted)",
  },
};

interface OutcomeSectionProps {
  applicationsByStage: Record<ApplicationStage, ApplicationWithOpportunity[]>;
}

export function OutcomeSection({ applicationsByStage }: OutcomeSectionProps) {
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
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:border-maroon-700 hover:bg-maroon-50"
                    >
                      {app.opportunity?.title ?? "Unknown"}
                    </Link>
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
