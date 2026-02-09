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
    description: "",
    ctaLabel: "Browse Opportunities →",
    ctaHref: "/opportunities",
  },
  "pipeline-contacted": {
    title: "No emails sent yet",
    description: "",
  },
  "pipeline-interview": {
    title: "No interviews scheduled",
    description: "",
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
    ctaLabel: "Browse Opportunities",
    ctaHref: "/opportunities",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel = "Browse Opportunities →",
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
      <div className="mb-4 flex h-14 w-14 items-center justify-center text-gray-300 [&>svg]:h-8 [&>svg]:w-8">
        {icon}
      </div>
      <p className="text-sm text-gray-500">{finalTitle}</p>
      {finalDescription ? (
        <p className="mt-1.5 max-w-[180px] text-[13px] leading-snug text-gray-500">
          {finalDescription}
        </p>
      ) : null}
      {finalCtaLabel && finalCtaHref && (
        <Link
          href={finalCtaHref}
          className="mt-4 text-[13px] font-medium text-maroon-900 hover:underline"
          style={{ color: "var(--maroon-900)" }}
        >
          {finalCtaLabel}
        </Link>
      )}
    </div>
  );
}
