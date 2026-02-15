"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirectTo") || "/opportunities";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith("@tamu.edu")) {
      setError("You must use a @tamu.edu email address.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const inputBox =
    "w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3 text-[15px] font-sans text-[var(--gray-900)] transition-[border-color,box-shadow] placeholder:text-[var(--gray-400)] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)]";
  const labelClass = "mb-2 block text-sm font-medium font-sans text-[var(--gray-700)]";
  const btnPrimary =
    "w-full cursor-pointer rounded-lg bg-[var(--maroon-900)] px-4 py-3.5 text-[15px] font-semibold font-sans text-white transition-colors hover:bg-[var(--maroon-700)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gray-100)] p-4 sm:p-6">
      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Integrated top: branding */}
        <div className="relative bg-[linear-gradient(160deg,var(--maroon-900)_0%,var(--maroon-800)_50%,var(--maroon-950)_100%)] px-8 pt-8 pb-6 text-center">
          <div
            className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none"
            aria-hidden
          />
          <div className="relative z-10">
            <div className="mx-auto mb-4 h-12 w-12">
              <svg
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
              >
                <circle cx="36" cy="20" r="6" fill="rgba(255,255,255,0.9)" />
                <circle cx="20" cy="48" r="5" fill="rgba(255,255,255,0.6)" />
                <circle cx="52" cy="48" r="5" fill="rgba(255,255,255,0.6)" />
                <circle cx="36" cy="56" r="4" fill="rgba(255,255,255,0.4)" />
                <line x1="36" y1="26" x2="23" y2="44" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <line x1="36" y1="26" x2="49" y2="44" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <line x1="24" y1="50" x2="33" y2="54" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <line x1="48" y1="50" x2="39" y2="54" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold font-sans leading-tight text-white">
              TAMU Research Tracker
            </h1>
            <p className="mt-1 text-sm font-sans text-white/70">
              Find your next breakthrough.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 pb-8 pt-6">
          <h2 className="mb-1 text-xl font-bold font-sans text-[var(--gray-900)]">
            Welcome back
          </h2>
          <p className="mb-6 text-[15px] font-sans text-[var(--gray-600)]">
            Sign in to track your applications
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="your.name@tamu.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBox}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputBox + " pr-12"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded p-1 text-[var(--gray-400)] transition-colors hover:text-[var(--gray-600)]"
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm font-sans text-red-800">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 border-t border-[var(--gray-100)] pt-5 text-center">
            <Link
              href="/opportunities"
              className="text-sm font-sans text-[var(--gray-500)] no-underline transition-colors hover:text-[var(--maroon-900)]"
            >
              Just browsing? Continue as guest →
            </Link>
          </div>

          <p className="mt-6 text-center text-[13px] font-sans text-[var(--gray-500)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[var(--maroon-900)] no-underline hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--gray-100)]">
          <span className="text-[var(--gray-500)]">Loading...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
