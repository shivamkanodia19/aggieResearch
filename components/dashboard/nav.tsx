"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TrackedTab } from "@/components/TrackedTab";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authedUserId, setAuthedUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showApplications, setShowApplications] = useState(false);

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
        setShowApplications(false);
        return;
      }

      setAuthedUserId(user.id);

      const [profileRes, appsCountRes] = await Promise.all([
        supabase.from("profiles").select("name, has_used_pipeline").eq("id", user.id).single(),
        supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      const name = (profileRes.data as any)?.name ?? null;
      const hasUsed = Boolean((profileRes.data as any)?.has_used_pipeline);
      const appsCount = appsCountRes.count ?? 0;

      if (cancelled) return;

      setDisplayName(name ?? user.email ?? "Account");
      setShowApplications(hasUsed || appsCount > 0);
    }

    loadNavState();
    return () => {
      cancelled = true;
    };
  }, []);

  const navItems = useMemo(() => {
    const items: Array<{ href: string; label: string; tabName: string }> = [
      { href: "/opportunities", label: "Find Research", tabName: "Find Research" },
      { href: "/recommendations", label: "Recommendations", tabName: "Recommendations" },
    ];
    if (authedUserId && showApplications) {
      items.push({ href: "/applications", label: "My Applications", tabName: "My Applications" });
    }
    items.push({ href: "/research", label: "My Research", tabName: "My Research" });
    return items;
  }, [authedUserId, showApplications]);

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
