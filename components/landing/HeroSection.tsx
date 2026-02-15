'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import { DemoModal } from './DemoModal';
import { AnimatedBackground } from './AnimatedBackground';
import { OpportunityCardCycle } from './OpportunityCardCycle';

export function HeroSection({
  oppCount,
  usersCount,
}: {
  oppCount: number;
  usersCount: number;
}) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative min-h-[calc(100vh-60px)] sm:min-h-screen sm:h-screen w-full flex items-center overflow-hidden bg-white">
      {/* Animated network background — hidden on small mobile for performance */}
      <div className="hidden sm:block">
        <AnimatedBackground />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16 items-center">

          {/* Left: Copy — 3 of 5 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 space-y-4 sm:space-y-6 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#500000]/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#500000]"
            >
              Made by Aggies, for Aggies
            </motion.span>

            {/* Headline — responsive sizes */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold leading-[1.1] tracking-tight text-gray-900">
              Stop scrolling through{' '}
              <br className="hidden sm:block" />
              <span className="text-[#500000]">Aggie&nbsp;Collaborate.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Find research that matches your major. Track&nbsp;applications. Log&nbsp;weekly&nbsp;progress.
            </p>

            {/* CTAs — stack vertically on mobile */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 sm:gap-4 pt-2 justify-center lg:justify-start">
              <motion.a
                href="/opportunities"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#500000] text-white text-base font-semibold rounded-xl hover:bg-[#600000]',
                  'transition-colors shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2',
                )}
              >
                Browse {oppCount} Opportunities
                <ArrowRight className="w-5 h-5" />
              </motion.a>

              <motion.a
                href="/login"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#500000] text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-[#500000] transition-colors inline-flex items-center justify-center gap-2"
              >
                Sign In
              </motion.a>

              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#500000] transition-colors"
              >
                <Play className="h-4 w-4 fill-current" />
                See&nbsp;it&nbsp;in&nbsp;action
              </button>
            </div>

            {/* Social-proof stat line */}
            <p className="text-xs sm:text-sm text-gray-500 pt-1">
              {usersCount > 0
                ? `Join ${usersCount.toLocaleString()} Aggies already tracking research`
                : 'Used by students in 14 majors across campus'}
            </p>
          </motion.div>

          {/* Right: Live Preview card — hidden on mobile, visible on lg+ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:flex lg:col-span-2 justify-center lg:justify-end"
          >
            <OpportunityCardCycle />
          </motion.div>
        </div>
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
