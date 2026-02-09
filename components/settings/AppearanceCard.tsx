"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const DARK_MODE_KEY = "darkMode";

function getStoredDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DARK_MODE_KEY) === "true";
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

  useEffect(() => {
    const stored = getStoredDarkMode();
    setDarkMode(stored);
    applyDarkMode(stored);
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
            <Palette className="h-5 w-5 text-maroon-700" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5 text-maroon-700" />
          Appearance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize how the app looks
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <div className="font-medium text-foreground">Dark mode</div>
            <div className="text-sm text-muted-foreground">
              Use dark theme across the application
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
      </CardContent>
    </Card>
  );
}
