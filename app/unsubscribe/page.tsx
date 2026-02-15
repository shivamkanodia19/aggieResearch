'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    if (!token) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Link</h1>
          <p className="text-gray-600">This unsubscribe link is missing a token.</p>
          <Link href="/" className="text-[#500000] hover:underline text-sm">
            Go to TAMU Research Tracker
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Unsubscribed</h1>
          <p className="text-gray-600">
            You&apos;ve been unsubscribed from all TAMU Research Tracker emails.
          </p>
          <p className="text-sm text-gray-500">
            Changed your mind?{' '}
            <Link href="/settings" className="text-[#500000] hover:underline">
              Re-enable notifications in Settings
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="text-gray-600">
            This link may be expired or invalid. You can manage your email preferences directly in Settings.
          </p>
          <Link
            href="/settings"
            className="inline-block rounded-lg bg-[#500000] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#3a0000]"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Unsubscribe from Emails</h1>
        <p className="text-gray-600">
          This will turn off all email notifications from TAMU Research Tracker, including
          opportunity alerts and weekly log reminders.
        </p>
        <button
          onClick={handleUnsubscribe}
          disabled={status === 'loading'}
          className="inline-block rounded-lg bg-[#500000] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#3a0000] disabled:opacity-50"
        >
          {status === 'loading' ? 'Unsubscribing...' : 'Confirm Unsubscribe'}
        </button>
        <p className="text-xs text-gray-400">
          You can re-enable notifications anytime in{' '}
          <Link href="/settings" className="text-[#500000] hover:underline">
            Settings
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
