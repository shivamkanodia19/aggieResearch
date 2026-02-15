"use client";

import { useState, useCallback } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";

export function KeyboardShortcutsProvider() {
  const [helpOpen, setHelpOpen] = useState(false);

  const toggleHelp = useCallback(() => {
    setHelpOpen((prev) => !prev);
  }, []);

  useKeyboardShortcuts({ onToggleHelp: toggleHelp });

  return (
    <KeyboardShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} />
  );
}
