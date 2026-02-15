'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, Filter, GitPullRequest, PenLine } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Browse',
    description: 'We scrape Aggie Collaborate daily so you see every active research opportunity in one place.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Filter',
    description: 'Select your major and instantly see only the positions that match your background.',
    icon: Filter,
  },
  {
    number: '03',
    title: 'Track',
    description: 'Save interesting positions, mark ones you\'ve contacted, and follow your application pipeline.',
    icon: GitPullRequest,
  },
  {
    number: '04',
    title: 'Log',
    description: 'Once you join a lab, log weekly hours and notes to build a research portfolio over time.',
    icon: PenLine,
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            How it works
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Go from searching to researching in four steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative text-center"
            >
              {/* Connector line (hidden on first item and mobile) */}
              {i > 0 && (
                <div className="hidden lg:block absolute top-8 -left-4 w-8 h-px bg-gray-200" />
              )}

              {/* Number circle */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#500000]/10">
                <step.icon className="h-7 w-7 text-[#500000]" />
              </div>

              {/* Step number */}
              <span className="text-xs font-bold text-[#500000] tracking-wider uppercase">
                Step {step.number}
              </span>

              <h3 className="mt-2 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
