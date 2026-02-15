"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/recommendations/ResumeUploader";
import { RecommendationsList } from "@/components/recommendations/RecommendationsList";
import type { StudentProfile } from "@/lib/resume-parser";
import type { MatchResult } from "@/lib/match-opportunities";
import { Loader2 } from "lucide-react";

export default function RecommendationsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const handleProfileParsed = async (parsed: StudentProfile) => {
    setProfile(parsed);
    setMatches(null);
    setMatchError(null);
    setIsLoadingMatches(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: parsed, topN: 10 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get recommendations");
      setMatches(data.matches ?? []);
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : "Failed to load recommendations");
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Recommendations</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          Upload your resume to get research opportunities matched to your skills and interests.
        </p>
      </div>

      <ResumeUploader onProfileParsed={handleProfileParsed} />

      {profile && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Parsed profile
          </p>
          <p className="mt-1 text-sm text-gray-700">
            {profile.name && <span className="font-medium">{profile.name}</span>}
            {profile.major && (
              <span>
                {profile.name ? " · " : ""}
                {profile.major}
                {profile.graduationYear ? ` (${profile.graduationYear})` : ""}
              </span>
            )}
            {profile.researchInterests?.length > 0 && (
              <span className="block mt-1 text-gray-600">
                Interests: {profile.researchInterests.slice(0, 5).join(", ")}
              </span>
            )}
          </p>
        </div>
      )}

      {isLoadingMatches && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-12">
          <Loader2 className="h-6 w-6 animate-spin text-maroon-900" aria-hidden />
          <span className="text-gray-600">Finding best matches…</span>
        </div>
      )}

      {matchError && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {matchError}
        </p>
      )}

      {!isLoadingMatches && matches !== null && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Your matches</h2>
          <RecommendationsList matches={matches} />
        </div>
      )}
    </div>
  );
}
