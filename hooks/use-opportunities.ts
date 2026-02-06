"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  trackOpportunity,
  untrackOpportunity,
  getUserApplicationIds,
} from "@/lib/supabase/queries";
import type { Opportunity } from "@/lib/types/database";

export interface UseOpportunitiesFilters {
  search?: string;
  major?: string;
}

interface OpportunitiesResponse {
  data: Opportunity[];
  meta: { majors: string[] };
}

export function useOpportunities(filters: UseOpportunitiesFilters = {}) {
  const queryClient = useQueryClient();

  const {
    data: opportunitiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["opportunities", filters.search ?? "", filters.major ?? "all"],
    queryFn: async (): Promise<OpportunitiesResponse> => {
      const params = new URLSearchParams();
      if (filters.search?.trim()) params.set("search", filters.search.trim());
      if (filters.major && filters.major !== "all") params.set("major", filters.major);
      const res = await fetch(`/api/opportunities?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to fetch opportunities");
      }
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const opportunities = opportunitiesData?.data ?? [];
  const majors = opportunitiesData?.meta?.majors ?? [];

  const { data: trackedIds = new Set<string>(), refetch: refetchTracked } = useQuery({
    queryKey: ["application-ids"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return new Set<string>();
      return getUserApplicationIds(user.id);
    },
    staleTime: 30 * 1000,
  });

  const toggleTrack = useCallback(
    async (opportunityId: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }
      const isTracked = trackedIds.has(opportunityId);
      if (isTracked) {
        const { error } = await untrackOpportunity(user.id, opportunityId);
        if (error) throw error;
      } else {
        const { error } = await trackOpportunity(user.id, opportunityId);
        if (error) throw error;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["application-ids"] }),
        queryClient.invalidateQueries({ queryKey: ["opportunities"] }),
      ]);
      refetchTracked();
    },
    [trackedIds, queryClient, refetchTracked]
  );

  return {
    opportunities,
    majors,
    isLoading,
    error,
    refetch,
    trackedIds,
    toggleTrack,
  };
}
