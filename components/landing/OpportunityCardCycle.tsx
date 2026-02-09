'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample opportunity data - replace with real data later
const SAMPLE_OPPORTUNITIES = [
  {
    id: 1,
    title: 'ML for Sorghum Root Analysis',
    department: 'Computer Science',
    tags: ['Machine Learning', 'Agriculture', 'Python'],
    description: 'Develop computer vision models to analyze root system architecture in sorghum plants.',
    paid: true,
  },
  {
    id: 2,
    title: 'Drone Imaging Research',
    department: 'Aerospace Engineering',
    tags: ['UAV', 'Image Processing', 'Field Work'],
    description: 'Process and analyze aerial imagery from agricultural drones for crop health monitoring.',
    paid: false,
  },
  {
    id: 3,
    title: 'NLP for Agri Data',
    department: 'Computer Science',
    tags: ['NLP', 'Data Science', 'Research'],
    description: 'Apply natural language processing to extract insights from agricultural research papers.',
    paid: true,
  },
  {
    id: 4,
    title: 'Coastal Erosion Modeling',
    department: 'Ocean Engineering',
    tags: ['Environmental', 'Simulation', 'MATLAB'],
    description: 'Create predictive models for coastal erosion patterns using historical data.',
    paid: true,
  },
];

export function OpportunityCardCycle() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SAMPLE_OPPORTUNITIES.length);
    }, 3500); // 3.5 seconds per card

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  const currentOpportunity = SAMPLE_OPPORTUNITIES[currentIndex];

  return (
    <div
      className="relative w-full max-w-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Card container with subtle shadow */}
      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOpportunity.id}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="p-6"
          >
            {/* Department tag */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#500000] bg-red-50 px-3 py-1 rounded-full">
                {currentOpportunity.department}
              </span>
              {currentOpportunity.paid && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                  PAID
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {currentOpportunity.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {currentOpportunity.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {currentOpportunity.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicator dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {SAMPLE_OPPORTUNITIES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-[#500000]'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to opportunity ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floating label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute -top-3 -right-3 bg-[#500000] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg"
      >
        Live Preview
      </motion.div>

      {/* Pause hint (shows on hover) */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm"
          >
            Paused • Click dots to navigate
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
