"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ApplicationWithOpportunity, ApplicationStage } from "@/lib/types/database";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PipelineColumn, ACTIVE_STAGES } from "@/components/pipeline/PipelineColumn";
import { OutcomeSection } from "@/components/pipeline/OutcomeSection";
import { PipelineCardPreview } from "@/components/pipeline/PipelineCard";
import { AcceptedPrompt } from "@/components/pipeline/AcceptedPrompt";
import { ApplicationSidePanel } from "@/components/pipeline/ApplicationSidePanel";
import { RejectionToast } from "@/components/pipeline/RejectionToast";

async function fetchApplications(): Promise<ApplicationWithOpportunity[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("applications")
    .select(`*, opportunity:opportunities(*)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ApplicationWithOpportunity[];
}

async function updateApplicationStage(applicationId: string, stage: ApplicationStage) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("applications")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .eq("user_id", user.id);
  if (error) throw error;
  await supabase.from("application_events").insert({
    application_id: applicationId,
    stage,
    notes: `Moved to ${stage}`,
  });
}

/** Permanently delete an application (unsave / remove from pipeline). */
async function deleteApplication(applicationId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", user.id);
  if (error) throw error;
}

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationWithOpportunity | null>(null);
  const [rejectionToast, setRejectionToast] = useState<{
    applicationId: string;
    previousStage: ApplicationStage;
  } | null>(null);
  const [showAcceptedPrompt, setShowAcceptedPrompt] = useState<{
    opportunityId: string;
    title: string;
    piName: string | null;
    /** When true, modal auto-starts "Start Tracking" (e.g. from card button). */
    autoStart?: boolean;
  } | null>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: ApplicationStage }) =>
      updateApplicationStage(id, stage),
    onMutate: async ({ id, stage }) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["applications"] });
      const previous = queryClient.getQueryData<ApplicationWithOpportunity[]>(["applications"]);
      queryClient.setQueryData<ApplicationWithOpportunity[]>(["applications"], (old) =>
        old?.map((app) =>
          app.id === id ? { ...app, stage, updated_at: new Date().toISOString() } : app
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Roll back on failure
      if (context?.previous) {
        queryClient.setQueryData(["applications"], context.previous);
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-events", id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (applicationId: string) => deleteApplication(applicationId),
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: ["applications"] });
      const previous = queryClient.getQueryData<ApplicationWithOpportunity[]>(["applications"]);
      queryClient.setQueryData<ApplicationWithOpportunity[]>(["applications"], (old) =>
        old?.filter((app) => app.id !== applicationId)
      );
      setSelectedApplication(null);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["applications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-ids"] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });

  // Keep selected application in sync when applications refetch (e.g. after stage change)
  useEffect(() => {
    if (selectedApplication && applications) {
      const updated = applications.find((a) => a.id === selectedApplication.id);
      if (updated && updated !== selectedApplication) {
        setSelectedApplication(updated);
      }
    }
  }, [applications, selectedApplication]);

  // Open side panel when arriving with ?applicationId= (e.g. from /applications/[id] redirect)
  const applicationIdFromUrl = searchParams.get("applicationId");
  useEffect(() => {
    if (!applicationIdFromUrl || !applications?.length) return;
    const app = applications.find((a) => a.id === applicationIdFromUrl);
    if (app) setSelectedApplication(app);
  }, [applicationIdFromUrl, applications]);

  const applicationsByStage = useMemo(() => {
    const empty = ACTIVE_STAGES.reduce(
      (acc, s) => {
        acc[s] = [];
        return acc;
      },
      {} as Record<ApplicationStage, ApplicationWithOpportunity[]>
    );
    empty.Accepted = [];
    empty.Rejected = [];
    empty.Withdrawn = [];
    if (!applications) return empty;
    applications.forEach((app) => {
      if (!empty[app.stage]) empty[app.stage] = [];
      empty[app.stage].push(app);
    });
    return empty;
  }, [applications]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const over = event.over;
    const active = event.active;
    if (!over || active.id === over.id) return;
    const overId = String(over.id);
    const activeData = active.data.current;
    if (activeData?.type !== "application") return;
    const app = activeData.application as ApplicationWithOpportunity;
    if (
      ACTIVE_STAGES.includes(overId as ApplicationStage) ||
      overId === "Accepted" ||
      overId === "Rejected" ||
      overId === "Withdrawn"
    ) {
      updateStageMutation.mutate(
        { id: app.id, stage: overId as ApplicationStage },
        {
          onSuccess: () => {
            // Show prompt when moved to Accepted
            if (overId === "Accepted" && app.opportunity) {
              setShowAcceptedPrompt({
                opportunityId: app.opportunity.id,
                title: app.opportunity.title || "Research Position",
                piName: app.opportunity.leader_name,
              });
            }
          },
        }
      );
    }
  };

  const activeApplication = useMemo(() => {
    if (!activeId || !applications) return null;
    return applications.find((a) => a.id === activeId) ?? null;
  }, [activeId, applications]);

  const handleStageChange = (applicationId: string, stage: ApplicationStage) => {
    updateStageMutation.mutate({ id: applicationId, stage });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-8">
          <Skeleton className="h-7 w-44" />
        </div>
        <div className="p-3 sm:p-6 lg:p-8">
          <div className="hidden md:grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
          <div className="md:hidden flex gap-3 overflow-hidden">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[300px] w-[270px] shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:py-4 sm:px-8">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/opportunities"
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-maroon-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">My Applications</h1>
        </div>
        <Link
          href="/opportunities"
          data-tutorial="add-opportunity-btn"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-maroon-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-maroon-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Opportunity
        </Link>
      </header>

      <main className="p-3 sm:p-6 lg:p-8">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* On mobile: scrollable horizontal kanban; on desktop: grid */}
          <div className="md:hidden mb-6 overflow-x-auto scrollbar-hide -mx-3 px-3">
            <div
              data-tutorial="pipeline-stages"
              className={cn(
                "flex gap-3 transition-all",
                selectedApplication && "brightness-[0.7] pointer-events-none"
              )}
              style={{ minWidth: `${ACTIVE_STAGES.length * 280}px` }}
            >
              {ACTIVE_STAGES.map((stage, index) => (
                <div key={stage} className="w-[270px] shrink-0">
                  <PipelineColumn
                    stage={stage}
                    applications={applicationsByStage[stage] ?? []}
                    filledDots={index + 1}
                    onStageChange={handleStageChange}
                    disabled={updateStageMutation.isPending}
                    selectedApplicationId={selectedApplication?.id ?? null}
                    onOpenSidePanel={setSelectedApplication}
                    onRejectedWithUndo={(applicationId, previousStage) => {
                      setRejectionToast({ applicationId, previousStage });
                    }}
                    onAcceptedToTracking={(opportunityId, meta) => {
                      const app = applications?.find(
                        (a) =>
                          a.opportunity?.id === opportunityId || a.opportunity_id === opportunityId
                      );
                      setShowAcceptedPrompt({
                        opportunityId,
                        title: meta?.title ?? app?.opportunity?.title ?? "Research Position",
                        piName: meta?.piName ?? app?.opportunity?.leader_name ?? null,
                        autoStart: true,
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop grid */}
          <div
            data-tutorial="pipeline-stages"
            className={cn(
              "hidden md:grid mb-6 grid-cols-2 gap-4 transition-all lg:grid-cols-4",
              selectedApplication && "brightness-[0.7] pointer-events-none"
            )}
          >
            {ACTIVE_STAGES.map((stage, index) => (
              <PipelineColumn
                key={stage}
                stage={stage}
                applications={applicationsByStage[stage] ?? []}
                filledDots={index + 1}
                onStageChange={handleStageChange}
                disabled={updateStageMutation.isPending}
                selectedApplicationId={selectedApplication?.id ?? null}
                onOpenSidePanel={setSelectedApplication}
                onRejectedWithUndo={(applicationId, previousStage) => {
                  setRejectionToast({ applicationId, previousStage });
                }}
                onAcceptedToTracking={(opportunityId, meta) => {
                  const app = applications?.find(
                    (a) =>
                      a.opportunity?.id === opportunityId || a.opportunity_id === opportunityId
                  );
                  setShowAcceptedPrompt({
                    opportunityId,
                    title: meta?.title ?? app?.opportunity?.title ?? "Research Position",
                    piName: meta?.piName ?? app?.opportunity?.leader_name ?? null,
                    autoStart: true,
                  });
                }}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeApplication ? <PipelineCardPreview application={activeApplication} /> : null}
          </DragOverlay>
        </DndContext>

        <OutcomeSection
          applicationsByStage={applicationsByStage}
          onOpenApplication={setSelectedApplication}
          onAddToResearch={(app) => {
            const opportunityId = app.opportunity?.id ?? app.opportunity_id;
            if (opportunityId) {
              setShowAcceptedPrompt({
                opportunityId,
                title: app.opportunity?.title ?? "Research Position",
                piName: app.opportunity?.leader_name ?? null,
              });
            }
          }}
        />
      </main>

      {showAcceptedPrompt && (
        <AcceptedPrompt
          opportunityId={showAcceptedPrompt.opportunityId}
          opportunityTitle={showAcceptedPrompt.title}
          piName={showAcceptedPrompt.piName}
          autoStart={showAcceptedPrompt.autoStart}
          onClose={() => setShowAcceptedPrompt(null)}
        />
      )}

      <RejectionToast
        rejection={rejectionToast}
        onUndo={(applicationId, previousStage) => {
          updateStageMutation.mutate(
            { id: applicationId, stage: previousStage },
            { onSettled: () => setRejectionToast(null) }
          );
        }}
        onDismiss={() => setRejectionToast(null)}
      />

      <ApplicationSidePanel
        application={selectedApplication}
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onStageChange={(applicationId, stage) => {
          updateStageMutation.mutate({ id: applicationId, stage });
        }}
        onRejectedWithUndo={(applicationId, previousStage) => {
          setRejectionToast({ applicationId, previousStage });
        }}
        onRemove={(applicationId) => {
          deleteMutation.mutate(applicationId);
        }}
        onAcceptedToTracking={(opportunityId, meta) => {
          const app = applications?.find(
            (a) => a.opportunity?.id === opportunityId || a.opportunity_id === opportunityId
          );
          setShowAcceptedPrompt({
            opportunityId,
            title: meta?.title ?? app?.opportunity?.title ?? "Research Position",
            piName: meta?.piName ?? app?.opportunity?.leader_name ?? null,
            autoStart: true,
          });
        }}
      />
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-gray-600">
          Loading...
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}

