'use client';

import { useEffect, useState } from 'react';

interface Props {
  dateRange: string;
}

export function TabClicksChart({ dateRange }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [dateRange]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/tabs?dateRange=${dateRange}&userType=all`);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      
      // Format data for chart (simplified - would need time series data for proper chart)
      const chartData = result.tabs?.map((tab: any) => ({
        name: tab.tabName,
        clicks: tab.totalClicks,
      })) || [];
      
      setData(chartData);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading chart...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No data available</div>;
  }

  // Simple bar chart visualization using CSS
  const maxClicks = Math.max(...data.map(d => d.clicks), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.name}</span>
            <span className="text-gray-600">{item.clicks.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-maroon-900 h-2 rounded-full transition-all"
              style={{ width: `${(item.clicks / maxClicks) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
