"use client";

interface Props {
  opportunity: {
    id: string;
    title: string;
    leader_name: string | null;
    relevant_majors: string[] | null;
    ai_summary: string | null;
  };
  isSelected: boolean;
  onClick: () => void;
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
      <h3
        className={`font-medium text-sm leading-snug mb-1 ${
          isSelected ? "text-[#500000]" : "text-gray-900"
        }`}
      >
        {opportunity.title}
      </h3>

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
