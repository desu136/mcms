import React, { useState } from 'react';

const departments = [
    { id: 1, name: 'Cardiology', icon: '❤️', desc: 'Heart and blood vessel care, including ECG and echocardiography.', doctors: 3, services: 8, status: 'Active' },
    { id: 2, name: 'Pulmonology', icon: '🫁', desc: 'Respiratory system and lung care.', doctors: 2, services: 6, status: 'Active' },
    { id: 3, name: 'Gastroenterology', icon: '🔬', desc: 'Digestive system and stomach care.', doctors: 2, services: 7, status: 'Active' },
    { id: 4, name: 'Neurology', icon: '🧠', desc: 'Brain, nerves and nervous system.', doctors: 2, services: 5, status: 'Active' },
    { id: 5, name: 'Orthopedics', icon: '🦴', desc: 'Bones, joints and muscle care.', doctors: 3, services: 9, status: 'Active' },
    { id: 6, name: 'Pediatrics', icon: '👶', desc: "Children's health and development.", doctors: 3, services: 7, status: 'Active' },
    { id: 7, name: 'Gynecology', icon: '🌸', desc: "Women's health and reproductive care.", doctors: 3, services: 6, status: 'Active' },
    { id: 8, name: 'Internal Medicine', icon: '🩺', desc: 'General health and adult care.', doctors: 4, services: 10, status: 'Active' },
    { id: 9, name: 'General Surgery', icon: '⚕️', desc: 'Surgical procedures and post-op care.', doctors: 2, services: 6, status: 'Active' },
    { id: 10, name: 'Ophthalmology', icon: '👁️', desc: 'Eye care and vision treatment.', doctors: 2, services: 5, status: 'Active' },
    { id: 11, name: 'Dermatology', icon: '🧴', desc: 'Skin, hair and nail care.', doctors: 2, services: 5, status: 'Active' },
    { id: 12, name: 'Dentistry', icon: '🦷', desc: 'Oral health and dental care.', doctors: 3, services: 7, status: 'Active' },
];

const summaryDepts = [
    { name: 'Cardiology', doctors: 3, services: 6, color: '#EF4444' },
    { name: 'Pediatrics', doctors: 3, services: 7, color: '#3B82F6' },
    { name: 'Orthopedics', doctors: 3, services: 9, color: '#10B981' },
    { name: 'Gynecology', doctors: 3, services: 6, color: '#EC4899' },
    { name: 'General Surgery', doctors: 2, services: 6, color: '#8B5CF6' },
];

const recentDepts = [
    { name: 'Dermatology', date: 'Oct 18, 2026', status: 'Active', color: '#F59E0B' },
    { name: 'Ophthalmology', date: 'Oct 18, 2026', status: 'Active', color: '#3B82F6' },
    { name: 'Dentistry', date: 'Oct 12, 2026', status: 'Active', color: '#10B981' },
    { name: 'General Surgery', date: 'Oct 12, 2026', status: 'Active', color: '#8B5CF6' },
    { name: 'Neurology', date: 'Oct 03, 2026', status: 'Active', color: '#6366F1' },
];

