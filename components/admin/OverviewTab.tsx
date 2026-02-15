'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Users, Activity, TrendingUp, MousePointerClick, Eye } from 'lucide-react';
import { TabClicksTable } from '@/components/admin/TabClicksTable';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { UserBreakdown } from '@/components/admin/UserBreakdown';
import { TabClicksChart } from '@/components/admin/TabClicksChart';

interface SummaryData {
  totalUsers: { registered: number; guest: number; total: number };
  activeUsers: { last7Days: number; last30Days: number };
  newSignups: { today: number; thisWeek: number; thisMonth: number };
  conversionRate: number;
  landingPageViews?: { last7Days: number; total: number };
}

export function OverviewTab() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/analytics/summary');

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert('Export functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalUsers.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.totalUsers.registered || 0} registered &bull; {summary?.totalUsers.guest || 0} guest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeUsers.last7Days || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days &bull; {summary?.activeUsers.last30Days || 0} in 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.newSignups.thisWeek || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This week &bull; {summary?.newSignups.today || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Guest &rarr; Registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Landing Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.landingPageViews?.last7Days || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days &bull; {summary?.landingPageViews?.total || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Analytics Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tab Click Analytics</CardTitle>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={handleExport}>
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TabClicksTable dateRange={dateRange} userType={userTypeFilter} />
        </CardContent>
      </Card>

      {/* User Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserBreakdown userType="registered" />
        <UserBreakdown userType="guest" />
      </div>

      {/* Activity Feed & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Activity Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed limit={50} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tab Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <TabClicksChart dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
