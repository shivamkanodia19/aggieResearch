import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
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

  return { oppCount, majorsCount, usersCount };
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
          <Link href="/opportunities" className="text-sm font-medium text-gray-600 hover:text-[#500000]">
            Opportunities
          </Link>
          <Link href="/recommendations" className="text-sm font-medium text-gray-600 hover:text-[#500000]">
            Recommendations
          </Link>
          <Link href="/pipeline" className="text-sm font-medium text-gray-600 hover:text-[#500000]">
            Pipeline
          </Link>
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
              Stop scrolling through <span className="text-[#500000]">Aggie Collaborate.</span>
            </h1>
            <p className="text-lg leading-relaxed text-gray-600 lg:text-xl">
              Research opportunities filtered by your major. AI summaries that actually tell you what you need to know. Track your applications from first email to acceptance — all in one place.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-lg bg-[#500000] hover:bg-[#6B1D1D]">
                <Link href="/opportunities">
                  Browse {stats.oppCount} Opportunities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
              <svg className="mb-4 h-16 w-16 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" />
              </svg>
              <p className="text-sm">Product demo video<br />(15 sec, muted autoplay)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <h2 className="mb-10 text-center text-sm font-semibold uppercase tracking-wider text-gray-500">
            See the difference
          </h2>
          <div className="mb-12 grid grid-cols-[1fr_auto_1fr] items-center gap-8">
            {/* Before */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 opacity-80">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <X className="h-4 w-4" />
                Aggie Collaborate
              </div>
              <div className="space-y-2 rounded-lg bg-gray-100 p-4 text-xs leading-relaxed text-gray-600">
                <div className="h-3 w-full rounded bg-gray-300" />
                <div className="h-3 w-[90%] rounded bg-gray-300" />
                <div className="h-3 w-[75%] rounded bg-gray-300" />
                <div className="h-3 w-[95%] rounded bg-gray-300" />
                <div className="h-3 w-[60%] rounded bg-gray-300" />
                <p className="mt-3 text-xs text-gray-400">
                  Wall of text • Buried contact info • No filtering • No tracking
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-3xl font-bold text-[#500000]">→</div>

            {/* After */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#500000]">
                <Check className="h-4 w-4" />
                Research Finder
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-2 text-sm font-semibold text-gray-900">
                  ML for Sorghum Root Analysis
                </div>
                <div className="mb-3 text-xs text-gray-600">Dr. Megan Schill · Texas</div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="rounded bg-[#FBF5F5] px-2.5 py-1 text-xs font-semibold text-[#500000]">
                    Computer Science
                  </span>
                  <span className="rounded bg-[#FBF5F5] px-2.5 py-1 text-xs font-semibold text-[#500000]">
                    Agriculture
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  <span>📧 mschill@tamu.edu</span>
                  <button className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mx-auto max-w-lg text-center">
            <p className="mb-3 text-lg italic text-gray-700">
              &ldquo;I found 3 relevant opportunities in 2 minutes instead of spending an hour on Aggie Collaborate.&rdquo;
            </p>
            <p className="text-sm text-gray-500">— Computer Science Major, Class of 2026</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-12">
          <div className="grid grid-cols-3 gap-12 text-center">
            <div>
              <div className="mb-2 text-5xl font-bold leading-none text-[#500000]">
                {stats.oppCount}
              </div>
              <div className="text-sm text-gray-600">Research Opportunities</div>
            </div>
            <div>
              <div className="mb-2 text-5xl font-bold leading-none text-[#500000]">
                {stats.majorsCount}
              </div>
              <div className="text-sm text-gray-600">Majors Covered</div>
            </div>
            <div>
              <div className="mb-2 text-5xl font-bold leading-none text-[#500000]">
                {stats.usersCount}
              </div>
              <div className="text-sm text-gray-600">Students Tracking</div>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">Updated daily from Aggie Collaborate</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-12">
        <h2 className="mb-12 text-center text-3xl font-bold">Built for how students actually search</h2>
        <div className="mb-8 flex justify-center gap-2">
          <button className="rounded-lg border border-gray-200 bg-[#500000] px-6 py-3 text-sm font-medium text-white">
            Filter by Major
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
            AI Summaries
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Track Applications
          </button>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
          <div className="flex h-full flex-col items-center justify-center p-12 text-center text-gray-500">
            <h3 className="mb-3 text-xl font-semibold text-gray-700">🎯 Filter by Major</h3>
            <p className="text-sm">
              Click Computer Science → See only relevant opportunities.<br />
              No more scrolling through agriculture postings when you&apos;re a CS major.
            </p>
          </div>
        </div>
      </section>

      {/* Major CTA Section */}
      <section className="bg-[#500000] py-20 text-center">
        <div className="mx-auto max-w-4xl px-6 lg:px-12">
          <h2 className="mb-8 text-3xl font-bold text-white">What&apos;s your major?</h2>
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-lg bg-white text-[#500000] hover:bg-[#FBF5F5]">
              <Link href="/opportunities?major=Computer Science">Computer Science</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-lg bg-white text-[#500000] hover:bg-[#FBF5F5]">
              <Link href="/opportunities?major=Engineering">Engineering</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-lg bg-white text-[#500000] hover:bg-[#FBF5F5]">
              <Link href="/opportunities?major=Biology">Biology</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-lg bg-white text-[#500000] hover:bg-[#FBF5F5]">
              <Link href="/opportunities?major=Chemistry">Chemistry</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/opportunities">Other ▾</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 lg:px-12">
          <div>
            <div className="text-sm text-gray-600">
              Built by <strong className="text-gray-900">Shivam Kanodia</strong>
            </div>
            <div className="mt-1 text-xs text-gray-400">Not affiliated with Texas A&M University</div>
          </div>
          <div>
            <a href="mailto:shivam@tamu.edu" className="text-sm text-[#500000] hover:underline">
              Questions? shivam@tamu.edu
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
