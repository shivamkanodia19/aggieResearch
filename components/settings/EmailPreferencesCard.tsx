"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { EmailPreferences } from "@/lib/types/database";

async function fetchEmailPreferences(): Promise<EmailPreferences> {
  const res = await fetch("/api/user/email-preferences", {
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error("Failed to fetch preferences");
  return res.json();
}

async function updateEmailPreferences(
  prefs: EmailPreferences
): Promise<EmailPreferences> {
  const res = await fetch("/api/user/email-preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error("Failed to save preferences");
  return res.json();
}

const PREF_ITEMS: {
  key: keyof EmailPreferences;
  title: string;
  description: string;
}[] = [
  {
    key: "newOpportunities",
    title: "New opportunity matches",
    description: "Get notified when new opportunities match your interests",
  },
  {
    key: "followUpReminders",
    title: "Follow-up reminders",
    description: "Reminds you to follow up if no response after 2 weeks",
  },
  {
    key: "deadlineReminders",
    title: "Deadline reminders",
    description: "Get notified 3 days before application deadlines",
  },
  {
    key: "weeklyDigest",
    title: "Weekly digest",
    description: "Summary of new opportunities every Monday",
  },
  {
    key: "responseNotifications",
    title: "Response notifications",
    description: "Get notified when professors respond to your emails",
  },
];

function Toggle({
  checked,
  onToggle,
  disabled,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-maroon-900" : "bg-gray-300 dark:bg-gray-600",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5"
        )}
      />
    </label>
  );
}

export function EmailPreferencesCard() {
  const queryClient = useQueryClient();
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["email-preferences"],
    queryFn: fetchEmailPreferences,
  });

  const saveMutation = useMutation({
    mutationFn: updateEmailPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(["email-preferences"], data);
    },
  });

  const handleToggle = (key: keyof EmailPreferences) => {
    if (!preferences) return;
    const next = { ...preferences, [key]: !preferences[key] };
    saveMutation.mutate(next);
  };

  if (isLoading || !preferences) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-maroon-700" />
            Email Reminders & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading preferences…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-maroon-700" />
          Email Reminders & Notifications
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Stay updated on your research applications
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {PREF_ITEMS.map(({ key, title, description }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground">{title}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
            <Toggle
              checked={!!preferences[key]}
              onToggle={() => handleToggle(key)}
              disabled={saveMutation.isPending}
            />
          </div>
        ))}
        {saveMutation.isPending && (
          <p className="text-xs italic text-muted-foreground">Saving…</p>
        )}
      </CardContent>
    </Card>
  );
}
