import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, Filter, BookmarkCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";

async function getPreviewOpportunities() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .eq("status", "Recruiting")
    .not("ai_summary", "is", null)
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function HomePage() {
  const previewOpportunities = await getPreviewOpportunities();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero */}
      <section className="relative border-b border-gray-200 bg-white">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Find Your Research Path
          </h1>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            Discover TAMU research opportunities tailored to your major. AI
            summaries help you find the perfect fit in seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-[#500000] hover:bg-[var(--maroon-light)]">
              <Link href="/login?redirectTo=/opportunities">Browse Opportunities</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mb-2 font-semibold text-gray-900">
              AI-Powered Summaries
            </h2>
            <p className="text-sm text-gray-600">
              Instantly understand what each project is about and which majors
              fit best.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#500000]/10 text-[#500000] mb-4">
              <Filter className="h-6 w-6" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">Smart Filters</h2>
            <p className="text-sm text-muted-foreground">
              Filter by field, eligibility, and time commitment. Find your match
              in seconds.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pipeline-success-bg text-pipeline-success">
              <BookmarkCheck className="h-6 w-6" />
            </div>
            <h2 className="mb-2 font-semibold text-gray-900">
              One-Click Tracking
            </h2>
            <p className="text-sm text-gray-600">
              Save opportunities and track your application status from first
              email to acceptance.
            </p>
          </div>
        </div>
      </section>

      {/* Live preview */}
      {previewOpportunities.length > 0 && (
        <section className="container mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            See it in action
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Real opportunities with AI summaries. Sign in to track and apply.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {previewOpportunities.slice(0, 3).map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isTracked={false}
                onTrack={undefined}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/login?redirectTo=/opportunities">
                Sign in to browse all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="container mx-auto border-t border-gray-200 px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-semibold text-gray-900">
          How it works
        </h2>
        <div className="mx-auto grid max-w-3xl gap-8 text-center sm:grid-cols-3">
          <div>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#500000] text-white font-bold text-lg">
              1
            </span>
            <h3 className="font-semibold text-foreground mt-4">Discover</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse AI-summarized opportunities
            </p>
          </div>
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-maroon-900 text-lg font-bold text-white">
              2
            </span>
            <h3 className="mt-4 font-semibold text-gray-900">Save & Track</h3>
            <p className="mt-1 text-sm text-gray-600">
              Add to your personal pipeline
            </p>
          </div>
          <div>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#500000] text-white font-bold text-lg">
              3
            </span>
            <h3 className="font-semibold text-foreground mt-4">Connect</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Link to Aggie Collaborate to apply
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto border-t border-gray-200 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            Ready to find your research opportunity?
          </h2>
          <p className="mt-2 text-gray-600">
            Join TAMU students discovering and tracking research positions.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-lg">
            <Link href="/signup">Get Started — It&apos;s Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