export function DepartmentsContent() {
    const [search, setSearch] = useState('');

    return (
        <div style={{ display: 'flex', gap: 16, height: '100%' }}>
            {/* Main */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>🏢</span>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Departments</h1>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>Manage clinic departments, services and related information.</p>
                    </div>
                    <button style={primaryBtn}>+ Add Department</button>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[
                        { label: 'Total Departments', value: '12', change: '+1 added this month', icon: '🏢', bg: '#EFF6FF', color: '#1D4ED8' },
                        { label: 'Total Doctors', value: '28', change: '+2 new this month', icon: '👨‍⚕️', bg: '#F0FDF4', color: '#166534' },
                        { label: 'Total Services', value: '86', change: '+5 new services', icon: '⚙️', bg: '#FDF4FF', color: '#7C3AED' },
                        { label: "Today's Appts", value: '36', change: '↑ 8% vs. yesterday', icon: '📅', bg: '#FFF7ED', color: '#C2410C' },
                    ].map((c, i) => (
                        <div key={i} style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{c.icon}</div>
                            </div>
                            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{c.label}</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '4px 0' }}>{c.value}</div>
                            <div style={{ fontSize: 10, color: '#059669' }}>{c.change}</div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9CA3AF' }}>🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments by name or description..." style={{ ...inputStyle, paddingLeft: 32 }} />
                    </div>
                    <select style={selectStyle}><option>All Departments</option></select>
                    <select style={selectStyle}><option>All Statuses</option></select>
                    <button style={{ ...secondaryBtn, display: 'flex', alignItems: 'center', gap: 6 }}>🔽 Filter</button>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', flex: 1 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>📅</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Departments</span>
                    </div>
                    <div style={{ overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F9FAFB' }}>
                                    {['#', 'Department', 'Description', 'Doctors', 'Services', 'Status', 'Actions'].map((h, i) => (
                                        <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map((d) => (
                                    <tr key={d.id} style={{ borderTop: '1px solid #F9FAFB' }}>
                                        <td style={td}>{d.id}</td>
                                        <td style={td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 16 }}>{d.icon}</span>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#2979FF' }}>{d.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ ...td, maxWidth: 220 }}><span style={{ fontSize: 11, color: '#6B7280' }}>{d.desc}</span></td>
                                        <td style={td}><span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{d.doctors}</span></td>
                                        <td style={td}><span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{d.services}</span></td>
                                        <td style={td}><span style={activeBadge}>Active</span></td>
                                        <td style={td}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button style={iconBtn}>👁️</button>
                                                <button style={iconBtn}>✏️</button>
                                                <button style={iconBtn}>⋮</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2].map(p => <button key={p} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', background: p === 1 ? '#2979FF' : '#fff', color: p === 1 ? '#fff' : '#374151', fontSize: 11, cursor: 'pointer' }}>{p}</button>)}
                            <button style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 11, cursor: 'pointer' }}>›</button>
                        </div>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Showing 1–12 of 12 departments</span>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Department Summary */}
                <div style={rightPanel}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={panelTitle}>Department Summary</span>
                        <button style={viewAllBtn}>View All</button>
                    </div>
                    {summaryDepts.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < summaryDepts.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{d.name}</div>
                                    <div style={{ fontSize: 9, color: '#9CA3AF' }}>{d.doctors} doctors · {d.services} services</div>
                                </div>
                            </div>
                            <span style={{ fontSize: 13, color: '#9CA3AF' }}>›</span>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={rightPanel}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span>⚡</span><span style={panelTitle}>Quick Actions</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[{ icon: '🏢', label: 'Add Department' }, { icon: '👨‍⚕️', label: 'Add Doctor' }, { icon: '⚙️', label: 'Add Service' }, { icon: '📊', label: 'View Report' }].map((a, i) => (
                            <button key={i} style={{ padding: '10px 6px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 10, color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent */}
                <div style={rightPanel}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={panelTitle}>Recent Departments</span>
                        <button style={viewAllBtn}>View All</button>
                    </div>
                    {recentDepts.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < recentDepts.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: d.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏥</div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: '#111827' }}>{d.name}</div>
                                    <div style={{ fontSize: 9, color: '#9CA3AF' }}>{d.date}</div>
                                </div>
                            </div>
                            <span style={activeBadge}>Active</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Shared styles
const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const rightPanel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const panelTitle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#111827' };
const viewAllBtn: React.CSSProperties = { fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 };
const td: React.CSSProperties = { padding: '10px 14px', fontSize: 12, color: '#374151' };
const activeBadge: React.CSSProperties = { display: 'inline-flex', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' };
const iconBtn: React.CSSProperties = { width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const secondaryBtn: React.CSSProperties = { background: '#fff', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { width: '100%', height: 36, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#F9FAFB', outline: 'none', paddingRight: 12, boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { height: 36, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#fff', padding: '0 10px', outline: 'none', cursor: 'pointer' };
