'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

interface Opportunity {
  id: string;
  title: string;
  department: string;
  piName: string;
  description: string;
  tags: string[];
}

const MAJORS = [
  { label: 'All Majors', value: 'all' },
  { label: 'Computer Science', value: 'Computer Science' },
  { label: 'Biology', value: 'Biology' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Physics', value: 'Physics' },
];

export function OpportunityPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [major, setMajor] = useState('all');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpps = async () => {
      setLoading(true);
      try {
        const params = major !== 'all' ? `?major=${encodeURIComponent(major)}` : '';
        const res = await fetch(`/api/opportunities/public${params}`);
        if (res.ok) {
          const data = await res.json();
          setOpportunities(data);
        }
      } catch {
        // Silently fail — this is a preview section
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, [major]);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Real opportunities, right now
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            These are live research positions from Aggie Collaborate, updated daily.
          </p>
        </motion.div>

        {/* Major filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {MAJORS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMajor(m.value)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                major === m.value
                  ? 'bg-[#500000] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#500000]/30 hover:text-[#500000]'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Opportunity cards */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
                  <div className="mt-4 h-12 w-full rounded bg-gray-100 animate-pulse" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" />
                    <div className="h-5 w-20 rounded-full bg-gray-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : opportunities.length > 0 ? (
            <motion.div
              key={`results-${major}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {opportunities.slice(0, 6).map((opp, i) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-[#500000]/30 hover:shadow-md transition-all"
                >
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#500000] transition-colors">
                    {opp.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {opp.piName} · {opp.department}
                  </p>
                  <p className="mt-2.5 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {opp.description}
                  </p>
                  {opp.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {opp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#500000]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#500000]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-sm text-gray-500">No opportunities found for this filter. Try &ldquo;All Majors&rdquo; or check back later.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#500000] hover:underline"
          >
            View all opportunities
            <ExternalLink className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
