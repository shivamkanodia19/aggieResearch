"use client";

import { useState, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FilterState {
  majors: string[];
  disciplines: string[];
  whoCanJoin: string[];
  timeCommitments: string[];
}

export interface FilterMeta {
  majors: string[];
  disciplines: string[];
  whoCanJoin: string[];
  timeCommitments: string[];
}

interface FilterSidebarProps {
  filterState: FilterState;
  meta: FilterMeta;
  onFilterChange: (state: FilterState) => void;
  resultCount: number;
}

type FilterCategoryKey = "majors" | "disciplines" | "whoCanJoin" | "timeCommitments";

const CATEGORY_CONFIG: Record<
  FilterCategoryKey,
  { title: string; key: FilterCategoryKey; searchPlaceholder?: string }
> = {
  majors: {
    title: "Major / Field",
    key: "majors",
    searchPlaceholder: "Search majors...",
  },
  disciplines: {
    title: "Discipline",
    key: "disciplines",
  },
  whoCanJoin: {
    title: "Who Can Join",
    key: "whoCanJoin",
  },
  timeCommitments: {
    title: "Time Commitment",
    key: "timeCommitments",
  },
};

function FilterCategory({
  title,
  options,
  selected,
  searchPlaceholder,
  onToggle,
  defaultCollapsed = false,
}: {
  title: string;
  options: string[];
  selected: Set<string>;
  searchPlaceholder?: string;
  onToggle: (value: string) => void;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div
      className={cn(
        "border-b border-gray-200 last:border-b-0",
        collapsed && "filter-category-collapsed"
      )}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-gray-500 transition-transform", collapsed && "-rotate-90")}
        />
      </button>
      {!collapsed && (
        <div className="max-h-[300px] overflow-y-auto px-4 pb-4">
          {searchPlaceholder && (
            <div className="mb-3">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-[13px] focus:border-maroon-900 focus:outline-none focus:ring-1 focus:ring-maroon-900"
              />
            </div>
          )}
          <div className="space-y-0">
            {filteredOptions.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center py-2 pr-2 transition-colors hover:pl-1"
              >
                <input
                  type="checkbox"
                  checked={selected.has(value)}
                  onChange={() => onToggle(value)}
                  className="h-4 w-4 rounded border-gray-300 text-maroon-900 focus:ring-maroon-900"
                />
                <span className="ml-2.5 flex-1 text-[13px] text-gray-900">{value}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <p className="py-2 text-[13px] text-gray-500">No options match</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function activeFilterTags(
  state: FilterState,
  meta: FilterMeta
): { key: FilterCategoryKey; label: string; value: string }[] {
  const tags: { key: FilterCategoryKey; label: string; value: string }[] = [];
  state.majors.forEach((v) => tags.push({ key: "majors", label: "Major", value: v }));
  state.disciplines.forEach((v) =>
    tags.push({ key: "disciplines", label: "Discipline", value: v })
  );
  state.whoCanJoin.forEach((v) =>
    tags.push({ key: "whoCanJoin", label: "Who", value: v })
  );
  state.timeCommitments.forEach((v) =>
    tags.push({ key: "timeCommitments", label: "Time", value: v })
  );
  return tags;
}

export function FilterSidebar({
  filterState,
  meta,
  onFilterChange,
  resultCount,
}: FilterSidebarProps) {
  const tags = useMemo(
    () => activeFilterTags(filterState, meta),
    [filterState, meta]
  );
  const activeCount = tags.length;

  const clearAll = () => {
    onFilterChange({
      majors: [],
      disciplines: [],
      whoCanJoin: [],
      timeCommitments: [],
    });
  };

  const removeTag = (category: FilterCategoryKey, value: string) => {
    const next = { ...filterState };
    const arr = next[category].filter((v) => v !== value);
    next[category] = arr;
    onFilterChange(next);
  };

  const toggleOption = (category: FilterCategoryKey, value: string) => {
    const arr = filterState[category];
    const next = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    onFilterChange({ ...filterState, [category]: next });
  };

  return (
    <aside className="w-[280px] shrink-0">
      {/* Active filters */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Active Filters {activeCount > 0 ? `(${activeCount})` : ""}
          </h3>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] font-medium text-maroon-900 underline hover:text-maroon-700"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(({ key, value }) => (
            <span
              key={`${key}-${value}`}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gray-100 px-2.5 py-1.5 text-[13px]"
            >
              {value}
              <button
                type="button"
                onClick={() => removeTag(key, value)}
                className="flex h-4 w-4 items-center justify-center rounded text-gray-500 hover:text-gray-900"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {activeCount === 0 && (
            <span className="text-[13px] text-gray-500">No filters applied</span>
          )}
        </div>
      </div>

      {/* Filter sections */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <FilterCategory
          title={CATEGORY_CONFIG.majors.title}
          options={meta.majors}
          selected={new Set(filterState.majors)}
          searchPlaceholder={CATEGORY_CONFIG.majors.searchPlaceholder}
          onToggle={(v) => toggleOption("majors", v)}
        />
        <FilterCategory
          title={CATEGORY_CONFIG.disciplines.title}
          options={meta.disciplines}
          selected={new Set(filterState.disciplines)}
          onToggle={(v) => toggleOption("disciplines", v)}
        />
        <FilterCategory
          title={CATEGORY_CONFIG.whoCanJoin.title}
          options={meta.whoCanJoin}
          selected={new Set(filterState.whoCanJoin)}
          onToggle={(v) => toggleOption("whoCanJoin", v)}
          defaultCollapsed
        />
        <FilterCategory
          title={CATEGORY_CONFIG.timeCommitments.title}
          options={meta.timeCommitments}
          selected={new Set(filterState.timeCommitments)}
          onToggle={(v) => toggleOption("timeCommitments", v)}
          defaultCollapsed
        />
      </div>
    </aside>
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
          value={sortValue ?? "relevance"}
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
