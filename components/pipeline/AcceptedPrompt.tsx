"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

interface Props {
  opportunityId: string;
  opportunityTitle: string;
  piName: string | null;
  onClose: () => void;
  onSkip: () => void;
}

export function AcceptedPrompt({
  opportunityId,
  opportunityTitle,
  piName,
  onClose,
  onSkip,
}: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

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
        router.push(`/research/${position.id}`);
        router.refresh();
      } else {
        const error = await res.json();
        console.error("Failed to create position:", error);
      }
    } catch (error) {
      console.error("Failed to create position:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-xl bg-white">
        <div className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Congratulations! 🎉
          </h2>
          <p className="mb-6 text-gray-600">
            You accepted a position{piName ? ` with ${piName}` : ""}
          </p>

          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
            <p className="text-sm font-medium text-gray-700">
              <strong>Start tracking your research progress?</strong>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Log weekly accomplishments, learnings, and blockers. Generate PDF
              reports and email updates for your PI.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartTracking}
              disabled={creating}
              className="w-full rounded-lg bg-[#500000] py-3 font-medium text-white transition-colors hover:bg-[#6B1D1D] disabled:opacity-50"
            >
              {creating ? "Setting up..." : "Start Tracking"}
            </button>
            <button
              onClick={onSkip}
              className="w-full py-3 text-gray-600 hover:text-gray-900"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
