"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Sparkles, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  {
    id: "filter",
    label: "Filter by Major",
    icon: Filter,
    description:
      "See only opportunities that match your major. No more scrolling through hundreds of posts—get a curated list in one click.",
    demo: "filter",
  },
  {
    id: "ai",
    label: "AI Summaries",
    icon: Sparkles,
    description:
      "Long descriptions get distilled into what matters: hours, prerequisites, and key details. Read in seconds, not minutes.",
    demo: "ai",
  },
  {
    id: "track",
    label: "Track Applications",
    icon: LayoutList,
    description:
      "Move opportunities from Saved to Contacted to Interview. See your pipeline at a glance and never lose track of an application.",
    demo: "track",
  },
] as const;

function FilterDemo() {
  const [selected, setSelected] = useState("Computer Science");
  const majors = ["Computer Science", "Biology", "Engineering", "Chemistry"];
  const counts: Record<string, number> = {
    "Computer Science": 24,
    Biology: 18,
    Engineering: 22,
    Chemistry: 12,
  };
  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap gap-2">
        {majors.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSelected(m)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              selected === m
                ? "border-[#500000] bg-[#500000] text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            {m} ({counts[m]})
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <p className="text-sm text-gray-600">
          Showing <strong>{counts[selected]}</strong> opportunities for{" "}
          <strong>{selected}</strong>
        </p>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 flex-1 rounded-md border border-gray-200 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AIDemo() {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="space-y-4 p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-2 text-xs font-medium text-gray-500">Original post (excerpt)</div>
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="mt-1 h-3 w-[95%] rounded bg-gray-200" />
        <div className="mt-1 h-3 w-[70%] rounded bg-gray-200" />
      </div>
      <div className="flex items-center gap-2 text-[#500000]">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span className="text-sm font-medium">Generating summary…</span>
      </div>
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-[#500000]/20 bg-[#FBF5F5] p-4"
          >
            <div className="text-xs font-semibold text-[#500000]">AI Summary</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• 10–15 hrs/week • Fall/Spring</li>
              <li>• Python, ML basics</li>
              <li>• Contact: mschill@tamu.edu</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrackDemo() {
  const columns = [
    { id: "saved", label: "Saved", count: 2 },
    { id: "contacted", label: "Contacted", count: 1 },
    { id: "interview", label: "Interview", count: 0 },
  ];
  return (
    <div className="p-6">
      <div className="flex gap-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">{col.label}</span>
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                {col.count}
              </span>
            </div>
            <div className="space-y-2">
              {col.id === "saved" && (
                <>
                  <div className="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium shadow-sm">
                    ML for Sorghum
                  </div>
                  <div className="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium shadow-sm">
                    Drone Imaging
                  </div>
                </>
              )}
              {col.id === "contacted" && (
                <div className="rounded border border-[#500000]/20 bg-white px-2 py-1.5 text-xs font-medium shadow-sm">
                  NLP for Agri Data
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">3 applications in pipeline</p>
    </div>
  );
}

export function FeatureTabsSection() {
  const [activeId, setActiveId] = useState<(typeof tabs)[number]["id"]>("filter");
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  useEffect(() => {
    const id = setInterval(() => {
      setActiveId((prev) => {
        const idx = tabs.findIndex((t) => t.id === prev);
        return tabs[(idx + 1) % tabs.length].id;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-6 py-20 lg:px-12">
      <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
        Built for how students actually search
      </h2>

      <div className="mb-6 flex justify-center border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            onMouseEnter={() => setActiveId(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors",
              activeId === tab.id ? "text-[#500000]" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {activeId === tab.id && (
              <motion.span
                layoutId="feature-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#500000]"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab.demo === "filter" && <FilterDemo />}
            {activeTab.demo === "ai" && <AIDemo />}
            {activeTab.demo === "track" && <TrackDemo />}
          </motion.div>
        </AnimatePresence>
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-lg text-gray-700">{activeTab.description}</p>
        </div>
      </div>
    </section>
  );
}
