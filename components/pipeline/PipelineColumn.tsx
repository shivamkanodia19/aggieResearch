"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Bookmark, Calendar, Mail, MessageCircle } from "lucide-react";
import { ReactNode } from "react";
import { ApplicationStage } from "@/lib/types/database";
import { ApplicationWithOpportunity } from "@/lib/types/database";
import { PipelineCard } from "./PipelineCard";
import { EmptyState } from "./EmptyState";
import { STAGE_LABELS } from "./StatusDropdown";

const ACTIVE_STAGES: ApplicationStage[] = [
  "Saved",
  "First Email",
  "Responded",
  "Interview",
];

const COLUMN_ICONS: Record<ApplicationStage, ReactNode> = {
  Saved: <Bookmark className="h-5 w-5" />,
  "First Email": <Mail className="h-5 w-5" />,
  Responded: <MessageCircle className="h-5 w-5" />,
  Interview: <Calendar className="h-5 w-5" />,
  Accepted: null,
  Rejected: null,
  Withdrawn: null,
};

const EMPTY_CONFIG: Record<
  ApplicationStage,
  { title: string; description: string; cta?: boolean }
> = {
  Saved: {
    title: "No saved opportunities",
    description: 'Browse opportunities and click "+ Track" to start your pipeline',
    cta: true,
  },
  "First Email": {
    title: "No contacts yet",
    description: "Move a card here when you've sent your first email",
    cta: false,
  },
  Responded: {
    title: "No responses yet",
    description: "When a PI responds, drag the card here",
    cta: false,
  },
  Interview: {
    title: "No interviews scheduled",
    description: "When a PI responds with an interview request, move the card here",
    cta: false,
  },
  Accepted: { title: "", description: "", cta: false },
  Rejected: { title: "", description: "", cta: false },
  Withdrawn: { title: "", description: "", cta: false },
};

interface PipelineColumnProps {
  stage: ApplicationStage;
  applications: ApplicationWithOpportunity[];
  filledDots: number; // 1–4 for progress indicator
  onStageChange: (applicationId: string, newStage: ApplicationStage) => void;
  disabled?: boolean;
  /** Called when user confirms "Start Tracking" in Accepted modal. */
  onAcceptedToTracking?: (opportunityId: string) => void;
}

export function PipelineColumn({
  stage,
  applications,
  filledDots,
  onStageChange,
  disabled = false,
  onAcceptedToTracking,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { type: "column", stage },
  });

  const label = STAGE_LABELS[stage];
  const config = EMPTY_CONFIG[stage];
  const icon = COLUMN_ICONS[stage];

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className="flex min-h-[400px] flex-col rounded-xl border border-gray-200 bg-white"
      style={{
        backgroundColor: isOver ? "var(--maroon-50)" : undefined,
      }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-700">
            {label}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-gray-600"
            style={{ backgroundColor: "var(--gray-100)" }}
          >
            {applications.length}
          </span>
        </div>
        {filledDots >= 1 && filledDots <= 4 && (
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    i <= filledDots ? "var(--maroon-900)" : "var(--gray-200)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-auto p-3">
        {applications.length === 0 ? (
          <EmptyState
            icon={icon}
            title={config.title}
            description={config.description}
            ctaLabel={config.cta ? "Browse Opportunities →" : undefined}
            ctaHref={config.cta ? "/opportunities" : undefined}
            type={
              stage === "Saved"
                ? "pipeline-saved"
                : stage === "First Email"
                  ? "pipeline-contacted"
                  : stage === "Interview"
                    ? "pipeline-interview"
                    : undefined
            }
          />
        ) : (
          applications.map((app) => (
            <PipelineCard
              key={app.id}
              application={app}
              onStageChange={onStageChange}
              disabled={disabled}
              onAcceptedToTracking={onAcceptedToTracking}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

export { ACTIVE_STAGES };
