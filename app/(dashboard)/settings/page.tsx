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
import { User, Mail } from "lucide-react";
import { ApplicationStatsCard } from "@/components/settings/ApplicationStatsCard";
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

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [classification, setClassification] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [bio, setBio] = useState("");
  const [graduationYear, setGraduationYear] = useState<string>("");
  const [emailEnabled, setEmailEnabled] = useState(true);

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
      setBio(profile.bio || "");
      setGraduationYear(profile.graduation_year ? String(profile.graduation_year) : "");
      setEmailEnabled(profile.email_notifications_enabled !== false);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      alert("Profile updated successfully!");
    },
  });

  const emailToggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await fetch("/api/user/email-toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onMutate: async (enabled) => {
      setEmailEnabled(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      // Revert on error
      setEmailEnabled((prev) => !prev);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: name || null,
      major: major || null,
      classification: classification || null,
      interests,
      bio: bio.trim() || null,
      graduation_year: graduationYear ? parseInt(graduationYear, 10) : null,
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
          Personalize your profile, notifications, and preferences.
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
              <Label htmlFor="graduation_year">Expected graduation year</Label>
              <Input
                id="graduation_year"
                type="number"
                min={2024}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g., 2027"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">One-sentence bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={280}
                rows={2}
                placeholder="e.g., I'm a sophomore interested in machine learning and computational biology, with experience in Python and data analysis."
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Used by the email generator to personalize outreach to PIs. Keep it to one sentence.
              </p>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
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
                We&apos;ll notify you when new opportunities match these interests.
              </p>
            </div>
            <Button type="submit" className="rounded-lg" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. Email Notifications */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-maroon-700" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Get notified about new research opportunities and important platform updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => emailToggleMutation.mutate(!emailEnabled)}
            disabled={emailToggleMutation.isPending}
            className="flex w-full items-center justify-between gap-4 rounded-lg bg-muted/50 p-4 text-left"
          >
            <div>
              <span className="text-sm font-medium text-foreground">
                Enable email notifications
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {emailEnabled ? "You'll receive emails from us" : "All emails are paused"}
              </p>
            </div>
            <span
              className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                emailEnabled ? "bg-maroon-900" : "bg-gray-300 dark:bg-gray-600"
              }`}
              aria-hidden="true"
            >
              <span
                className={`ml-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  emailEnabled ? "translate-x-5" : ""
                }`}
              />
            </span>
          </button>

          {emailEnabled && (
            <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground space-y-1.5">
              <p>When enabled, you&apos;ll receive:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>New opportunities matching your interests</li>
                <li>Important platform updates and announcements</li>
                <li>Weekly log reminders (set per-position in My Research)</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Preferences */}
      <AppearanceCard />

      {/* 4. Your Activity */}
      <ApplicationStatsCard />

      {/* 5. Account actions */}
      <PrivacyDataCard />
    </div>
  );
}
