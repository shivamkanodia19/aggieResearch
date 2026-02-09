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
import { Download, Users, Activity, TrendingUp, MousePointerClick } from 'lucide-react';
import { TabClicksTable } from '@/components/admin/TabClicksTable';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { UserBreakdown } from '@/components/admin/UserBreakdown';
import { TabClicksChart } from '@/components/admin/TabClicksChart';
import { useRouter } from 'next/navigation';

interface SummaryData {
  totalUsers: { registered: number; guest: number; total: number };
  activeUsers: { last7Days: number; last30Days: number };
  newSignups: { today: number; thisWeek: number; thisMonth: number };
  conversionRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
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
      
      if (response.status === 401 || response.status === 403) {
        setError('Unauthorized access. Admin privileges required.');
        router.push('/opportunities');
        return;
      }

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
    // TODO: Implement CSV export
    alert('Export functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">User metrics and analytics</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalUsers.total || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {summary?.totalUsers.registered || 0} registered • {summary?.totalUsers.guest || 0} guest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeUsers.last7Days || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Last 7 days • {summary?.activeUsers.last30Days || 0} in 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.newSignups.thisWeek || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              This week • {summary?.newSignups.today || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.conversionRate || 0}%</div>
            <p className="text-xs text-gray-600 mt-1">Guest → Registered</p>
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
