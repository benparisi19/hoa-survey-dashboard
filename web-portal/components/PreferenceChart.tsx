'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from '@/lib/utils';

interface PreferenceData {
  preference: string;
  count: number;
  percentage: number;
}

interface PreferenceChartProps {
  data: PreferenceData[];
}

export default function PreferenceChart({ data }: PreferenceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No preference data available
      </div>
    );
  }
  
  const formatLabel = (preference: string) => {
    if (preference.length > 30) {
      return preference.substring(0, 30) + '...';
    }
    return preference;
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-900 mb-1">{data.preference}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.count}</span> responses ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col space-y-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">
              {formatLabel(entry.payload.preference)} ({entry.payload.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={60}
            fill="#8884d8"
            dataKey="count"
            label={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            content={<CustomLegend />}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}