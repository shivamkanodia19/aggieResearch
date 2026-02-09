"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MAIN_MAJORS = [
  { label: "Computer Science", href: "/opportunities?major=Computer Science" },
  { label: "Engineering", href: "/opportunities?major=Engineering" },
  { label: "Biology", href: "/opportunities?major=Biology" },
  { label: "Chemistry", href: "/opportunities?major=Chemistry" },
];

export function MajorSelectorSection({ allMajors }: { allMajors: string[] }) {
  const [otherOpen, setOtherOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOtherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMajors = allMajors.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );
  const displayMajors = filteredMajors.length > 0 ? filteredMajors : allMajors;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#500000] to-[#300000] py-20 text-center">
      <div className="relative mx-auto max-w-4xl px-6 lg:px-12">
        <h2 className="mb-10 text-4xl font-bold text-white">What&apos;s your major?</h2>
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          {MAIN_MAJORS.map(({ label, href }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={href}
                className={cn(
                  "inline-flex rounded-lg bg-white px-8 py-3 text-base font-semibold text-[#500000]",
                  "shadow-md transition-shadow hover:shadow-lg hover:bg-gray-50"
                )}
              >
                {label}
              </Link>
            </motion.div>
          ))}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOtherOpen(!otherOpen)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border-2 border-white/40 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm",
                "transition-colors hover:bg-white/20 hover:border-white/60"
              )}
            >
              Other
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", otherOpen && "rotate-180")}
              />
            </motion.button>
            {otherOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-1/2 top-full z-10 mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
              >
                <div className="border-b border-gray-100 p-2">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search majors..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {displayMajors.map((major) => (
                    <Link
                      key={major}
                      href={`/opportunities?major=${encodeURIComponent(major)}`}
                      onClick={() => setOtherOpen(false)}
                      className="block px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#500000]/10 hover:text-[#500000]"
                    >
                      {major}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
