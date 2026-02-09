"use client";

import { useRef, useState, useEffect } from "react";
import CountUp from "react-countup";
import { motion, useInView } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function AnimatedStatsSection({
  oppCount,
  majorsCount,
}: {
  oppCount: number;
  majorsCount: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (inView && !started) setStarted(true);
  }, [inView, started]);

  const stats = [
    {
      value: oppCount,
      label: "Research Opportunities",
      sublabel: "and growing",
      icon: Briefcase,
    },
    {
      value: majorsCount,
      label: "Majors Covered",
      sublabel: "expand list",
      icon: GraduationCap,
    },
  ];

  return (
    <section ref={ref} className="border-b border-gray-200 bg-white py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="mb-2 flex justify-center">
                <div className="h-10 w-px bg-[#500000]/40" aria-hidden />
              </div>
              <div className="mb-2 flex justify-center">
                <stat.icon className="h-8 w-8 text-[#500000]/70" />
              </div>
              <div className="mb-1 text-4xl font-bold tracking-tight text-[#500000] lg:text-5xl">
                {started ? (
                  <CountUp end={stat.value} duration={1.2} useEasing easingFn={(t) => 1 - Math.pow(1 - t, 3)} />
                ) : (
                  0
                )}
              </div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              <div className="mt-0.5 text-xs text-gray-500">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">Updated daily from Aggie Collaborate</p>
      </div>
    </section>
  );
}
