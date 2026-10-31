'use client';

import React, { useState } from 'react';

const appointments = [
    { time: '08:00 AM', patient: 'Aster Mulu', id: '#P-001024', phone: '+251 912 345 678', doctor: 'Dr. Fitsum Alemu', dept: 'Cardiology', status: 'Checked In', av: 'AM', c: '#2979FF' },
    { time: '08:20 AM', patient: 'Abebe Assefa', id: '#P-001023', phone: '+251 911 234 567', doctor: 'Dr. Hanan Mengesha', dept: 'Pediatrics', status: 'Scheduled', av: 'AA', c: '#00C853' },
    { time: '08:40 AM', patient: 'Tigist Alemu', id: '#P-001022', phone: '+251 913 456 789', doctor: 'Dr. Abenet Kebede', dept: 'General Medicine', status: 'Scheduled', av: 'TA', c: '#AA00FF' },
    { time: '09:00 AM', patient: 'Getachew Tadesse', id: '#P-001021', phone: '+251 912 876 543', doctor: 'Dr. Daniel Wondimu', dept: 'Orthopedics', status: 'Scheduled', av: 'GT', c: '#FF6D00' },
    { time: '09:30 AM', patient: 'Lidya Kebede', id: '#P-001020', phone: '+251 918 765 432', doctor: 'Dr. Mekdes Worku', dept: 'Internal Medicine', status: 'Checked In', av: 'LK', c: '#F44336' },
    { time: '10:00 AM', patient: 'Samuel Girma', id: '#P-001019', phone: '+251 912 234 110', doctor: 'Dr. Lidia Abebe', dept: 'Dermatology', status: 'Scheduled', av: 'SG', c: '#00BCD4' },
    { time: '10:30 AM', patient: 'Betselhem Abebe', id: '#P-001018', phone: '+251 911 876 520', doctor: 'Dr. Getachew Tadesse', dept: 'Surgery', status: 'Scheduled', av: 'BA', c: '#8BC34A' },
    { time: '11:30 AM', patient: 'Daniel Wondimu', id: '#P-001017', phone: '+251 916 543 210', doctor: 'Dr. Tsegaye Asfaw', dept: 'Psychiatry', status: 'Scheduled', av: 'DW', c: '#9C27B0' },
    { time: '11:30 AM', patient: 'Saron Tesfaye', id: '#P-001016', phone: '+251 912 334 156', doctor: 'Dr. Fitsum Alemu', dept: 'Cardiology', status: 'Cancelled', av: 'ST', c: '#EF4444' },
    { time: '12:00 PM', patient: 'Mekdes Worku', id: '#P-001015', phone: '+251 911 765 453', doctor: 'Dr. Hana Mengesha', dept: 'Pediatrics', status: 'Scheduled', av: 'MW', c: '#FF9800' },
];

const todayList = [
    { time: '08:00 AM', patient: 'Aster Mulu', id: '#P-001024', dept: 'Cardiology', status: 'Checked In', c: '#2979FF' },
    { time: '08:20 AM', patient: 'Abebe Assefa', id: '#P-001023', dept: 'Pediatrics', status: 'Scheduled', c: '#00C853' },
    { time: '08:40 AM', patient: 'Tigist Alemu', id: '#P-001022', dept: 'General Medicine', status: 'Scheduled', c: '#AA00FF' },
    { time: '09:00 AM', patient: 'Getachew Tadesse', id: '#P-001021', dept: 'Orthopedics', status: 'Scheduled', c: '#FF6D00' },
    { time: '09:30 AM', patient: 'Lidya Kebede', id: '#P-001020', dept: 'Internal Medicine', status: 'Checked In', c: '#F44336' },
];

const calDays = Array.from({ length: 31 }, (_, i) => i + 1);
const firstOffset = 1;

