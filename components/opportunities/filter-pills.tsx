"use client";

import { useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FilterPillOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterPillsProps {
  options: FilterPillOption[];
  selected: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function FilterPills({ options, selected, onSelect, className }: FilterPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selected]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
        "scroll-smooth snap-x snap-mandatory",
        className
      )}
      role="tablist"
      aria-label="Filter by department"
    >
      {options.map(({ id, label, icon: Icon }) => {
        const isActive = selected === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-active={isActive ? "true" : undefined}
            onClick={() => onSelect(id)}
            className={cn(
              "flex items-center gap-2 shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-900 focus-visible:ring-offset-2",
              isActive
                ? "bg-maroon-900 border-maroon-900 text-white hover:bg-maroon-700"
                : "border-gray-200 bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {Icon ? <Icon className="h-4 w-4" aria-hidden /> : <Globe className="h-4 w-4" aria-hidden />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
