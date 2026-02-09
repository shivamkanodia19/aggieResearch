import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AnalyticsEvent {
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
}

export function useAnalytics() {
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const sessionIdRef = useRef<string>(
    typeof window !== 'undefined' 
      ? localStorage.getItem('analytics_session_id') || generateSessionId()
      : ''
  );
  const userIdRef = useRef<string | null>(null);

  // Initialize session ID and get user ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('analytics_session_id')) {
        localStorage.setItem('analytics_session_id', sessionIdRef.current);
      }

      // Get user ID from Supabase
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        userIdRef.current = user?.id || null;
      });
    }
  }, []);

  // Flush events every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      flushEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Flush on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushEvents(true); // synchronous flush
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const trackEvent = (eventType: string, eventData: Record<string, any>) => {
    const event: AnalyticsEvent = {
      eventType,
      eventData,
      timestamp: new Date(),
    };

    eventQueueRef.current.push(event);

    // Flush immediately for important events
    if (eventType === 'signup' || eventType === 'conversion') {
      flushEvents();
    }
  };

  const flushEvents = async (sync = false) => {
    if (eventQueueRef.current.length === 0) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    const payload = {
      events: events.map(e => ({
        ...e,
        userId: userIdRef.current || null,
        sessionId: sessionIdRef.current,
        userType: userIdRef.current ? 'registered' : 'guest',
      })),
    };

    if (sync) {
      // Synchronous request for page unload
      navigator.sendBeacon('/api/admin/analytics/events', JSON.stringify(payload));
    } else {
      // Async request for normal tracking
      try {
        await fetch('/api/admin/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('Failed to send analytics:', error);
        // Re-queue events on failure
        eventQueueRef.current.unshift(...events);
      }
    }
  };

  return { trackEvent };
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
