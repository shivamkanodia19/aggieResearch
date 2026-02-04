"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    { href: "/pipeline", label: "Pipeline" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/opportunities" className="font-bold text-xl text-tamu-maroon">
              TAMU Research Tracker
            </Link>
            <div className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-tamu-maroon ${
                    pathname === item.href
                      ? "text-tamu-maroon border-b-2 border-tamu-maroon pb-1"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="text-sm">
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
}
