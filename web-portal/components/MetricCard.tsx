import { formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  total: number;
  type: 'success' | 'warning' | 'error' | 'info';
  description: string;
}

export default function MetricCard({ label, value, total, type, description }: MetricCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <TrendingDown className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'info':
        return <Users className="h-6 w-6 text-blue-600" />;
    }
  };
  
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-600',
          value: 'text-green-900',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-600',
          value: 'text-yellow-900',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-600',
          value: 'text-red-900',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          value: 'text-blue-900',
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <h3 className="text-sm font-medium text-gray-700">{label}</h3>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${colors.value}`}>
                {value}
              </span>
              <span className={`text-sm font-medium ${colors.text}`}>
                ({percentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      {total !== value && (
        <p className="mt-1 text-xs text-gray-500">
          out of {total} total responses
        </p>
      )}
    </div>
  );
}