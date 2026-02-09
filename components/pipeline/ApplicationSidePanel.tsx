"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  ApplicationWithOpportunity,
  ApplicationStage,
  ApplicationEvent,
} from "@/lib/types/database";
import { useCallback, useState, useEffect, useRef } from "react";
import { useDebouncedSave } from "@/hooks/use-debounced-save";
import { motion } from "framer-motion";
import {
  X,
  Copy,
  Mail,
  ChevronDown,
  ExternalLink,
  Trash2,
  Check,
  CheckCircle,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { STAGE_LABELS } from "./StatusDropdown";
import { cn } from "@/lib/utils/cn";
import { AcceptedModal } from "./AcceptedModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const ACTIVE_STAGES: ApplicationStage[] = [
  "Saved",
  "First Email",
  "Responded",
  "Interview",
];

const STAGE_DOT_CLASS: Record<string, string> = {
  Saved: "bg-gray-400",
  "First Email": "bg-amber-600",
  Responded: "bg-blue-600",
  Interview: "bg-purple-600",
  Accepted: "bg-green-600",
  Rejected: "bg-red-600",
  Withdrawn: "bg-gray-400",
};

async function fetchApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("application_events")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

interface ApplicationSidePanelProps {
  application: ApplicationWithOpportunity | null;
  onClose: () => void;
  onStageChange: (applicationId: string, stage: ApplicationStage) => void;
  onRemove?: (applicationId: string) => void;
  onAcceptedToTracking?: (
    opportunityId: string,
    meta?: { title?: string; piName?: string | null }
  ) => void;
  /** Called when user confirms rejection; parent can show toast with undo. */
  onRejectedWithUndo?: (
    applicationId: string,
    previousStage: ApplicationStage
  ) => void;
  isOpen: boolean;
}

