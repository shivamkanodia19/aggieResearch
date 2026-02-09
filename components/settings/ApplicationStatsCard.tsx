"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-maroon-700" />
            Application Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading statistics…</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-maroon-700" />
          Application Statistics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your research application journey
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/60 p-4 text-center">
            <div className="text-2xl font-bold text-foreground sm:text-3xl">
              {stats.totalSaved}
            </div>
            <div className="text-xs font-medium text-muted-foreground sm:text-sm">
              Opportunities Saved
            </div>
          </div>
          <div className="rounded-lg bg-muted/60 p-4 text-center">
            <div className="text-2xl font-bold text-foreground sm:text-3xl">
              {stats.totalContacted}
            </div>
            <div className="text-xs font-medium text-muted-foreground sm:text-sm">
              Applications Sent
            </div>
          </div>
          <div className="rounded-lg bg-muted/60 p-4 text-center">
            <div className="text-2xl font-bold text-foreground sm:text-3xl">
              {stats.totalResponded}
            </div>
            <div className="text-xs font-medium text-muted-foreground sm:text-sm">
              Responses Received
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-maroon-900 to-maroon-800 p-4 text-center text-white">
            <div className="text-2xl font-bold sm:text-3xl">
              {stats.responseRate}%
            </div>
            <div className="text-xs font-medium text-white/90 sm:text-sm">
              Response Rate
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Current Pipeline
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {[
              { label: "Saved", count: stats.saved },
              { label: "Contacted", count: stats.contacted },
              { label: "Responded", count: stats.responded },
              { label: "Interview", count: stats.interview },
              {
                label: "Accepted",
                count: stats.accepted,
                success: true,
              },
              {
                label: "Rejected",
                count: stats.rejected,
                danger: true,
              },
            ].map(({ label, count, success, danger }) => (
              <div
                key={label}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                  success
                    ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900"
                    : danger
                      ? "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900"
                      : "bg-muted/60"
                }`}
              >
                <span className="font-medium text-muted-foreground">{label}</span>
                <span
                  className={`font-bold ${
                    success
                      ? "text-green-700 dark:text-green-400"
                      : danger
                        ? "text-red-700 dark:text-red-400"
                        : "text-foreground"
                  }`}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
