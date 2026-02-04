"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ApplicationWithOpportunity, ApplicationStage } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const STAGES: ApplicationStage[] = [
  "Saved",
  "First Email",
  "Responded",
  "Interview",
  "Accepted",
  "Rejected",
  "Withdrawn",
];

async function fetchApplications() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      opportunity:opportunities(*)
    `)
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

  // Create timeline event
  await supabase.from("application_events").insert({
    application_id: applicationId,
    stage,
    notes: `Moved to ${stage}`,
  });
}

export default function PipelinePage() {
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: ApplicationStage }) =>
      updateApplicationStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const applicationsByStage = applications?.reduce(
    (acc, app) => {
      if (!acc[app.stage]) acc[app.stage] = [];
      acc[app.stage].push(app);
      return acc;
    },
    {} as Record<ApplicationStage, ApplicationWithOpportunity[]>
  ) || {};

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading your applications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-tamu-maroon">
          Application Pipeline
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your research opportunity applications
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't tracked any opportunities yet.
            </p>
            <Link href="/opportunities">
              <Button>Browse Opportunities</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((stage) => {
            const stageApps = applicationsByStage[stage] || [];
            return (
              <div key={stage} className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-lg">{stage}</h2>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {stageApps.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageApps.map((app) => (
                    <Card key={app.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-2">
                          {app.opportunity?.title || "Unknown Opportunity"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {app.opportunity?.leader_department && (
                          <p className="text-xs text-muted-foreground">
                            {app.opportunity.leader_department}
                          </p>
                        )}
                        <Select
                          value={app.stage}
                          onValueChange={(value) =>
                            updateStageMutation.mutate({
                              id: app.id,
                              stage: value as ApplicationStage,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Link href={`/applications/${app.id}`}>
                          <Button variant="ghost" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
