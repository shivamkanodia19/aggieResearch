import type { Config, DriveStep } from "driver.js";

export const driverConfig: Partial<Config> = {
  showProgress: true,
  progressText: "Step {{current}} of {{total}}",
  animate: true,
  smoothScroll: true,
  overlayColor: "rgb(0, 0, 0)",
  overlayOpacity: 0.75,
  showButtons: ["next", "previous", "close"],
  nextBtnText: "Next",
  prevBtnText: "Previous",
  doneBtnText: "Done",
  allowClose: true,
  disableActiveInteraction: false,
  allowKeyboardControl: true,
  popoverClass: "tutorial-popover",
  popoverOffset: 10,
};

export type CreateStepPopover = {
  title?: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
};

export function createStep(
  element: string,
  popover: CreateStepPopover
): DriveStep {
  return {
    element,
    popover: {
      ...popover,
      side: popover.side ?? "bottom",
    },
  };
}
