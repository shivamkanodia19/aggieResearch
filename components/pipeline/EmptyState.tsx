"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel = "Browse Opportunities →",
  ctaHref = "/opportunities",
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-gray-400"
        style={{ backgroundColor: "var(--gray-100)" }}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-1.5 max-w-[180px] text-[13px] leading-snug text-gray-500">
        {description}
      </p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 text-[13px] font-medium text-maroon-900 hover:underline"
          style={{ color: "var(--maroon-900)" }}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
