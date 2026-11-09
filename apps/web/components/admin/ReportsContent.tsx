'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchClinicDashboardStats } from '../../lib/api/staff';
import type { ClinicDashboardStatsDTO } from '@mcms/contracts';

export function ReportsContent() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<ClinicDashboardStatsDTO | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        const data = await fetchClinicDashboardStats(accessToken);
        if (mounted && data) setStats(data);
      } catch (err) {
        console.error('Failed to load reports stats:', err);
      }
    }
    void loadStats();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%' }}>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>📈</span>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Reports & Analytics</h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
              Real-time clinic metrics and generated summary reports.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', fontSize: 11, color: '#374151' }}>
              📅 {dateFormatted}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Total Patients', val: stats?.totalPatients ?? 0, change: 'Active patient files', cl: '#059669', icon: '👥', bg: '#EFF6FF' },
            { label: "Today's Appointments", val: stats?.todayAppointmentsCount ?? 0, change: 'Scheduled today', cl: '#059669', icon: '📅', bg: '#F0FDF4' },
            { label: 'Total Doctors', val: stats?.totalDoctors ?? 0, change: 'Active clinical doctors', cl: '#059669', icon: '🩺', bg: '#FDF4FF' },
            { label: 'Clinical Departments', val: stats?.totalDepartments ?? 0, change: 'Configured departments', cl: '#059669', icon: '🏥', bg: '#FFF7ED' },
          ].map((c, i) => (
            <div key={i} style={card}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 10 }}>
                {c.icon}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '2px 0' }}>{c.val}</div>
              <div style={{ fontSize: 10 }}>
                <span style={{ color: c.cl, fontWeight: 600 }}>{c.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📄</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Generated Reports</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>Audit and compliance report logs.</div>
            </div>
          </div>
          <div style={{ padding: 48, textAlign: 'center', margin: 'auto' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>No exported reports yet</div>
            <p style={{ fontSize: 12, color: '#6B7280', maxWidth: 360, margin: '6px auto 0' }}>
              Custom report exports and audits generated for this clinic will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
