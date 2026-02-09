'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  userType: 'registered' | 'guest';
}

export function UserBreakdown({ userType }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBreakdown();
  }, [userType]);

  const fetchBreakdown = async () => {
    try {
      // This would fetch user breakdown data
      // For now, we'll use summary data
      const response = await fetch('/api/admin/analytics/summary');
      if (!response.ok) throw new Error('Failed to fetch');
      const summary = await response.json();
      
      if (userType === 'registered') {
        setData({
          total: summary.totalUsers.registered,
          active: summary.activeUsers.last7Days,
        });
      } else {
        setData({
          total: summary.totalUsers.guest,
          active: 0, // Guest active users would need separate tracking
        });
      }
    } catch (error) {
      console.error('Failed to fetch breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {userType === 'registered' ? 'Registered Users' : 'Guest Users'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {userType === 'registered' ? 'Registered Users' : 'Guest Users'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
            <p className="text-sm text-gray-600">Total {userType === 'registered' ? 'Registered' : 'Guest'} Users</p>
          </div>
          {userType === 'registered' && (
            <div>
              <div className="text-xl font-semibold">{data?.active || 0}</div>
              <p className="text-sm text-gray-600">Active (Last 7 days)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
