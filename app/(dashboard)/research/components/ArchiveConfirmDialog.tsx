"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  positionId: string;
  positionTitle: string;
}

export function ArchiveConfirmDialog({
  open,
  onClose,
  positionId,
  positionTitle,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleArchive = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/research/${positionId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        onClose();
        router.refresh();
        window.location.reload();
      } else {
        const data = await response.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Failed to archive position");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Archive Research Position?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This will move &ldquo;{positionTitle}&rdquo; to your archived
            projects. All logs will be preserved and you can unarchive it later
            if needed.
          </p>
        </div>

        {error && (
          <p className="px-6 pb-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#500000] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6B1D1D] disabled:opacity-50"
          >
            {loading ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
