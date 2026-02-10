"use client";

import { Lightbulb } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTutorial, type TutorialType } from "./useTutorial";

const TUTORIAL_ROUTES: Record<string, TutorialType> = {
  "/applications": "pipeline",
};

function getTutorialForPath(pathname: string): TutorialType | null {
  if (TUTORIAL_ROUTES[pathname]) return TUTORIAL_ROUTES[pathname];
  // Research journal tutorial: position detail page (has form, previous weeks, export link)
  if (/^\/research\/[^/]+$/.test(pathname)) return "research-journal";
  return null;
}

export function TutorialButton() {
  const pathname = usePathname();
  const { startTutorial } = useTutorial();

  const tutorialType = getTutorialForPath(pathname);

  if (!tutorialType) return null;

  return (
    <button
      type="button"
      onClick={() => startTutorial(tutorialType)}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-maroon-900 dark:hover:text-maroon-100"
      aria-label="Start tutorial"
    >
      <Lightbulb className="h-4 w-4" />
      <span className="hidden sm:inline">Tutorial</span>
    </button>
  );
}
