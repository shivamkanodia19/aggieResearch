'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function AnimatedScreenshot() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const durations = [2200, 1200, 1800, 2500, 1000];
    const nextSteps = [1, 2, 3, 4, 0];

    const timer = setTimeout(() => {
      setStep(nextSteps[step]);
    }, durations[step]);

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Browser Window */}
      <div className="bg-white rounded-2xl shadow-[0_20px_80px_-10px_rgba(0,0,0,0.3)] border border-gray-200 overflow-hidden">
        {/* Browser Chrome */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-4 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-lg px-4 py-2 text-xs text-gray-500 font-medium ml-2 shadow-inner">
            aggieresearchfinder.com/opportunities
          </div>
        </div>

        {/* App Content */}
        <div className="p-6 sm:p-10 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-[450px] sm:min-h-[550px]">
          {/* Top Navigation */}
          <div className="flex gap-1 mb-8 border-b border-gray-200">
            <div className="px-4 py-2 text-sm text-gray-500 font-medium">Browse</div>
            <div className="px-4 py-2 text-sm font-bold text-[#500000] border-b-2 border-[#500000] -mb-px">
              Filter
            </div>
            <div className="px-4 py-2 text-sm text-gray-500 font-medium">Track</div>
            <div className="px-4 py-2 text-sm text-gray-500 font-medium">Log</div>
          </div>

          {/* Filter Pills */}
          <AnimatePresence mode="wait">
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                <motion.div
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    step >= 2
                      ? 'bg-[#500000] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  animate={step === 2 ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  Computer Science
                </motion.div>
                <div className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                  Biology
                </div>
                <div className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                  Engineering
                </div>
                <div className="hidden sm:block px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                  Chemistry
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 font-medium mb-6"
              >
                Showing opportunities for Computer Science
              </motion.p>
            )}
          </AnimatePresence>

          {/* Opportunity Cards */}
          <div className="space-y-4">
            <AnimatePresence>
              {step >= 3 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 font-display">
                        Machine Learning Research Lab
                      </h3>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                        PAID
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-4">
                      Computer Science Department &middot; Dr. Sarah Smith
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                        Machine Learning
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg">
                        Python
                      </span>
                      <span className="hidden sm:inline px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg">
                        NLP
                      </span>
                    </div>
                    <motion.div
                      className="inline-block px-6 py-2.5 bg-[#500000] text-white rounded-lg text-sm font-bold shadow-lg"
                      animate={
                        step === 4
                          ? {
                              scale: [1, 1.06, 1],
                              boxShadow: [
                                '0 10px 40px -10px rgba(80, 0, 0, 0.2)',
                                '0 20px 60px -10px rgba(80, 0, 0, 0.4)',
                                '0 10px 40px -10px rgba(80, 0, 0, 0.2)',
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 1.8, repeat: Infinity }}
                    >
                      Save Opportunity
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm"
                  >
                    <h3 className="font-bold text-base text-gray-900 mb-2 font-display">
                      Data Analysis for Climate Research
                    </h3>
                    <p className="text-sm text-gray-600 font-medium mb-3">
                      Computer Science &middot; Dr. Michael Johnson
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg">
                        Data Science
                      </span>
                      <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg">
                        Statistics
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 0.4, y: 0 }}
                    transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6"
                  >
                    <h3 className="font-bold text-base text-gray-900 mb-2 font-display">
                      Cybersecurity and Privacy Research
                    </h3>
                    <p className="text-sm text-gray-600">
                      Computer Science &middot; Dr. Emily Williams
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500 mt-8 font-medium"
      >
        Filter by major &rarr; See relevant opportunities &rarr; Save with one click
      </motion.p>
    </div>
  );
}
