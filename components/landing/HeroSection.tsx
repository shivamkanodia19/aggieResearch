"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Filter, Sparkles, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { DemoModal } from "./DemoModal";

const MAROON = "#500000";
const ORANGE = "#FF8C00";
const GRAY = "#E5E5E5";

export function HeroSection({
  oppCount,
}: {
  oppCount: number;
}) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-6 py-20 lg:px-12 lg:py-32">
      {/* Animated gradient mesh background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden
      >
        <div
          className={cn(
            "absolute -left-1/4 -top-1/4 h-[80vh] w-[80vw] rounded-full",
            "animate-gradient-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
            "from-[#500000] via-[#FF8C00] to-transparent"
          )}
          style={{
            // @ts-expect-error CSS custom property for animation
            "--maroon": MAROON,
            "--orange": ORANGE,
            "--gray": GRAY,
          }}
        />
        <div
          className={cn(
            "absolute -bottom-1/4 -right-1/4 h-[70vh] w-[70vw] rounded-full",
            "animate-gradient-2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
            "from-[#FF8C00] via-[#E5E5E5] to-transparent"
          )}
        />
        <div
          className={cn(
            "absolute left-1/2 top-1/2 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-full",
            "animate-gradient-3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
            "from-[#500000] to-transparent"
          )}
        />
      </div>

      {/* Floating demo button */}
      <motion.div
        className="absolute right-6 top-24 z-10 lg:right-12 lg:top-28"
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

      <div className="relative grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <motion.h1
            className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-gray-900 lg:text-[4rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Stop scrolling through{" "}
            <span className="text-[#500000]">Aggie Collaborate.</span>
          </motion.h1>

          <motion.ul
            className="space-y-4 text-lg text-gray-700"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {[
              {
                icon: Filter,
                text: "Research opportunities filtered by your major",
              },
              {
                icon: Sparkles,
                text: "AI summaries that actually tell you what you need to know",
              },
              {
                icon: CheckCircle,
                text: "Track your applications from first email to acceptance",
              },
            ].map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#500000]" />
                <span>{text}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <Button
                asChild
                size="lg"
                className={cn(
                  "rounded-lg bg-[#500000] px-8 py-4 text-lg font-semibold text-white shadow-lg",
                  "hover:bg-[#6B1D1D] hover:shadow-xl",
                  "transition-shadow duration-200"
                )}
              >
                <Link href="/opportunities">
                  Browse {oppCount} Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <Button asChild variant="outline" size="lg" className="rounded-lg border-2">
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>

          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="font-medium text-gray-600">14 majors</span>
            <span className="mx-2">·</span>
            <span className="font-medium text-gray-600">AI-powered</span>
            <span className="mx-2">·</span>
            <span className="font-medium text-gray-600">Made by Aggies</span>
          </motion.p>
        </div>

        {/* Right side: optional visual (keep minimal for "simplistic") */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="rounded-2xl border border-gray-200/80 bg-white/60 p-6 shadow-xl backdrop-blur-sm">
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded bg-[#500000]/10 px-2 py-0.5 text-xs font-semibold text-[#500000]">
                  Computer Science
                </span>
                <span className="text-xs text-gray-500">24 opportunities</span>
              </div>
              <div className="space-y-2">
                {["ML for Sorghum Root Analysis", "Drone Imaging Research", "NLP for Agri Data"].map((title, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800"
                  >
                    {title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
