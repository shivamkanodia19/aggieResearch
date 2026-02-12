"use client";

import { useState } from "react";
import { subWeeks, format } from "date-fns";
import { X, Download, Loader2, AlertCircle } from "lucide-react";

interface Props {
  positionId: string;
  positionTitle: string;
  onClose: () => void;
}

export function ExportModal({ positionId, positionTitle, onClose }: Props) {
  const [dateRange, setDateRange] = useState("all");
  const [includeDetails, setIncludeDetails] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "1week":
        startDate = subWeeks(endDate, 1);
        break;
      case "4weeks":
        startDate = subWeeks(endDate, 4);
        break;
      case "8weeks":
        startDate = subWeeks(endDate, 8);
        break;
      case "all":
        startDate = new Date("2020-01-01");
        break;
      default:
        startDate = subWeeks(endDate, 4);
    }

    return { startDate, endDate };
  };

  const handleExport = async () => {
    setGenerating(true);
    setError(null);
    const { startDate, endDate } = getDateRange();

    try {
      const res = await fetch("/api/research/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          includeDetails,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Export failed (${res.status})`);
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("Generated PDF was empty — try a different date range");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${positionTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      onClose();
    } catch (err) {
      console.error("Export failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Export Progress Report
            </h2>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
              {positionTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Date range picker */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-900">
              Time range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "1week", label: "Last week" },
                { value: "4weeks", label: "Last 4 weeks" },
                { value: "8weeks", label: "Last 8 weeks" },
                { value: "all", label: "All time" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDateRange(option.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    dateRange === option.value
                      ? "bg-[#500000] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Include details checkbox */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={includeDetails}
              onChange={(e) => setIncludeDetails(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#500000] focus:ring-[#500000]"
            />
            <span className="text-sm text-gray-700">
              Include detailed weekly breakdown
            </span>
          </label>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-[#500000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B1D1D] disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
