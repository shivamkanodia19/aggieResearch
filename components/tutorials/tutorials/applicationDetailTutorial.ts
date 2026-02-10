import type { DriveStep } from "driver.js";
import { createStep } from "../config";

export const applicationDetailTutorial: DriveStep[] = [
  createStep("[data-tutorial='stage-selector']", {
    title: "Current Stage",
    description:
      "Click a stage bubble to move this application to a different stage.",
    side: "bottom",
  }),
  createStep("[data-tutorial='application-notes']", {
    title: "Personal Notes",
    description:
      "Add notes to remember key details about this position or your conversations with the PI.",
    side: "right",
  }),
  createStep("[data-tutorial='contact-section']", {
    title: "Contact PI",
    description: "Copy the PI email or open your mail client to send a message.",
    side: "right",
  }),
  createStep("[data-tutorial='stage-transition']", {
    title: "Quick Actions",
    description:
      "Move to Accepted, Rejected, or Withdrawn with inline confirmations.",
    side: "top",
  }),
];
