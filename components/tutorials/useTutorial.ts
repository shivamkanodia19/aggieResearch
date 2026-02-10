"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { driverConfig } from "./config";
import { pipelineTutorial } from "./tutorials/pipelineTutorial";
import { applicationDetailTutorial } from "./tutorials/applicationDetailTutorial";
import { researchJournalTutorial } from "./tutorials/researchJournalTutorial";

export type TutorialType = "pipeline" | "application-detail" | "research-journal";

export function useTutorial() {
  const startTutorial = useCallback((type: TutorialType) => {
    let steps;
    switch (type) {
      case "pipeline":
        steps = pipelineTutorial;
        break;
      case "application-detail":
        steps = applicationDetailTutorial;
        break;
      case "research-journal":
        steps = researchJournalTutorial;
        break;
      default:
        console.error(`Unknown tutorial type: ${type}`);
        return;
    }

    const driverObj = driver({
      ...driverConfig,
      steps,
      onDestroyStarted: () => {
        driverObj.destroy();
      },
    });

    driverObj.drive();
  }, []);

  return { startTutorial };
}
