'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export type LabCardColor = 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'cyan';

export interface LabStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: LabCardColor;
  change?: {
    value?: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  className?: string;
}

const colorMap: Record<LabCardColor, { iconBg: string; iconColor: string; borderColor: string }> = {
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-100',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
  },
  rose: {
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    borderColor: 'border-rose-100',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-100',
  },
  cyan: {
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-100',
  },
};

export default function LabStatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  change,
  className = '',
}: LabStatCardProps) {
  const theme = colorMap[color] || colorMap.blue;
  const deltaText = change ? (change.change ?? change.value?.toString()) : undefined;

  return (
    <div
      className={`bg-white rounded-2xl p-2.5 sm:p-3 xl:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300/90 transition-all duration-150 flex flex-col justify-between group min-w-0 ${className}`}
    >
      <div className="flex items-start gap-2 xl:gap-2.5">
        {Icon && (
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center shrink-0 border ${theme.borderColor} group-hover:scale-105 transition-transform duration-150`}
          >
            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-[11px] xl:text-xs font-bold text-slate-500 uppercase tracking-wider truncate leading-tight">
            {title}
          </div>
          <div className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-1">
            {value}
          </div>
        </div>
      </div>

      {change && deltaText && (
        <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold flex-nowrap truncate">
          {change.trend === 'up' && (
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold shrink-0">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              {deltaText}
            </span>
          )}
          {change.trend === 'down' && (
            <span className="inline-flex items-center gap-0.5 text-rose-500 font-bold shrink-0">
              <TrendingDown className="w-3 h-3 stroke-[2.5]" />
              {deltaText}
            </span>
          )}
          {change.trend === 'neutral' && (
            <span className="inline-flex items-center gap-0.5 text-purple-600 font-bold shrink-0">
              {deltaText}
            </span>
          )}
          {change.label && (
            <span className="text-slate-400 font-medium text-[9px] sm:text-[10px] xl:text-[11px] truncate">
              {change.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

