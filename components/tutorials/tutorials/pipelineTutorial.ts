import type { DriveStep } from "driver.js";
import { createStep } from "../config";

export const pipelineTutorial: DriveStep[] = [
  createStep("[data-tutorial='pipeline-stages']", {
    title: "Pipeline Stages",
    description:
      "Track your applications across four stages: Saved, Contacted, Responded, and Interview.",
    side: "bottom",
  }),
  createStep("[data-tutorial='pipeline-drag-drop']", {
    title: "Move Applications",
    description:
      "Drag opportunities between stages to update your application progress.",
    side: "right",
  }),
  createStep("[data-tutorial='outcomes-section']", {
    title: "Application Outcomes",
    description:
      "Mark applications as Accepted, Rejected, or Withdrawn when you receive final decisions.",
    side: "top",
  }),
  createStep("[data-tutorial='add-opportunity-btn']", {
    title: "Add Manually",
    description:
      "Add opportunities you found outside the platform to keep everything in one place.",
    side: "left",
  }),
];
