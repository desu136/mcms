'use client';

import React, { ReactNode } from 'react';
import {
  Users,
  CalendarDays,
  Syringe,
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
} from 'lucide-react';

export interface NurseStatCardProps {
  // Flexible API (used by new pages)
  icon?: ReactNode | React.ComponentType<any>;
  iconBg?: string;
  label?: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;

  // Original API (used by dashboard/vitals)
  title?: string;
  value: string | number;
  iconName?: 'users' | 'calendar' | 'syringe' | 'bell' | 'clock' | 'alert' | 'check' | 'activity' | 'heart';
  trendText?: string;
  trendDirection?: 'up' | 'down';
  trendIsPositive?: boolean;
  colorTheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  className?: string;
}

const themeStyles = {
  blue: {
    bg: 'bg-blue-50/70',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-emerald-50/70',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'bg-purple-50/70',
    iconColor: 'text-purple-600',
    border: 'border-purple-100',
  },
  orange: {
    bg: 'bg-amber-50/70',
    iconColor: 'text-amber-600',
    border: 'border-amber-100',
  },
  red: {
    bg: 'bg-rose-50/70',
    iconColor: 'text-rose-600',
    border: 'border-rose-100',
  },
  cyan: {
    bg: 'bg-teal-50/70',
    iconColor: 'text-teal-600',
    border: 'border-teal-100',
  },
};

const iconMap = {
  users: Users,
  calendar: CalendarDays,
  syringe: Syringe,
  bell: Bell,
  clock: Clock,
  alert: AlertTriangle,
  check: CheckCircle2,
  activity: Activity,
  heart: Heart,
};

export function NurseStatCard({
  // Flexible API
  icon: iconNode,
  iconBg,
  label,
  trend,
  trendUp,
  color,
  // Legacy API
  title,
  value,
  iconName = 'users',
  trendText,
  trendDirection = 'up',
  trendIsPositive = true,
  colorTheme = 'blue',
  className = '',
}: NurseStatCardProps) {
  // Determine which API is in use
  const isFlexible = iconNode !== undefined || iconBg !== undefined || label !== undefined;

  // Flexible rendering
  if (isFlexible) {
    const displayLabel = label ?? title ?? '';
    const displayTrend = trend ?? trendText;
    const isPositive = trendUp ?? trendIsPositive;

    const colorMap: Record<string, { bg: string; text: string }> = {
      blue:   { bg: 'bg-blue-50',    text: 'text-blue-600' },
      green:  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
      purple: { bg: 'bg-purple-50',  text: 'text-purple-600' },
      amber:  { bg: 'bg-amber-50',   text: 'text-amber-600' },
      orange: { bg: 'bg-orange-50',  text: 'text-orange-600' },
      red:    { bg: 'bg-rose-50',    text: 'text-rose-600' },
      cyan:   { bg: 'bg-cyan-50',    text: 'text-cyan-600' },
    };

    const palette = color ? colorMap[color] : undefined;
    const bgClass = iconBg ?? palette?.bg ?? 'bg-blue-50';
    const textClass = palette?.text ?? 'text-blue-600';

    const renderIcon = () => {
      if (!iconNode) return null;
      if (React.isValidElement(iconNode)) return iconNode;
      if (typeof iconNode === 'function' || (typeof iconNode === 'object' && iconNode !== null)) {
        return React.createElement(iconNode as any, { size: 18, className: textClass });
      }
      return null;
    };

    return (
      <div className={`bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-150 flex items-center gap-2.5 sm:gap-3 min-w-0 ${className}`}>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
          {renderIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 truncate">{displayLabel}</p>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight mt-0.5">{value}</div>
          {displayTrend && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[10px] font-bold inline-flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {displayTrend.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate">{displayTrend.split(' ').slice(1).join(' ')}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Legacy rendering
  const Icon = iconMap[iconName!] || Users;
  const theme = themeStyles[colorTheme!] || themeStyles.blue;

  return (
    <div className={`bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-150 flex items-center gap-2.5 sm:gap-3 min-w-0 ${className}`}>
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${theme.bg} ${theme.border} border flex items-center justify-center shrink-0`}>
        <Icon className={`w-4.5 h-4.5 ${theme.iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-500 truncate" title={title}>{title}</p>
        <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight mt-0.5">{value}</div>
        {trendText && (
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-[10px] font-bold inline-flex items-center gap-0.5 ${trendIsPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendText.split(' ')[0]}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate">{trendText.split(' ').slice(1).join(' ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(NurseStatCard);
