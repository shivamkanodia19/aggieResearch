"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  type?:
    | "pipeline-saved"
    | "pipeline-contacted"
    | "pipeline-interview"
    | "opportunities-none"
    | "research-none";
}

const EDUCATIONAL_MESSAGES: Record<
  string,
  { title: string; description: string; ctaLabel?: string; ctaHref?: string }
> = {
  "pipeline-saved": {
    title: "No saved opportunities",
    description: "Browse and save research opportunities to start building your pipeline.",
    ctaLabel: "Find Research",
    ctaHref: "/opportunities",
  },
  "pipeline-contacted": {
    title: "No emails sent yet",
    description: "Once you contact a PI, move the opportunity here to track responses.",
  },
  "pipeline-interview": {
    title: "No interviews scheduled",
    description: "Interviews will appear here as your applications progress.",
  },
  "opportunities-none": {
    title: "No opportunities found",
    description:
      "Try broadening your filters or checking back later. New opportunities are posted regularly.",
    ctaLabel: "Clear Filters",
    ctaHref: "/opportunities",
  },
  "research-none": {
    title: "No active research yet",
    description:
      "Once you accept a research position, you can track your weekly progress here. Log accomplishments and generate reports for your PI.",
    ctaLabel: "Find Research",
    ctaHref: "/opportunities",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel = "Find Research",
  ctaHref = "/opportunities",
  type,
}: EmptyStateProps) {
  // Use educational messages if type is provided
  const config = type
    ? EDUCATIONAL_MESSAGES[type]
    : { title, description, ctaLabel, ctaHref };

  const finalTitle = config?.title || title;
  const finalDescription = config?.description || description;
  const finalCtaLabel = config?.ctaLabel || ctaLabel;
  const finalCtaHref = config?.ctaHref || ctaHref;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 [&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-900">{finalTitle}</p>
      {finalDescription ? (
        <p className="mt-1.5 max-w-[220px] text-[13px] leading-snug text-gray-500">
          {finalDescription}
        </p>
      ) : null}
      {finalCtaLabel && finalCtaHref && (
        <Link
          href={finalCtaHref}
          className="mt-4 inline-flex items-center rounded-lg bg-maroon-900 px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-maroon-700 hover:shadow-md active:scale-[0.98]"
          style={{ backgroundColor: "var(--maroon-900)" }}
        >
          {finalCtaLabel}
        </Link>
      )}
    </div>
  );
}
