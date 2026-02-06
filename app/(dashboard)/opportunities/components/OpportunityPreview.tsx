"use client";

import { useState } from "react";
import type { Opportunity } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Check, Plus, Loader2 } from "lucide-react";

interface Props {
  opportunity: Opportunity;
  isTracked: boolean;
  onTrack: () => Promise<void>;
  onSelectSimilar?: (id: string) => void;
}

interface OpportunitySummary {
  oneLiner?: string;
  whatYoullDo?: string;
  researchArea?: string;
  skills?: string[];
  timeCommitment?: string;
  compensation?: string;
  requirements?: string[];
  idealFor?: string[];
  applicationTip?: string;
}

export function OpportunityPreview({
  opportunity,
  isTracked,
  onTrack,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [tracking, setTracking] = useState(false);

  const handleCopyEmail = async () => {
    if (opportunity.leader_email) {
      await navigator.clipboard.writeText(opportunity.leader_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrack = async () => {
    setTracking(true);
    try {
      await onTrack();
    } finally {
      setTracking(false);
    }
  };

  // Parse opportunity_summary JSON if available
  const summary: OpportunitySummary | null = opportunity.opportunity_summary
    ? (opportunity.opportunity_summary as OpportunitySummary)
    : null;

  const majors = opportunity.relevant_majors ?? [];
  const skills = summary?.skills ?? opportunity.skills_gained ?? [];
  const timeCommitment =
    summary?.timeCommitment ?? opportunity.time_commitment ?? "Not specified";
  const compensation = summary?.compensation ?? "Not specified";

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {opportunity.title}
          </h1>
          <Button
            onClick={handleTrack}
            disabled={tracking || isTracked}
            className={`whitespace-nowrap ${
              isTracked
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-[#500000] text-white hover:bg-[#700000]"
            }`}
          >
            {tracking ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : isTracked ? (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Tracked
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Track
              </>
            )}
          </Button>
        </div>

        {summary?.oneLiner && (
          <p className="text-lg text-gray-600 mb-4">{summary.oneLiner}</p>
        )}

        {/* PI Info with hover-to-copy email */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-gray-700">
              {opportunity.leader_name || "Unknown"}
            </span>
          </div>

          {opportunity.leader_email && (
            <div className="flex items-center gap-2 group relative">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-700">{opportunity.leader_email}</span>
              <button
                onClick={handleCopyEmail}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {majors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {majors.map((major) => (
            <span
              key={major}
              className="px-3 py-1 bg-[#500000]/10 text-[#500000] text-sm rounded-full font-medium"
            >
              {major}
            </span>
          ))}
        </div>
      )}

      {/* Summary sections */}
      {summary && (
        <div className="space-y-6">
          {/* What you'll actually do */}
          {summary.whatYoullDo && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🔬</span> What you&apos;ll actually do
              </h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {summary.whatYoullDo}
              </p>
            </section>
          )}

          {/* Quick Facts */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Time Commitment</p>
              <p className="text-sm font-medium text-gray-900">
                {timeCommitment}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Compensation</p>
              <p className="text-sm font-medium text-gray-900">
                {compensation}
              </p>
            </div>
          </section>

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Skills & Tools
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Ideal For */}
          {summary.idealFor && summary.idealFor.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Best for
              </h2>
              <ul className="text-sm text-gray-700 space-y-1">
                {summary.idealFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Requirements */}
          {summary.requirements && summary.requirements.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Requirements
              </h2>
              <ul className="text-sm text-gray-700 space-y-1">
                {summary.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Application Tip */}
          {summary.applicationTip && (
            <section className="bg-[#500000]/5 border border-[#500000]/20 p-4 rounded-lg">
              <h2 className="text-sm font-semibold text-[#500000] mb-1 flex items-center gap-2">
                <span>💡</span> Application Tip
              </h2>
              <p className="text-sm text-[#500000]/90">{summary.applicationTip}</p>
            </section>
          )}
        </div>
      )}

      {/* Raw description fallback */}
      {!summary && opportunity.description && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Description
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {opportunity.description}
          </p>
        </section>
      )}

      {/* Email Tips for Freshmen */}
      <section className="mt-8 border-t border-gray-200 pt-6">
        <details className="group">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-[#500000] flex items-center gap-2">
            <span>📧</span> Tips for emailing this professor
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2 pl-6">
            <p>
              • <strong>Keep it short</strong> — 3-4 sentences max. Professors
              are busy.
            </p>
            <p>
              • <strong>Be specific</strong> — Mention this project by name
              and one thing that interests you about it.
            </p>
            <p>
              • <strong>Show relevance</strong> — Briefly mention a skill or
              class that relates to their work.
            </p>
            <p>
              • <strong>Clear ask</strong> — End with &quot;Would you have 15
              minutes to discuss this opportunity?&quot;
            </p>
            <p>
              • <strong>Don&apos;t attach your resume</strong> unless they ask
              for it.
            </p>
          </div>
        </details>
      </section>

      {/* Similar Opportunities */}
      {onSelectSimilar && (
        <SimilarOpportunities
          opportunityId={opportunity.id}
          onSelect={onSelectSimilar}
        />
      )}

      {/* Action footer */}
      {opportunity.source_url && (
        <div className="mt-8 flex items-center gap-4">
          <a
            href={opportunity.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            View on Aggie Collaborate ↗
          </a>
        </div>
      )}
    </div>
  );
}
