// src/modules/dashboard/components/ChartCard.jsx
import { useState } from 'react';
import { ChevronDown, BarChart2, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';

const ChartCard = ({ 
  title, 
  icon: Icon, 
  children, 
  value, 
  change, 
  changeType = 'up',
  period = 'últimos 7 días'
}) => {
  const [showPeriod, setShowPeriod] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-teal-600" />}
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowPeriod(!showPeriod)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {period}
              <ChevronDown size={12} />
            </button>
            {showPeriod && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                {['últimos 7 días', 'últimos 30 días', 'últimos 90 días'].map(opt => (
                  <button 
                    key={opt}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowPeriod(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {value !== undefined && (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">{value}</span>
              {change !== undefined && (
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {changeType === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {change}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">vs período anterior</p>
          </div>
        )}
        
        {/* Gráfico personalizado (Recharts) */}
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartCard;