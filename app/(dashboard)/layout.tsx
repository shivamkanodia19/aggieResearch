import { DashboardNav } from "@/components/dashboard/nav";
import { OnboardingWrapper } from "@/components/OnboardingWrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      <OnboardingWrapper />
    </div>
  );
}
