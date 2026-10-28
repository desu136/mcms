import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  change?: string;
  changeDir?: 'up' | 'down' | 'neutral';
  changeLabel?: string;
  suffix?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-500',
  change,
  changeDir = 'neutral',
  changeLabel = 'vs. last month',
  suffix,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6EEFF] shadow-sm flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value}
          {suffix && <span className="text-base font-medium text-gray-500 ml-1">{suffix}</span>}
        </p>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            {changeDir === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
            {changeDir === 'down' && <TrendingDown size={12} className="text-red-500" />}
            {changeDir === 'neutral' && <Minus size={12} className="text-gray-400" />}
            <span
              className={`text-xs font-medium ${
                changeDir === 'up'
                  ? 'text-emerald-600'
                  : changeDir === 'down'
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}
            >
              {change}
            </span>
            <span className="text-xs text-gray-400">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
