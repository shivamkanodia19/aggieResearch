"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getOpportunities,
  trackOpportunity,
  untrackOpportunity,
  getUserApplicationIds,
} from "@/lib/supabase/queries";
import type { Opportunity } from "@/lib/types/database";

export interface UseOpportunitiesFilters {
  search?: string;
  field?: string;
}

export function useOpportunities(filters: UseOpportunitiesFilters = {}) {
  const queryClient = useQueryClient();

  const { data: opportunities = [], isLoading, error, refetch } = useQuery({
    queryKey: ["opportunities", filters.search ?? "", filters.field ?? "all"],
    queryFn: async () => {
      const { data, error } = await getOpportunities({
        search: filters.search || undefined,
        field: filters.field || undefined,
      });
      if (error) throw error;
      return (data ?? []) as Opportunity[];
    },
    staleTime: 60 * 1000,
  });

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
    isLoading,
    error,
    refetch,
    trackedIds,
    toggleTrack,
  };
}
