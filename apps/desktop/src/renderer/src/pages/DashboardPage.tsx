import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { DepartmentsContent } from './content/DepartmentsContent';
import { AppointmentsContent } from './content/AppointmentsContent';
import { MedicalRecordsContent } from './content/MedicalRecordsContent';
import { ReportsContent } from './content/ReportsContent';
import { SettingsContent } from './content/SettingsContent';
import { PatientsContent } from './content/PatientsContent';
import { DoctorsContent } from './content/DoctorsContent';
import { ServicesContent } from './content/ServicesContent';
import { BillingContent } from './content/BillingContent';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SyncStatus { ready: boolean; pendingOperations: number; cursor: string | null; }

declare global {
  interface Window {
    mcmsDesktop?: {
      getSyncStatus: () => Promise<SyncStatus>;
      getVersion: () => Promise<string>;
    };
  }
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const appointmentsData = [
  { day: 'Mon', thisWeek: 22, lastWeek: 18 },
  { day: 'Tue', thisWeek: 30, lastWeek: 24 },
  { day: 'Wed', thisWeek: 27, lastWeek: 32 },
  { day: 'Thu', thisWeek: 38, lastWeek: 28 },
  { day: 'Fri', thisWeek: 35, lastWeek: 30 },
  { day: 'Sat', thisWeek: 40, lastWeek: 22 },
  { day: 'Sun', thisWeek: 28, lastWeek: 25 },
];

const departmentData = [
  { name: 'General Medicine', pct: 32, color: '#2979FF' },
  { name: 'Pediatrics', pct: 18, color: '#00C853' },
  { name: 'Gynecology', pct: 15, color: '#AA00FF' },
  { name: 'Cardiology', pct: 12, color: '#FF6D00' },
  { name: 'Orthopedics', pct: 10, color: '#F44336' },
  { name: 'Other', pct: 13, color: '#90A4AE' },
];

const upcomingAppts = [
  { time: '09:00 AM', patient: 'Amanuel Bekele', doctor: 'Dr. Fitsum Alemu', dept: 'General Medicine', bg: '#E3F2FD', fg: '#1565C0' },
  { time: '10:30 AM', patient: 'Selam Tesfaye', doctor: 'Dr. Hana Mengesha', dept: 'Pediatrics', bg: '#E8F5E9', fg: '#2E7D32' },
  { time: '01:00 PM', patient: 'Yonas Tadesse', doctor: 'Dr. Abebe Kebede', dept: 'Cardiology', bg: '#FFF3E0', fg: '#E65100' },
  { time: '03:30 PM', patient: 'Mekdes Worku', doctor: 'Dr. Lealem Demissie', dept: 'Gynecology', bg: '#F3E5F5', fg: '#6A1B9A' },
  { time: '04:45 PM', patient: 'Abraham Girma', doctor: 'Dr. Fitsum Alemu', dept: 'General Medicine', bg: '#E3F2FD', fg: '#1565C0' },
];

const recentPatients = [
  { name: 'Aster Mulu', phone: '+251 912 345 678', dept: 'General Medicine', lastVisit: 'Oct 18, 2026', status: 'Active', av: 'AM', color: '#2979FF' },
  { name: 'Abebe Assefa', phone: '+251 911 234 567', dept: 'Pediatrics', lastVisit: 'Oct 17, 2026', status: 'Active', av: 'AA', color: '#00C853' },
  { name: 'Tigist Alemu', phone: '+251 913 456 789', dept: 'Gynecology', lastVisit: 'Oct 16, 2026', status: 'Active', av: 'TA', color: '#AA00FF' },
  { name: 'Getachew Tadesse', phone: '+251 912 876 543', dept: 'Cardiology', lastVisit: 'Oct 15, 2026', status: 'Active', av: 'GT', color: '#FF6D00' },
  { name: 'Lidya Kebede', phone: '+251 918 765 432', dept: 'Orthopedics', lastVisit: 'Oct 14, 2026', status: 'Inactive', av: 'LK', color: '#F44336' },
];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'patients', label: 'Patients' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'departments', label: 'Departments' },
  { id: 'services', label: 'Services' },
  { id: 'medical-records', label: 'Medical Records' },
  { id: 'billing', label: 'Billing & Payments' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
];

