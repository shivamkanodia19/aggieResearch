"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Sparkles, Loader2, Tags, User, BellRing } from "lucide-react";
import { ApplicationStatsCard } from "@/components/settings/ApplicationStatsCard";
import { EmailPreferencesCard } from "@/components/settings/EmailPreferencesCard";
import { PrivacyDataCard } from "@/components/settings/PrivacyDataCard";
import { AppearanceCard } from "@/components/settings/AppearanceCard";

async function fetchProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data as Profile;
}

async function updateProfile(updates: Partial<Profile>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;
}

async function runSummarizeBackfill(): Promise<{ summarized: number; failed: number; message: string }> {
  const res = await fetch("/api/opportunities/summarize-backfill", {
    method: "POST",
    credentials: "same-origin",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

async function runDisciplinesBackfill(): Promise<{ tagged: number; total: number; message: string }> {
  const res = await fetch("/api/opportunities/disciplines-backfill", {
    method: "POST",
    credentials: "same-origin",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [classification, setClassification] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [backfillMessage, setBackfillMessage] = useState<string | null>(null);
  const [disciplinesMessage, setDisciplinesMessage] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setMajor(profile.major || "");
      setClassification(profile.classification || "");
      setInterests(profile.interests || []);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      alert("Profile updated successfully!");
    },
  });

  const backfillMutation = useMutation({
    mutationFn: runSummarizeBackfill,
    onSuccess: (data) => {
      setBackfillMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
    onError: (err: Error) => {
      setBackfillMessage(err.message);
    },
  });

  const disciplinesMutation = useMutation({
    mutationFn: runDisciplinesBackfill,
    onSuccess: (data) => {
      setDisciplinesMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
    onError: (err: Error) => {
      setDisciplinesMessage(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: name || null,
      major: major || null,
      classification: classification || null,
      interests,
    });
  };

  const handleAddInterest = () => {
    const value = newInterest.trim();
    if (!value) return;
    if (interests.includes(value)) {
      setNewInterest("");
      return;
    }
    setInterests((prev) => [...prev, value]);
    setNewInterest("");
  };

  const ReminderToggle = ({
    storageKey,
    label,
  }: {
    storageKey: string;
    label: string;
  }) => {
    const [checked, setChecked] = useState<boolean>(() => {
      if (typeof window === "undefined") return true;
      const stored = window.localStorage.getItem(storageKey);
      if (stored === null) return true;
      return stored === "true";
    });

    const handleToggle = () => {
      setChecked((prev) => {
        const next = !prev;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, String(next));
        }
        return next;
      });
    };

    return (
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-4 rounded-lg bg-muted/50 p-4 text-left"
      >
        <span className="text-sm text-foreground">{label}</span>
        <span
          className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            checked ? "bg-maroon-900" : "bg-gray-300 dark:bg-gray-600"
          }`}
          aria-hidden="true"
        >
          <span
            className={`ml-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : ""
            }`}
          />
        </span>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Personalize your profile, notifications, and preferences to support your research journey.
        </p>
      </div>

      {/* 1. Profile */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-maroon-700" />
            Profile
          </CardTitle>
          <CardDescription>
            Confirm who you are and keep your details up to date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classification">Classification</Label>
              <Select value={classification} onValueChange={setClassification}>
                <SelectTrigger>
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Freshman">Freshman</SelectItem>
                  <SelectItem value="Sophomore">Sophomore</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">Research interests</Label>
              <div className="flex flex-wrap gap-2">
                {interests.length > 0 ? (
                  interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      <span className="truncate">{interest}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setInterests((prev) =>
                            prev.filter((value) => value !== interest),
                          )
                        }
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${interest}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Add a few topics so we can recommend better opportunities.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  id="interests"
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="e.g., Machine Learning, Neuroscience"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleAddInterest}
                  disabled={!newInterest.trim()}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;ll save your interests when you update your profile.
              </p>
            </div>
            <Button type="submit" className="rounded-lg" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. Email Notifications */}
      <EmailPreferencesCard />

      {/* 3. Research Reminders */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellRing className="h-5 w-5 text-maroon-700" />
            Research Reminders
          </CardTitle>
          <CardDescription>
            Gentle nudges to keep you applying and celebrating wins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ReminderToggle
            storageKey="remindNoAppsThisMonth"
            label="Remind me to apply if I haven't sent any applications this month"
          />
          <ReminderToggle
            storageKey="suggestWeeklyOpportunities"
            label="Suggest new opportunities for me each week"
          />
          <ReminderToggle
            storageKey="celebrateMilestones"
            label="Celebrate milestones like my first application or first acceptance"
          />
        </CardContent>
      </Card>

      {/* 4. Preferences */}
      <AppearanceCard />

      {/* 5. Your Activity */}
      <ApplicationStatsCard />

      {/* 6. Advanced tools: AI summaries */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-maroon-700" />
            AI summaries
          </CardTitle>
          <CardDescription>
            Generate short AI summaries for opportunities that don&apos;t have one yet. This can take a minute if there are many.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={backfillMutation.isPending}
            onClick={() => {
              setBackfillMessage(null);
              backfillMutation.mutate();
            }}
          >
            {backfillMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate AI summaries for opportunities"
            )}
          </Button>
          {backfillMessage && (
            <p className={`text-sm ${backfillMutation.isError ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
              {backfillMessage}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 7. Advanced tools: Technical disciplines */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tags className="h-5 w-5 text-maroon-700" />
            Technical disciplines
          </CardTitle>
          <CardDescription>
            Tag opportunities with disciplines (engineering subfields, medicine, animal science, etc.) using Groq. Enables discipline filters on the Opportunities page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={disciplinesMutation.isPending}
            onClick={() => {
              setDisciplinesMessage(null);
              disciplinesMutation.mutate();
            }}
          >
            {disciplinesMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tagging…
              </>
            ) : (
              "Tag opportunities with disciplines"
            )}
          </Button>
          {disciplinesMessage && (
            <p className={`text-sm ${disciplinesMutation.isError ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
              {disciplinesMessage}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 8. Account actions */}
      <PrivacyDataCard />
    </div>
  );
}
