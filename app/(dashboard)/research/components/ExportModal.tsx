"use client";

import { useState } from "react";
import { subWeeks, format } from "date-fns";

interface Props {
  positionId: string;
  positionTitle: string;
  onClose: () => void;
}

export function ExportModal({ positionId, positionTitle, onClose }: Props) {
  const [dateRange, setDateRange] = useState("4weeks");
  const [includeDetails, setIncludeDetails] = useState(true);
  const [generating, setGenerating] = useState(false);

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

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `research-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        onClose();
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-xl bg-white">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-lg font-semibold">Export Progress Report</h2>
          <p className="mt-1 text-sm text-gray-600">{positionTitle}</p>
        </div>

        <div className="space-y-6 p-6">
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

          <div>
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
          </div>
        </div>

        <div className="flex justify-end gap-3 bg-gray-50 p-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={generating}
            className="rounded-lg bg-[#500000] px-4 py-2 font-medium text-white transition-colors hover:bg-[#6B1D1D] disabled:opacity-50"
          >
            {generating ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