export function ApplicationSidePanel({
  application,
  onClose,
  onStageChange,
  onRemove,
  onAcceptedToTracking,
  onRejectedWithUndo,
  isOpen,
}: ApplicationSidePanelProps) {
  const queryClient = useQueryClient();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<"accepted" | null>(null);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const cancelRejectRef = useRef<HTMLButtonElement>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    if (application) {
      setNotesValue(application.notes ?? "");
      setDetailsOpen(false);
    }
  }, [application]);

  useEffect(() => {
    if (confirmingReject) {
      cancelRejectRef.current?.focus();
    }
  }, [confirmingReject]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmingReject) setConfirmingReject(false);
        else onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose, confirmingReject]);

  const { data: events = [] } = useQuery({
    queryKey: ["application-events", application?.id],
    queryFn: () => fetchApplicationEvents(application!.id),
    enabled: !!application?.id,
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("applications")
        .update({ notes: notes || null, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application", application?.id] });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    },
  });

  const copyEmail = useCallback(() => {
    const email = application?.opportunity?.leader_email;
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [application?.opportunity?.leader_email]);

  const handleSaveNotes = () => {
    if (!application) return;
    updateNotesMutation.mutate({ id: application.id, notes: notesValue });
  };

  const notesFromServer = application?.notes ?? "";
  const { saving: autoSaving, saveNow: saveNotesNow } = useDebouncedSave({
    value: notesValue,
    saveFn: async (val) => {
      if (!application) return;
      await updateNotesMutation.mutateAsync({
        id: application.id,
        notes: val,
      });
    },
    isDirty: (val) => val !== notesFromServer,
    delayMs: 1500,
    enabled: !!application?.id,
  });

  const handleStageSelect = (stage: ApplicationStage) => {
    if (!application) return;
    if (stage === "Accepted") {
      setPendingOutcome("accepted");
      return;
    }
    if (stage === "Rejected") {
      setConfirmingReject(true);
      return;
    }
    onStageChange(application.id, stage);
  };

  const handleConfirmReject = () => {
    if (!application) return;
    const previousStage = application.stage;
    onStageChange(application.id, "Rejected");
    onRejectedWithUndo?.(application.id, previousStage);
    setConfirmingReject(false);
    setRejectSuccess(true);
    setTimeout(() => onClose(), 1000);
  };

  const handleRemoveClick = () => {
    if (!application || !onRemove) return;
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = () => {
    if (!application || !onRemove) return;
    onRemove(application.id);
    onClose();
    setShowRemoveConfirm(false);
  };

  if (!application) return null;

  const opp = application.opportunity;
  const title = opp?.title ?? "Unknown Opportunity";
  const piName = opp?.leader_name ?? "—";
  const email = opp?.leader_email ?? null;
  const notes = application.notes ?? "";
  const displayNotes = notesValue !== "" ? notesValue : notes;
  const hasNotesChange = notesValue !== notes && notesValue.trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        className={cn(
          "fixed inset-0 z-[100] bg-black/30 transition-all duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[101] w-full max-w-[500px] flex flex-col bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-modal="true"
        aria-label="Application details"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-bold leading-snug text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          {/* Current Stage */}
          <section className="mb-6">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Current Stage
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVE_STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleStageSelect(stage)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border-2 bg-white px-4 py-3 text-left transition-colors",
                    application.stage === stage
                      ? "border-maroon-900 bg-maroon-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      STAGE_DOT_CLASS[stage] ?? "bg-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      application.stage === stage ? "text-maroon-900" : "text-gray-700"
                    )}
                  >
                    {STAGE_LABELS[stage]}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-dashed border-gray-200 pt-3">
              {rejectSuccess ? (
                <motion.div
                  className="col-span-3 flex items-center justify-center gap-2 rounded-lg border-2 border-green-300 bg-green-50 py-2.5 text-sm font-medium text-green-700"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="h-5 w-5" strokeWidth={2.5} />
                  Rejected — closing...
                </motion.div>
              ) : !confirmingReject ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleStageSelect("Accepted")}
                    title="Move to accepted"
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border-2 bg-white py-2.5 text-center text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-sm",
                      application.stage === "Accepted"
                        ? "border-green-600 bg-green-50 text-green-600"
                        : "border-gray-200 text-green-600 hover:border-green-600 hover:bg-green-50"
                    )}
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    Accepted
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStageSelect("Rejected")}
                    title="Move to rejected list"
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border-2 bg-white py-2.5 text-center text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-sm",
                      application.stage === "Rejected"
                        ? "border-red-600 bg-red-50 text-red-600"
                        : "border-gray-200 text-red-600 hover:border-red-600 hover:bg-red-50"
                    )}
                  >
                    <XCircle className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    Rejected
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStageSelect("Withdrawn")}
                    title="Mark as withdrawn"
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border-2 bg-white py-2.5 text-center text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-sm",
                      application.stage === "Withdrawn"
                        ? "border-gray-400 bg-gray-100 text-gray-500"
                        : "border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-gray-100"
                    )}
                  >
                    <MinusCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                    Withdrawn
                  </button>
                </>
              ) : (
                <motion.div
                  className="col-span-3 flex flex-col gap-3 rounded-xl border-2 border-red-200 bg-red-50/80 px-4 py-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  role="alert"
                  aria-labelledby="reject-confirm-title"
                >
                  <p
                    id="reject-confirm-title"
                    className="flex items-center gap-2 text-sm font-semibold text-red-800"
                  >
                    Confirm rejection?
                  </p>
                  <p className="text-[13px] text-red-700/90">
                    This will move &quot;{title}&quot; to your rejected list. You can change it
                    later if needed.
                  </p>
                  <p className="text-xs text-amber-800/90">
                    Don&apos;t get discouraged — most students apply to 5–10 positions before
                    getting one.
                  </p>
                  <div className="flex gap-2">
                    <button
                      ref={cancelRejectRef}
                      type="button"
                      onClick={() => setConfirmingReject(false)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReject}
                      className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Mark as rejected"
                    >
                      Mark as Rejected
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Contact */}
          {email && (
            <section className="mb-6">
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Contact
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maroon-100 text-sm font-semibold text-maroon-900">
                    {piName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{piName}</div>
                    <div className="truncate text-[13px] text-gray-500">{email}</div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={copyEmail}
                    title="Copy email"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                      copied
                        ? "border-green-600 bg-green-50 text-green-600"
                        : "border-gray-200 bg-white text-gray-500 hover:border-maroon-900 hover:bg-maroon-50 hover:text-maroon-900"
                    )}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={`mailto:${email}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-maroon-900 hover:bg-maroon-50 hover:text-maroon-900"
                    title="Open email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="mb-6">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Notes
            </div>
            <textarea
              value={displayNotes}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={() => {
                saveNotesNow();
              }}
              placeholder="Add notes about this application..."
              className="min-h-[100px] w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-maroon-900 focus:outline-none focus:ring-3 focus:ring-maroon-100"
            />
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400">
                Auto-saves as you type and when you click away
              </span>
              <div className="flex items-center gap-2">
                {(notesSaved || autoSaving || updateNotesMutation.isPending) && (
                  <span className="text-[13px] font-medium text-gray-500">
                    {notesSaved ? "Saved!" : "Saving..."}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={!hasNotesChange || updateNotesMutation.isPending}
                  className={cn(
                    "rounded-md bg-maroon-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-maroon-700 disabled:opacity-50 disabled:pointer-events-none"
                  )}
                >
                  Save
                </button>
              </div>
            </div>
          </section>

          {/* Timeline */}
          {events.length > 0 && (
            <section className="mb-6">
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Timeline
              </div>
              <div className="relative pl-1">
                {events.length > 1 && (
                  <div
                    className="absolute left-[5px] top-5 bottom-4 w-0.5 bg-gray-200"
                    aria-hidden
                  />
                )}
                {events.map((event, i) => (
                  <div
                    key={event.id}
                    className={cn(
                      "relative flex gap-3 pb-4",
                      i === events.length - 1 && "pb-0"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 h-3 w-3 shrink-0 rounded-full",
                        STAGE_DOT_CLASS[event.stage ?? ""] ?? "bg-gray-300"
                      )}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {event.stage ? `Moved to ${STAGE_LABELS[event.stage as ApplicationStage] ?? event.stage}` : "Event"}
                      </div>
                      {event.notes && (
                        <div className="text-[13px] text-gray-500">{event.notes}</div>
                      )}
                      <div className="mt-1 text-xs text-gray-400">
                        {new Date(event.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Opportunity Details (expandable) */}
          {opp && (opp.description || opp.team_needs || (opp.who_can_join && opp.who_can_join.length > 0)) && (
            <section className="mb-6">
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left transition-colors hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-gray-700">
                  📋 Opportunity Details
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 text-gray-400 transition-transform", detailsOpen && "rotate-180")}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden border border-t-0 border-gray-200 rounded-b-xl transition-[max-height] duration-300",
                  detailsOpen ? "max-h-[600px]" : "max-h-0"
                )}
              >
                <div className="space-y-4 border-t border-gray-200 bg-white p-4">
                  {opp.description && (
                    <div>
                      <h4 className="mb-1.5 text-xs font-semibold text-gray-500">
                        Description
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-700">
                        {opp.description}
                      </p>
                    </div>
                  )}
                  {opp.team_needs && (
                    <div>
                      <h4 className="mb-1.5 text-xs font-semibold text-gray-500">
                        Team Needs
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-700">
                        {opp.team_needs}
                      </p>
                    </div>
                  )}
                  {opp.who_can_join && opp.who_can_join.length > 0 && (
                    <div>
                      <h4 className="mb-1.5 text-xs font-semibold text-gray-500">
                        Who Can Join
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-700">
                        {opp.who_can_join.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-4">
            {opp?.source_url ? (
              <a
                href={opp.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-gray-500 transition-colors hover:text-maroon-900"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Original Posting
              </a>
            ) : null}
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={handleRemoveClick}
              className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-transparent px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Modals for Accepted/Rejected */}
      {pendingOutcome === "accepted" && (
        <AcceptedModal
          onClose={() => setPendingOutcome(null)}
          onJustMark={() => {
            onStageChange(application.id, "Accepted");
            setPendingOutcome(null);
          }}
          onStartTracking={() => {
            onStageChange(application.id, "Accepted");
            const opportunityId = application.opportunity?.id ?? application.opportunity_id;
            if (opportunityId && onAcceptedToTracking) {
              onAcceptedToTracking(opportunityId, {
                title: application.opportunity?.title,
                piName: application.opportunity?.leader_name ?? null,
              });
            }
            setPendingOutcome(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleConfirmRemove}
        title="Remove from pipeline?"
        message="This will remove the opportunity from your pipeline. You can always add it back later if needed."
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
