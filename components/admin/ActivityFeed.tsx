'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ActivityEvent {
  timestamp: string;
  userType: string;
  userEmail: string;
  action: string;
  target: string;
}

interface Props {
  limit?: number;
}

export function ActivityFeed({ limit = 50 }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
    // Refresh every 10 seconds
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, [limit]);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/activity-feed?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading activity...</div>;
  }

  if (events.length === 0) {
    return <div className="text-center py-4 text-gray-500">No recent activity</div>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {events.map((event, index) => (
        <div
          key={index}
          className="flex items-center gap-3 text-sm border-b pb-2 last:border-0"
        >
          <span className="text-xs text-gray-500 w-20 shrink-0">
            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
          </span>
          <Badge variant={event.userType === 'guest' ? 'outline' : 'default'} className="shrink-0">
            {event.userType === 'guest' ? 'Guest' : event.userEmail.split('@')[0]}
          </Badge>
          <span className="text-gray-600">{event.action}</span>
          <span className="font-medium">{event.target}</span>
        </div>
      ))}
    </div>
  );
}
