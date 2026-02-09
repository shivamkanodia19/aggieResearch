"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

/**
 * Reusable confirmation modal. Use instead of window.confirm for in-app,
 * styled confirmations (e.g. remove from pipeline).
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[102] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-desc"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-[480px] overflow-hidden rounded-2xl bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-6 pt-6 pb-4">
          <h2
            id="confirmation-modal-title"
            className="text-xl font-semibold text-foreground"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          <p id="confirmation-modal-desc" className="text-[15px] leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border-2 border-border bg-card py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:border-muted-foreground/30"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors",
              variant === "danger" &&
                "bg-red-600 hover:bg-red-700 hover:shadow-md hover:shadow-red-600/20",
              variant === "warning" &&
                "bg-amber-600 hover:bg-amber-700 hover:shadow-md hover:shadow-amber-600/20"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
