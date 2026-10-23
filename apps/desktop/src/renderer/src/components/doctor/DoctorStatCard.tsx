import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface DoctorStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    trend?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'cyan';
}

const colorMap = {
  blue: { bg: 'rgba(56,189,248,0.12)', text: '#38bdf8', border: 'rgba(56,189,248,0.25)' },
  emerald: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
  purple: { bg: 'rgba(192,132,252,0.12)', text: '#c084fc', border: 'rgba(192,132,252,0.25)' },
  orange: { bg: 'rgba(251,146,60,0.12)', text: '#fb923c', border: 'rgba(251,146,60,0.25)' },
  cyan: { bg: 'rgba(34,211,238,0.12)', text: '#22d3ee', border: 'rgba(34,211,238,0.25)' },
};

export function DoctorStatCard({
  title,
  value,
  icon: Icon,
  change,
  color = 'blue',
}: DoctorStatCardProps) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      style={{
        background: 'rgba(21,30,51,0.65)',
        border: '1px solid rgba(30,41,59,0.9)',
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2, marginTop: '2px' }}>
          {value}
        </div>
        {change && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginTop: '2px',
              color: change.trend === 'down' ? '#f87171' : '#4ade80',
            }}
          >
            {change.trend === 'down' ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
            <span>{change.value}</span>
            {change.label && <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '2px' }}>{change.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
