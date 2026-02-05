"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ApplicationWithOpportunity, ApplicationStage, Priority } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

const STAGES: ApplicationStage[] = [
  "Saved",
  "First Email",
  "Responded",
  "Interview",
  "Accepted",
  "Rejected",
  "Withdrawn",
];

const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

async function fetchApplication(id: string) {
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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data as ApplicationWithOpportunity;
}

async function fetchApplicationEvents(applicationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("application_events")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

async function updateApplication(
  id: string,
  updates: {
    stage?: ApplicationStage;
    priority?: Priority;
    notes?: string;
  }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("applications")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  if (updates.stage) {
    await supabase.from("application_events").insert({
      application_id: id,
      stage: updates.stage,
      notes: `Moved to ${updates.stage}`,
    });
  }
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const { data: application, isLoading } = useQuery({
    queryKey: ["application", params.id],
    queryFn: () => fetchApplication(params.id as string),
  });

  const { data: events } = useQuery({
    queryKey: ["application-events", params.id],
    queryFn: () => fetchApplicationEvents(params.id as string),
    enabled: !!params.id,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: {
      stage?: ApplicationStage;
      priority?: Priority;
      notes?: string;
    }) => updateApplication(params.id as string, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", params.id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-events", params.id] });
    },
  });

  const handleSaveNotes = async () => {
    if (!application) return;
    setIsSavingNotes(true);
    await updateMutation.mutateAsync({ notes });
    setIsSavingNotes(false);
  };

  const copyEmail = () => {
    if (application?.opportunity?.leader_email) {
      navigator.clipboard.writeText(application.opportunity.leader_email);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading application details...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Application not found</p>
        <Button onClick={() => router.push("/pipeline")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pipeline
        </Button>
      </div>
    );
  }

  const opp = application.opportunity;

  return (
    <div className="max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => router.push("/pipeline")}
        className="mb-4 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-maroon-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pipeline
      </button>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">{opp?.title || "Unknown"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Stage</Label>
              <Select
                value={application.stage}
                onValueChange={(value) =>
                  updateMutation.mutate({ stage: value as ApplicationStage })
                }
              >
                <SelectTrigger>
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
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={application.priority}
                onValueChange={(value) =>
                  updateMutation.mutate({ priority: value as Priority })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {opp?.leader_email && (
            <div>
              <Label>Contact</Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm">
                  {opp.leader_name || "N/A"} ({opp.leader_email})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyEmail}
                  className="h-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(`mailto:${opp.leader_email}`, "_blank")
                  }
                  className="h-8"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {opp?.source_url && (
            <div>
              <Button
                variant="outline"
                onClick={() => window.open(opp.source_url!, "_blank")}
              >
                View Original Posting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Add or edit notes</Label>
            <textarea
              className="w-full min-h-[150px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={notes || application.notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this application..."
            />
          </div>
          <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
            {isSavingNotes ? "Saving..." : "Save Notes"}
          </Button>
        </CardContent>
      </Card>

      {events && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-tamu-maroon mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {event.stage || "Event"}
                    </p>
                    {event.notes && (
                      <p className="text-sm text-muted-foreground">
                        {event.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {opp && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {opp.description && (
              <div>
                <Label className="text-sm font-semibold">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {opp.description}
                </p>
              </div>
            )}
            {opp.team_needs && (
              <div>
                <Label className="text-sm font-semibold">Team Needs</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {opp.team_needs}
                </p>
              </div>
            )}
            {opp.who_can_join && opp.who_can_join.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Who Can Join</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {opp.who_can_join.join(", ")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
