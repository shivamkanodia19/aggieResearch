'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_OPPORTUNITIES = [
  {
    id: 1,
    title: 'ML for Sorghum Root Analysis',
    department: 'Computer Science',
    tags: ['Machine Learning', 'Agriculture', 'Python'],
    description:
      'Develop computer vision models to analyze root system architecture in sorghum plants.',
    paid: true,
  },
  {
    id: 2,
    title: 'Drone Imaging Research',
    department: 'Aerospace Engineering',
    tags: ['UAV', 'Image Processing', 'Field Work'],
    description:
      'Process and analyze aerial imagery from agricultural drones for crop health monitoring.',
    paid: false,
  },
  {
    id: 3,
    title: 'NLP for Agri Data',
    department: 'Computer Science',
    tags: ['NLP', 'Data Science', 'Research'],
    description:
      'Apply natural language processing to extract insights from agricultural research papers.',
    paid: true,
  },
  {
    id: 4,
    title: 'Coastal Erosion Modeling',
    department: 'Ocean Engineering',
    tags: ['Environmental', 'Simulation', 'MATLAB'],
    description:
      'Create predictive models for coastal erosion patterns using historical data.',
    paid: true,
  },
];

export function OpportunityCardCycle() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SAMPLE_OPPORTUNITIES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  const opp = SAMPLE_OPPORTUNITIES[currentIndex];

  return (
    <div
      className="relative w-full max-w-sm lg:max-w-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Glow ring behind card */}
      <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[#500000]/10 via-transparent to-[#500000]/5 blur-xl pointer-events-none" />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-xl ring-1 ring-gray-200/60 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={opp.id}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }
            }
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="p-7"
          >
            {/* Department + Paid badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#500000] bg-[#500000]/8 px-3 py-1 rounded-full">
                {opp.department}
              </span>
              {opp.paid && (
                <span className="text-xs font-bold tracking-wide text-green-700 bg-green-50 px-2.5 py-1 rounded-md uppercase">
                  Paid
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
              {opp.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">
              {opp.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {opp.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot navigation */}
        <div className="flex justify-center gap-2 pb-5">
          {SAMPLE_OPPORTUNITIES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-7 bg-[#500000]'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to opportunity ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* "Live Preview" floating label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="absolute -top-3 -right-3 bg-[#500000] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg"
      >
        Live Preview
      </motion.div>

      {/* Pause tooltip */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap"
          >
            Paused · Click dots to navigate
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