const statusColor = (s: string) => {
    if (s === 'Checked In') return { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE' };
    if (s === 'Cancelled') return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
    return { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
};

export function AppointmentsContent() {
    const [selectedDay, setSelectedDay] = useState(19);

    return (
        <div style={{ display: 'flex', gap: 14, height: '100%', minHeight: 'calc(100vh - 120px)' }}>

            {/* Left: Calendar + Filters */}
            <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Calendar */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>October 2026</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button style={calBtn}>‹</button>
                            <button style={calBtn}>›</button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, color: '#9CA3AF', padding: '2px 0' }}>{d}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px 0' }}>
                        {Array(firstOffset).fill(null).map((_, i) => <div key={`e${i}`} style={{ height: 26 }} />)}
                        {calDays.map(d => {
                            const isToday = d === selectedDay;
                            const hasDot = [1, 3, 5, 7, 10, 12, 14, 15, 17, 19, 20, 21, 22, 24, 26, 28].includes(d);
                            return (
                                <div key={d} style={{ height: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setSelectedDay(d)}
                                        style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: isToday ? 700 : 400, background: isToday ? '#2979FF' : 'transparent', color: isToday ? '#fff' : '#374151' }}
                                    >{d}</button>
                                    {hasDot && <div style={{ width: 3, height: 3, borderRadius: '50%', background: isToday ? '#fff' : '#2979FF', marginTop: 1 }} />}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
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
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Filter Appointments</span>
                    </div>
                    {[{ label: 'Date Range', val: 'Oct 19, 2026 – Oct 19, 2026' }, { label: 'Department', val: 'All Departments' }, { label: 'Doctor', val: 'All Doctors' }, { label: 'Status', val: 'All Statuses' }].map((f, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{f.label}</div>
                            <select style={{ width: '100%', height: 32, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', background: '#F9FAFB', padding: '0 8px', outline: 'none' }}>
                                <option>{f.val}</option>
                            </select>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button style={{ flex: 1, height: 32, border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 11, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>🔄 Reset</button>
                        <button style={{ flex: 1, height: 32, border: 'none', borderRadius: 8, background: '#2979FF', fontSize: 11, color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>🔍 Apply</button>
                    </div>
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
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>View, manage and schedule patient appointments.</p>
                    </div>
                    <button style={primaryBtn}>+ New Appointment</button>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {[
                        { label: 'Total Appointments', value: '1,248', change: '↑ 12%', cl: '#059669', icon: '📅' },
                        { label: "Today's Appointments", value: '36', change: '↑ 8%', cl: '#059669', icon: '🕐' },
                        { label: 'Completed', value: '1,102', change: '↑ 15%', cl: '#059669', icon: '✅' },
                        { label: 'Cancelled', value: '42', change: '↓ 5%', cl: '#DC2626', icon: '❌' },
                    ].map((c, i) => (
                        <div key={i} style={smallCard}>
                            <div style={{ fontSize: 18, marginBottom: 6 }}>{c.icon}</div>
                            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>{c.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '2px 0' }}>{c.value}</div>
                            <div style={{ fontSize: 10, color: c.cl }}>{c.change} vs. last month</div>
                        </div>
                    ))}
                </div>

                {/* Table area */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>🔍</span>
                            <input placeholder="Search by patient name, phone, or appointment ID..." style={{ width: '100%', height: 32, paddingLeft: 30, paddingRight: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#374151', fontWeight: 500, marginLeft: 12 }}>
                            Appointments (Today · Oct 19, 2026) <span style={{ color: '#2979FF', marginLeft: 6 }}>36 appointments</span>
                        </div>
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: 380 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F9FAFB' }}>
                                    {['Time', 'Patient', 'Doctor', 'Department', 'Status', 'Actions'].map((h, i) => (
                                        <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((a, i) => {
                                    const sc = statusColor(a.status);
                                    return (
                                        <tr key={i} style={{ borderTop: '1px solid #F9FAFB' }}>
                                            <td style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{a.time}</td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>{a.av}</div>
                                                    <div>
                                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{a.patient}</div>
                                                        <div style={{ fontSize: 9, color: '#9CA3AF' }}>{a.id} · {a.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151' }}>{a.doctor}</td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#374151' }}>
                                                    <span>🏥</span>{a.dept}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{a.status}</span>
                                            </td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <button style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 12 }}>⋮</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '10px 16px', borderTop: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3, 4, 5].map(p => <button key={p} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: p === 1 ? '#2979FF' : '#fff', color: p === 1 ? '#fff' : '#374151', fontSize: 11, cursor: 'pointer' }}>{p}</button>)}
                            <button style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 11, cursor: 'pointer' }}>›</button>
                        </div>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Showing 1–10 of 36</span>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Quick Actions */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span>👤</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Quick Actions</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[{ icon: '📅', label: 'New Appointment' }, { icon: '📋', label: 'View Schedule' }, { icon: '🔍', label: 'Find Patient' }, { icon: '🚶', label: 'Walk-in Reg.' }].map((a, i) => (
                            <button key={i} style={{ padding: '10px 4px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 9, color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Today List */}
                <div style={{ ...panel, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Today's Appointments</span>
                        <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                    </div>
                    {todayList.map((a, i) => {
                        const sc = statusColor(a.status);
                        return (
                            <div key={i} style={{ padding: '8px 0', borderBottom: i < todayList.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                        {a.patient.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 10, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.patient}</div>
                                        <div style={{ fontSize: 9, color: '#9CA3AF' }}>{a.time} · {a.dept}</div>
                                    </div>
                                    <span style={{ padding: '1px 6px', borderRadius: 999, fontSize: 9, fontWeight: 600, background: sc.bg, color: sc.color, flexShrink: 0 }}>{a.status}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Promo */}
                <div style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderRadius: 14, padding: 14, border: '1px solid #BFDBFE' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>🏥</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>Healthy Patients</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 10, color: '#3B82F6' }}>Build a Stronger Community — Timely appointments lead to better health outcomes.</p>
                </div>
            </div>
        </div>
    );
}

const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const smallCard: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const calBtn: React.CSSProperties = { width: 22, height: 22, border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' };
export default AppointmentsContent;
