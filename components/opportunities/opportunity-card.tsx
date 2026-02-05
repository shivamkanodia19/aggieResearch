"use client";

import { Sparkles, Clock, Users, Check, Plus, ExternalLink } from "lucide-react";
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
  research_field: string | null;
  skills_gained: string[] | null;
}

export interface OpportunityCardProps {
  opportunity: OpportunityCardOpportunity;
  isTracked?: boolean;
  onTrack?: () => void;
}

export function OpportunityCard({
  opportunity,
  isTracked = false,
  onTrack,
}: OpportunityCardProps) {
  const {
    title,
    leader_name,
    leader_department,
    source_url,
    who_can_join,
    time_commitment,
    ai_summary,
    relevant_majors,
    skills_gained,
  } = opportunity;

  const majors = relevant_majors ?? [];
  const skills = skills_gained ?? [];
  const eligibility = who_can_join?.filter(Boolean).join(", ") || "Open to qualified students";

  return (
    <Card className="flex flex-col overflow-hidden border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-lg" aria-hidden>🧪</span>
              {leader_department && (
                <span className="text-xs font-medium truncate">{leader_department}</span>
              )}
            </div>
            <h2 className="text-xl font-semibold leading-tight text-foreground">{title}</h2>
            {(leader_name || leader_department) && (
              <p className="text-sm text-muted-foreground mt-1">
                {[leader_name, leader_department].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          {onTrack && (
            <Button
              size="sm"
              variant={isTracked ? "success" : "default"}
              onClick={onTrack}
              className="shrink-0"
            >
              {isTracked ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" aria-hidden />
                  Tracked
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" aria-hidden />
                  Track
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-0">
        {/* AI Summary – visually distinct per spec */}
        {ai_summary && (
          <div
            className="rounded-lg border p-4 text-sm leading-relaxed"
            style={{
              background: "linear-gradient(135deg, var(--ai-gradient-start), var(--ai-gradient-end))",
              borderColor: "var(--ai-border)",
            }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-400 mb-2">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI Summary
            </div>
            <p className="text-foreground/95">{ai_summary}</p>
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

      <CardFooter className="border-t border-border pt-4 mt-auto">
        {source_url ? (
          <a
            href={source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-tamu-maroon hover:underline"
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
