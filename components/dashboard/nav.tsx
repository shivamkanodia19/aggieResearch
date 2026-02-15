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
import { Menu, X } from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authedUserId, setAuthedUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = useMemo(() => {
    const items: Array<{ href: string; label: string; tabName: string }> = [
      { href: "/opportunities", label: "Find Research", tabName: "Find Research" },
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
    <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/opportunities"
              className="text-base sm:text-lg font-semibold text-maroon-900 dark:text-maroon-100 truncate max-w-[200px] sm:max-w-none"
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
          <div className="flex items-center gap-2 sm:gap-3">
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
              <div className="hidden md:block">
                <ProfileDropdown name={displayName} onSignOut={handleSignOut} />
              </div>
            )}

            {/* Mobile hamburger menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-6 py-3.5 text-sm font-medium transition-colors active:bg-gray-100",
                  pathname === item.href
                    ? "text-maroon-900 bg-maroon-50 dark:text-maroon-100 dark:bg-maroon-900/10"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {authedUserId && (
              <>
                <Link
                  href="/settings"
                  className="px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <div className="border-t border-border mx-4 my-1" />
                <div className="px-6 py-2">
                  <p className="text-xs text-muted-foreground truncate">{displayName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="px-6 py-3.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
