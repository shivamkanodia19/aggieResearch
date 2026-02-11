"use client";

import type { OpportunityUserStatus } from "@/hooks/use-opportunities";

interface Props {
  opportunity: {
    id: string;
    title: string;
    leader_name: string | null;
    relevant_majors: string[] | null;
    ai_summary: string | null;
    userStatus?: OpportunityUserStatus;
  };
  isSelected: boolean;
  onClick: () => void;
}

function StatusBadge({ userStatus }: { userStatus: OpportunityUserStatus }) {
  if (!userStatus) return null;

  if ("isResearch" in userStatus) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Researching
      </span>
    );
  }

  if ("stage" in userStatus) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        {userStatus.stage}
      </span>
    );
  }

  return null;
}

export function OpportunityListItem({
  opportunity,
  isSelected,
  onClick,
}: Props) {
  const majors = opportunity.relevant_majors ?? [];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-200 transition-colors ${
        isSelected
          ? "bg-white border-l-4 border-l-[#500000]"
          : "bg-gray-50 hover:bg-gray-100 border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`font-medium text-sm leading-snug mb-1 ${
            isSelected ? "text-[#500000]" : "text-gray-900"
          }`}
        >
          {opportunity.title}
        </h3>
        {opportunity.userStatus && (
          <StatusBadge userStatus={opportunity.userStatus} />
        )}
      </div>

      <p className="text-xs text-gray-600 mb-2">
        {opportunity.leader_name || "Unknown"}
      </p>

      {opportunity.ai_summary && (
        <p className="text-xs text-gray-500 line-clamp-2">
          {opportunity.ai_summary}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mt-2">
        {majors.slice(0, 2).map((major) => (
          <span
            key={major}
            className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded"
          >
            {major}
          </span>
        ))}
        {majors.length > 2 && (
          <span className="text-xs text-gray-400">
            +{majors.length - 2}
          </span>
        )}
      </div>
    </button>
  );
}
