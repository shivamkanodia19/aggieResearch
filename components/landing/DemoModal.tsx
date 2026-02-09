"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-modal-title"
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 id="demo-modal-title" className="text-lg font-semibold text-gray-900">
                See it in action
              </h2>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video bg-gray-100 p-8">
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#500000]/10">
                  <svg
                    className="h-8 w-8 text-[#500000]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="10,8 16,12 10,16" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">Screen recording demo</p>
                <p className="mt-1 text-xs text-gray-500">Coming soon — try the app instead.</p>
                <a
                  href="/opportunities"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#500000] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6B1D1D]"
                >
                  Browse opportunities
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
