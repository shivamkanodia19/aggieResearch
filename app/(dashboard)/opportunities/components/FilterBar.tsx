"use client";

import { useEffect, useState } from "react";

const MAJORS = [
  "All Majors",
  "Agriculture",
  "Biology",
  "Biomedical Sciences",
  "Chemistry",
  "Computer Science",
  "Economics",
  "Engineering",
  "Environmental Science",
  "Health Sciences",
  "Mathematics",
  "Neuroscience",
  "Physics",
  "Psychology",
];

interface Props {
  selected: string;
  onChange: (major: string) => void;
  autoApply?: boolean;
}

export function FilterBar({ selected, onChange, autoApply = false }: Props) {
  const [userMajor, setUserMajor] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    // Fetch user's major from profile
    fetch("/api/user/onboarding")
      .then((res) => res.json())
      .then((data) => {
        if (data.major) {
          setUserMajor(data.major);
          // Auto-apply if autoApply is true and no filter is currently set
          if (autoApply && !selected && data.major) {
            onChange(data.major);
            setIsPinned(true);
          } else if (selected === data.major) {
            setIsPinned(true);
          }
        }
      })
      .catch(() => {
        // Silently fail if user not logged in
      });
  }, [selected, onChange, autoApply]);

  const handleSelect = (major: string) => {
    if (major === "All Majors") {
      onChange("");
      setIsPinned(false);
    } else {
      onChange(major);
      setIsPinned(major === userMajor);
    }
  };

  const clearFilter = () => {
    onChange("");
    setIsPinned(false);
  };

  return (
    <div>
      {/* Active filter indicator */}
      {selected && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">
            Showing: <strong>{selected}</strong>
            {isPinned && (
              <span className="ml-2 text-xs text-[#500000]">(your major)</span>
            )}
          </span>
          <button
            onClick={clearFilter}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Scrollable filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {MAJORS.map((major) => {
          const isSelected =
            major === "All Majors" ? !selected : selected === major;
          const isUserMajor = major === userMajor;

          return (
            <button
              key={major}
              onClick={() => handleSelect(major)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                isSelected
                  ? "bg-[#500000] text-white"
                  : isUserMajor
                    ? "bg-[#500000]/10 text-[#500000] border border-[#500000]/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isUserMajor && !isSelected && (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
              {major}
            </button>
          );
        })}
      </div>
    </div>
  );
}
