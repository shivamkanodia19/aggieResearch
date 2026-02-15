"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAJORS = [
  "Agriculture",
  "Biology",
  "Biomedical Sciences",
  "Chemistry",
  "Computer Science",
  "Economics",
  "Engineering",
  "Environmental Science",
  "Health Sciences",
  "Mathematics",
  "Neuroscience",
  "Physics",
  "Psychology",
  "Other",
];

const RESEARCH_INTERESTS = [
  { id: "ai-ml", label: "AI & Machine Learning", icon: "🤖" },
  { id: "health", label: "Health & Medicine", icon: "🏥" },
  { id: "environment", label: "Environment & Sustainability", icon: "🌱" },
  { id: "data", label: "Data Science & Analytics", icon: "📊" },
  { id: "biology", label: "Biology & Life Sciences", icon: "🧬" },
  { id: "engineering", label: "Engineering & Robotics", icon: "⚙️" },
  { id: "social", label: "Social Sciences & Policy", icon: "🏛️" },
  { id: "chemistry", label: "Chemistry & Materials", icon: "⚗️" },
  { id: "physics", label: "Physics & Astronomy", icon: "🔭" },
  { id: "agriculture", label: "Agriculture & Food", icon: "🌾" },
  { id: "neuro", label: "Neuroscience & Cognition", icon: "🧠" },
  { id: "energy", label: "Energy & Resources", icon: "⚡" },
];

interface OnboardingModalProps {
  /** Called after preferences are saved — wrapper should hide the modal. */
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [major, setMajor] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ major, researchInterests: interests, emailOptIn }),
      });

      if (!res.ok) {
        throw new Error("Failed to save onboarding data");
      }

      // Dismiss modal immediately, then soft-navigate to filtered opportunities
      onComplete();
      router.push(`/opportunities?major=${encodeURIComponent(major)}`);
      router.refresh();
    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("Failed to save your preferences. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 shrink-0">
          <div
            className="h-full bg-[#500000] transition-all duration-300"
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          />
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          {step === 1 ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Welcome to Research Finder! 👋
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Let&apos;s personalize your experience. What&apos;s your major?
              </p>

              <div className="grid grid-cols-2 gap-2 max-h-[40vh] sm:max-h-64 overflow-y-auto">
                {MAJORS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMajor(m)}
                    className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                      major === m
                        ? "bg-[#500000] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!major}
                className="w-full mt-6 py-3 bg-[#500000] text-white rounded-lg font-medium hover:bg-[#700000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </>
          ) : step === 2 ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                What sounds interesting?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Pick up to 3 areas you&apos;d like to explore. Don&apos;t worry
                — you can change this later.
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 max-h-[40vh] sm:max-h-72 overflow-y-auto">
                {RESEARCH_INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      interests.includes(interest.id)
                        ? "border-[#500000] bg-[#500000]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{interest.icon}</span>
                    <span
                      className={`text-sm font-medium ${
                        interests.includes(interest.id)
                          ? "text-[#500000]"
                          : "text-gray-700"
                      }`}
                    >
                      {interest.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col-reverse xs:flex-row gap-2 xs:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={interests.length === 0}
                  className="flex-1 py-3 bg-[#500000] text-white rounded-lg font-medium hover:bg-[#700000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Stay in the loop
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Get notified when new opportunities match your interests.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setEmailOptIn(true)}
                  className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                    emailOptIn
                      ? "border-[#500000] bg-[#500000]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      emailOptIn ? "border-[#500000]" : "border-gray-300"
                    }`}>
                      {emailOptIn && <div className="w-2.5 h-2.5 rounded-full bg-[#500000]" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${emailOptIn ? "text-[#500000]" : "text-gray-700"}`}>
                        Yes, notify me
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Get emails when new research positions match your major &amp; interests
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setEmailOptIn(false)}
                  className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                    !emailOptIn
                      ? "border-[#500000] bg-[#500000]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      !emailOptIn ? "border-[#500000]" : "border-gray-300"
                    }`}>
                      {!emailOptIn && <div className="w-2.5 h-2.5 rounded-full bg-[#500000]" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${!emailOptIn ? "text-[#500000]" : "text-gray-700"}`}>
                        No thanks
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        I&apos;ll check for new opportunities myself
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                You can change this anytime in Settings.
              </p>

              <div className="flex flex-col-reverse xs:flex-row gap-2 xs:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#500000] text-white rounded-lg font-medium hover:bg-[#700000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Setting up..." : "Show me opportunities →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
