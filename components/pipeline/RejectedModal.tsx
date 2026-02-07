"use client";

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export function RejectedModal({ onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="p-6 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl" aria-hidden>
              📋
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Mark as Rejected?</h2>
          <p className="text-[15px] leading-snug text-gray-600">
            This will move the opportunity to your rejected list. You can change it later if
            needed.
          </p>
        </div>
        <div className="px-6 pb-2">
          <p className="rounded-lg bg-gray-50 px-4 py-3 text-[13px] text-gray-500">
            Don’t get discouraged — most students apply to several positions before getting one.
          </p>
        </div>
        <div className="flex gap-3 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Mark Rejected
          </button>
        </div>
      </div>
    </div>
  );
}
