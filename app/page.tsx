'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
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
    }).catch(() => {});
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
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900 font-display tracking-tight">
            TAMU Research Tracker
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/opportunities"
              className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Find Research
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-purple-50/30 -z-10" />
        <FloatingOpportunities />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-maroon/20 bg-maroon/5 mb-8 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-maroon" />
              <span className="text-sm font-bold text-maroon tracking-wide">
                MADE BY AGGIES, FOR AGGIES
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-gray-900 mb-8 leading-[0.95] font-display tracking-tighter">
              Find research.
              <br />
              <span className="bg-gradient-to-r from-maroon via-maroon-light to-orange-600 bg-clip-text text-transparent">
                Track progress.
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              The all-in-one platform for Texas A&amp;M students to discover research
              opportunities, track applications, and log weekly progress.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 sm:mb-12">
              <Link
                href="/opportunities"
                className="group w-full sm:w-auto px-8 py-4 bg-maroon text-white rounded-xl font-bold text-lg hover:bg-maroon-dark transition-all shadow-2xl shadow-maroon/25 hover:shadow-maroon/40 flex items-center justify-center gap-2 border-2 border-maroon"
              >
                Start Exploring
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Free forever
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Built by TAMU students
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Not affiliated with the university
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Screenshot Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 font-display tracking-tight">
              See it in action
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">
              From discovery to tracking in seconds
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <AnimatedScreenshot />
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 font-display tracking-tight">
              Try it yourself
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">
              Filter by your major to see live opportunities from Aggie Collaborate
            </p>
          </motion.div>

          {/* Major Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
            {majors.map((major, index) => {
              const Icon = major.icon;
              const isSelected = selectedMajor === major.value;

              return (
                <motion.button
                  key={major.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => handleMajorSelect(major.value)}
                  className={`
                    group px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 sm:gap-3 border-2 text-sm sm:text-base
                    ${
                      isSelected
                        ? 'bg-maroon text-white border-maroon shadow-xl shadow-maroon/30 scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-maroon hover:text-maroon hover:scale-105 shadow-sm hover:shadow-lg'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {major.name}
                </motion.button>
              );
            })}
          </div>

          {/* Opportunity Preview */}
          <AnimatePresence mode="wait">
            {selectedMajor && (
              <motion.div
                key={selectedMajor}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin h-12 w-12 border-4 border-maroon border-t-transparent rounded-full" />
                  </div>
                ) : opportunities.length > 0 ? (
                  <div className="space-y-6">
                    <p className="text-center text-gray-600 font-semibold mb-8">
                      Found {opportunities.length}{opportunities.length === 6 ? ' (showing first 6)' : ''} opportunities
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      {opportunities.map((opp: any, index: number) => (
                        <motion.div
                          key={opp.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 30 }}
                          className="group bg-white p-6 sm:p-7 rounded-2xl border-2 border-gray-200 hover:border-maroon/40 hover:shadow-2xl transition-all"
                        >
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 font-display group-hover:text-maroon transition-colors">
                            {opp.title}
                          </h3>
                          <p className="text-sm text-gray-600 font-semibold mb-4">
                            {opp.department} &middot; {opp.piName || 'PI not specified'}
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-3 mb-5 leading-relaxed">
                            {opp.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {opp.tags?.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center mt-10 sm:mt-12">
                      <Link
                        href="/opportunities"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-maroon text-white rounded-xl font-bold text-lg hover:bg-maroon-dark transition-all shadow-2xl shadow-maroon/25"
                      >
                        View All Opportunities
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 px-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-600 font-medium text-lg">
                      No opportunities found for this filter. Try &ldquo;All Majors&rdquo; or check back later.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 font-display tracking-tight">
              Everything you need
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">
              Discover, track, and succeed&mdash;all in one platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Search,
                title: 'Smart Discovery',
                description:
                  'Filter opportunities by your major and interests. No more scrolling through irrelevant postings.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: LayoutGrid,
                title: 'Visual Pipeline',
                description:
                  'Track applications through stages: Saved, Contacted, Interview, Accepted.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: TrendingUp,
                title: 'Progress Logging',
                description:
                  'Weekly journals, hour tracking, and PDF exports for advisors once you land a position.',
                gradient: 'from-orange-500 to-red-500',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.12, type: 'spring', stiffness: 200, damping: 25 }}
                  className="group bg-white p-8 sm:p-10 rounded-3xl border-2 border-gray-200 hover:border-maroon/30 hover:shadow-2xl transition-all"
                >
                  <div
                    className={`w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <Icon className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-br from-maroon via-maroon-dark to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 font-display tracking-tight">
              Ready to find your
              <br />
              research position?
            </h2>
            <p className="text-lg sm:text-xl mb-10 sm:mb-12 text-white/90 font-medium max-w-2xl mx-auto">
              Browse opportunities updated daily from Aggie Collaborate. Start exploring now&mdash;no signup required.
            </p>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-maroon rounded-xl font-black text-lg hover:bg-gray-100 transition-all shadow-2xl"
            >
              Start Exploring
              <ChevronRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-600 text-center md:text-left">
              <p className="font-black text-gray-900 mb-2 text-lg font-display">
                TAMU Research Tracker
              </p>
              <p className="font-semibold">Made by Aggies, for Aggies</p>
            </div>

            <div className="text-sm text-gray-500 text-center md:text-right font-medium">
              <p>Not affiliated with Texas A&amp;M University</p>
              <p className="mt-2">&copy; 2026 &middot; Free forever</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
