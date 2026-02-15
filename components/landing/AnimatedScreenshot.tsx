'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function AnimatedScreenshot() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const durations = [2000, 1500, 2000, 2000, 1000];
    const nextSteps = [1, 2, 3, 4, 0];

    const timer = setTimeout(() => {
      setStep(nextSteps[step]);
    }, durations[step]);

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Browser Window */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Browser Chrome */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600 ml-4">
            aggieresearchfinder.com/opportunities
          </div>
        </div>

        {/* App Content */}
        <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-[500px]">
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
            <div className="px-3 py-1 text-sm text-gray-600">Browse</div>
            <div className="px-3 py-1 text-sm font-medium text-[#500000] border-b-2 border-[#500000]">
              Filter
            </div>
            <div className="px-3 py-1 text-sm text-gray-600">Track</div>
            <div className="px-3 py-1 text-sm text-gray-600">Log</div>
          </div>

          {/* Filter Pills */}
          <AnimatePresence mode="wait">
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 mb-6"
              >
                <motion.button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    step >= 2
                      ? 'bg-[#500000] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  animate={step === 2 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  Computer Science
                </motion.button>
                <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">
                  Biology
                </button>
                <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">
                  Engineering
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Header */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 mb-4"
              >
                Showing opportunities for Computer Science
              </motion.p>
            )}
          </AnimatePresence>

          {/* Opportunity Cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {step >= 3 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Machine Learning Research Lab
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Computer Science &middot; Dr. Smith
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Machine Learning
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                        Paid
                      </span>
                    </div>
                    <motion.button
                      className="mt-3 px-4 py-2 bg-[#500000] text-white rounded-lg text-sm font-medium"
                      animate={
                        step === 4
                          ? {
                              scale: [1, 1.05, 1],
                              boxShadow: [
                                '0 0 0 0 rgba(80, 0, 0, 0)',
                                '0 0 0 8px rgba(80, 0, 0, 0.2)',
                                '0 0 0 0 rgba(80, 0, 0, 0)',
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Save
                    </motion.button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Data Analysis for Climate Research
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Computer Science &middot; Dr. Johnson
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Data Science
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 opacity-50"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      AI Ethics and Policy Research
                    </h3>
                    <p className="text-sm text-gray-600">
                      Computer Science &middot; Dr. Williams
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Filter by major &rarr; See relevant opportunities &rarr; Save with one click
      </p>
    </div>
  );
}
