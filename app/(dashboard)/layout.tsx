import { DashboardNav } from "@/components/dashboard/nav";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { OnboardingWrapper } from "@/components/OnboardingWrapper";
import { KeyboardShortcutsProvider } from "@/components/dashboard/KeyboardShortcutsProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8 pb-20 md:pb-6">{children}</main>
      <BottomNav />
      <OnboardingWrapper />
      <KeyboardShortcutsProvider />
    </div>
  );
}
