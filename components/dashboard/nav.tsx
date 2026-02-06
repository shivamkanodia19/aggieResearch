"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navItems = [
    { href: "/opportunities", label: "Opportunities" },
    { href: "/recommendations", label: "Recommendations" },
    { href: "/pipeline", label: "Pipeline" },
    { href: "/research", label: "My Research" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/opportunities"
              className="text-lg font-semibold text-maroon-900"
            >
              TAMU Research Tracker
            </Link>
            <div className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-maroon-900"
                      : "text-gray-600 hover:text-maroon-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
