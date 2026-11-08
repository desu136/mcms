import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { fetchClinicDashboardStats } from '../../api/staff';
import type { ClinicDashboardStatsDTO } from '@mcms/contracts';

const settingsMenu = [
  { id: 'clinic', icon: '🏢', label: 'Clinic Profile', desc: 'Basic information about your clinic' },
  { id: 'system', icon: '⚙️', label: 'System Preferences', desc: 'General system settings' },
  { id: 'users', icon: '👥', label: 'Users & Roles', desc: 'Manage users and permissions' },
  { id: 'depts', icon: '🏢', label: 'Departments', desc: 'Manage clinic departments' },
  { id: 'services', icon: '🔧', label: 'Services', desc: 'Manage medical services' },
  { id: 'notifs', icon: '🔔', label: 'Notifications', desc: 'Configure notifications' },
  { id: 'backup', icon: '💾', label: 'Backup & Restore', desc: 'Backup your data' },
  { id: 'security', icon: '🛡️', label: 'Security', desc: 'Security settings and logs' },
];

const workingHours = [
  { day: 'Monday', hours: '8:00 AM – 5:00 PM', closed: false },
  { day: 'Tuesday', hours: '8:00 AM – 5:00 PM', closed: false },
  { day: 'Wednesday', hours: '8:00 AM – 5:00 PM', closed: false },
  { day: 'Thursday', hours: '8:00 AM – 5:00 PM', closed: false },
  { day: 'Friday', hours: '8:00 AM – 5:00 PM', closed: false },
  { day: 'Saturday', hours: '8:00 AM – 12:00 PM', closed: false },
  { day: 'Sunday', hours: 'Closed', closed: true },
];

export function SettingsContent() {
  const { accessToken, user } = useAuth();
  const [stats, setStats] = useState<ClinicDashboardStatsDTO | null>(null);
  const [activeMenu, setActiveMenu] = useState('clinic');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const s = await fetchClinicDashboardStats(accessToken);
        if (mounted && s) setStats(s);
      } catch (err) {
        console.error('Failed to load settings stats:', err);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const tenantName = user?.tenant?.name || (user as any)?.tenantName || 'My Clinic';
  const branchName = user?.branches?.find((b: any) => b.isPrimary)?.name || user?.branches?.[0]?.name || 'Main Facility';

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%' }}>
      {/* Left Menu */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F7FA' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Settings Menu</span>
          </div>
          {settingsMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                border: 'none',
                borderBottom: '1px solid #F9FAFB',
                background: activeMenu === item.id ? '#EFF6FF' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: activeMenu === item.id ? 700 : 500, color: activeMenu === item.id ? '#2979FF' : '#111827' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 9, color: '#9CA3AF' }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Settings Body */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Clinic Profile</h2>
          <p style={{ margin: '0 0 16px', fontSize: 11, color: '#6B7280' }}>Manage facility name and operations.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Clinic Name</label>
              <input value={tenantName} readOnly style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Primary Facility</label>
              <input value={branchName} readOnly style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Operating Hours</h2>
          <div style={{ marginTop: 12 }}>
            {workingHours.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F9FAFB', fontSize: 11 }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>{h.day}</span>
                <span style={{ color: h.closed ? '#EF4444' : '#2979FF', fontWeight: 500 }}>{h.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Clinic Stats */}
        <div style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span>📊</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Live Clinic Stats</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Total Patients', val: stats?.totalPatients ?? 0, change: 'Active files', bg: '#EFF6FF', color: '#1D4ED8', icon: '👥' },
              { label: 'Appts Today', val: stats?.todayAppointmentsCount ?? 0, change: 'Today', bg: '#F0FDF4', color: '#166534', icon: '📅' },
              { label: 'Total Doctors', val: stats?.totalDoctors ?? 0, change: 'Doctors', bg: '#FDF4FF', color: '#7C3AED', icon: '🩺' },
              { label: 'Departments', val: stats?.totalDepartments ?? 0, change: 'Departments', bg: '#FFF7ED', color: '#C2410C', icon: '🏥' },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '10px', border: `1px solid ${s.bg}` }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 9, color: '#6B7280' }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '2px 0' }}>{s.val}</div>
                <div style={{ fontSize: 9, color: s.color, fontWeight: 600 }}>{s.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span>⚙️</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>System Status</span>
          </div>
          {[
            { label: 'System Version', val: 'v1.0.0' },
            { label: 'Database', val: 'PostgreSQL / Prisma' },
            { label: 'Environment', val: 'Online', badge: true },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid #F5F7FA' : 'none' }}>
              <span style={{ fontSize: 10, color: '#6B7280' }}>{r.label}</span>
              {r.badge ? (
                <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 9, fontWeight: 600, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                  {r.val}
                </span>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 600, color: '#111827' }}>{r.val}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const inputStyle: React.CSSProperties = { width: '100%', height: 36, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', background: '#F9FAFB', outline: 'none', paddingLeft: 10, boxSizing: 'border-box' };
