'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueDataPoint {
  month: string;
  mrr: number;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
          tickFormatter={(value) =>
            formatCurrency(value).replace('.00', '')
          }
        />
        <Tooltip
          formatter={(value: any) => [formatCurrency(value), 'MRR']}
        />
        <Line
          type="monotone"
          dataKey="mrr"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

