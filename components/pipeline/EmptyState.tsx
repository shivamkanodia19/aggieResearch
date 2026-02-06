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
    description:
      "Not sure where to start? Browse opportunities filtered by your major and save 3-5 that sound interesting. You don't need to be a perfect fit.",
    ctaLabel: "Browse Opportunities",
    ctaHref: "/opportunities",
  },
  "pipeline-contacted": {
    title: "No emails sent yet",
    description:
      "Ready to reach out? Move a saved opportunity here when you email the professor. Most students apply to 5-10 positions before getting one — it's normal!",
  },
  "pipeline-interview": {
    title: "No interviews scheduled",
    description:
      "When a professor responds wanting to meet, move the card here. Interviews are usually casual conversations — they want to see if you're curious and reliable.",
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
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-gray-400"
        style={{ backgroundColor: "var(--gray-100)" }}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-700">{finalTitle}</p>
      <p className="mt-1.5 max-w-[180px] text-[13px] leading-snug text-gray-500">
        {finalDescription}
      </p>
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
