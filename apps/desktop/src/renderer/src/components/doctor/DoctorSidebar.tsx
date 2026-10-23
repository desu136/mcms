import React from 'react';
import {
  Activity,
  Zap,
  CalendarDays,
  Users,
  FileText,
  Pill,
  FlaskConical,
  Settings,
  LogOut,
  Database,
} from 'lucide-react';
import { CURRENT_DOCTOR } from './doctorMockData';

export type DoctorTab =
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'medical-records'
  | 'prescriptions'
  | 'lab-results'
  | 'settings';

export interface DoctorSidebarProps {
  currentTab: DoctorTab;
  onSelectTab: (tab: DoctorTab) => void;
  onLogout: () => void;
  pendingSyncOps?: number;
}

export function DoctorSidebar({
  currentTab,
  onSelectTab,
  onLogout,
  pendingSyncOps = 0,
}: DoctorSidebarProps) {
  const navItems: Array<{ id: DoctorTab; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Zap },
    { id: 'appointments', label: 'My Appointments', icon: CalendarDays },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'medical-records', label: 'Medical Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'lab-results', label: 'Lab Results', icon: FlaskConical },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '250px',
        background: '#090f20',
        borderRight: '1px solid rgba(30,41,59,0.8)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
      }}
    >
      {/* Brand Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '22px 20px',
          borderBottom: '1px solid rgba(30,41,59,0.7)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0b1329',
            boxShadow: '0 4px 12px rgba(56,189,248,0.25)',
          }}
        >
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            MCMS
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px', fontWeight: 500 }}>
            Desktop Workstation
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#475569',
            padding: '0 10px',
            marginBottom: '8px',
          }}
        >
          Clinical Workstation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? '#0284c7' : 'none',
                boxShadow: isActive ? '0 4px 14px rgba(2,132,199,0.3)' : 'none',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                marginBottom: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* SQLite Sync Card */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '10px',
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(30,41,59,0.8)',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
            <Database size={13} /> Offline-First Active
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Engine</span>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>SQLite</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '3px' }}>
            <span>Outbound Queue</span>
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>{pendingSyncOps} ops</span>
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div
        style={{
          padding: '16px 14px',
          borderTop: '1px solid rgba(30,41,59,0.7)',
          background: 'rgba(9,15,32,0.8)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(21,30,51,0.6)',
            border: '1px solid #1e293b',
          }}
        >
          <img
            src={CURRENT_DOCTOR.avatar}
            alt="Doctor"
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectCover: 'cover', border: '1.5px solid #38bdf8' } as any}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#f8fafc',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {CURRENT_DOCTOR.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              {CURRENT_DOCTOR.role}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            marginTop: '10px',
            background: 'none',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#f87171',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
