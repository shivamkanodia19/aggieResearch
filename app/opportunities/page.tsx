"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Opportunity } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";

async function fetchOpportunities(search?: string) {
  const supabase = createClient();
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "Recruiting")
    .order("created_at", { ascending: false })
    .limit(50);

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,leader_name.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Opportunity[];
}

async function trackOpportunity(opportunityId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    opportunity_id: opportunityId,
    stage: "Saved",
  });

  if (error) throw error;
}

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: opportunities, isLoading, refetch } = useQuery({
    queryKey: ["opportunities", debouncedSearch],
    queryFn: () => fetchOpportunities(debouncedSearch || undefined),
  });

  const handleTrack = async (opportunityId: string) => {
    try {
      await trackOpportunity(opportunityId);
      refetch();
    } catch (error) {
      console.error("Failed to track opportunity:", error);
      alert("Failed to track opportunity. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tamu-maroon">
            Research Opportunities
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and track research positions at TAMU
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading opportunities...
        </div>
      ) : !opportunities || opportunities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No opportunities found. Try adjusting your search.
        </div>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opp) => (
            <Card key={opp.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{opp.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {opp.leader_department && (
                        <span className="font-medium">{opp.leader_department}</span>
                      )}
                      {opp.who_can_join && opp.who_can_join.length > 0 && (
                        <span className="mx-2">•</span>
                      )}
                      {opp.who_can_join && opp.who_can_join.join(", ")}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleTrack(opp.id)}
                    size="sm"
                    className="ml-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {opp.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {opp.description}
                  </p>
                )}
                {opp.leader_email && (
                  <p className="text-sm text-muted-foreground">
                    Contact: {opp.leader_name || "N/A"} ({opp.leader_email})
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
