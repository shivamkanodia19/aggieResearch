'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TabData {
  tabName: string;
  totalClicks: number;
  uniqueUsers: number;
  avgClicksPerUser: string;
  clickRate: number;
  trend?: number;
}

interface Props {
  dateRange: string;
  userType: string;
}

export function TabClicksTable({ dateRange, userType }: Props) {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabData();
  }, [dateRange, userType]);

  const fetchTabData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/analytics/tabs?dateRange=${dateRange}&userType=${userType}`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTabs(data.tabs || []);
    } catch (error) {
      console.error('Failed to fetch tab data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  if (tabs.length === 0) {
    return <div className="text-center py-4 text-gray-500">No data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tab Name</TableHead>
            <TableHead className="text-right">Total Clicks</TableHead>
            <TableHead className="text-right">Unique Users</TableHead>
            <TableHead className="text-right">Avg Clicks/User</TableHead>
            <TableHead className="text-right">Click Rate %</TableHead>
            <TableHead className="text-right">Trend (7d)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tabs.map((tab) => (
            <TableRow key={tab.tabName}>
              <TableCell className="font-medium">{tab.tabName}</TableCell>
              <TableCell className="text-right">{tab.totalClicks.toLocaleString()}</TableCell>
              <TableCell className="text-right">{tab.uniqueUsers.toLocaleString()}</TableCell>
              <TableCell className="text-right">{tab.avgClicksPerUser}</TableCell>
              <TableCell className="text-right">{tab.clickRate}%</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {tab.trend && tab.trend > 0 && (
                    <>
                      <ArrowUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 text-sm">{tab.trend}%</span>
                    </>
                  )}
                  {tab.trend && tab.trend < 0 && (
                    <>
                      <ArrowDown className="h-3 w-3 text-red-600" />
                      <span className="text-red-600 text-sm">{Math.abs(tab.trend)}%</span>
                    </>
                  )}
                  {(!tab.trend || tab.trend === 0) && (
                    <>
                      <Minus className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-400 text-sm">0%</span>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
