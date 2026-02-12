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
    <section className="relative min-h-screen h-screen w-full flex items-center overflow-hidden bg-white">
      {/* Animated network background */}
      <AnimatedBackground />

      {/* Content */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

          {/* Left: Copy — 3 of 5 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#500000]/10 px-4 py-1.5 text-sm font-semibold text-[#500000]"
            >
              Made by Aggies, for Aggies
            </motion.span>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[3.5rem] xl:text-6xl font-bold leading-[1.1] tracking-tight text-gray-900">
              Stop scrolling through{' '}
              <span className="text-[#500000]">Aggie&nbsp;Collaborate.</span>
            </h1>

            {/* Sub-headline — outcome-focused, not feature-list */}
            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-xl">
              Find research that matches your major. Track&nbsp;applications. Log&nbsp;weekly&nbsp;progress.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.a
                href="/opportunities"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'px-8 py-4 bg-[#500000] text-white text-base font-semibold rounded-xl hover:bg-[#600000]',
                  'transition-colors shadow-md hover:shadow-lg inline-flex items-center gap-2',
                )}
              >
                Browse {oppCount} Opportunities
                <ArrowRight className="w-5 h-5" />
              </motion.a>

              <motion.a
                href="/login"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-[#500000] text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-[#500000] transition-colors inline-flex items-center gap-2"
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
            <p className="text-sm text-gray-500 pt-1">
              {usersCount > 0
                ? `Join ${usersCount.toLocaleString()} Aggies already tracking research`
                : 'Used by students in 14 majors across campus'}
            </p>
          </motion.div>

          {/* Right: Live Preview card — 2 of 5 columns */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-2 flex justify-center lg:justify-end"
          >
            <OpportunityCardCycle />
          </motion.div>
        </div>
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
