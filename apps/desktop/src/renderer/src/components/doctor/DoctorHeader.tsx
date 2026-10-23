import React from 'react';
import { Search, Calendar, Bell } from 'lucide-react';
import { CURRENT_DOCTOR } from './doctorMockData';

export interface DoctorHeaderProps {
  title: string;
  subtitle?: string;
  date?: string;
  syncReady?: boolean;
  onSearch?: (q: string) => void;
}

export function DoctorHeader({
  title,
  subtitle,
  date = 'Oct 19, 2026',
  syncReady = true,
}: DoctorHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        borderBottom: '1px solid rgba(30,41,59,0.7)',
        background: 'rgba(11,19,41,0.75)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}
    >
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Date pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(21,30,51,0.6)',
            border: '1px solid rgba(30,41,59,0.8)',
            borderRadius: '10px',
            padding: '6px 12px',
            fontSize: '12px',
          }}
        >
          <Calendar size={14} color="#38bdf8" />
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{date}</span>
        </div>

        {/* SQLite Local Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#38bdf8',
          }}
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: syncReady ? '#38bdf8' : '#fbbf24',
              boxShadow: syncReady ? '0 0 8px #38bdf8' : 'none',
            }}
          />
          <span>{syncReady ? 'SQLite Active' : 'Connecting...'}</span>
        </div>
      </div>
    </header>
  );
}
