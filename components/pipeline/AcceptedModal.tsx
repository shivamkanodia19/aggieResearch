"use client";

interface Props {
  onClose: () => void;
  onJustMark: () => void;
  onStartTracking: () => void;
}

/**
 * Modal shown when user selects "Accepted" from the status dropdown.
 * Offers "Just Mark Accepted" or "Start Tracking →".
 */
export function AcceptedModal({ onClose, onJustMark, onStartTracking }: Props) {
  return (
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
            onClick={onJustMark}
            className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            Just Mark Accepted
          </button>
          <button
            type="button"
            onClick={onStartTracking}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Start Tracking →
          </button>
        </div>
      </div>
    </div>
  );
}
