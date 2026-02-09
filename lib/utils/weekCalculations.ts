/**
 * Week calculation utilities for research journal
 * Ensures consistent week boundaries (Sunday-Saturday) regardless of timezone
 */

import { startOfWeek, endOfWeek, format } from "date-fns";

/**
 * Get the week start date (Sunday at midnight UTC) for a given date
 * This ensures consistent week boundaries regardless of timezone
 * 
 * The key insight: We want the calendar date (year-month-day) of Sunday
 * to be preserved, but stored as UTC midnight. This ensures that
 * regardless of the user's timezone, Feb 9, 2026 always maps to the same week.
 */
export function getWeekStart(date: Date = new Date()): Date {
  // Get Sunday at midnight in local time
  const localWeekStart = startOfWeek(date, { weekStartsOn: 0 });
  
  // Extract the calendar date components (year, month, day)
  // These represent the calendar date in the user's local timezone
  const year = localWeekStart.getFullYear();
  const month = localWeekStart.getMonth();
  const day = localWeekStart.getDate();
  
  // Create a UTC date with the same calendar date at midnight UTC
  // This ensures Feb 9, 2026 in any timezone becomes Feb 9, 2026 00:00:00 UTC
  const utcWeekStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  
  return utcWeekStart;
}

/**
 * Get the week end date (Saturday at 23:59:59 UTC) for a given date
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  // Add 6 days to get Saturday, then set to end of day
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Format week header string: "Week of Feb 9-15, 2026"
 */
export function formatWeekHeader(date: Date = new Date()): string {
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(date);
  
  const startFormatted = format(weekStart, "MMM d");
  const endFormatted = format(weekEnd, "d, yyyy");
  
  return `Week of ${startFormatted}-${endFormatted}`;
}

/**
 * Check if a date falls within the current week
 */
export function isCurrentWeek(date: Date): boolean {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  
  const checkDate = getWeekStart(date); // Normalize the date to week start
  
  return checkDate.getTime() === weekStart.getTime();
}

/**
 * Normalize a date string from the database to get its week start
 * 
 * When reading from the database, dates are stored as UTC ISO strings.
 * We need to extract the UTC calendar date and find its Sunday.
 * 
 * Important: We interpret the UTC date as a calendar date, then find
 * which Sunday that calendar date falls on in UTC.
 */
export function normalizeWeekStart(dateString: string): Date {
  const date = new Date(dateString);
  
  // Extract UTC components to get the calendar date in UTC
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Create a UTC date at midnight for this calendar date
  const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  
  // Find which day of the week this UTC date falls on (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = utcDate.getUTCDay();
  
  // Calculate days to subtract to get to Sunday (0)
  const daysToSubtract = dayOfWeek;
  
  // Create Sunday at midnight UTC
  const sundayUTC = new Date(utcDate);
  sundayUTC.setUTCDate(sundayUTC.getUTCDate() - daysToSubtract);
  
  return sundayUTC;
}

/**
 * Compare two week start dates for equality
 * Handles timezone normalization
 */
export function isSameWeek(date1: Date | string, date2: Date | string): boolean {
  const week1 = typeof date1 === "string" ? normalizeWeekStart(date1) : getWeekStart(date1);
  const week2 = typeof date2 === "string" ? normalizeWeekStart(date2) : getWeekStart(date2);
  
  return week1.getTime() === week2.getTime();
}
