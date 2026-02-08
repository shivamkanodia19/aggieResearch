"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterOption {
  name: string;
  count: number;
}

interface SourceOption {
  name: string;
  label: string;
  count: number;
}

interface FilterData {
  majors: FilterOption[];
  eligibility: FilterOption[];
  sources?: SourceOption[];
  total: number;
}

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterData | null>(null);
  const [loading, setLoading] = useState(true);

  const [expandedSections, setExpandedSections] = useState({
    majors: true,
    eligibility: true,
    source: true,
  });

  const selectedMajors = searchParams.getAll("major");
  const selectedEligibility = searchParams.getAll("eligibility");
  const selectedSources = searchParams.getAll("source");

  useEffect(() => {
    fetch("/api/opportunities/filters")
      .then((res) => res.json())
      .then((data) => {
        setFilters(data);
        setLoading(false);
      });
  }, []);

  const toggleFilter = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(type);

    if (current.includes(value)) {
      params.delete(type);
      current.filter((v) => v !== value).forEach((v) => params.append(type, v));
    } else {
      params.append(type, value);
    }

    router.push(`/opportunities?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/opportunities");
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters =
    selectedMajors.length > 0 || selectedEligibility.length > 0 || selectedSources.length > 0;

  if (loading) {
    return (
      <div className="w-64 flex-shrink-0 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-24" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      {hasActiveFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Active Filters
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-maroon-900 hover:text-maroon-700 font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedMajors.map((major) => (
              <button
                key={major}
                type="button"
                onClick={() => toggleFilter("major", major)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-maroon-100 text-maroon-900 rounded-full text-xs font-medium hover:bg-maroon-200 transition-colors"
              >
                {major}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
            {selectedEligibility.map((elig) => (
              <button
                key={elig}
                type="button"
                onClick={() => toggleFilter("eligibility", elig)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
              >
                {elig}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
            {selectedSources.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => toggleFilter("source", src)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors"
              >
                {filters?.sources?.find((s) => s.name === src)?.label ?? src}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-gray-200">
        <button
          type="button"
          onClick={() => toggleSection("majors")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-900">
            Major / Field
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.majors ? "rotate-180" : ""}`}
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
        </button>

        {expandedSections.majors && (
          <div className="px-4 pb-4 space-y-1 max-h-64 overflow-y-auto">
            {filters?.majors.map(({ name, count }) => {
              const isSelected = selectedMajors.includes(name);
              return (
                <label
                  key={name}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-maroon-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFilter("major", name)}
                    className="w-4 h-4 rounded border-gray-300 text-maroon-900 focus:ring-maroon-500"
                  />
                  <span
                    className={`flex-1 text-sm ${isSelected ? "text-maroon-900 font-medium" : "text-gray-700"}`}
                  >
                    {name}
                  </span>
                  <span
                    className={`text-xs ${isSelected ? "text-maroon-600" : "text-gray-400"}`}
                  >
                    {count}
                  </span>
                </label>
              );
            })}

            {filters?.majors.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No majors available</p>
            )}
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <button
          type="button"
          onClick={() => toggleSection("eligibility")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-900">
            Who Can Join
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.eligibility ? "rotate-180" : ""}`}
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
        </button>

        {expandedSections.eligibility && (
          <div className="px-4 pb-4 space-y-1">
            {filters?.eligibility.map(({ name, count }) => {
              const isSelected = selectedEligibility.includes(name);
              return (
                <label
                  key={name}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFilter("eligibility", name)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className={`flex-1 text-sm ${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}
                  >
                    {name}
                  </span>
                  <span
                    className={`text-xs ${isSelected ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {count}
                  </span>
                </label>
              );
            })}

            {filters?.eligibility.length === 0 && (
              <p className="text-sm text-gray-500 py-2">
                No eligibility options available
              </p>
            )}
          </div>
        )}
      </div>

      {filters?.sources && filters.sources.length > 0 && (
        <div className="border-b border-gray-200">
          <button
            type="button"
            onClick={() => toggleSection("source")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-900">
              Opportunity Source
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.source ? "rotate-180" : ""}`}
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
          </button>
          {expandedSections.source && (
            <div className="px-4 pb-4 space-y-1">
              {filters.sources.map(({ name, label, count }) => {
                const isSelected = selectedSources.includes(name);
                return (
                  <label
                    key={name}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFilter("source", name)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span
                      className={`flex-1 text-sm ${isSelected ? "text-amber-900 font-medium" : "text-gray-700"}`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-xs ${isSelected ? "text-amber-600" : "text-gray-400"}`}
                    >
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="p-4 text-center">
        <p className="text-xs text-gray-500">
          {filters?.total} total opportunities
        </p>
      </div>
    </div>
  );
}

export function ResultsHeader({
  resultCount,
  sortValue,
  onSortChange,
}: {
  resultCount: number;
  sortValue?: string;
  onSortChange?: (value: string) => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-5">
      <p className="text-base font-semibold text-gray-900">
        <strong>{resultCount} opportunities</strong>{" "}
        <span className="font-normal text-gray-600">match your filters</span>
      </p>
      {onSortChange && (
        <select
          value={sortValue ?? "recent"}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-maroon-900 focus:outline-none focus:ring-1 focus:ring-maroon-900"
        >
          <option value="relevance">Sort by: Relevance</option>
          <option value="recent">Sort by: Recently Posted</option>
          <option value="alphabetical">Sort by: Alphabetical</option>
        </select>
      )}
    </div>
  );
}
