'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const COLORS = ['#6655c5', '#84cbb1', '#f3bb70', '#e47b87'];

interface DashboardChartsProps {
  mode: 'manager' | 'accountant';
  values: number[];
}

export function DashboardCharts({ mode, values }: DashboardChartsProps) {
  const data = mode === 'manager'
    ? [
        { name: 'Complaints', value: values[0] ?? 0 },
        { name: 'Bills', value: values[1] ?? 0 },
        { name: 'Visitors', value: values[2] ?? 0 },
        { name: 'Bookings', value: values[3] ?? 0 },
      ]
    : [
        { name: 'Billed', value: values[0] ?? 0 },
        { name: 'Collected', value: values[1] ?? 0 },
        { name: 'Pending', value: values[2] ?? 0 },
        { name: 'Overdue', value: values[3] ?? 0 },
      ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between border-0 pb-0">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9186bd]">Live overview</p>
          <CardTitle>{mode === 'manager' ? 'Community pulse' : 'Collection snapshot'}</CardTitle>
        </div>
        <span className="badge rounded-full border-0 bg-[#e9f8f2] text-[#14745e]">This month</span>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#eceaf4" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8990a3', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8990a3', fontSize: 11 }} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f7f5ff' }} contentStyle={{ borderRadius: 14, border: '1px solid #ebe9f5', boxShadow: '0 10px 30px rgba(42,35,86,.1)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={42}>
                {data.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
