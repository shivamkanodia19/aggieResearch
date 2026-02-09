"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const testimonials = [
  {
    quote:
      "I found 3 relevant opportunities in 2 minutes instead of spending an hour on Aggie Collaborate.",
    author: "Computer Science Major, Class of 2026",
  },
  {
    quote:
      "Finally something that filters by major. No more scrolling through posts that don't apply to me.",
    author: "Biology Major, Class of 2025",
  },
  {
    quote:
      "The AI summaries save so much time. I can skim in seconds and only open what matters.",
    author: "Engineering Major, Class of 2027",
  },
];

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const active = testimonials[index];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-xl italic text-gray-700 lg:text-2xl">&ldquo;{active.quote}&rdquo;</p>
            <p className="mt-4 text-sm text-gray-500">— {active.author}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View testimonial ${i + 1}`}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === index ? "bg-[#500000] w-6" : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
        <div className="mt-10 rounded-lg border border-gray-100 bg-gray-50/50 p-6 text-left">
          <p className="text-sm font-medium text-gray-700">Used by students across 14 majors</p>
          <p className="mt-1 text-sm text-gray-500">
            Trusted by Engineering, Science, and Liberal Arts majors. Built by Aggies, for Aggies.
          </p>
        </div>
      </div>
    </section>
  );
}