// ─── SVG Line Chart ─────────────────────────────────────────────────────────────
function LineChart() {
  const W = 420, H = 160, PAD = { t: 10, r: 10, b: 30, l: 32 };
  const cW = W - PAD.l - PAD.r, cH = H - PAD.t - PAD.b, maxVal = 50;
  const xStep = cW / (appointmentsData.length - 1);
  const pts = (key: 'thisWeek' | 'lastWeek') =>
    appointmentsData.map((d, i): [number, number] => [PAD.l + i * xStep, PAD.t + cH - (d[key] / maxVal) * cH]);
  const poly = (p: [number, number][]) => p.map(pt => pt.join(',')).join(' ');
  const pThis = pts('thisWeek'), pLast = pts('lastWeek');
  const yTicks = [0, 10, 20, 30, 40, 50];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      {yTicks.map(v => {
        const y = PAD.t + cH - (v / maxVal) * cH;
        return <g key={v}><line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#F1F5F9" strokeWidth="1" /><text x={PAD.l - 6} y={y + 4} fontSize="9" fill="#94A3B8" textAnchor="end">{v}</text></g>;
      })}
      {appointmentsData.map((d, i) => (
        <text key={d.day} x={PAD.l + i * xStep} y={H - 8} fontSize="9" fill="#94A3B8" textAnchor="middle">{d.day}</text>
      ))}
      <polygon points={[...pThis, [PAD.l + (appointmentsData.length - 1) * xStep, PAD.t + cH], [PAD.l, PAD.t + cH]].map(p => p.join(',')).join(' ')} fill="rgba(41,121,255,0.08)" />
      <polyline points={poly(pLast)} fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
      <polyline points={poly(pThis)} fill="none" stroke="#2979FF" strokeWidth="2" />
      {pThis.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#2979FF" />)}
      {pLast.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="#CBD5E1" />)}
    </svg>
  );
}

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart() {
  const cx = 65, cy = 65, R = 52, r = 33;
  let cum = 0;
  const slices = departmentData.map(d => {
    const sa = (cum / 100) * 2 * Math.PI - Math.PI / 2;
    cum += d.pct;
    const ea = (cum / 100) * 2 * Math.PI - Math.PI / 2;
    const large = d.pct > 50 ? 1 : 0;
    return {
      ...d,
      path: `M ${cx + R * Math.cos(sa)} ${cy + R * Math.sin(sa)} A ${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(ea)} ${cy + R * Math.sin(ea)} L ${cx + r * Math.cos(ea)} ${cy + r * Math.sin(ea)} A ${r} ${r} 0 ${large} 0 ${cx + r * Math.cos(sa)} ${cy + r * Math.sin(sa)} Z`,
    };
  });
  return (
    <svg viewBox="0 0 130 130" width={130} height={130}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1F2937">1,248</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#9CA3AF">Total Visits</text>
    </svg>
  );
}

