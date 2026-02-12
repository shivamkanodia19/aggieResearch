"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TrackedTab } from "@/components/TrackedTab";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";
import { TutorialButton } from "@/components/tutorials/TutorialButton";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authedUserId, setAuthedUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    let cancelled = false;

    async function loadNavState() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setAuthedUserId(null);
        setDisplayName(null);
        return;
      }

      setAuthedUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      setDisplayName((profile as any)?.name ?? user.email ?? "Account");
    }

    loadNavState();
    return () => {
      cancelled = true;
    };
  }, []);

  // Always show all four tabs for authenticated users.
  // Unauthenticated visitors still see Find Research + Recommendations.
  const navItems = useMemo(() => {
    const items: Array<{ href: string; label: string; tabName: string }> = [
      { href: "/opportunities", label: "Find Research", tabName: "Find Research" },
      { href: "/recommendations", label: "Recommendations", tabName: "Recommendations" },
    ];
    if (authedUserId) {
      items.push(
        { href: "/applications", label: "My Applications", tabName: "My Applications" },
        { href: "/research", label: "My Research", tabName: "My Research" },
      );
    }
    return items;
  }, [authedUserId]);

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/opportunities"
              className="text-lg font-semibold text-maroon-900 dark:text-maroon-100"
            >
              TAMU Research Tracker
            </Link>
            <div className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <TrackedTab
                  key={item.href}
                  href={item.href}
                  tabName={item.tabName}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-maroon-900 dark:text-maroon-100"
                      : "text-muted-foreground hover:text-maroon-900 dark:hover:text-maroon-100"
                  }`}
                >
                  {item.label}
                </TrackedTab>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TutorialButton />
            {!authedUserId ? (
              <Link
                href="/login?redirectTo=/opportunities"
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium",
                  "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                )}
              >
                Sign in
              </Link>
            ) : (
              <ProfileDropdown name={displayName} onSignOut={handleSignOut} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
