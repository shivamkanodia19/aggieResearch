"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface Props {
  opportunityId: string;
  opportunityTitle?: string;
  piName?: string | null;
  onClose: () => void;
}

/** Shown when user drags a card to Accepted column or clicks "Add to My Research". */
export function AcceptedPrompt({
  opportunityId,
  onClose,
}: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJustMark = () => {
    setError(null);
    onClose();
  };

  const handleStartTracking = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const id = (data as { id?: string }).id;
        if (id) {
          onClose();
          router.push(`/research/${id}`);
          router.refresh();
          return;
        }
        setError("Something went wrong. Try again.");
        return;
      }
      if (res.status === 401) {
        setError("Please sign in again.");
        return;
      }
      if (res.status === 409) {
        setError("Already in My Research.");
        return;
      }
      setError((data as { error?: string }).error ?? "Something went wrong. Try again.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setCreating(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="p-6 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl" aria-hidden>
              🎉
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Congratulations!</h2>
          <p className="text-[15px] leading-snug text-gray-600">
            You&apos;re marking this position as accepted.
          </p>
        </div>
        <div className="px-6 pb-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-1 text-sm font-semibold text-gray-900">
              Start tracking your research?
            </h4>
            <p className="text-[13px] text-gray-600">
              Log weekly progress, accomplishments, and generate reports for your
              PI.
            </p>
          </div>
        </div>
        {error && (
          <p className="px-6 pb-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3 p-4 pt-0">
          <button
            type="button"
            onClick={handleJustMark}
            className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            Just Mark Accepted
          </button>
          <button
            type="button"
            onClick={handleStartTracking}
            disabled={creating}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {creating ? "Setting up…" : "Start Tracking →"}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined" || !mounted) return null;
  return createPortal(modal, document.body);
}
