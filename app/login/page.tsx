"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ─── Network animation canvas ────────────────────────────────────────────────

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const NODE_COUNT = 38;
    const CONNECTION_DIST = 130;
    const nodes: Node[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);

    resize();
    init();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const redirectTo = searchParams.get("redirectTo") || "/opportunities";

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoadingGoogle(true);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoadingGoogle(false);
    }
    // On success, Supabase redirects the browser — no further action needed
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingEmail(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoadingEmail(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel: animated network ── */}
      <div className="relative hidden lg:flex lg:w-1/2 items-end overflow-hidden bg-[linear-gradient(160deg,#500000_0%,#3a0000_55%,#1a0000_100%)]">
        <NetworkAnimation />

        {/* Overlay copy */}
        <div className="relative z-10 p-12 pb-14">
          <div className="mb-5 flex items-center gap-3">
            {/* Logo mark */}
            <svg
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9 shrink-0"
            >
              <circle cx="36" cy="20" r="6" fill="rgba(255,255,255,0.9)" />
              <circle cx="20" cy="48" r="5" fill="rgba(255,255,255,0.6)" />
              <circle cx="52" cy="48" r="5" fill="rgba(255,255,255,0.6)" />
              <circle cx="36" cy="56" r="4" fill="rgba(255,255,255,0.4)" />
              <line x1="36" y1="26" x2="23" y2="44" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
              <line x1="36" y1="26" x2="49" y2="44" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
              <line x1="24" y1="50" x2="33" y2="54" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <line x1="48" y1="50" x2="39" y2="54" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            </svg>
            <span className="text-lg font-bold text-white leading-tight">
              TAMU Research Tracker
            </span>
          </div>
          <p className="max-w-xs text-[15px] leading-relaxed text-white/60">
            Discover, track, and land undergraduate research positions at Texas
            A&amp;M — all in one place.
          </p>
        </div>
      </div>

      {/* ── Right panel: sign-in ── */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <svg
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
          >
            <circle cx="36" cy="20" r="6" fill="#500000" />
            <circle cx="20" cy="48" r="5" fill="#7b0000" />
            <circle cx="52" cy="48" r="5" fill="#7b0000" />
            <circle cx="36" cy="56" r="4" fill="#a33333" />
            <line x1="36" y1="26" x2="23" y2="44" stroke="#500000" strokeWidth="2" opacity="0.4" />
            <line x1="36" y1="26" x2="49" y2="44" stroke="#500000" strokeWidth="2" opacity="0.4" />
            <line x1="24" y1="50" x2="33" y2="54" stroke="#500000" strokeWidth="1.5" opacity="0.25" />
            <line x1="48" y1="50" x2="39" y2="54" stroke="#500000" strokeWidth="1.5" opacity="0.25" />
          </svg>
          <span className="text-base font-bold text-[var(--gray-900)]">
            TAMU Research Tracker
          </span>
        </div>

        <div className="w-full max-w-[360px]">
          <h1 className="mb-1 text-2xl font-bold text-[var(--gray-900)]">
            Sign in
          </h1>
          <p className="mb-8 text-[15px] text-[var(--gray-600)]">
            Sign in to track your research applications.
          </p>

          {/* Google SSO button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3 text-[15px] font-medium text-[var(--gray-900)] shadow-sm transition-all hover:bg-[var(--gray-50)] hover:border-[var(--gray-300)] focus:outline-none focus:ring-2 focus:ring-[var(--maroon-900)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Google "G" logo */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              aria-hidden
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            {loadingGoogle ? "Redirecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--gray-200)]" />
            <span className="text-xs text-[var(--gray-400)]">or</span>
            <div className="h-px flex-1 bg-[var(--gray-200)]" />
          </div>

          {/* Email sign-in toggle */}
          {!showEmail ? (
            <button
              type="button"
              onClick={() => setShowEmail(true)}
              className="flex w-full items-center justify-center rounded-lg border border-[var(--gray-200)] px-4 py-3 text-[15px] font-medium text-[var(--gray-600)] transition-all hover:bg-[var(--gray-50)] hover:border-[var(--gray-300)] hover:text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--maroon-900)] focus:ring-offset-2"
            >
              Sign in with email
            </button>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <input
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3 text-[15px] text-[var(--gray-900)] placeholder:text-[var(--gray-400)] transition-[border-color,box-shadow] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)]"
              />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3 text-[15px] text-[var(--gray-900)] placeholder:text-[var(--gray-400)] transition-[border-color,box-shadow] hover:border-[var(--gray-300)] focus:border-[var(--maroon-900)] focus:outline-none focus:ring-[3px] focus:ring-[var(--maroon-100)]"
              />
              <button
                type="submit"
                disabled={loadingEmail}
                className="w-full cursor-pointer rounded-lg bg-[var(--maroon-900)] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--maroon-700)] focus:outline-none focus:ring-2 focus:ring-[var(--maroon-900)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingEmail ? "Signing in..." : "Sign in"}
              </button>
              <p className="text-center text-[13px] text-[var(--gray-500)]">
                No account?{" "}
                <Link href="/signup" className="font-medium text-[var(--maroon-900)] hover:underline no-underline">
                  Sign up
                </Link>
              </p>
            </form>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--gray-200)]" />
          </div>

          {/* Guest mode */}
          <Link
            href="/opportunities"
            className="block text-center text-sm text-[var(--gray-500)] no-underline transition-colors hover:text-[var(--maroon-900)]"
          >
            Just browsing? Continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <span className="text-[var(--gray-500)]">Loading...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
