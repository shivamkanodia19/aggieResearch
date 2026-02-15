'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, LayoutList, ClipboardCheck, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const features = [
  {
    title: 'Smart Discovery',
    description: 'Filter by major and find the right fit in minutes instead of hours.',
    icon: Search,
    gradient: 'from-[#500000]/10 to-[#500000]/5',
    iconBg: 'bg-[#500000]/10',
    iconColor: 'text-[#500000]',
    demo: (
      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
          {['CS', 'Bio', 'Engr'].map((m) => (
            <span key={m} className="rounded-full bg-[#500000]/10 px-3 py-1 text-xs font-medium text-[#500000]">
              {m}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#500000]/20 bg-[#FBF5F5] px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-[#500000]" />
          <span className="text-xs text-[#500000]">10 hrs/week, Python required</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Visual Pipeline',
    description: 'Track every application from discovery to acceptance with a drag-and-drop pipeline.',
    icon: LayoutList,
    gradient: 'from-blue-50 to-blue-50/50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    demo: (
      <div className="mt-4 flex gap-2">
        {[
          { label: 'Saved', count: 3 },
          { label: 'Applied', count: 2 },
          { label: 'Interview', count: 1 },
        ].map((col, i) => (
          <div key={col.label} className="flex-1 rounded-lg bg-white/80 border border-gray-100 p-2 text-center">
            <p className="text-[10px] font-medium text-gray-500">{col.label}</p>
            <p className="text-lg font-bold text-gray-900">{col.count}</p>
          </div>
        ))}
        <ArrowRight className="h-4 w-4 text-gray-300 self-center" />
      </div>
    ),
  },
  {
    title: 'Progress Logging',
    description: 'Log weekly hours and notes. Get email reminders so you never forget to update.',
    icon: ClipboardCheck,
    gradient: 'from-green-50 to-green-50/50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    demo: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/80 border border-gray-100 px-3 py-2 text-center flex-1">
            <p className="text-lg font-bold text-gray-900">12h</p>
            <p className="text-[10px] text-gray-500">This week</p>
          </div>
          <div className="rounded-lg bg-white/80 border border-gray-100 px-3 py-2 text-center flex-1">
            <p className="text-lg font-bold text-gray-900">48h</p>
            <p className="text-[10px] text-gray-500">This month</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[3, 5, 4, 6, 2, 4, 3].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-green-200" style={{ height: `${h * 6}px` }} />
          ))}
        </div>
      </div>
    ),
  },
];

export function BentoGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything you need to land research
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            From finding opportunities to tracking your progress — all in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={cn(
                'rounded-2xl border border-gray-200 p-6 bg-gradient-to-br shadow-sm hover:shadow-md transition-shadow',
                feature.gradient
              )}
            >
              <div className={cn('inline-flex rounded-xl p-2.5', feature.iconBg)}>
                <feature.icon className={cn('h-5 w-5', feature.iconColor)} />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              {feature.demo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
