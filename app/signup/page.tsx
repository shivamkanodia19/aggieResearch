"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.endsWith("@tamu.edu")) {
      setError("Must use a valid @tamu.edu email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name },
      },
    });

    if (signUpError) {
      console.error("[Signup] Supabase error:", signUpError);
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        <div className="hidden md:block" style={{ background: "linear-gradient(160deg, var(--maroon-900) 0%, var(--maroon-800) 50%, var(--maroon-950) 100%)" }} />
        <div className="flex flex-col justify-center bg-white px-6 py-12 md:px-16">
          <div className="mx-auto w-full max-w-[380px]">
            <div className="mb-12 text-lg font-bold text-[var(--maroon-900)]">
              TAMU Research Tracker
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[var(--gray-900)]">Check your email</h2>
            <p className="text-[var(--gray-600)]">
              We&apos;ve sent a verification link to <strong>{email}</strong>. Click the link to
              verify your account, then sign in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block font-medium text-[var(--maroon-900)] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left panel - branding (same as login) */}
      <div className="relative hidden overflow-hidden md:flex md:flex-col md:items-center md:justify-center md:bg-[linear-gradient(160deg,var(--maroon-900)_0%,var(--maroon-800)_50%,var(--maroon-950)_100%)] md:px-16 md:py-16 md:text-center">
        <div
          className="absolute -top-[200px] -right-[200px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-[100px] -left-[100px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none"
          aria-hidden
        />
        <div className="relative z-10">
          <div className="mx-auto mb-8 h-[72px] w-[72px]">
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
          <h1 className="mx-auto mb-4 max-w-[320px] text-3xl font-bold leading-tight text-white md:text-4xl">
            Find your next breakthrough.
          </h1>
          <p className="mx-auto max-w-[280px] text-base leading-relaxed text-white/60">
            TAMU research opportunities, filtered and organized for you.
          </p>
        </div>
        <p className="absolute bottom-8 left-0 right-0 text-center text-[13px] text-white/40">
          Built by Aggies, for Aggies
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-col justify-center bg-white px-6 py-12 md:px-16 md:py-16">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="mb-12 text-lg font-bold text-[var(--maroon-900)]">
            TAMU Research Tracker
          </div>

          <h2 className="mb-2 text-2xl font-bold text-[var(--gray-900)] md:text-[28px]">
            Create account
          </h2>
          <p className="mb-8 text-[15px] text-[var(--gray-600)]">
            Sign up with your @tamu.edu email address
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[var(--gray-700)]"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3 text-[15px] text-[var(--gray-900)] transition-[border-color,box-shadow] placeholder:text-[var(--gray-400)] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[var(--gray-700)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="student@tamu.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3 text-[15px] text-[var(--gray-900)] transition-[border-color,box-shadow] placeholder:text-[var(--gray-400)] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[var(--gray-700)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  className="w-full rounded-lg border border-[var(--gray-200)] bg-white py-3 pl-4 pr-12 text-[15px] text-[var(--gray-900)] transition-[border-color,box-shadow] placeholder:text-[var(--gray-400)] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)]"
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
              <p className="mt-1.5 text-xs text-[var(--gray-500)]">Must be at least 8 characters</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-[var(--maroon-900)] px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--maroon-700)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[var(--gray-500)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--maroon-900)] no-underline hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
