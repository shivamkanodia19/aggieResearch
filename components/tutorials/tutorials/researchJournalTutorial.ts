import type { DriveStep } from "driver.js";
import { createStep } from "../config";

export const researchJournalTutorial: DriveStep[] = [
  createStep("[data-tutorial='current-week-entry']", {
    title: "This Week",
    description: "Log your research progress for the current week here.",
    side: "bottom",
  }),
  createStep("[data-tutorial='auto-save-indicator']", {
    title: "Auto-Save",
    description: "Your changes are automatically saved as you type.",
    side: "left",
  }),
  createStep("[data-tutorial='stats-overview']", {
    title: "Weekly Stats",
    description: "Track your hours worked and accomplishments at a glance.",
    side: "bottom",
  }),
  createStep("[data-tutorial='previous-weeks']", {
    title: "Previous Weeks",
    description: "View and reference your past weekly entries in read-only mode.",
    side: "bottom",
  }),
  createStep("[data-tutorial='export-options']", {
    title: "Export & Share",
    description:
      "Export your journal as a PDF or use email templates to update your PI.",
    side: "left",
  }),
];
