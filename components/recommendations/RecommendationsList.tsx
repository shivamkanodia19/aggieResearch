"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MatchResult } from "@/lib/match-opportunities";
import { trackOpportunity } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface RecommendationsListProps {
  matches: MatchResult[];
}

function MatchScoreBadge({ score }: { score: number }) {
  const style =
    score >= 80
      ? "bg-maroon-100 text-maroon-900 border-maroon-700/30"
      : score >= 60
        ? "bg-gray-100 text-gray-800 border-gray-300"
        : "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium ${style}`}
    >
      {score}% Match
    </span>
  );
}

export function RecommendationsList({ matches }: RecommendationsListProps) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  const handleTrack = async (opportunityId: string) => {
    if (trackedIds.has(opportunityId) || trackingId) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?redirectTo=/recommendations");
      return;
    }
    setTrackingId(opportunityId);
    try {
      const { error } = await trackOpportunity(user.id, opportunityId);
      if (error) throw error;
      setTrackedIds((prev) => new Set(prev).add(opportunityId));
      router.refresh();
    } catch (err) {
      console.error("Track failed:", err);
    } finally {
      setTrackingId(null);
    }
  };

  if (matches.length === 0) {
    return (
      <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
        No matches yet. Upload a resume to get personalized recommendations, or try again after more
        opportunities are summarized.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match, index) => {
        const isTracked = trackedIds.has(match.opportunityId);
        const isTracking = trackingId === match.opportunityId;

        return (
          <motion.div
            key={match.opportunityId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-[0_4px_12px_rgba(80,0,0,0.06)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-maroon-900">#{index + 1}</span>
                  <MatchScoreBadge score={match.matchScore} />
                </div>
                <Link
                  href={`/opportunities/${match.opportunityId}`}
                  className="block"
                >
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-maroon-900 hover:underline">
                    {match.opportunityTitle}
                  </h3>
                </Link>

                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Why you&apos;re a good fit
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-gray-700">
                      {match.matchReasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0 text-maroon-700">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {match.gapWarnings.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Things to consider
                      </p>
                      <ul className="mt-1 space-y-1 text-sm text-gray-600">
                        {match.gapWarnings.map((warning, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 text-amber-600">!</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-lg border border-maroon-100 bg-maroon-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-maroon-900">
                      Application tip
                    </p>
                    <p className="mt-1 text-sm text-maroon-800">{match.standoutTip}</p>
                  </div>
                </div>
              </div>

              <div className="shrink-0 sm:pl-4">
                <motion.div
                  whileTap={!isTracking && !isTracked ? { scale: 0.94 } : undefined}
                  transition={{ duration: 0.1 }}
                >
                  <Button
                    size="sm"
                    variant={isTracked ? "success" : "default"}
                    onClick={() => handleTrack(match.opportunityId)}
                    disabled={isTracking}
                    className="rounded-lg"
                  >
                    {isTracking ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Saving…
                      </span>
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
                        <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                        Track
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
