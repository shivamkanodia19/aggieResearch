"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const DARK_MODE_KEY = "darkMode";
const PIN_MAJOR_FILTER_KEY = "pref_pinMajorFilter";
const AUTO_SAVE_JOURNAL_KEY = "pref_autoSaveJournal";
const SHOW_MATCH_SCORES_KEY = "pref_showMatchScores";
const SHOW_ENCOURAGEMENT_KEY = "pref_showEncouragementMessages";

function getStoredDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DARK_MODE_KEY) === "true";
}

function getStoredBoolean(key: string, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  return stored === "true";
}

function applyDarkMode(isDark: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function AppearanceCard() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pinMajorFilter, setPinMajorFilter] = useState(true);
  const [autoSaveJournal, setAutoSaveJournal] = useState(true);
  const [showMatchScores, setShowMatchScores] = useState(true);
  const [showEncouragement, setShowEncouragement] = useState(true);

  useEffect(() => {
    const stored = getStoredDarkMode();
    setDarkMode(stored);
    applyDarkMode(stored);
    setPinMajorFilter(getStoredBoolean(PIN_MAJOR_FILTER_KEY, true));
    setAutoSaveJournal(getStoredBoolean(AUTO_SAVE_JOURNAL_KEY, true));
    setShowMatchScores(getStoredBoolean(SHOW_MATCH_SCORES_KEY, true));
    setShowEncouragement(getStoredBoolean(SHOW_ENCOURAGEMENT_KEY, true));
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem(DARK_MODE_KEY, String(next));
    applyDarkMode(next);
  };

  if (!mounted) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="h-5 w-5 text-maroon-700" />
            Preferences
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <SlidersHorizontal className="h-5 w-5 text-maroon-700" />
          Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fine-tune how Aggie Research behaves for you
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <div className="font-medium text-foreground">Dark mode</div>
            <div className="text-sm text-muted-foreground">
              Use a dark theme across the application.
            </div>
          </div>
          <label
            className={cn(
              "relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
              darkMode ? "bg-maroon-900" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              className="sr-only"
            />
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                darkMode && "translate-x-5"
              )}
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <div className="font-medium text-foreground">
              Pin major filter on opportunities page
            </div>
            <div className="text-sm text-muted-foreground">
              Keep your major filter visible so you see the most relevant roles.
            </div>
          </div>
          <label
            className={cn(
              "relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
              pinMajorFilter ? "bg-maroon-900" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <input
              type="checkbox"
              checked={pinMajorFilter}
              onChange={() => {
                const next = !pinMajorFilter;
                setPinMajorFilter(next);
                localStorage.setItem(PIN_MAJOR_FILTER_KEY, String(next));
              }}
              className="sr-only"
            />
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                pinMajorFilter && "translate-x-5"
              )}
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <div className="font-medium text-foreground">
              Auto-save journal entries
            </div>
            <div className="text-sm text-muted-foreground">
              Automatically save your research logs as you type (recommended).
            </div>
          </div>
          <label
            className={cn(
              "relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
              autoSaveJournal ? "bg-maroon-900" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <input
              type="checkbox"
              checked={autoSaveJournal}
              onChange={() => {
                const next = !autoSaveJournal;
                setAutoSaveJournal(next);
                localStorage.setItem(AUTO_SAVE_JOURNAL_KEY, String(next));
              }}
              className="sr-only"
            />
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                autoSaveJournal && "translate-x-5"
              )}
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <div className="font-medium text-foreground">
              Show AI match scores
            </div>
            <div className="text-sm text-muted-foreground">
              Display match scores on opportunity cards when available.
            </div>
          </div>
          <label
            className={cn(
              "relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
              showMatchScores ? "bg-maroon-900" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <input
              type="checkbox"
              checked={showMatchScores}
              onChange={() => {
                const next = !showMatchScores;
                setShowMatchScores(next);
                localStorage.setItem(SHOW_MATCH_SCORES_KEY, String(next));
              }}
              className="sr-only"
            />
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                showMatchScores && "translate-x-5"
              )}
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <div className="font-medium text-foreground">
              Show encouragement messages
            </div>
            <div className="text-sm text-muted-foreground">
              See gentle nudges and encouragement as you make progress.
            </div>
          </div>
          <label
            className={cn(
              "relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
              showEncouragement ? "bg-maroon-900" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <input
              type="checkbox"
              checked={showEncouragement}
              onChange={() => {
                const next = !showEncouragement;
                setShowEncouragement(next);
                localStorage.setItem(SHOW_ENCOURAGEMENT_KEY, String(next));
              }}
              className="sr-only"
            />
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                showEncouragement && "translate-x-5"
              )}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
