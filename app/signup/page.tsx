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

  const inputBox =
    "w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3 text-[15px] font-sans text-[var(--gray-900)] transition-[border-color,box-shadow] placeholder:text-[var(--gray-400)] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)]";
  const labelClass = "mb-2 block text-sm font-medium font-sans text-[var(--gray-700)]";
  const btnPrimary =
    "w-full cursor-pointer rounded-lg bg-[var(--maroon-900)] px-4 py-3.5 text-[15px] font-semibold font-sans text-white transition-colors hover:bg-[var(--maroon-700)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)] disabled:cursor-not-allowed disabled:opacity-60";

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--gray-100)] p-6">
        <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="relative bg-[linear-gradient(160deg,var(--maroon-900)_0%,var(--maroon-800)_50%,var(--maroon-950)_100%)] px-8 pt-8 pb-6 text-center">
            <div className="relative z-10">
              <h1 className="text-xl font-bold font-sans leading-tight text-white">
                TAMU Research Tracker
              </h1>
              <p className="mt-1 text-sm font-sans text-white/70">
                Find your next breakthrough.
              </p>
            </div>
          </div>
          <div className="px-8 pb-8 pt-6">
            <h2 className="mb-2 text-xl font-bold font-sans text-[var(--gray-900)]">
              Check your email
            </h2>
            <p className="text-[15px] font-sans text-[var(--gray-600)]">
              We&apos;ve sent a verification link to <strong>{email}</strong>. Click the link to
              verify your account, then sign in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-[15px] font-medium font-sans text-[var(--maroon-900)] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gray-100)] p-6">
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
            Create account
          </h2>
          <p className="mb-6 text-[15px] font-sans text-[var(--gray-600)]">
            Sign up with your @tamu.edu email address
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputBox}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="student@tamu.edu"
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
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
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
              <p className="mt-1.5 text-xs font-sans text-[var(--gray-500)]">
                Must be at least 8 characters
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm font-sans text-red-800">{error}</div>
            )}

            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] font-sans text-[var(--gray-500)]">
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
