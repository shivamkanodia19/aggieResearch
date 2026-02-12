import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/HeroSection";
import { ComparisonSliderSection } from "@/components/landing/ComparisonSliderSection";
import { FeatureTabsSection } from "@/components/landing/FeatureTabsSection";
import { AnimatedStatsSection } from "@/components/landing/AnimatedStatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { MajorSelectorSection } from "@/components/landing/MajorSelectorSection";

async function getStats() {
  const supabase = await createClient();

  const [oppsResult, majorsResult, usersResult] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "Recruiting"),
    supabase
      .from("opportunities")
      .select("relevant_majors")
      .eq("status", "Recruiting")
      .not("relevant_majors", "is", null),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const oppCount = oppsResult.count ?? 0;
  const majorsSet = new Set<string>();
  (majorsResult.data ?? []).forEach((r) => {
    const arr = r.relevant_majors;
    if (Array.isArray(arr)) {
      arr.forEach((m) => {
        const s = typeof m === "string" ? m.trim() : String(m).trim();
        if (s) majorsSet.add(s);
      });
    }
  });
  const majorsCount = majorsSet.size;
  const usersCount = usersResult.count ?? 0;
  const majorsList = Array.from(majorsSet).sort();

  return { oppCount, majorsCount, usersCount, majorsList };
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 lg:px-12">
        <Link href="/" className="text-lg font-bold text-[#500000]">
          TAMU Research Tracker
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/opportunities"
            className="text-sm font-medium text-gray-600 hover:text-[#500000]"
          >
            Find Research
          </Link>
          <Link
            href="/recommendations"
            className="text-sm font-medium text-gray-600 hover:text-[#500000]"
          >
            Recommendations
          </Link>
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      <HeroSection oppCount={stats.oppCount} usersCount={stats.usersCount} />

      <ComparisonSliderSection />

      <FeatureTabsSection />

      <AnimatedStatsSection oppCount={stats.oppCount} majorsCount={stats.majorsCount} />

      <TestimonialsSection />

      <MajorSelectorSection allMajors={stats.majorsList} />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 px-6 text-center lg:flex-row lg:justify-between lg:px-12">
          <div>
            <div className="font-semibold text-gray-900">TAMU Research Tracker</div>
            <div className="text-sm text-gray-600">Made by Aggies, for Aggies</div>
          </div>
          <a
            href="mailto:shivam@tamu.edu"
            className="text-sm font-medium text-[#500000] hover:underline"
          >
            Questions? shivam@tamu.edu
          </a>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} · Not affiliated with Texas A&M University
        </div>
      </footer>
    </div>
  );
}
