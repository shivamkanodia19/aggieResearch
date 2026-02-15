import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LandingPageTracker } from "@/components/landing/LandingPageTracker";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { OpportunityPreview } from "@/components/landing/OpportunityPreview";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { ArrowRight } from "lucide-react";

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
  const usersCount = usersResult.count ?? 0;

  return { oppCount, usersCount };
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-white">
      <LandingPageTracker />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4 lg:px-12">
        <Link href="/" className="text-base sm:text-lg font-bold text-[#500000]">
          TAMU Research Tracker
        </Link>
        <div className="flex items-center gap-3 sm:gap-8">
          <Link
            href="/opportunities"
            className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-[#500000] transition-colors"
          >
            Find Research
          </Link>
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#500000]/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#500000]">
                Made by Aggies, for Aggies
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-gray-900">
                Find research.{" "}
                <span className="text-[#500000]">Track progress.</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                The all-in-one platform for Texas A&M students to discover
                research opportunities, track applications, and log weekly progress.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2 justify-center lg:justify-start">
                <Link
                  href="/opportunities"
                  className="w-full sm:w-auto px-8 py-4 bg-[#500000] text-white text-base font-semibold rounded-xl hover:bg-[#600000] transition-colors shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
                >
                  Browse {stats.oppCount} Opportunities
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#500000] text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-[#500000] transition-colors inline-flex items-center justify-center gap-2"
                >
                  Sign In
                </Link>
              </div>

              <p className="text-sm text-gray-500 pt-1">
                Free forever &middot; Built by TAMU students &middot; Not affiliated with the university
              </p>
            </div>

            {/* Right: Interactive Product Showcase */}
            <div className="hidden lg:block">
              <ProductShowcase />
            </div>
          </div>
        </div>

        {/* Subtle gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </section>

      {/* Bento Feature Grid */}
      <BentoGrid />

      {/* Live Opportunity Preview */}
      <OpportunityPreview />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final CTA */}
      <section className="bg-[#500000] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to find your research?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Stop scrolling through Aggie Collaborate. Start here.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/opportunities"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#500000] text-base font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center justify-center gap-2"
            >
              Browse Opportunities
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 text-white text-base font-semibold rounded-xl border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 sm:py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 px-4 sm:px-6 text-center lg:flex-row lg:justify-between lg:px-12">
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
          &copy; {new Date().getFullYear()} &middot; Not affiliated with Texas A&M University
        </div>
      </footer>
    </div>
  );
}
