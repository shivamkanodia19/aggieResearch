"use client";

import { useEffect, useState } from "react";
import { OnboardingModal } from "./OnboardingModal";

export function OnboardingWrapper() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch("/api/user/onboarding");
        if (res.ok) {
          const data = await res.json();
          setShowOnboarding(!data.onboardingComplete);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkOnboarding();
  }, []);

  if (loading || !showOnboarding) return null;

  return (
    <OnboardingModal onComplete={() => setShowOnboarding(false)} />
  );
}
