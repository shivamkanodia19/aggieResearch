"use client";

import { useState } from "react";
import type { StudentProfile } from "@/lib/resume-parser";
import { Loader2, FileUp } from "lucide-react";

interface ResumeUploaderProps {
  onProfileParsed: (profile: StudentProfile) => void;
}

export function ResumeUploader({ onProfileParsed }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      setError("Please upload a PDF or plain text file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to parse resume");

      onProfileParsed(data as StudentProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center transition-colors hover:border-maroon-700/50">
      <input
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={handleUpload}
        disabled={isUploading}
        className="hidden"
        id="resume-upload"
      />
      <label htmlFor="resume-upload" className="cursor-pointer">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-maroon-900" aria-hidden />
            <span className="text-sm font-medium text-gray-700">Analyzing your resume…</span>
          </div>
        ) : (
          <>
            <FileUp className="mx-auto h-10 w-10 text-gray-400" aria-hidden />
            <p className="mt-2 text-lg font-medium text-gray-900">Upload your resume</p>
            <p className="mt-1 text-sm text-gray-500">PDF or plain text, max 5MB</p>
          </>
        )}
      </label>
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
