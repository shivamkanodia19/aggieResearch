"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddResearchPositionModal({ open, onClose }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [piName, setPiName] = useState("");
  const [piEmail, setPiEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetForm = () => {
    setTitle("");
    setPiName("");
    setPiEmail("");
    setDepartment("");
    setDescription("");
    setStartDate("");
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Position title is required");
      return;
    }
    if (!startDate) {
      setError("Start date is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          piName: piName.trim() || undefined,
          piEmail: piEmail.trim() || undefined,
          department: department.trim() || undefined,
          description: description.trim() || undefined,
          startDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Failed to add position");
        return;
      }

      const position = await res.json();
      toast.success("Research position added! Start logging your progress.");
      resetForm();
      onClose();
      router.push(`/research/${position.id}/log`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition-[border-color,box-shadow] placeholder:text-gray-400 hover:border-gray-300 focus:border-[#500000] focus:outline-none focus:ring-2 focus:ring-[#500000]/10 disabled:opacity-50";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl animate-modal-enter">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Add Research Position
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Add a research position you&apos;re currently working on to start
            tracking your progress.
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          {/* Title - Required */}
          <div>
            <label htmlFor="pos-title" className={labelClass}>
              Position Title <span className="text-red-500">*</span>
            </label>
            <input
              id="pos-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Machine Learning Research Assistant"
              required
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* Start Date - Required */}
          <div>
            <label htmlFor="pos-start" className={labelClass}>
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="pos-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={loading}
              max={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
          </div>

          {/* PI Name */}
          <div>
            <label htmlFor="pos-pi" className={labelClass}>
              Principal Investigator (PI) Name
            </label>
            <input
              id="pos-pi"
              type="text"
              value={piName}
              onChange={(e) => setPiName(e.target.value)}
              placeholder="e.g., Dr. Jane Smith"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* PI Email */}
          <div>
            <label htmlFor="pos-pi-email" className={labelClass}>
              PI Email
            </label>
            <input
              id="pos-pi-email"
              type="email"
              value={piEmail}
              onChange={(e) => setPiEmail(e.target.value)}
              placeholder="e.g., jsmith@tamu.edu"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="pos-dept" className={labelClass}>
              Department
            </label>
            <input
              id="pos-dept"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Computer Science & Engineering"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="pos-desc" className={labelClass}>
              Description
            </label>
            <textarea
              id="pos-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the research position..."
              rows={3}
              disabled={loading}
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-[#500000] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6B1D1D] disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add & Start Tracking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
