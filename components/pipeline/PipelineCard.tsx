"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useDebouncedSave } from "@/hooks/use-debounced-save";
import { Check, Mail, User, Plus, X } from "lucide-react";
import { AcceptedModal } from "./AcceptedModal";
import { ApplicationWithOpportunity, ApplicationStage, Priority } from "@/lib/types/database";
import { StatusDropdown } from "./StatusDropdown";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface PipelineCardProps {
  application: ApplicationWithOpportunity;
  onStageChange: (applicationId: string, stage: ApplicationStage) => void;
  disabled?: boolean;
  /** Called when user confirms "Start Tracking" in Accepted modal. */
  onAcceptedToTracking?: (
    opportunityId: string,
    meta?: { title?: string; piName?: string | null }
  ) => void;
  /** When provided, clicking the card opens this application in the side panel. */
  onOpenSidePanel?: (application: ApplicationWithOpportunity) => void;
  /** When true, card is currently selected (panel open). */
  isSelected?: boolean;
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "Low") return null;
  const isHigh = priority === "High";
  return (
    <span
      className={cn(
        "mb-2.5 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold",
        isHigh ? "bg-maroon-100 text-maroon-900" : "bg-gray-100 text-gray-600"
      )}
    >
      {isHigh ? "⚡ High Priority" : "● Medium"}
    </span>
  );
}

/** Static card view for DragOverlay (no drag handle or dropdown). */
export function PipelineCardPreview({
  application,
}: {
  application: ApplicationWithOpportunity;
}) {
  const opp = application.opportunity;
  const title = opp?.title ?? "Unknown Opportunity";
  const piName = opp?.leader_name ?? "—";
  const email = opp?.leader_email ?? null;
  return (
    <div className="w-[280px] rounded-[10px] border border-gray-200 bg-white p-3.5 shadow-lg">
      <PriorityBadge priority={application.priority} />
      <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
        {title}
      </h3>
      <div className="mb-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[13px] text-gray-600">
          <User className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>{piName}</span>
        </div>
        {email && (
          <div className="flex items-center gap-2 text-[13px] text-gray-600">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-[11px] text-gray-400">
          {formatTimeAgo(application.updated_at)}
        </span>
      </div>
    </div>
  );
}

type PendingOutcome = "accepted" | null;

export function PipelineCard({
  application,
  onStageChange,
  disabled = false,
  onAcceptedToTracking,
  onRejectedWithUndo,
  onOpenSidePanel,
  isSelected = false,
}: PipelineCardProps) {
  const [copied, setCopied] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(application.notes || "");
  const [saving, setSaving] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<PendingOutcome>(null);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const queryClient = useQueryClient();

  const saveNoteToServer = useCallback(
    async (text: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("applications")
        .update({
          notes: text || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id)
        .eq("user_id", user.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    [application.id, queryClient]
  );

  const serverNotes = application.notes ?? "";
  const { saving: autoSaving, saveNow: saveNoteNow } = useDebouncedSave({
    value: noteText,
    saveFn: saveNoteToServer,
    isDirty: (val) => val !== serverNotes,
    delayMs: 1200,
    enabled: showNoteInput && !!application?.id,
  });

  const opportunityId =
    application.opportunity?.id ?? application.opportunity_id;
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: application.id,
    data: { type: "application", application },
  });

  const opp = application.opportunity;
  const title = opp?.title ?? "Unknown Opportunity";
  const piName = opp?.leader_name ?? "—";
  const email = opp?.leader_email ?? null;

  const copyEmail = useCallback(() => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [email]);

  const handleSaveNote = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (noteText === serverNotes) {
      setShowNoteInput(false);
      return;
    }
    setSaving(true);
    try {
      await saveNoteToServer(noteText);
      setShowNoteInput(false);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!onOpenSidePanel) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, [role='listbox']")) return;
    e.preventDefault();
    onOpenSidePanel(application);
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={false}
      animate={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={onOpenSidePanel ? handleCardClick : undefined}
      className={cn(
        "rounded-[10px] border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all",
        "cursor-grab active:cursor-grabbing hover:border-maroon-700 hover:shadow-[0_4px_12px_rgba(80,0,0,0.08)] hover:-translate-y-px",
        isDragging && "z-50 shadow-lg",
        onOpenSidePanel && "cursor-pointer",
        isSelected && "ring-2 ring-maroon-900 ring-offset-2"
      )}
      {...attributes}
      {...listeners}
    >
      <PriorityBadge priority={application.priority} />

      {onOpenSidePanel ? (
        <div className="block">
          <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
            {title}
          </h3>
        </div>
      ) : (
        <Link
          href={`/applications/${application.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block"
        >
          <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
            {title}
          </h3>
        </Link>
      )}

      <div className="mb-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[13px] text-gray-600">
          <User className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>{piName}</span>
        </div>
        {email && (
          <div className="group flex items-center gap-2 text-[13px] text-gray-600">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{email}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                copyEmail();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-maroon-100 hover:text-maroon-900"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {/* Quick note */}
      {application.notes && !showNoteInput && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowNoteInput(true);
          }}
          className="text-xs text-gray-600 bg-yellow-50 border border-yellow-100 rounded p-2 mb-3 cursor-pointer hover:bg-yellow-100 transition-colors"
        >
          📝 {application.notes}
        </div>
      )}

      {showNoteInput && (
        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={() => saveNoteNow()}
            placeholder="Add a quick note... (auto-saves)"
            className="w-full text-xs p-2 border border-gray-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-[#500000]"
            rows={2}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowNoteInput(false);
                setNoteText(application.notes || "");
              }
            }}
          />
          <div className="flex justify-end items-center gap-2 mt-1">
            {(saving || autoSaving) && (
              <span className="text-xs text-gray-500">Saving...</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNoteInput(false);
                setNoteText(application.notes || "");
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNote}
              disabled={saving || autoSaving}
              className="text-xs text-[#500000] font-medium hover:text-[#700000] disabled:opacity-50"
            >
              {saving || autoSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Add note button (if no note exists) */}
      {!application.notes && !showNoteInput && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowNoteInput(true);
          }}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3"
        >
          <Plus className="w-3 h-3" />
          Add note
        </button>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <StatusDropdown
          value={application.stage}
          onChange={(stage) => onStageChange(application.id, stage)}
          activeOnly={false}
          disabled={disabled || confirmingReject}
          onRequestAccepted={() => setPendingOutcome("accepted")}
          onRequestRejected={() => setConfirmingReject(true)}
        />
        <span className="text-[11px] text-gray-400">
          {formatTimeAgo(application.updated_at)}
        </span>
      </div>

      {application.stage === "Interview" && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setPendingOutcome("accepted");
            }}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs font-medium text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Accepted
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setPendingOutcome("rejected");
            }}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Rejected
          </button>
        </div>
      )}

      {pendingOutcome === "accepted" && (
        <AcceptedModal
          onClose={() => setPendingOutcome(null)}
          onJustMark={() => {
            onStageChange(application.id, "Accepted");
            setPendingOutcome(null);
          }}
          onStartTracking={() => {
            onStageChange(application.id, "Accepted");
            if (opportunityId && onAcceptedToTracking) {
              onAcceptedToTracking(opportunityId, {
                title: opp?.title,
                piName: opp?.leader_name ?? null,
              });
            }
            setPendingOutcome(null);
          }}
        />
      )}
    </motion.div>
  );
}

