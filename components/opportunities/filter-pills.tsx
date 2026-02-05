"use client";

import { useRef, useEffect } from "react";
import { RESEARCH_FIELDS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export interface FilterPillsProps {
  selected: string;
  onSelect: (fieldId: string) => void;
  className?: string;
}

export function FilterPills({ selected, onSelect, className }: FilterPillsProps) {
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
      aria-label="Filter by research field"
    >
      {RESEARCH_FIELDS.map(({ id, label, icon: Icon }) => {
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
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamu-maroon focus-visible:ring-offset-2",
              isActive
                ? "bg-[#500000] border-[#500000] text-white hover:bg-[var(--maroon-light,#7b0000)]"
                : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
