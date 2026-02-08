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
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, Plus } from "lucide-react";
import { PipelineColumn, ACTIVE_STAGES } from "@/components/pipeline/PipelineColumn";
import { OutcomeSection } from "@/components/pipeline/OutcomeSection";
import { PipelineCard, PipelineCardPreview } from "@/components/pipeline/PipelineCard";
import { AcceptedPrompt } from "@/components/pipeline/AcceptedPrompt";
import { ApplicationSidePanel } from "@/components/pipeline/ApplicationSidePanel";

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

async function updateApplicationStage(
  applicationId: string,
  stage: ApplicationStage
) {
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

export default function PipelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationWithOpportunity | null>(null);
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-events", id] });
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
    if (ACTIVE_STAGES.includes(overId as ApplicationStage) || overId === "Accepted" || overId === "Rejected" || overId === "Withdrawn") {
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
    updateStageMutation.mutate(
      { id: applicationId, stage },
      {
        onSuccess: () => {
          if (stage === "Accepted") {
            const app = applications?.find((a) => a.id === applicationId);
            if (app?.opportunity) {
              setShowAcceptedPrompt({
                opportunityId: app.opportunity.id,
                title: app.opportunity.title || "Research Position",
                piName: app.opportunity.leader_name ?? null,
              });
            }
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-600">
        Loading your applications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header – mockup style */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/opportunities"
            className="flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-maroon-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Application Pipeline
          </h1>
        </div>
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-2 rounded-lg bg-maroon-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-maroon-700"
        >
          <Plus className="h-4 w-4" />
          Add Opportunity
        </Link>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* 4-column pipeline */}
          <div
            className={cn(
              "mb-6 grid grid-cols-1 gap-4 transition-all sm:grid-cols-2 lg:grid-cols-4",
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
          ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeApplication ? (
              <PipelineCardPreview application={activeApplication} />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Outcomes: outside DndContext so "Add to My Research" clicks aren't captured by drag layer */}
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

      <ApplicationSidePanel
        application={selectedApplication}
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onStageChange={(applicationId, stage) => {
          updateStageMutation.mutate(
            { id: applicationId, stage },
            {
              onSuccess: () => {
                if (stage === "Accepted") {
                  const app = applications?.find((a) => a.id === applicationId);
                  if (app?.opportunity) {
                    setShowAcceptedPrompt({
                      opportunityId: app.opportunity.id,
                      title: app.opportunity.title || "Research Position",
                      piName: app.opportunity.leader_name ?? null,
                    });
                  }
                }
              },
            }
          );
        }}
        onRemove={(applicationId) => {
          updateStageMutation.mutate(
            { id: applicationId, stage: "Withdrawn" },
            { onSuccess: () => setSelectedApplication(null) }
          );
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
