import React, { useState } from 'react';

const doctors = [
    { name: 'Dr. Fitsum Alemu', specialty: 'Cardiologist', dept: 'Cardiology', hours: 'Mon – Fri 8:00 AM – 5:00 PM', status: 'Active', av: 'FA', c: '#2979FF' },
    { name: 'Dr. Hana Mengesha', specialty: 'Pediatrician', dept: 'Pediatrics', hours: 'Mon – Fri 8:00 AM – 4:00 PM', status: 'Active', av: 'HM', c: '#00C853' },
    { name: 'Dr. Abebe Kebede', specialty: 'General Practitioner', dept: 'General Medicine', hours: 'Mon – Sat 8:00 AM – 6:00 PM', status: 'Active', av: 'AK', c: '#FF6D00' },
    { name: 'Dr. Selam Tesfaye', specialty: 'Gynecologist', dept: 'Gynecology', hours: 'Mon – Fri 9:00 AM – 5:00 PM', status: 'Active', av: 'ST', c: '#AA00FF' },
    { name: 'Dr. Daniel Wondimu', specialty: 'Orthopedic Surgeon', dept: 'Orthopedics', hours: 'Tue – Sat 9:00 AM – 5:00 PM', status: 'Active', av: 'DW', c: '#F44336' },
    { name: 'Dr. Mekdes Worku', specialty: 'Internist', dept: 'Internal Medicine', hours: 'Mon – Fri 9:30 AM – 4:30 PM', status: 'Active', av: 'MW', c: '#10B981' },
    { name: 'Dr. Samuel Girma', specialty: 'Radiologist', dept: 'Radiology', hours: 'Mon – Fri 8:00 AM – 4:00 PM', status: 'On Leave', av: 'SG', c: '#64748B' },
    { name: 'Dr. Lidia Abebe', specialty: 'Dermatologist', dept: 'Dermatology', hours: 'Mon – Fri 9:00 AM – 5:00 PM', status: 'Active', av: 'LA', c: '#EC4899' },
    { name: 'Dr. Getachew Tadesse', specialty: 'General Surgeon', dept: 'Surgery', hours: 'Tue – Sat 8:00 AM – 5:00 PM', status: 'Active', av: 'GT', c: '#8B5CF6' },
    { name: 'Dr. Lealem Demissie', specialty: 'Urologist', dept: 'Urology', hours: 'Mon – Fri 5:00 AM – 5:00 PM', status: 'Active', av: 'LD', c: '#06B6D4' },
    { name: 'Dr. Tsegaye Asfaw', specialty: 'ENT Specialist', dept: 'Psychiatry', hours: 'Mon – Fri 8:30 AM – 5:00 PM', status: 'Active', av: 'TA', c: '#F59E0B' },
    { name: 'Dr. Biniam Solomon', specialty: 'ENT Specialist', dept: 'ENT', hours: 'Mon – Fri 8:30 AM – 5:00 PM', status: 'Active', av: 'BS', c: '#EF4444' },
];

const workHours = [
    { day: 'Monday', hours: '8:00 AM – 5:00 PM' },
    { day: 'Tuesday', hours: '8:00 AM – 5:00 PM' },
    { day: 'Wednesday', hours: '8:00 AM – 5:00 PM' },
    { day: 'Thursday', hours: '8:00 AM – 5:00 PM' },
    { day: 'Friday', hours: '8:00 AM – 5:00 PM' },
    { day: 'Saturday', hours: '8:00 AM – 12:00 PM' },
    { day: 'Sunday', hours: 'Closed', closed: true },
];

const statusStyle = (s: string): React.CSSProperties => ({
    padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700,
    background: s === 'Active' ? '#ECFDF5' : '#FFF7ED',
    color: s === 'Active' ? '#065F46' : '#C2410C',
    border: `1px solid ${s === 'Active' ? '#A7F3D0' : '#FED7AA'}`,
});

