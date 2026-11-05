import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { fetchStaffUsers } from '../../api/staff';
import type { UserSummaryDTO } from '@mcms/contracts';

interface DoctorDisplay {
  id: string;
  name: string;
  specialty: string;
  dept: string;
  hours: string;
  status: string;
  av: string;
  c: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
}

const COLORS = ['#2979FF', '#00C853', '#FF6D00', '#AA00FF', '#F44336', '#10B981', '#06B6D4', '#EC4899', '#8B5CF6'];

function getInitials(name: string): string {
  const clean = name.replace(/^Dr\.\s*/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'DR';
  }
  return (clean.slice(0, 2) || 'DR').toUpperCase();
}

const statusStyle = (s: string): React.CSSProperties => ({
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 9,
  fontWeight: 700,
  background: s === 'Active' ? '#ECFDF5' : '#FFF7ED',
  color: s === 'Active' ? '#065F46' : '#C2410C',
  border: `1px solid ${s === 'Active' ? '#A7F3D0' : '#FED7AA'}`,
});

export function DoctorsContent() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctorsList, setDoctorsList] = useState<DoctorDisplay[]>([]);
  const [selected, setSelected] = useState<DoctorDisplay | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Overview');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    let mounted = true;
    async function loadDoctors() {
      setLoading(true);
      try {
        const users = await fetchStaffUsers(accessToken);
        if (!mounted) return;
        const doctorUsers = users.filter((u: UserSummaryDTO) => {
          const isDocRole = u.roles?.some((r) => r.toUpperCase() === 'DOCTOR');
          const isDocTitle = u.staffProfile?.jobTitle?.toLowerCase().includes('doctor');
          const hasDrPrefix = u.displayName?.toLowerCase().startsWith('dr.');
          return isDocRole || isDocTitle || hasDrPrefix;
        });

        const mapped: DoctorDisplay[] = doctorUsers.map((u, idx) => ({
          id: u.id,
          name: u.displayName || u.email,
          specialty: u.staffProfile?.jobTitle || 'General Practitioner',
          dept: u.staffProfile?.department || 'General Medicine',
          hours: 'Mon – Fri 8:00 AM – 5:00 PM',
          status: u.isActive ? 'Active' : 'Inactive',
          av: getInitials(u.displayName || u.email),
          c: COLORS[idx % COLORS.length] || '#2979FF',
          email: u.email,
          phone: (u.staffProfile as any)?.phoneNumber || 'N/A',
          employeeNumber: u.staffProfile?.employeeNumber || 'N/A',
        }));

        setDoctorsList(mapped);
        if (mapped.length > 0 && mapped[0]) {
          setSelected(mapped[0]);
        } else {
          setSelected(null);
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
        setDoctorsList([]);
        setSelected(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadDoctors();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    doctorsList.forEach((d) => {
      if (d.dept) set.add(d.dept);
    });
    return Array.from(set);
  }, [doctorsList]);

  const filtered = useMemo(() => {
    return doctorsList.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase()) ||
        d.dept.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'All Departments' || d.dept === deptFilter;
      const matchStatus = statusFilter === 'All Status' || d.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [doctorsList, search, deptFilter, statusFilter]);

  const activeCount = doctorsList.filter((d) => d.status === 'Active').length;

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%' }}>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>👨‍⚕️</span>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Doctor Management</h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
              Manage clinical doctor profiles, specialties, and schedules from live database.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Total Doctors', val: doctorsList.length, sub: 'Registered in system', icon: '👥', bg: '#EFF6FF', c: '#059669' },
            { label: 'Active Doctors', val: activeCount, sub: 'Currently active', icon: '✅', bg: '#F0FDF4', c: '#059669' },
            { label: 'Departments', val: departments.length, sub: 'With assigned doctors', icon: '🏢', bg: '#FDF4FF', c: '#9CA3AF' },
            { label: 'Available Today', val: activeCount, sub: 'On active duty', icon: '📅', bg: '#FFF7ED', c: '#059669' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '2px 0' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: s.c, fontWeight: 500 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialty, or department..."
              style={{
                width: '100%',
                height: 36,
                paddingLeft: 30,
                paddingRight: 12,
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                fontSize: 12,
                color: '#374151',
                background: '#F9FAFB',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ height: 36, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 11, color: '#374151', background: '#fff', padding: '0 10px', outline: 'none', cursor: 'pointer' }}
          >
            <option>All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: 36, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 11, color: '#374151', background: '#fff', padding: '0 10px', outline: 'none', cursor: 'pointer' }}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Doctor Cards Grid */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>Loading doctors from database...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍⚕️</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>No doctors found</div>
              <p style={{ fontSize: 12, color: '#6B7280', maxWidth: 360, margin: '6px auto 0' }}>
                {doctorsList.length === 0
                  ? 'There are currently no staff members assigned the Doctor role in this clinic.'
                  : 'No doctors matched your current search and filter criteria.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {filtered.map((d) => {
                const isSelected = selected?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelected(d)}
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      padding: '16px',
                      border: `2px solid ${isSelected ? '#2979FF' : '#F1F5F9'}`,
                      boxShadow: isSelected ? '0 2px 12px rgba(41,121,255,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: d.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {d.av}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{d.name}</div>
                          <div style={{ fontSize: 10, color: '#6B7280' }}>{d.specialty}</div>
                          <div style={{ fontSize: 10, color: '#2979FF', fontWeight: 500 }}>{d.dept}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={statusStyle(d.status)}>{d.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                      <span>📅</span>{d.hours}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, height: 28, border: '1px solid #E5E7EB', borderRadius: 8, background: '#F9FAFB', fontSize: 10, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        👤 View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Doctor Detail */}
      {selected && (
        <div style={{ width: 270, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {/* Profile Header */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: selected.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                {selected.av}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{selected.name}</span>
                  <span style={statusStyle(selected.status)}>{selected.status}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{selected.specialty}</div>
              </div>
            </div>
            {[
              { icon: '📞', val: selected.phone || 'N/A' },
              { icon: '✉️', val: selected.email || 'N/A' },
              { icon: '🏢', val: selected.dept },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#6B7280', padding: '3px 0' }}>
                <span>{r.icon}</span>{r.val}
              </div>
            ))}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginTop: 14, borderBottom: '2px solid #F1F5F9' }}>
              {['Overview', 'Schedule'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '6px 10px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: tab === t ? 700 : 400,
                    color: tab === t ? '#2979FF' : '#6B7280',
                    borderBottom: tab === t ? '2px solid #2979FF' : '2px solid transparent',
                    marginBottom: -2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Professional Info */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span>👤</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Professional Information</span>
            </div>
            {[
              { label: 'Full Name', val: selected.name },
              { label: 'Specialty', val: selected.specialty },
              { label: 'Department', val: selected.dept },
              { label: 'Employee ID', val: selected.employeeNumber },
              { label: 'Account Status', val: selected.status },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F9FAFB', fontSize: 10 }}>
                <span style={{ color: '#6B7280' }}>{r.label}</span>
                <span style={{ color: '#111827', fontWeight: 500, textAlign: 'right', maxWidth: 130 }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Working Hours */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span>📅</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Standard Clinic Hours</span>
            </div>
            {[
              { day: 'Monday – Friday', hours: '8:00 AM – 5:00 PM' },
              { day: 'Saturday', hours: '8:00 AM – 1:00 PM' },
              { day: 'Sunday', hours: 'Emergency / On-call' },
            ].map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 2 ? '1px solid #F9FAFB' : 'none', fontSize: 10 }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>{h.day}</span>
                <span style={{ color: '#2979FF', fontWeight: 500 }}>{h.hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
