'use client';

import React from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  Receipt,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export interface ReceptionistStatCardProps {
  title: string;
  value: string | number;
  prefix?: string | undefined;
  suffix?: string | undefined;
  change?: string | undefined;
  trend?: 'up' | 'down' | undefined;
  trendLabel?: string | undefined;
  iconName?: ('users' | 'calendar' | 'check-circle' | 'receipt' | 'clock' | 'dollar') | undefined;
  color?: ('blue' | 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose') | undefined;
  className?: string | undefined;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  cyan: {
    bg: 'bg-teal-50',
    icon: 'text-teal-600',
    border: 'border-teal-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    border: 'border-amber-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-100',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    border: 'border-rose-100',
  },
};

const iconMap = {
  users: Users,
  calendar: Calendar,
  'check-circle': CheckCircle2,
  receipt: Receipt,
  clock: Clock,
  dollar: DollarSign,
};

function ReceptionistStatCard({
  title,
  value,
  prefix,
  suffix,
  change,
  trend = 'up',
  trendLabel = 'vs. yesterday',
  iconName = 'users',
  color = 'blue',
  className = '',
}: ReceptionistStatCardProps) {
  const Icon = iconMap[iconName] || Users;
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between min-w-0 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 tracking-tight truncate mb-0.5" title={title}>
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-xs sm:text-sm font-bold text-slate-600">{prefix}</span>}
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              {value}
            </h3>
            {suffix && <span className="text-[11px] font-semibold text-slate-500">{suffix}</span>}
          </div>
        </div>

        <div
          className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg ${colors.bg} ${colors.icon} ${colors.border} border flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>

      {change && (
        <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] sm:text-[11px] font-medium leading-none">
          {trend === 'up' ? (
            <span className="flex items-center text-emerald-600 font-bold gap-0.5 shrink-0">
              <TrendingUp className="w-3 h-3" />
              {change}
            </span>
          ) : (
            <span className="flex items-center text-emerald-600 font-bold gap-0.5 shrink-0">
              <TrendingDown className="w-3 h-3" />
              {change}
            </span>
          )}
          <span className="text-slate-400 text-[10px] font-normal truncate">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

export default React.memo(ReceptionistStatCard);
