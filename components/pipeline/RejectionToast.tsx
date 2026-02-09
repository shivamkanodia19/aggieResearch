"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target } from "lucide-react";
import { ApplicationStage } from "@/lib/types/database";

const TOAST_DURATION_MS = 5000;

interface RejectionToastProps {
  /** When set, toast is visible. applicationId + previousStage used for undo. */
  rejection: { applicationId: string; previousStage: ApplicationStage } | null;
  onUndo: (applicationId: string, previousStage: ApplicationStage) => void;
  onDismiss: () => void;
}

export function RejectionToast({
  rejection,
  onUndo,
  onDismiss,
}: RejectionToastProps) {
  useEffect(() => {
    if (!rejection) return;
    const t = setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [rejection, onDismiss]);

  return (
    <AnimatePresence>
      {rejection && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-4 right-4 z-[200] flex max-w-sm items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 shadow-lg backdrop-blur-sm"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Target className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Marked as rejected. Keep applying! 🎯
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onUndo(rejection.applicationId, rejection.previousStage);
                  onDismiss();
                }}
                className="rounded-lg bg-amber-200/80 px-3 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-300/90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-amber-100/80 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
