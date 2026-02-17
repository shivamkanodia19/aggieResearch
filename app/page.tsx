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
  Search,
  LayoutGrid,
  TrendingUp,
} from 'lucide-react';
import { FloatingOpportunities } from '@/components/landing/FloatingOpportunities';

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
      console.error('Error:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-gray-900 tracking-wide uppercase">
            TAMU Research Tracker
          </Link>

          <div className="flex items-center gap-12">
            <Link
              href="/opportunities"
              className="text-sm text-gray-600 hover:text-gray-900 transition tracking-wide"
            >
              Find Research
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-900 hover:text-maroon transition tracking-wide"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-8 min-h-screen flex items-center overflow-hidden">
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white -z-10" />

        {/* Floating Opportunities Background */}
        <FloatingOpportunities />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Headline */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-light text-gray-900 mb-8 leading-[0.95] font-serif tracking-tight">
              Find research.
              <br />
              <span className="text-maroon">Track progress.</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg md:text-xl text-gray-500 mb-16 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              From finding opportunities to tracking your progress — all in one place.
            </p>

            {/* CTA */}
            <Link
              href="/opportunities"
              className="inline-block px-10 py-4 border border-gray-900 text-gray-900 text-sm font-light tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              Start Exploring
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 font-serif">
              Everything you need to land research
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Search,
                title: 'Smart Discovery',
                description: 'Filter by major and find the right fit in minutes instead of hours.',
                color: 'bg-red-50/50',
                iconColor: 'text-maroon',
              },
              {
                icon: LayoutGrid,
                title: 'Visual Pipeline',
                description: 'Track every application from discovery to acceptance with a drag-and-drop pipeline.',
                color: 'bg-blue-50/50',
                iconColor: 'text-blue-600',
              },
              {
                icon: TrendingUp,
                title: 'Progress Logging',
                description: 'Log weekly hours and notes. Get email reminders so you never forget to update.',
                color: 'bg-green-50/50',
                iconColor: 'text-green-600',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.15, duration: 0.8 }}
                  className="group"
                >
                  <div className={`w-16 h-16 ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-3 font-serif">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-32 px-8 bg-gray-50/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 font-serif">
              Try it yourself
            </h2>
            <p className="text-lg text-gray-500 font-light">
              Filter by your major to see live opportunities from Aggie Collaborate
            </p>
          </motion.div>

          {/* Major Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {majors.map((major, index) => {
              const Icon = major.icon;
              const isSelected = selectedMajor === major.value;

              return (
                <motion.button
                  key={major.value}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.6 }}
                  onClick={() => handleMajorSelect(major.value)}
                  className={`
                    px-6 py-3 text-sm font-light tracking-wide transition-all flex items-center gap-2 border
                    ${
                      isSelected
                        ? 'bg-maroon text-white border-maroon'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-maroon hover:text-maroon'
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
          <AnimatePresence mode="wait">
            {selectedMajor && (
              <motion.div
                key={selectedMajor}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin h-8 w-8 border border-gray-300 border-t-maroon rounded-full" />
                  </div>
                ) : opportunities.length > 0 ? (
                  <div className="space-y-8">
                    <p className="text-center text-gray-500 font-light mb-10">
                      Found {opportunities.length} {opportunities.length === 6 ? '(showing first 6)' : ''} opportunities
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      {opportunities.map((opp, index) => (
                        <motion.div
                          key={opp.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.6 }}
                          className="group bg-white p-8 border border-gray-200 hover:border-maroon/30 transition-all"
                        >
                          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-light">
                            {opp.department}
                          </p>
                          <h3 className="text-xl font-light text-gray-900 mb-4 font-serif group-hover:text-maroon transition-colors">
                            {opp.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2 font-light">
                            {opp.piName || 'PI not specified'}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed font-light">
                            {opp.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {opp.tags?.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-light tracking-wide"
                              >
                                {tag}
                              </span>
                            ))}
                            {opp.isPaid && (
                              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-light tracking-wide">
                                PAID
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center mt-12">
                      <Link
                        href="/opportunities"
                        className="inline-block px-10 py-4 border border-gray-900 text-gray-900 text-sm font-light tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-all duration-300"
                      >
                        View All Opportunities
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 border border-gray-200">
                    <p className="text-gray-500 font-light">
                      No opportunities found for this filter. Try &quot;All Majors&quot; or check back later.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 bg-maroon text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-light mb-8 font-serif">
              Ready to find your
              <br />
              research position?
            </h2>
            <p className="text-lg mb-12 text-white/80 font-light max-w-2xl mx-auto">
              Browse opportunities updated daily from Aggie Collaborate. Start exploring now.
            </p>
            <Link
              href="/opportunities"
              className="inline-block px-10 py-4 border border-white text-white text-sm font-light tracking-widest uppercase hover:bg-white hover:text-maroon transition-all duration-300"
            >
              Start Exploring
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-500">
              <p className="font-light text-gray-900 mb-2 tracking-wide uppercase text-xs">
                TAMU Research Tracker
              </p>
              <p className="font-light">Made by Aggies, for Aggies</p>
            </div>

            <div className="text-sm text-gray-400 text-center md:text-right font-light">
              <p>Not affiliated with Texas A&M University</p>
              <p className="mt-2">&copy; 2026 &middot; Free forever</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
