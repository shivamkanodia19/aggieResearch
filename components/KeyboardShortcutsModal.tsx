"use client";

import { useEffect, useRef } from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "General",
    shortcuts: [
      { keys: ["?"], description: "Toggle this help modal" },
      { keys: ["/"], description: "Focus search bar" },
      { keys: ["Esc"], description: "Close modal / blur input" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["g", "f"], description: "Go to Find Research" },
      { keys: ["g", "a"], description: "Go to My Applications" },
      { keys: ["g", "r"], description: "Go to My Research" },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", handleEsc, { capture: true });
    return () => window.removeEventListener("keydown", handleEsc, { capture: true });
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-modal-enter">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <Keyboard className="h-4.5 w-4.5 text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
        </div>

        <div className="space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          {i > 0 && (
                            <span className="mx-0.5 text-xs text-gray-300">then</span>
                          )}
                          <kbd className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 shadow-sm">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          Press <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px] font-medium">?</kbd> to toggle this modal
        </p>
      </div>
    </div>
  );
}
