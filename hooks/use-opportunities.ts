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
  /** Legacy: single major (used if filterState.majors not provided). */
  major?: string;
  /** Legacy: single discipline (used if filterState not provided). */
  discipline?: string;
  /** New multi-select filter state; takes precedence over major/discipline. */
  filterState?: {
    majors: string[];
    disciplines: string[];
    whoCanJoin: string[];
    timeCommitments: string[];
    sources?: string[];
  };
}

/** User's tracking status for a single opportunity. */
export type OpportunityUserStatus =
  | null // never saved
  | { stage: string } // in pipeline
  | { isResearch: true }; // active research

/** Opportunity enriched with the current user's tracking status. */
export type OpportunityWithStatus = Opportunity & {
  userStatus: OpportunityUserStatus;
};

interface OpportunitiesResponse {
  data: OpportunityWithStatus[];
  meta: {
    majors: string[];
    disciplines: string[];
    whoCanJoin: string[];
    timeCommitments: string[];
  };
}

function buildQueryParams(filters: UseOpportunitiesFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  const state = filters.filterState;
  if (state) {
    if (state.majors.length) params.set("majors", state.majors.join(","));
    if (state.disciplines.length) params.set("disciplines", state.disciplines.join(","));
    if (state.whoCanJoin.length) params.set("whoCanJoin", state.whoCanJoin.join(","));
    if (state.timeCommitments.length)
      params.set("timeCommitments", state.timeCommitments.join(","));
    if (state.sources?.length) state.sources.forEach((s) => params.append("source", s));
  } else {
    if (filters.major && filters.major !== "all") params.set("major", filters.major);
    if (filters.discipline && filters.discipline !== "all")
      params.set("discipline", filters.discipline);
  }
  return params;
}

export function useOpportunities(filters: UseOpportunitiesFilters = {}) {
  const queryClient = useQueryClient();
  const queryKey = [
    "opportunities",
    filters.search ?? "",
    filters.filterState
      ? JSON.stringify(filters.filterState)
      : `${filters.major ?? "all"}-${filters.discipline ?? "all"}`,
  ];

  const {
    data: opportunitiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<OpportunitiesResponse> => {
      const params = buildQueryParams(filters);
      const res = await fetch(`/api/opportunities?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to fetch opportunities");
      }
      const data = await res.json();
      return {
        data: data.data,
        meta: {
          majors: data.meta?.majors ?? [],
          disciplines: data.meta?.disciplines ?? [],
          whoCanJoin: data.meta?.whoCanJoin ?? [],
          timeCommitments: data.meta?.timeCommitments ?? [],
        },
      };
    },
    staleTime: 60 * 1000,
  });

  const opportunities = opportunitiesData?.data ?? [];
  const majors = opportunitiesData?.meta?.majors ?? [];
  const disciplines = opportunitiesData?.meta?.disciplines ?? [];
  const whoCanJoin = opportunitiesData?.meta?.whoCanJoin ?? [];
  const timeCommitments = opportunitiesData?.meta?.timeCommitments ?? [];

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
      let didEnablePipeline = false;
      if (isTracked) {
        const { error } = await untrackOpportunity(user.id, opportunityId);
        if (error) throw error;
      } else {
        const { error, didEnablePipeline: enabled } = await trackOpportunity(user.id, opportunityId);
        if (error) throw error;
        didEnablePipeline = Boolean(enabled);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["application-ids"] }),
        queryClient.invalidateQueries({ queryKey: ["opportunities"] }),
      ]);
      refetchTracked();

      return { isTracked: !isTracked, didEnablePipeline };
    },
    [trackedIds, queryClient, refetchTracked]
  );

  return {
    opportunities,
    majors,
    disciplines,
    whoCanJoin,
    timeCommitments,
    meta: opportunitiesData?.meta
      ? {
          majors,
          disciplines,
          whoCanJoin,
          timeCommitments,
        }
      : undefined,
    isLoading,
    error,
    refetch,
    trackedIds,
    toggleTrack,
  };
}
