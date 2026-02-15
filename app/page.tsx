'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Code2,
  Beaker,
  Cpu,
  Activity,
  Building2,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Search,
  LayoutGrid,
  TrendingUp,
} from 'lucide-react';
import { FloatingOpportunities } from '@/components/landing/FloatingOpportunities';
import { AnimatedScreenshot } from '@/components/landing/AnimatedScreenshot';

export default function LandingPage() {
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'LANDING' }),
    }).catch(console.error);
  }, []);

  const majors = [
    { name: 'Computer Science', icon: Code2, value: 'Computer Science' },
    { name: 'Engineering', icon: Cpu, value: 'Engineering' },
    { name: 'Biology', icon: Activity, value: 'Biology' },
    { name: 'Chemistry', icon: Beaker, value: 'Chemistry' },
    { name: 'Business', icon: Building2, value: 'Business' },
    { name: 'All Majors', icon: GraduationCap, value: 'all' },
  ];

  const handleMajorSelect = async (major: string) => {
    setSelectedMajor(major);
    setLoading(true);

    try {
      const res = await fetch(`/api/opportunities/public?major=${encodeURIComponent(major)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900">
            TAMU Research Tracker
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/opportunities"
              className="hidden sm:inline text-sm text-gray-700 hover:text-gray-900 transition"
            >
              Find Research
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <FloatingOpportunities />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full border-2 border-maroon/20 bg-maroon/5 mb-8">
              <span className="text-sm font-medium text-maroon">
                Made by Aggies, for Aggies
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find research.
              <br />
              <span className="text-maroon">Track progress.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The all-in-one platform for Texas A&amp;M students to discover research
              opportunities, track applications, and log weekly progress.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
              <Link
                href="/opportunities"
                className="w-full sm:w-auto px-8 py-4 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition shadow-lg flex items-center justify-center gap-2"
              >
                Start Exploring
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Free forever
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Built by TAMU students
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Not affiliated with the university
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Screenshot Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See it in action
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              From discovery to tracking in seconds
            </p>
          </motion.div>

          <AnimatedScreenshot />
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Try it yourself
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Filter by your major to see live opportunities from Aggie Collaborate
            </p>
          </motion.div>

          {/* Major Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {majors.map((major, index) => {
              const Icon = major.icon;
              const isSelected = selectedMajor === major.value;

              return (
                <motion.button
                  key={major.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleMajorSelect(major.value)}
                  className={`
                    px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all flex items-center gap-2 text-sm sm:text-base
                    ${
                      isSelected
                        ? 'bg-maroon text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-maroon hover:text-maroon'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {major.name}
                </motion.button>
              );
            })}
          </div>

          {/* Opportunity Preview */}
          {selectedMajor && (
            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-maroon border-t-transparent rounded-full" />
                </div>
              ) : opportunities.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-center text-gray-600 mb-6">
                    Found {opportunities.length}{opportunities.length === 6 ? ' (showing first 6)' : ''} opportunities
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {opportunities.map((opp: any, index: number) => (
                      <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white p-6 rounded-xl border border-gray-200 hover:border-maroon/30 hover:shadow-lg transition"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {opp.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {opp.department} &middot; {opp.piName || 'PI not specified'}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                          {opp.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {opp.tags?.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <Link
                      href="/opportunities"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition shadow-lg"
                    >
                      View All Opportunities
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    No opportunities found for this filter. Try &ldquo;All Majors&rdquo; or check back later.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Discover, track, and succeed&mdash;all in one platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: 'Smart Discovery',
                description:
                  'Filter opportunities by your major and interests. No more scrolling through irrelevant postings.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: LayoutGrid,
                title: 'Visual Pipeline',
                description:
                  'Track applications through stages: Saved, Contacted, Interview, Accepted.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: TrendingUp,
                title: 'Progress Logging',
                description:
                  'Weekly journals, hour tracking, and PDF exports for advisors once you land a position.',
                color: 'from-orange-500 to-red-500',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-maroon/30 hover:shadow-xl transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-maroon text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to find your research position?
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/90">
            Browse opportunities updated daily from Aggie Collaborate
          </p>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-maroon rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Start Exploring
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 text-center md:text-left">
              <p className="font-semibold text-gray-900 mb-1">
                TAMU Research Tracker
              </p>
              <p>Made by Aggies, for Aggies</p>
            </div>

            <div className="text-sm text-gray-500 text-center md:text-right">
              <p>Not affiliated with Texas A&amp;M University</p>
              <p className="mt-1">&copy; 2026 &middot; Free forever</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
