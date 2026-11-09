import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { apiRequest } from '../../api/staff';
import type { AppointmentDTO } from '@mcms/contracts';

const statusColor = (s: string) => {
  const norm = s?.toUpperCase() || '';
  if (norm === 'CHECKED_IN' || norm === 'CHECKED IN') return { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE' };
  if (norm === 'CANCELLED' || norm === 'CANCELED') return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
  if (norm === 'COMPLETED') return { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
  return { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
};

const COLORS = ['#2979FF', '#00C853', '#AA00FF', '#FF6D00', '#F44336', '#00BCD4', '#8BC34A', '#9C27B0'];

export function AppointmentsContent() {
  const { accessToken } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [statusFilter, setStatusFilter] = useState('All');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-based
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate days in month & first day offset (0 = Mon, 6 = Sun)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Convert Sun=0 to Mon=0

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  useEffect(() => {
    let mounted = true;
    async function fetchAppointments() {
      setLoading(true);
      try {
        const data = await apiRequest<AppointmentDTO[]>('appointments', { token: accessToken });
        if (mounted) {
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load appointments:', err);
        if (mounted) setAppointments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchAppointments();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const selectedDateStr = selectedDate.toISOString().slice(0, 10);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filtered appointments
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchSearch =
        a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        a.patientPid?.toLowerCase().includes(search.toLowerCase()) ||
        a.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
        a.branchName?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || a.status?.toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [appointments, search, statusFilter]);

  // Today's appointments
  const todayList = useMemo(() => {
    return appointments.filter((a) => a.appointmentDate?.startsWith(todayStr));
  }, [appointments, todayStr]);

  const completedCount = appointments.filter((a) => a.status?.toUpperCase() === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => a.status?.toUpperCase() === 'CANCELLED').length;

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%' }}>
      {/* Left: Calendar + Filters */}
      <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Calendar */}
        <div style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{monthName}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={handlePrevMonth} style={calBtn}>‹</button>
              <button onClick={handleNextMonth} style={calBtn}>›</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, color: '#9CA3AF', padding: '2px 0' }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px 0' }}>
            {Array(firstDayIndex).fill(null).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: 26 }} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const thisDate = new Date(year, month, d);
              const isSelected =
                thisDate.getFullYear() === selectedDate.getFullYear() &&
                thisDate.getMonth() === selectedDate.getMonth() &&
                thisDate.getDate() === selectedDate.getDate();
              const dateIso = thisDate.toISOString().slice(0, 10);
              const hasAppt = appointments.some((a) => a.appointmentDate?.startsWith(dateIso));

              return (
                <div key={d} style={{ height: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <button
                    onClick={() => setSelectedDate(thisDate)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: isSelected ? 700 : 400,
                      background: isSelected ? '#2979FF' : 'transparent',
                      color: isSelected ? '#fff' : '#374151',
                    }}
                  >
                    {d}
                  </button>
                  {hasAppt && (
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: isSelected ? '#fff' : '#2979FF', marginTop: 1 }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
            {[{ c: '#2979FF', l: 'Scheduled' }, { c: '#10B981', l: 'Completed' }, { c: '#EF4444', l: 'Cancelled' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#6B7280' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />{s.l}
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>🔽</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Filter</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Status</div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', height: 32, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', background: '#F9FAFB', padding: '0 8px', outline: 'none' }}
            >
              <option value="All">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <button
            onClick={() => { setStatusFilter('All'); setSearch(''); }}
            style={{ width: '100%', height: 32, border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 11, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            🔄 Reset Filters
          </button>
        </div>
      </div>

      {/* Center */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>📅</span>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Appointments</h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
              Live appointments records retrieved from the database.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { label: 'Total Appointments', value: appointments.length, change: 'Real database total', cl: '#059669', icon: '📅' },
            { label: "Today's Appointments", value: todayList.length, change: 'Scheduled today', cl: '#059669', icon: '🕐' },
            { label: 'Completed', value: completedCount, change: 'Completed visits', cl: '#059669', icon: '✅' },
            { label: 'Cancelled', value: cancelledCount, change: 'Cancelled visits', cl: '#DC2626', icon: '❌' },
          ].map((c, i) => (
            <div key={i} style={smallCard}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '2px 0' }}>{c.value}</div>
              <div style={{ fontSize: 10, color: c.cl }}>{c.change}</div>
            </div>
          ))}
        </div>

        {/* Table area */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient, PID, or doctor..."
                style={{ width: '100%', height: 32, paddingLeft: 30, paddingRight: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#374151', fontWeight: 500, marginLeft: 12 }}>
              Appointments: <span style={{ color: '#2979FF', marginLeft: 4, fontWeight: 600 }}>{filtered.length} found</span>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>Loading appointments from database...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>No appointments found</div>
                <p style={{ fontSize: 12, color: '#6B7280', maxWidth: 360, margin: '6px auto 0' }}>
                  {appointments.length === 0
                    ? 'There are currently no appointments registered in the database.'
                    : 'No appointments match the current search or status filter.'}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Time / Date', 'Patient', 'Doctor', 'Branch', 'Status'].map((h, i) => (
                      <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const sc = statusColor(a.status);
                    const initials = (a.patientName || 'P')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    const color = COLORS[i % COLORS.length];

                    return (
                      <tr key={a.id || i} style={{ borderTop: '1px solid #F9FAFB' }}>
                        <td style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                          <div>{a.startTime || '09:00 AM'}</div>
                          <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 400 }}>{a.appointmentDate?.slice(0, 10)}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{a.patientName}</div>
                              <div style={{ fontSize: 9, color: '#9CA3AF' }}>PID: {a.patientPid || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151' }}>
                          {a.doctorName || 'Unassigned'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#374151' }}>
                            <span>🏥</span>{a.branchName || 'Main Facility'}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Today List */}
        <div style={{ ...panel, flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Today's Appointments</span>
            <span style={{ fontSize: 10, color: '#2979FF', fontWeight: 600 }}>{todayList.length}</span>
          </div>
          {todayList.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 11 }}>
              No appointments scheduled for today.
            </div>
          ) : (
            todayList.map((a, i) => {
              const sc = statusColor(a.status);
              const initials = (a.patientName || 'P')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <div key={a.id || i} style={{ padding: '8px 0', borderBottom: i < todayList.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.patientName}
                      </div>
                      <div style={{ fontSize: 9, color: '#9CA3AF' }}>{a.startTime || 'Scheduled'} · {a.branchName || 'Clinic'}</div>
                    </div>
                    <span style={{ padding: '1px 6px', borderRadius: 999, fontSize: 9, fontWeight: 600, background: sc.bg, color: sc.color, flexShrink: 0 }}>
                      {a.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const smallCard: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const calBtn: React.CSSProperties = { width: 22, height: 22, border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' };
