"use client";

import { useState } from "react";
import { subWeeks, format } from "date-fns";

interface Props {
  positionId: string;
  positionTitle: string;
  piEmail: string;
  piName: string;
  onClose: () => void;
}

export function EmailModal({
  positionId,
  positionTitle,
  piEmail,
  piName,
  onClose,
}: Props) {
  const [emailType, setEmailType] = useState<
    "weekly_update" | "monthly_summary" | "meeting_prep"
  >("weekly_update");
  const [dateRange, setDateRange] = useState("4weeks");
  const [generating, setGenerating] = useState(false);
  const [emailContent, setEmailContent] = useState<{
    subject: string;
    body: string;
  } | null>(null);

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
      default:
        startDate = subWeeks(endDate, 4);
    }

    return { startDate, endDate };
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const { startDate, endDate } = getDateRange();

    try {
      const res = await fetch("/api/research/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          emailType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEmailContent({ subject: data.subject, body: data.body });
      }
    } catch (error) {
      console.error("Failed to generate email:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenMail = () => {
    if (!emailContent) return;

    const mailtoUrl = `mailto:${piEmail}?subject=${encodeURIComponent(
      emailContent.subject
    )}&body=${encodeURIComponent(emailContent.body)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopy = () => {
    if (!emailContent) return;
    navigator.clipboard.writeText(
      `Subject: ${emailContent.subject}\n\n${emailContent.body}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-lg font-semibold">Email Progress to PI</h2>
          <p className="mt-1 text-sm text-gray-600">
            {piName} ({piEmail})
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {!emailContent ? (
            <>
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-900">
                  Email type
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "weekly_update",
                      label: "Weekly Update",
                      desc: "Quick summary of this week",
                    },
                    {
                      value: "monthly_summary",
                      label: "Monthly Summary",
                      desc: "Overview of the past month",
                    },
                    {
                      value: "meeting_prep",
                      label: "Meeting Prep",
                      desc: "Agenda for upcoming meeting",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEmailType(option.value as any)}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                        emailType === option.value
                          ? "border-[#500000] bg-[#FBF5F5]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-900">
                  Include data from
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#500000]"
                >
                  <option value="1week">Last week</option>
                  <option value="4weeks">Last 4 weeks</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) =>
                    setEmailContent({ ...emailContent, subject: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Body
                </label>
                <textarea
                  value={emailContent.body}
                  onChange={(e) =>
                    setEmailContent({ ...emailContent, body: e.target.value })
                  }
                  rows={12}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 bg-gray-50 p-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>

          {!emailContent ? (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-lg bg-[#500000] px-4 py-2 font-medium text-white transition-colors hover:bg-[#6B1D1D] disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Email"}
            </button>
          ) : (
            <>
              <button
                onClick={() => setEmailContent(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={handleCopy}
                className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleOpenMail}
                className="rounded-lg bg-[#500000] px-4 py-2 font-medium text-white transition-colors hover:bg-[#6B1D1D]"
              >
                Open in Mail
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
