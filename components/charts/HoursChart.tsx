"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HoursChartProps {
  logs: {
    week_start: string;
    hours_worked: number | null;
    week_number?: number | null;
  }[];
}

export function HoursChart({ logs }: HoursChartProps) {
  const data = logs
    .filter((log) => log.hours_worked != null)
    .sort(
      (a, b) =>
        new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
    )
    .map((log) => {
      const d = new Date(log.week_start);
      return {
        week: `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        hours: log.hours_worked ?? 0,
        weekNum: log.week_number,
      };
    });

  if (data.length < 2) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        Hours Over Time
      </h3>
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#500000" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#500000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e5e5" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              unit="h"
            />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                fontSize: "13px",
              }}
              formatter={(value: number | undefined) => [`${value ?? 0} hours`, "Hours"]}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#500000"
              strokeWidth={2}
              fill="url(#hoursGradient)"
              dot={{ r: 3, fill: "#500000", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#500000", strokeWidth: 2, stroke: "white" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