// ─── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9);
  const todayD = 19, todayM = 9, todayY = 2026;
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const offset = (() => { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const btn: React.CSSProperties = { width: 22, height: 22, border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1F2937' }}>{monthName}</span>
        <div style={{ display: 'flex', gap: 4 }}><button onClick={prev} style={btn}>‹</button><button onClick={next} style={btn}>›</button></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, color: '#9CA3AF', padding: '2px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px 0' }}>
        {cells.map((d, i) => {
          const isToday = d === todayD && month === todayM && year === todayY;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28 }}>
              {d ? (
                <button style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isToday ? '#2979FF' : 'transparent', color: isToday ? '#fff' : '#374151', fontWeight: isToday ? 700 : 400, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 2px 8px rgba(41,121,255,0.4)' : 'none' }}>{d}</button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, changeLabel, iconBg, iconColor, icon }: {
  label: string; value: string; change: number; changeLabel: string; iconBg: string; iconColor: string; icon: string;
}) {
  const up = change > 0, flat = change === 0;
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 20, color: iconColor }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: flat ? '#9CA3AF' : up ? '#059669' : '#DC2626', fontWeight: 600 }}>{flat ? '→' : up ? '↑' : '↓'} {Math.abs(change)}%</span>
        <span style={{ color: '#9CA3AF' }}>{changeLabel}</span>
      </div>
    </div>
  );
}

