import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export type CardColor = 'blue' | 'emerald' | 'purple' | 'orange' | 'cyan' | 'amber' | 'rose';

export interface DoctorStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    trend?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  color?: CardColor;
  className?: string;
}

const colorStyles: Record<CardColor, { bg: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-500',
    border: 'border-orange-100',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-500',
    border: 'border-rose-100',
  },
};

export function DoctorStatCard({
  title,
  value,
  icon: Icon,
  change,
  color = 'blue',
  className = '',
}: DoctorStatCardProps) {
  const c = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`bg-white rounded-xl p-2 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center gap-2 min-w-0 ${className}`}
    >
      <div
        className={`w-7 h-7 rounded-lg ${c.bg} ${c.text} flex items-center justify-center shrink-0 border ${c.border}`}
      >
        <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold text-slate-500 truncate leading-tight" title={title}>
          {title}
        </div>
        <div className="text-base font-extrabold text-slate-800 tracking-tight leading-tight">
          {value}
        </div>
        {change && (
          <div
            className={`flex items-center gap-0.5 text-[9px] font-semibold leading-tight truncate ${
              change.trend === 'down' ? 'text-rose-500' : 'text-emerald-600'
            }`}
          >
            {change.trend === 'down' ? (
              <TrendingDown className="w-2.5 h-2.5 shrink-0" />
            ) : (
              <TrendingUp className="w-2.5 h-2.5 shrink-0" />
            )}
            <span className="truncate">{change.value}</span>
            {change.label && (
              <span className="text-slate-400 font-normal truncate">
                &nbsp;{change.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default DoctorStatCard;
