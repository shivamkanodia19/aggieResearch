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
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = searchParams.get("redirectTo") || "/opportunities";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
      return;
    }
    setGoogleLoading(false);
  };

  const inputBox =
    "w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3 text-[15px] font-sans text-[var(--gray-900)] transition-[border-color,box-shadow] placeholder:text-[var(--gray-400)] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)]";
  const labelClass = "mb-2 block text-sm font-medium font-sans text-[var(--gray-700)]";
  const btnPrimary =
    "w-full cursor-pointer rounded-lg bg-[var(--maroon-900)] px-4 py-3.5 text-[15px] font-semibold font-sans text-white transition-colors hover:bg-[var(--maroon-700)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)] disabled:cursor-not-allowed disabled:opacity-60";
  const btnSecondary =
    "flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3.5 text-[15px] font-medium font-sans text-[var(--gray-700)] transition-colors hover:bg-[var(--gray-50)] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)] disabled:opacity-60";

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

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className={btnSecondary + " mb-5"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-4 py-4 text-[13px] font-sans text-[var(--gray-400)]">
            <span className="h-px flex-1 bg-[var(--gray-200)]" />
            or
            <span className="h-px flex-1 bg-[var(--gray-200)]" />
          </div>

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
