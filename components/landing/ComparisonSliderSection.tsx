"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderHandle } from "react-compare-slider";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const beforeAnnotations = [
  { text: "No major filters", done: false },
  { text: "Expired posts still show", done: false },
  { text: "Can't track applications", done: false },
];

const afterAnnotations = [
  { text: "Auto-filtered to Computer Science", done: true },
  { text: "Only active opportunities", done: true },
  { text: "Built-in application tracker", done: true },
];

function BeforePanel() {
  return (
    <div className="flex h-full flex-col bg-gray-50 p-6">
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <X className="h-4 w-4 text-red-500" />
        Aggie Collaborate
      </div>
      <div className="flex-1 space-y-3 rounded-lg bg-white p-4 shadow-inner">
        <div className="h-2 w-full rounded bg-gray-300" />
        <div className="h-2 w-[92%] rounded bg-gray-300" />
        <div className="h-2 w-[78%] rounded bg-gray-300" />
        <div className="h-2 w-[88%] rounded bg-gray-300" />
        <div className="h-2 w-[65%] rounded bg-gray-300" />
        <div className="h-2 w-[95%] rounded bg-gray-300" />
        <div className="mt-4 border-t border-gray-200 pt-3">
          {beforeAnnotations.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
              <X className="h-3 w-3 shrink-0 text-red-400" />
              {a.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AfterPanel() {
  return (
    <div className="flex h-full flex-col bg-white p-6">
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#500000]">
        <Check className="h-4 w-4" />
        Research Finder
      </div>
      <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-semibold text-gray-900">
          ML for Sorghum Root Analysis
        </div>
        <div className="mb-2 text-xs text-gray-600">Dr. Megan Schill · Texas A&M</div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded bg-[#FBF5F5] px-2 py-0.5 text-xs font-semibold text-[#500000]">
            Computer Science
          </span>
          <span className="rounded bg-[#FBF5F5] px-2 py-0.5 text-xs font-semibold text-[#500000]">
            Agriculture
          </span>
        </div>
        <div className="space-y-2 border-t border-gray-100 pt-3">
          {afterAnnotations.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
              <Check className="h-3 w-3 shrink-0 text-[#500000]" />
              {a.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComparisonSliderSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section ref={ref} className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-12">
        <motion.h2
          className="mb-10 text-center text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          From this... to this.
        </motion.h2>

        <motion.div
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {mounted && (
            <ReactCompareSlider
              className="min-h-[320px]"
              itemOne={<BeforePanel />}
              itemTwo={<AfterPanel />}
              position={50}
              handle={
                <ReactCompareSliderHandle
                  buttonStyle={{
                    backgroundColor: "#500000",
                    border: "none",
                    color: "white",
                  }}
                  linesStyle={{ opacity: 0.8 }}
                  className="flex h-12 w-8 items-center justify-center rounded-lg shadow-md"
                />
              }
            />
          )}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <p className="text-3xl font-bold tracking-tight text-[#500000] lg:text-4xl">
            3 relevant opportunities in 2 minutes
          </p>
          <p className="mt-2 text-lg text-gray-600">
            instead of 1 hour scrolling through 500 posts
          </p>
        </motion.div>
      </div>
    </section>
  );
}
