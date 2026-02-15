"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface KeyboardShortcutsOptions {
  onToggleHelp?: () => void;
}

/**
 * Global keyboard shortcuts for the dashboard.
 * - `?`  → Toggle keyboard shortcuts help modal
 * - `/`  → Focus the search bar (on opportunities page)
 * - `Escape` → Close any open modal/drawer, blur active input
 * - `g` then `f` → Go to Find Research
 * - `g` then `a` → Go to My Applications
 * - `g` then `r` → Go to My Research
 */
export function useKeyboardShortcuts({ onToggleHelp }: KeyboardShortcutsOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let gPending = false;
    let gTimeout: ReturnType<typeof setTimeout> | null = null;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInput = tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;

      // Escape always works — close modals, blur inputs
      if (e.key === "Escape") {
        if (isInput) {
          (target as HTMLInputElement).blur();
          return;
        }
        // Let existing modal handlers deal with Escape
        return;
      }

      // Don't fire shortcuts when typing in inputs
      if (isInput) return;

      // Don't fire when modifier keys are held (except shift for ?)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // `?` → help modal (shift + /)
      if (e.key === "?") {
        e.preventDefault();
        onToggleHelp?.();
        return;
      }

      // `/` → focus search bar
      if (e.key === "/") {
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-search-input], input[type="search"]'
        );
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // `g` sequences for navigation
      if (e.key === "g") {
        if (gPending) return; // already waiting for second key
        gPending = true;
        gTimeout = setTimeout(() => {
          gPending = false;
        }, 800);
        return;
      }

      if (gPending) {
        gPending = false;
        if (gTimeout) clearTimeout(gTimeout);

        switch (e.key) {
          case "f":
            e.preventDefault();
            if (pathname !== "/opportunities") router.push("/opportunities");
            break;
          case "a":
            e.preventDefault();
            if (pathname !== "/applications") router.push("/applications");
            break;
          case "r":
            e.preventDefault();
            if (pathname !== "/research") router.push("/research");
            break;
        }
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gTimeout) clearTimeout(gTimeout);
    };
  }, [router, pathname, onToggleHelp]);
}
