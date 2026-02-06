"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ArrowLeft,
  Mail,
  User,
  ExternalLink,
  Check,
  Plus,
  Loader2,
  Clock,
  Users,
  Briefcase,
} from "lucide-react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { trackOpportunity, getUserApplicationIds } from "@/lib/supabase/queries";

function truncateSummary(text: string, maxSentences = 2): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= maxSentences) return text;
  return sentences.slice(0, maxSentences).join(" ") + " …";
}

async function fetchOpportunity(id: string): Promise<Opportunity | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as Opportunity;
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [copied, setCopied] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const { data: opportunity, isLoading } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => fetchOpportunity(id),
    enabled: !!id,
  });

  const { data: trackedIds = new Set<string>() } = useQuery({
    queryKey: ["application-ids"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return new Set<string>();
      return getUserApplicationIds(user.id);
    },
  });

  const isTracked = id ? trackedIds.has(id) : false;

  const handleTrack = useCallback(async () => {
    if (!id || isTracked || isTracking) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?redirectTo=/opportunities/" + id);
      return;
    }
    setIsTracking(true);
    try {
      const { error } = await trackOpportunity(user.id, id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["application-ids"] });
      await queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    } catch (err) {
      console.error("Failed to track:", err);
    } finally {
      setIsTracking(false);
    }
  }, [id, isTracked, isTracking, queryClient, router]);

  const copyEmail = useCallback(() => {
    if (opportunity?.leader_email) {
      navigator.clipboard.writeText(opportunity.leader_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [opportunity?.leader_email]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Opportunity not found.</p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link href="/opportunities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Link>
        </Button>
      </div>
    );
  }

  const summary =
    opportunity.ai_summary ||
    (opportunity.description ? truncateSummary(opportunity.description) : null);
  const whoCanJoin = opportunity.who_can_join?.filter(Boolean).join(", ") || null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/opportunities"
          className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-maroon-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Opportunities
        </Link>
        <Button
          size="sm"
          variant={isTracked ? "success" : "default"}
          onClick={handleTrack}
          disabled={isTracking}
          className="rounded-lg"
        >
          {isTracking ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : isTracked ? (
            <motion.span
              key="tracked"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              Tracked
            </motion.span>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" />
              Track
            </>
          )}
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          {opportunity.leader_department && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              {opportunity.leader_department}
            </p>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">{opportunity.title}</h1>
          {opportunity.project_type && (
            <p className="mt-1 text-sm text-gray-600">{opportunity.project_type}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {summary && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Summary</h2>
              <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Contact</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {opportunity.leader_name && (
                <span className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  {opportunity.leader_name}
                </span>
              )}
              {opportunity.leader_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{opportunity.leader_email}</span>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="rounded px-2 py-1 text-xs font-medium text-maroon-900 hover:bg-maroon-100"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={`mailto:${opportunity.leader_email}`}
                    className="inline-flex items-center gap-1 text-maroon-900 hover:underline"
                  >
                    Email
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {!opportunity.leader_name && !opportunity.leader_email && (
                <p className="text-gray-500">No contact info available.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {opportunity.time_commitment && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                {opportunity.time_commitment}
              </span>
            )}
            {whoCanJoin && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0" />
                {whoCanJoin}
              </span>
            )}
          </div>

          {opportunity.team_needs && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Team needs</h2>
              <p className="text-sm text-gray-700">{opportunity.team_needs}</p>
            </div>
          )}

          {opportunity.skills_gained && opportunity.skills_gained.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Skills you&apos;ll gain</h2>
              <p className="text-sm text-gray-700">{opportunity.skills_gained.join(", ")}</p>
            </div>
          )}

          {opportunity.source_url && (
            <div className="pt-2">
              <Button asChild className="rounded-lg" size="sm">
                <a
                  href={opportunity.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  View on Aggie Collaborate
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
