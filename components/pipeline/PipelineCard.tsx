"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Mail, User } from "lucide-react";
import { ApplicationWithOpportunity, ApplicationStage, Priority } from "@/lib/types/database";
import { StatusDropdown } from "./StatusDropdown";
import { cn } from "@/lib/utils/cn";

interface PipelineCardProps {
  application: ApplicationWithOpportunity;
  onStageChange: (applicationId: string, stage: ApplicationStage) => void;
  disabled?: boolean;
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "Low") return null;
  const isHigh = priority === "High";
  return (
    <span
      className={cn(
        "mb-2.5 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold",
        isHigh
          ? "bg-pipeline-warning-bg text-pipeline-warning"
          : "bg-gray-100 text-gray-600"
      )}
    >
      {isHigh ? "⚡ High Priority" : "● Medium"}
    </span>
  );
}

/** Static card view for DragOverlay (no drag handle or dropdown). */
export function PipelineCardPreview({
  application,
}: {
  application: ApplicationWithOpportunity;
}) {
  const opp = application.opportunity;
  const title = opp?.title ?? "Unknown Opportunity";
  const piName = opp?.leader_name ?? "—";
  const email = opp?.leader_email ?? null;
  return (
    <div className="w-[280px] rounded-[10px] border border-gray-200 bg-white p-3.5 shadow-lg">
      <PriorityBadge priority={application.priority} />
      <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
        {title}
      </h3>
      <div className="mb-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[13px] text-gray-600">
          <User className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>{piName}</span>
        </div>
        {email && (
          <div className="flex items-center gap-2 text-[13px] text-gray-600">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-[11px] text-gray-400">
          {formatTimeAgo(application.updated_at)}
        </span>
      </div>
    </div>
  );
}

export function PipelineCard({
  application,
  onStageChange,
  disabled = false,
}: PipelineCardProps) {
  const [copied, setCopied] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: application.id,
    data: { type: "application", application },
  });

  const opp = application.opportunity;
  const title = opp?.title ?? "Unknown Opportunity";
  const piName = opp?.leader_name ?? "—";
  const email = opp?.leader_email ?? null;

  const copyEmail = useCallback(() => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [email]);

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={false}
      animate={{ opacity: isDragging ? 0.5 : 1 }}
      className={cn(
        "rounded-[10px] border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all",
        "cursor-grab active:cursor-grabbing hover:border-maroon-700 hover:shadow-[0_4px_12px_rgba(80,0,0,0.08)] hover:-translate-y-px",
        isDragging && "z-50 shadow-lg"
      )}
      {...attributes}
      {...listeners}
    >
      <PriorityBadge priority={application.priority} />

      <Link
        href={`/applications/${application.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block"
      >
        <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {title}
        </h3>
      </Link>

      <div className="mb-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[13px] text-gray-600">
          <User className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>{piName}</span>
        </div>
        {email && (
          <div className="flex items-center justify-between gap-2 text-[13px] text-gray-600">
            <div className="flex min-w-0 items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{email}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                copyEmail();
              }}
              className="shrink-0 rounded px-2 py-1 text-[11px] text-gray-600 transition-colors hover:bg-maroon-100 hover:text-maroon-900"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <StatusDropdown
          value={application.stage}
          onChange={(stage) => {
            onStageChange(application.id, stage);
          }}
          activeOnly
          disabled={disabled}
        />
        <span className="text-[11px] text-gray-400">
          {formatTimeAgo(application.updated_at)}
        </span>
      </div>
    </motion.div>
  );
}

