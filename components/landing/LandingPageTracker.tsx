'use client';

import { useEffect, useRef } from 'react';

export function LandingPageTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch('/api/admin/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [
          {
            eventType: 'landing_page_view',
            eventData: {
              referrer: document.referrer || 'direct',
              path: '/',
            },
            timestamp: new Date().toISOString(),
            userId: null,
            sessionId:
              localStorage.getItem('analytics_session_id') ||
              `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userType: 'guest',
          },
        ],
      }),
    }).catch(() => {});
  }, []);

  return null;
}
