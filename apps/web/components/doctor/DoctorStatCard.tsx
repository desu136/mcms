'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export type CardColor = 'blue' | 'emerald' | 'purple' | 'orange' | 'cyan' | 'amber' | 'rose';

export interface DoctorStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
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

export default function DoctorStatCard({
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
      className={`bg-white rounded-2xl p-2.5 sm:p-3 xl:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-w-0 ${className}`}
    >
      <div className="flex items-start gap-2 xl:gap-2.5">
        {Icon && (
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0 border ${c.border}`}
          >
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title={title}>
            {title}
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-1">
            {value}
          </div>
        </div>
      </div>
      {change && (
        <div
          className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold mt-2 truncate ${
            change.trend === 'down' ? 'text-rose-500' : 'text-emerald-600'
          }`}
        >
          {change.trend === 'down' ? (
            <TrendingDown className="w-3 h-3 shrink-0" />
          ) : (
            <TrendingUp className="w-3 h-3 shrink-0" />
          )}
          <span className="truncate">{change.value}</span>
          {change.label && (
            <span className="text-slate-400 font-normal truncate hidden sm:inline">
              {change.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
