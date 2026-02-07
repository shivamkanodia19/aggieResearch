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

/** Shown when user drags a card to Accepted column (stage already updated). */
export function AcceptedPrompt({
  opportunityId,
  onClose,
}: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleJustMark = () => onClose();

  const handleStartTracking = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      if (res.ok) {
        const position = await res.json();
        onClose();
        router.push(`/research/${position.id}`);
        router.refresh();
      } else {
        const err = await res.json();
        console.error("Failed to create position:", err);
      }
    } catch (err) {
      console.error("Failed to create position:", err);
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
