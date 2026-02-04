import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="max-w-xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-tamu-maroon">
          TAMU Research Application Tracker
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover, track, and manage your research opportunity applications in
          one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-tamu-maroon px-6 py-3 text-white font-medium hover:bg-tamu-maroonDark transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border-2 border-tamu-maroon px-6 py-3 text-tamu-maroon font-medium hover:bg-tamu-maroon/5 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
