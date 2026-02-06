"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Clock, Users, Check, Plus, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface OpportunityCardOpportunity {
  id: string;
  title: string;
  leader_name: string | null;
  leader_email: string | null;
  leader_department: string | null;
  source_url: string | null;
  who_can_join: string[] | null;
  time_commitment: string | null;
  ai_summary: string | null;
  relevant_majors: string[] | null;
  technical_disciplines?: string[] | null;
  research_field: string | null;
  skills_gained: string[] | null;
}

export interface OpportunityCardProps {
  opportunity: OpportunityCardOpportunity;
  isTracked?: boolean;
  onTrack?: () => void | Promise<void>;
}

export function OpportunityCard({
  opportunity,
  isTracked = false,
  onTrack,
}: OpportunityCardProps) {
  const [isTracking, setIsTracking] = useState(false);
  const {
    title,
    leader_name,
    leader_department,
    source_url,
    who_can_join,
    time_commitment,
    ai_summary,
    relevant_majors,
    technical_disciplines,
    skills_gained,
  } = opportunity;

  const majors = relevant_majors ?? [];
  const disciplines = technical_disciplines ?? [];
  const skills = skills_gained ?? [];
  const eligibility = who_can_join?.filter(Boolean).join(", ") || "Open to qualified students";

  const handleTrackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onTrack || isTracked || isTracking) return;
    setIsTracking(true);
    try {
      await onTrack();
    } finally {
      setIsTracking(false);
    }
  };

  const detailHref = `/opportunities/${opportunity.id}`;

  return (
    <Card className="flex flex-col overflow-hidden border-gray-200 bg-white transition-all hover:border-maroon-700 hover:shadow-[0_4px_12px_rgba(80,0,0,0.08)] hover:-translate-y-px">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link href={detailHref} className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-lg" aria-hidden>🧪</span>
              {leader_department && (
                <span className="text-xs font-medium truncate">{leader_department}</span>
              )}
            </div>
            <h2 className="text-xl font-semibold leading-tight text-foreground hover:text-maroon-900">{title}</h2>
            {(leader_name || leader_department) && (
              <p className="text-sm text-muted-foreground mt-1">
                {[leader_name, leader_department].filter(Boolean).join(" · ")}
              </p>
            )}
          </Link>
          {onTrack && (
            <motion.div
              className="shrink-0"
              whileTap={!isTracking && !isTracked ? { scale: 0.94 } : undefined}
              transition={{ duration: 0.1 }}
            >
              <Button
                size="sm"
                variant={isTracked ? "success" : "default"}
                onClick={handleTrackClick}
                disabled={isTracking}
                className="shrink-0 rounded-lg"
              >
                {isTracking ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </motion.span>
                ) : isTracked ? (
                  <motion.span
                    key="tracked"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    Tracked
                  </motion.span>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" aria-hidden />
                    Track
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </CardHeader>

      <Link href={detailHref} className="block">
        <CardContent className="flex flex-col gap-4 pt-0 cursor-pointer">
        {/* AI Summary – visually distinct per spec */}
        {ai_summary && (
          <div
            className="rounded-lg border border-maroon-100 bg-maroon-50 p-4 text-sm leading-relaxed"
            style={{ borderColor: "var(--ai-border)" }}
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-maroon-900">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI Summary
            </div>
            <p className="text-gray-800">{ai_summary}</p>
          </div>
        )}

        {/* Best for: major tags */}
        {majors.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Best for</p>
            <div className="flex flex-wrap gap-2">
              {majors.map((major) => (
                <span
                  key={major}
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(80, 0, 0, 0.3)",
                    borderColor: "rgba(80, 0, 0, 0.3)",
                    color: "var(--foreground)",
                  }}
                >
                  {major}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Technical disciplines (engineering, medicine, etc.) */}
        {disciplines.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Disciplines</p>
            <div className="flex flex-wrap gap-2">
              {disciplines.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Time & eligibility */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {time_commitment && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              {time_commitment}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            {eligibility}
          </span>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Skills you&apos;ll gain
            </p>
            <p className="text-xs text-muted-foreground">
              {skills.join(", ")}
            </p>
          </div>
        )}
        </CardContent>
      </Link>

      <CardFooter className="border-t border-border pt-4 mt-auto">
        {source_url ? (
          <a
            href={source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-maroon-900 hover:underline"
            )}
          >
            View on Aggie Collaborate
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">Link not available</span>
        )}
      </CardFooter>
    </Card>
  );
}
