/**
 * Week calculation utilities for research journal
 * All weeks run Sunday 00:00 UTC → Saturday 23:59:59 UTC.
 *
 * IMPORTANT: dates are stored in the DB as UTC ISO strings.  date-fns `format()`
 * interprets dates in the *local* timezone, which can shift the displayed day
 * (e.g. 2026-02-08T00:00:00Z in CST would show as Feb 7).  To avoid this we
 * use a small `formatUTC` helper that always reads the UTC components.
 */

import { startOfWeek } from "date-fns";

/* ------------------------------------------------------------------ */
/*  UTC-safe formatting helpers                                       */
/* ------------------------------------------------------------------ */

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format a Date using its UTC components so timezone never shifts the day. */
export function formatUTC(date: Date, pattern: "MMM d" | "MMM d, yyyy" | "d, yyyy" | "d" | "MMM yyyy"): string {
  const m = MONTH_ABBR[date.getUTCMonth()];
  const d = date.getUTCDate();
  const y = date.getUTCFullYear();

  switch (pattern) {
    case "MMM d":
      return `${m} ${d}`;
    case "MMM d, yyyy":
      return `${m} ${d}, ${y}`;
    case "d, yyyy":
      return `${d}, ${y}`;
    case "d":
      return `${d}`;
    case "MMM yyyy":
      return `${m} ${y}`;
    default:
      return `${m} ${d}, ${y}`;
  }
}

/* ------------------------------------------------------------------ */
/*  Core week boundary functions                                      */
/* ------------------------------------------------------------------ */

/**
 * Get the week start date (Sunday at midnight UTC) for a given date.
 *
 * Uses the *local* calendar day to find Sunday (so the user's "today" is
 * respected), then stores the result as UTC midnight.
 */
export function getWeekStart(date: Date = new Date()): Date {
  // Get Sunday at midnight in local time
  const localWeekStart = startOfWeek(date, { weekStartsOn: 0 });

  // Preserve the local calendar date as UTC midnight
  const year = localWeekStart.getFullYear();
  const month = localWeekStart.getMonth();
  const day = localWeekStart.getDate();

  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Get the week end date (Saturday at 23:59:59.999 UTC) for a given date.
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  return weekEnd;
}

/* ------------------------------------------------------------------ */
/*  Display helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Format week header: "Week of Feb 9–15, 2026"
 * Handles cross-month ("Jan 26 – Feb 1, 2026") and cross-year boundaries.
 */
export function formatWeekHeader(date: Date = new Date()): string {
  const ws = getWeekStart(date);
  const we = getWeekEnd(date);

  if (ws.getUTCFullYear() !== we.getUTCFullYear()) {
    return `Week of ${formatUTC(ws, "MMM d, yyyy")} – ${formatUTC(we, "MMM d, yyyy")}`;
  }
  if (ws.getUTCMonth() !== we.getUTCMonth()) {
    return `Week of ${formatUTC(ws, "MMM d")} – ${formatUTC(we, "MMM d, yyyy")}`;
  }
  return `Week of ${formatUTC(ws, "MMM d")}–${formatUTC(we, "d, yyyy")}`;
}

/**
 * Format a week range from an arbitrary weekStart date.
 * Useful in previous-week lists where we already have the week_start from DB.
 */
export function formatWeekRange(weekStartDate: Date): string {
  const ws = weekStartDate;
  const we = new Date(ws);
  we.setUTCDate(we.getUTCDate() + 6);

  if (ws.getUTCFullYear() !== we.getUTCFullYear()) {
    return `Week of ${formatUTC(ws, "MMM d, yyyy")} – ${formatUTC(we, "MMM d, yyyy")}`;
  }
  if (ws.getUTCMonth() !== we.getUTCMonth()) {
    return `Week of ${formatUTC(ws, "MMM d")} – ${formatUTC(we, "MMM d, yyyy")}`;
  }
  return `Week of ${formatUTC(ws, "MMM d")}–${formatUTC(we, "d, yyyy")}`;
}

/* ------------------------------------------------------------------ */
/*  Comparison / normalization                                         */
/* ------------------------------------------------------------------ */

/** Check if a date falls within the current week. */
export function isCurrentWeek(date: Date): boolean {
  const weekStart = getWeekStart(new Date());
  const checkDate = getWeekStart(date);
  return checkDate.getTime() === weekStart.getTime();
}

/**
 * Normalize a DB date string to its Sunday-at-midnight-UTC week start.
 *
 * Reads the *UTC* calendar date from the ISO string, then finds which
 * Sunday that falls on (in UTC).
 */
export function normalizeWeekStart(dateString: string): Date {
  const date = new Date(dateString);

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const dayOfWeek = utcDate.getUTCDay(); // 0 = Sunday

  const sundayUTC = new Date(utcDate);
  sundayUTC.setUTCDate(sundayUTC.getUTCDate() - dayOfWeek);
  return sundayUTC;
}

/**
 * Compare two week-start dates for equality.
 * Accepts Date objects (local) or ISO strings (UTC from DB).
 */
export function isSameWeek(date1: Date | string, date2: Date | string): boolean {
  const week1 = typeof date1 === "string" ? normalizeWeekStart(date1) : getWeekStart(date1);
  const week2 = typeof date2 === "string" ? normalizeWeekStart(date2) : getWeekStart(date2);
  return week1.getTime() === week2.getTime();
}

/**
 * Compute the week number relative to a position's start date.
 */
export function computeWeekNumber(weekStart: Date, positionStartDate: string): number {
  const start = normalizeWeekStart(positionStartDate);
  const diff = weekStart.getTime() - start.getTime();
  const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, weeks + 1);
}
