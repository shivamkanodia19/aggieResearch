"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export interface ApplicationStats {
  totalSaved: number;
  totalContacted: number;
  totalResponded: number;
  saved: number;
  contacted: number;
  responded: number;
  interview: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  responseRate: string;
}

async function fetchStats(): Promise<ApplicationStats> {
  const res = await fetch("/api/user/stats", { credentials: "same-origin" });
  if (!res.ok) throw new Error("Failed to fetch statistics");
  return res.json();
}

export function ApplicationStatsCard() {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-maroon-700" />
            Your Activity
          </CardTitle>
          <CardDescription>
            Checking your recent research activity…
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isError || !stats) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-maroon-700" />
            Your Activity
          </CardTitle>
          <CardDescription>
            We couldn&apos;t load your activity right now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/opportunities">Browse opportunities</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasActivity =
    stats.totalSaved > 0 ||
    stats.totalContacted > 0 ||
    stats.totalResponded > 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-maroon-700" />
          Your Activity
        </CardTitle>
        <CardDescription>
          A quick snapshot of how you&apos;re using Aggie Research.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasActivity ? (
          <div className="space-y-2 text-sm">
            <p className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2">
              <span className="text-muted-foreground">Opportunities saved</span>
              <span className="font-semibold text-foreground">
                {stats.totalSaved}
              </span>
            </p>
            <p className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2">
              <span className="text-muted-foreground">Applications sent</span>
              <span className="font-semibold text-foreground">
                {stats.totalContacted}
              </span>
            </p>
            <p className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2">
              <span className="text-muted-foreground">Responses received</span>
              <span className="font-semibold text-foreground">
                {stats.totalResponded}
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              You haven&apos;t saved any opportunities or sent applications
              yet.
            </p>
            <p className="text-muted-foreground">
              Just getting started? Begin by exploring opportunities that match
              your interests.
            </p>
            <Button asChild className="rounded-lg">
              <Link href="/opportunities">Browse opportunities</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
