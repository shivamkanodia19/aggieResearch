"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekStart, formatUTC } from "@/lib/utils/weekCalculations";

interface Props {
  /** Called with the Sunday of the selected week */
  onSelectDate: (date: Date) => void;
  /** Sundays that already have a log (ISO strings) — shown as dots */
  existingWeekStarts?: Set<string>;
  /** The latest selectable date (exclusive). Defaults to start of current week. */
  maxDate?: Date;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function MiniCalendar({ onSelectDate, existingWeekStarts, maxDate }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // The boundary: can't select dates in the current week or future
  const cutoff = maxDate ?? getWeekStart(today);

  const days = useMemo(() => {
    // First day of the month
    const first = new Date(viewYear, viewMonth, 1);
    const startPad = first.getDay(); // 0 = Sunday
    // Last day of the month
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: Array<{ day: number; date: Date; disabled: boolean; hasLog: boolean } | null> = [];

    // Pad leading blanks
    for (let i = 0; i < startPad; i++) cells.push(null);

    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const ws = getWeekStart(date);
      const disabled = ws.getTime() >= cutoff.getTime();
      const hasLog = existingWeekStarts?.has(ws.toISOString()) ?? false;
      cells.push({ day: d, date, disabled, hasLog });
    }

    return cells;
  }, [viewYear, viewMonth, cutoff, existingWeekStarts]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    // Don't go past current month
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const canGoNext = (() => {
    const now = new Date();
    return viewYear < now.getFullYear() || (viewYear === now.getFullYear() && viewMonth < now.getMonth());
  })();

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  const monthLabel = `${formatUTC(new Date(Date.UTC(viewYear, viewMonth, 1)), "MMM d, yyyy").split(" ")[0]} ${viewYear}`;

  return (
    <div className="w-[280px]">
      {/* Header: < Month Year > */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          disabled={!canGoNext}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0">
        {DAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-xs font-medium text-gray-400">
            {label}
          </div>
        ))}

        {/* Day cells */}
        {days.map((cell, i) => {
          if (!cell) {
            return <div key={`blank-${i}`} />;
          }

          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === cell.date.getFullYear() &&
            selectedDate.getMonth() === cell.date.getMonth() &&
            selectedDate.getDate() === cell.date.getDate();

          const isToday =
            cell.date.getFullYear() === today.getFullYear() &&
            cell.date.getMonth() === today.getMonth() &&
            cell.date.getDate() === today.getDate();

          return (
            <button
              key={cell.day}
              type="button"
              disabled={cell.disabled}
              onClick={() => handleDayClick(cell.date)}
              className={`
                relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors
                ${cell.disabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer hover:bg-[#500000]/10 text-gray-700"}
                ${isSelected ? "bg-[#500000] text-white hover:bg-[#500000]" : ""}
                ${isToday && !isSelected ? "font-bold ring-1 ring-[#500000]/40" : ""}
              `}
            >
              {cell.day}
              {/* Dot indicator for existing logs */}
              {cell.hasLog && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#500000]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
