'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '@/lib/utils';

interface ServiceRatingData {
  rating: string;
  count: number;
  percentage: number;
}

interface ServiceRatingChartProps {
  data: ServiceRatingData[];
}

const RATING_COLORS: Record<string, string> = {
  'Excellent': '#10B981', // Green
  'Good': '#84CC16',      // Lime
  'Fair': '#F59E0B',      // Amber
  'Poor': '#EF4444',      // Red
  'Very Poor': '#DC2626', // Dark red
};

export default function ServiceRatingChart({ data }: ServiceRatingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No service rating data available
      </div>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.count}</span> responses ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="rating" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={RATING_COLORS[entry.rating] || CHART_COLORS[index % CHART_COLORS.length]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}