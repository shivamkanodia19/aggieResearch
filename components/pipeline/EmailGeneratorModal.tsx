"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ApplicationWithOpportunity, Profile } from "@/lib/types/database";
import { X, Copy, Check, Loader2, Mail, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmailGeneratorModalProps {
  application: ApplicationWithOpportunity;
  mode: "cold" | "followup";
  onClose: () => void;
  onMarkedSent: (applicationId: string, mode: "cold" | "followup") => void;
}

async function fetchProfile(): Promise<Profile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data as Profile;
}

function profileCompleteness(profile: Profile | null): string[] {
  if (!profile) return [];
  const missing: string[] = [];
  if (!profile.major) missing.push("major");
  if (!profile.classification) missing.push("year/classification");
  if (!profile.bio) missing.push("bio");
  return missing;
}

export function EmailGeneratorModal({
  application,
  mode,
  onClose,
  onMarkedSent,
}: EmailGeneratorModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emailText, setEmailText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);
  const [markedSent, setMarkedSent] = useState(false);

  const opp = application.opportunity;
  const piName = opp?.leader_name ?? "the PI";
  const piEmail = opp?.leader_email ?? null;

  // Load profile on mount
  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => setError("Could not load your profile."));
  }, []);

  // Auto-generate when profile is ready
  useEffect(() => {
    if (profile !== null && emailText === "" && !generating) {
      generateEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const generateEmail = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setEmailText(data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setGenerating(false);
    }
  }, [application.id, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkSent = async () => {
    setMarkingSent(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const field = mode === "cold" ? "email_sent_at" : "follow_up_sent_at";
      const { error: updateError } = await supabase
        .from("applications")
        .update({ [field]: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", application.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // If cold email, also move to "First Email" stage if still in Saved
      if (mode === "cold" && application.stage === "Saved") {
        await supabase
          .from("applications")
          .update({ stage: "First Email", updated_at: new Date().toISOString() })
          .eq("id", application.id)
          .eq("user_id", user.id);
        await supabase.from("application_events").insert({
          application_id: application.id,
          stage: "First Email",
          notes: "Moved to First Email after sending cold email",
        });
      }

      setMarkedSent(true);
      onMarkedSent(application.id, mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as sent");
    } finally {
      setMarkingSent(false);
    }
  };

  const missing = profileCompleteness(profile);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-[201] w-full max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Email generator"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {mode === "cold" ? "Email This PI" : "Send Follow-up"}
            </h2>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {piName}
              {piEmail ? ` · ${piEmail}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Profile nudge */}
          {missing.length > 0 && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[13px] text-amber-800">
                Add your {missing.join(" and ")} in{" "}
                <a
                  href="/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  Settings
                </a>{" "}
                for a more personalized email.
              </p>
            </div>
          )}

          {/* Generating state */}
          {generating && (
            <div className="flex items-center justify-center gap-3 py-10 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[15px]">Generating email…</span>
            </div>
          )}

          {/* Error state */}
          {error && !generating && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Email textarea */}
          {!generating && emailText && (
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={12}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-[14px] leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-[#500000] focus:outline-none focus:ring-[3px] focus:ring-[#500000]/10"
              spellCheck
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={generateEmail}
            disabled={generating}
            className="text-[13px] font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline disabled:opacity-50"
          >
            Regenerate
          </button>

          <div className="flex items-center gap-2">
            {/* mailto link (opens system email client) */}
            {piEmail && emailText && (
              <a
                href={`mailto:${piEmail}?body=${encodeURIComponent(emailText)}`}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 no-underline"
              >
                <Mail className="h-3.5 w-3.5" />
                Open in Mail
              </a>
            )}

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!emailText || generating}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-50",
                copied
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>

            {/* Mark as Sent */}
            {markedSent ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3.5 py-2 text-[13px] font-medium text-green-700">
                <Check className="h-3.5 w-3.5" />
                Marked sent
              </span>
            ) : (
              <button
                type="button"
                onClick={handleMarkSent}
                disabled={!emailText || generating || markingSent}
                className="flex items-center gap-1.5 rounded-lg bg-[#500000] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#6B1D1D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingSent ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Mark as Sent
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