export function DoctorsContent() {
    const [selected, setSelected] = useState(doctors[0]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('Overview');

    const filtered = doctors.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase()) ||
        d.dept.toLowerCase().includes(search.toLowerCase())
    );

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
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>Manage doctor profiles, specialties, departments and availability.</p>
                    </div>
                    <button style={primaryBtn}>+ Add New Doctor</button>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[
                        { label: 'Total Doctors', val: '12', sub: '↑ 2 this month', icon: '👥', bg: '#EFF6FF', c: '#059669' },
                        { label: 'Active Doctors', val: '11', sub: '↑ 1 this month', icon: '✅', bg: '#F0FDF4', c: '#059669' },
                        { label: 'Departments', val: '6', sub: 'no change', icon: '🏢', bg: '#FDF4FF', c: '#9CA3AF' },
                        { label: 'Available Today', val: '9', sub: '75% available', icon: '📅', bg: '#FFF7ED', c: '#059669' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
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
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, specialty, or department..." style={{ width: '100%', height: 36, paddingLeft: 30, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' as 'border-box' }} />
                    </div>
                    {['All Departments', 'All Specialties', 'All Status'].map((opt, i) => (
                        <select key={i} style={{ height: 36, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 11, color: '#374151', background: '#fff', padding: '0 10px', outline: 'none', cursor: 'pointer' }}>
                            <option>{opt}</option>
                        </select>
                    ))}
                    <button style={secondaryBtn}>🔽 Filter</button>
                </div>

                {/* Doctor Cards Grid */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                        {filtered.map((d, i) => {
                            const isSelected = selected.name === d.name;
                            return (
                                <div key={i} onClick={() => setSelected(d)} style={{ background: '#fff', borderRadius: 14, padding: '16px', border: `2px solid ${isSelected ? '#2979FF' : '#F1F5F9'}`, boxShadow: isSelected ? '0 2px 12px rgba(41,121,255,0.15)' : '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.15s' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: d.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{d.av}</div>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{d.name}</div>
                                                <div style={{ fontSize: 10, color: '#6B7280' }}>{d.specialty}</div>
                                                <div style={{ fontSize: 10, color: '#2979FF', fontWeight: 500 }}>{d.dept}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                            <span style={statusStyle(d.status)}>{d.status}</span>
                                            <button style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9CA3AF' }}>⋮</button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                                        <span>📅</span>{d.hours}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button style={{ flex: 1, height: 28, border: '1px solid #E5E7EB', borderRadius: 8, background: '#F9FAFB', fontSize: 10, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>👤 View Profile</button>
                                        <button style={{ flex: 1, height: 28, border: '1px solid #E5E7EB', borderRadius: 8, background: '#F9FAFB', fontSize: 10, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>✏️ Edit</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right: Doctor Detail */}
            <div style={{ width: 270, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
                {/* Profile Header */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: selected.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{selected.av}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{selected.name}</span>
                                <span style={statusStyle(selected.status)}>{selected.status}</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{selected.specialty}</div>
                        </div>
                    </div>
                    {[{ icon: '📞', val: '+251 912 345 678' }, { icon: '✉️', val: `${selected.av.toLowerCase()}.alemu@clinic.com` }, { icon: '📍', val: 'Addis Ababa, Ethiopia' }].map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#6B7280', padding: '3px 0' }}>
                            <span>{r.icon}</span>{r.val}
                        </div>
                    ))}

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 0, marginTop: 14, borderBottom: '2px solid #F1F5F9' }}>
                        {['Overview', 'Schedule', 'Appointments', 'Documents'].map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, fontWeight: tab === t ? 700 : 400, color: tab === t ? '#2979FF' : '#6B7280', borderBottom: tab === t ? '2px solid #2979FF' : '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap' }}>{t}</button>
                        ))}
                    </div>
                </div>

                {/* Professional Info */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>👤</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Professional Information</span>
                        </div>
                        <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>✏️ Edit</button>
                    </div>
                    {[
                        { label: 'Full Name', val: selected.name },
                        { label: 'Specialty', val: selected.specialty },
                        { label: 'Department', val: selected.dept },
                        { label: 'Medical License No.', val: 'MD-12345' },
                        { label: 'Experience', val: '8 years' },
                        { label: 'Education', val: 'Addis Ababa University (MD)' },
                    ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F9FAFB', fontSize: 10 }}>
                            <span style={{ color: '#6B7280' }}>{r.label}</span>
                            <span style={{ color: '#111827', fontWeight: 500, textAlign: 'right', maxWidth: 130 }}>{r.val}</span>
                        </div>
                    ))}
                    <div style={{ marginTop: 10, fontSize: 10, color: '#6B7280', lineHeight: 1.6 }}>Experienced cardiologist with a strong focus on preventive cardiology and heart disease management.</div>
                </div>

                {/* Working Hours */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>📅</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Working Hours</span>
                        </div>
                        <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>✏️ Edit</button>
                    </div>
                    {workHours.map((h, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < workHours.length - 1 ? '1px solid #F9FAFB' : 'none', fontSize: 10 }}>
                            <span style={{ color: '#374151', fontWeight: 500 }}>{h.day}</span>
                            <span style={{ color: h.closed ? '#EF4444' : '#2979FF', fontWeight: 500 }}>{h.hours}</span>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span>⚡</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Quick Actions</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                        {[{ icon: '📅', label: 'Book Appointment' }, { icon: '✉️', label: 'Send Message' }, { icon: '📋', label: 'View Schedule' }, { icon: '🖨️', label: 'Print Profile' }].map((a, i) => (
                            <button key={i} style={{ padding: '10px 2px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 8, color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const secondaryBtn: React.CSSProperties = { background: '#fff', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' };
