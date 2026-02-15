'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, LayoutList, ClipboardCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const steps = [
  {
    id: 'browse',
    label: 'Browse',
    icon: Search,
    title: 'Search opportunities',
    description: 'Browse hundreds of research positions from Aggie Collaborate, updated daily.',
  },
  {
    id: 'filter',
    label: 'Filter',
    icon: Filter,
    title: 'Filter by your major',
    description: 'Instantly see only opportunities that match your field of study.',
  },
  {
    id: 'track',
    label: 'Track',
    icon: LayoutList,
    title: 'Track applications',
    description: 'Move opportunities through your pipeline: Saved → Contacted → Interview → Accepted.',
  },
  {
    id: 'log',
    label: 'Log',
    icon: ClipboardCheck,
    title: 'Log your progress',
    description: 'Record weekly hours and notes. Get email reminders so you never forget.',
  },
] as const;

function BrowseDemo() {
  return (
    <div className="space-y-3">
      {[
        { title: 'ML for Sorghum Root Analysis', dept: 'Computer Science', pi: 'Dr. Schill' },
        { title: 'Drone-Based Crop Monitoring', dept: 'Engineering', pi: 'Dr. Thomasson' },
        { title: 'NLP for Agricultural Data', dept: 'Computer Science', pi: 'Dr. Caverlee' },
      ].map((opp, i) => (
        <motion.div
          key={opp.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{opp.title}</p>
              <p className="text-xs text-gray-500">{opp.pi} · {opp.dept}</p>
            </div>
            <Sparkles className="h-4 w-4 text-[#500000]/40" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FilterDemo() {
  const [selected, setSelected] = useState('Computer Science');
  const majors = ['Computer Science', 'Biology', 'Engineering'];
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {majors.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSelected(m)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              selected === m
                ? 'bg-[#500000] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-[#500000]/20 bg-[#FBF5F5] p-3">
        <p className="text-xs text-[#500000] font-medium">
          Showing 24 opportunities for {selected}
        </p>
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="h-2.5 w-3/4 rounded bg-gray-200" />
            <div className="mt-1.5 h-2 w-1/2 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackDemo() {
  const columns = [
    { label: 'Saved', count: 3, color: 'bg-blue-500' },
    { label: 'Contacted', count: 2, color: 'bg-yellow-500' },
    { label: 'Interview', count: 1, color: 'bg-[#500000]' },
  ];
  return (
    <div className="flex gap-3">
      {columns.map((col) => (
        <div key={col.label} className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">{col.label}</span>
            <span className={cn('h-2 w-2 rounded-full', col.color)} />
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: col.count }).map((_, i) => (
              <div key={i} className="rounded border border-gray-200 bg-white px-2 py-1.5">
                <div className="h-2 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LogDemo() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">This Week</span>
          <span className="text-xs text-gray-500">Feb 9 - Feb 15</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded bg-gray-50 p-2 text-center">
            <p className="text-lg font-bold text-[#500000]">12</p>
            <p className="text-[10px] text-gray-500">Hours logged</p>
          </div>
          <div className="rounded bg-gray-50 p-2 text-center">
            <p className="text-lg font-bold text-[#500000]">4</p>
            <p className="text-[10px] text-gray-500">Tasks completed</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-green-200 bg-green-50 p-2.5 text-center">
        <p className="text-xs font-medium text-green-700">Weekly log submitted!</p>
      </div>
    </div>
  );
}

const demos: Record<string, () => JSX.Element> = {
  browse: BrowseDemo,
  filter: FilterDemo,
  track: TrackDemo,
  log: LogDemo,
};

export function ProductShowcase() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const step = steps[activeStep];
  const DemoComponent = demos[step.id];

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Browser chrome */}
      <div className="rounded-t-xl border border-b-0 border-gray-200 bg-gray-100 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400 text-center">
            aggieresearchfinder.com
          </div>
        </div>
      </div>

      {/* Browser body */}
      <div className="rounded-b-xl border border-gray-200 bg-white overflow-hidden">
        {/* Step tabs */}
        <div className="flex border-b border-gray-100">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStep(i)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative',
                i === activeStep ? 'text-[#500000]' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
              {i === activeStep && (
                <motion.div
                  layoutId="showcase-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#500000]"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Demo area */}
        <div className="p-4 min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <DemoComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Step description */}
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-gray-900">{step.title}</p>
        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
      </div>
    </div>
  );
}