// ─── Dashboard Home Content ────────────────────────────────────────────────────
function DashboardHome({ firstName, dateStr, dayStr }: { firstName: string; dateStr: string; dayStr: string }) {
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Center */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* Greeting */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Good Morning, {firstName} 👋</h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>Here's what's happening at your clinic today.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #F1F5F9', borderRadius: 12, padding: '8px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: 14 }}>📅</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{dateStr}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>{dayStr}</div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          <StatCard label="Total Patients" value="1,248" change={12} changeLabel="vs. last month" iconBg="#DBEAFE" iconColor="#1D4ED8" icon="👥" />
          <StatCard label="Today's Appointments" value="36" change={8} changeLabel="vs. yesterday" iconBg="#DCFCE7" iconColor="#166534" icon="📅" />
          <StatCard label="Active Doctors" value="12" change={0} changeLabel="vs. last month" iconBg="#EDE9FE" iconColor="#6D28D9" icon="🩺" />
          <StatCard label="Pending Bills" value="8" change={-33} changeLabel="vs. last month" iconBg="#FEF3C7" iconColor="#B45309" icon="🧾" />
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 18 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Appointments Overview</span>
              <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#6B7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 20, height: 2, background: '#2979FF', display: 'inline-block', borderRadius: 2 }} /> This Week</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 20, height: 2, background: '#CBD5E1', display: 'inline-block', borderRadius: 2 }} /> Last Week</span>
              </div>
            </div>
            <LineChart />
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Patient Visits by Department</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DonutChart />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {departmentData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flexShrink: 0, display: 'inline-block' }} />{d.name}
                    </span>
                    <span style={{ fontWeight: 600, color: '#111827', marginLeft: 6 }}>{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F9FAFB' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Recent Patients</span>
            <button style={{ fontSize: 11, color: '#2979FF', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Name', 'Phone', 'Department', 'Last Visit', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((p, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F9FAFB' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{p.av}</div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#6B7280' }}>{p.phone}</td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#2979FF', fontWeight: 500 }}>{p.dept}</td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#6B7280' }}>{p.lastVisit}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: p.status === 'Active' ? '#ECFDF5' : '#FEF2F2', color: p.status === 'Active' ? '#065F46' : '#B91C1C', border: `1px solid ${p.status === 'Active' ? '#A7F3D0' : '#FECACA'}` }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <button style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 11, color: '#6B7280' }}>›</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: 260, background: '#fff', borderLeft: '1px solid #F1F5F9', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Upcoming */}
        <div style={{ padding: 16, borderBottom: '1px solid #F5F7FA' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Upcoming Appointments</span>
            <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>
          {upcomingAppts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', width: 52, flexShrink: 0 }}>{a.time}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.patient}</div>
                <div style={{ fontSize: 9, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.doctor}</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 999, background: a.bg, color: a.fg, flexShrink: 0 }}>{a.dept.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div style={{ padding: 16, borderBottom: '1px solid #F5F7FA' }}>
          <MiniCalendar />
        </div>

        {/* Quick Actions */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 10 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '👤', label: 'Register Patient', bg: '#DBEAFE' },
              { icon: '📅', label: 'Book Appointment', bg: '#DCFCE7' },
              { icon: '📋', label: 'Add Medical Record', bg: '#FEF3C7' },
              { icon: '📊', label: 'Generate Report', bg: '#FFF9C4' },
            ].map((a, i) => (
              <button key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 12, border: '1px solid #F1F5F9', background: '#fff', cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{a.icon}</div>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main DashboardPage ────────────────────────────────────────────────────────
export function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ ready: false, pendingOperations: 0, cursor: null });
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (window.mcmsDesktop) {
      window.mcmsDesktop.getSyncStatus().then(setSyncStatus).catch(() => { });
    }
  }, []);

  const firstName = user?.firstName ?? user?.email?.split('@')[0] ?? 'Admin';
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : (user?.email ?? 'Admin');
  const initials = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase() || (user?.email?.[0]?.toUpperCase() ?? 'CA');
  const role = user?.role ?? 'Clinic Admin';
  const now = new Date(2026, 9, 21);
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: '#F5F7FA', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, background: '#1A2035', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#2979FF,#1565C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, flexShrink: 0 }}>+</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>MCMS</div>
            <div style={{ color: '#64748B', fontSize: 9, lineHeight: 1.3 }}>Modern Clinic Mgmt System</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400, textAlign: 'left', width: '100%', fontFamily: 'inherit', background: active ? '#2979FF' : 'transparent', color: active ? '#fff' : '#94A3B8', boxShadow: active ? '0 2px 8px rgba(41,121,255,0.35)' : 'none', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 15, opacity: active ? 1 : 0.5 }}>▸</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(41,121,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏥</div>
            <div>
              <div style={{ color: '#E2E8F0', fontSize: 11, fontWeight: 600 }}>City Health Clinic</div>
              <div style={{ color: '#475569', fontSize: 9 }}>Better Health, Brighter Future</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ height: 56, background: '#fff', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9CA3AF' }}>🔍</span>
            <input placeholder="Search patients, appointments..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, height: 34, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 500, background: syncStatus.ready ? '#ECFDF5' : '#FEF3C7', color: syncStatus.ready ? '#065F46' : '#92400E', border: `1px solid ${syncStatus.ready ? '#A7F3D0' : '#FCD34D'}`, borderRadius: 999, padding: '3px 10px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: syncStatus.ready ? '#10B981' : '#F59E0B', display: 'inline-block' }} />
              {syncStatus.ready ? 'SQLite Active' : 'Offline Mode'}
            </div>

            <button style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 15, position: 'relative' }}>
              🔔
              <span style={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, background: '#EF4444', borderRadius: '50%', fontSize: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</span>
            </button>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setProfileOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2979FF,#5C6BC0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{initials}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1F2937', lineHeight: 1.2 }}>{displayName}</div>
                  <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'capitalize' }}>{role}</div>
                </div>
                <span style={{ fontSize: 10, color: '#9CA3AF' }}>▾</span>
              </button>
              {profileOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 180, background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #F1F5F9', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F7FA' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1F2937' }}>{displayName}</div>
                    <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>{user?.email ?? ''}</div>
                  </div>
                  <button onClick={logout} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>⬅ Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeNav === 'dashboard' && <DashboardHome firstName={firstName} dateStr={dateStr} dayStr={dayStr} />}

          {activeNav !== 'dashboard' && (
            <div style={{ height: '100%', overflowY: 'auto', padding: 20 }}>
              {activeNav === 'patients' && <PatientsContent />}
              {activeNav === 'doctors' && <DoctorsContent />}
              {activeNav === 'departments' && <DepartmentsContent />}
              {activeNav === 'appointments' && <AppointmentsContent />}
              {activeNav === 'medical-records' && <MedicalRecordsContent />}
              {activeNav === 'services' && <ServicesContent />}
              {activeNav === 'billing' && <BillingContent />}
              {activeNav === 'reports' && <ReportsContent />}
              {activeNav === 'settings' && <SettingsContent />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
