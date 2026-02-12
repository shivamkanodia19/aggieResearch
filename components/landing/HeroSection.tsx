'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Filter, Sparkles, CheckCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import { DemoModal } from './DemoModal';
import { AnimatedBackground } from './AnimatedBackground';
import { OpportunityCardCycle } from './OpportunityCardCycle';

export function HeroSection({
  oppCount,
}: {
  oppCount: number;
}) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative min-h-screen h-screen w-full flex items-center overflow-hidden bg-white">
      {/* Animated network background */}
      <AnimatedBackground />

      {/* Content Container */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Stop scrolling through{' '}
              <span className="text-[#500000]">Aggie Collaborate.</span>
            </h1>

            {/* Value Props */}
            <div className="space-y-4 text-lg text-gray-700">
              <div className="flex items-start gap-3">
                <Filter className="w-6 h-6 text-[#500000] mt-0.5 flex-shrink-0" />
                <span>Research opportunities filtered by your major</span>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-[#500000] mt-0.5 flex-shrink-0" />
                <span>AI summaries that actually tell you what you need to know</span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#500000] mt-0.5 flex-shrink-0" />
                <span>Track your applications from first email to acceptance</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <motion.a
                href="/opportunities"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "px-8 py-4 bg-[#500000] text-white font-semibold rounded-lg hover:bg-[#600000]",
                  "transition-colors shadow-md hover:shadow-lg inline-flex items-center gap-2"
                )}
              >
                Browse {oppCount} Opportunities
                <ArrowRight className="w-5 h-5" />
              </motion.a>

              <motion.a
                href="/login"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-[#500000] font-semibold rounded-lg border-2 border-gray-200 hover:border-[#500000] transition-colors inline-flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                Sign In
              </motion.a>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4 text-sm text-gray-600">
              <span>14 majors</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span>AI-powered</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span>Made by Aggies</span>
            </div>
          </motion.div>

          {/* Right: Animated Opportunity Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <OpportunityCardCycle />
          </motion.div>
        </div>
      </div>

      {/* Floating demo button */}
      <motion.div
        className="absolute right-6 top-24 z-20 lg:right-12 lg:top-28"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className={cn(
            "group flex items-center gap-2 rounded-full border border-gray-300 bg-white/90 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm",
            "hover:border-[#500000]/30 hover:text-[#500000] hover:shadow-md",
            "transition-all duration-200 hover:translate-x-1"
          )}
        >
          <Play className="h-4 w-4" />
          See it in action
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </motion.div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
