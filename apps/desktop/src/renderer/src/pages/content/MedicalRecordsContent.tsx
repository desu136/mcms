import React, { useState } from 'react';

const records = [
    { date: 'Oct 15, 2026\n09:00 AM', type: 'Follow-up', dept: 'Cardiology', doctor: 'Dr. Fitsum Alemu', summary: 'Hypertension – condition stable. Continue medication.', typeColor: '#DBEAFE', typeText: '#1D4ED8' },
    { date: 'Oct 08, 2026\n10:30 AM', type: 'Consultation', dept: 'General Medicine', doctor: 'Dr. Mekdes Worku', summary: 'Common cold. Prescribed medication and rest.', typeColor: '#ECFDF5', typeText: '#065F46' },
    { date: 'Sep 28, 2026\n02:15 PM', type: 'Lab Visit', dept: 'Laboratory', doctor: 'Lab Technician', summary: 'Complete Blood Count (CBC) – Normal range.', typeColor: '#FEF3C7', typeText: '#B45309' },
    { date: 'Sep 20, 2026\n11:00 AM', type: 'Consultation', dept: 'Pediatrics', doctor: 'Dr. Hanan Mengesha', summary: 'Fever and cough. Treated with antibiotics.', typeColor: '#ECFDF5', typeText: '#065F46' },
    { date: 'Sep 10, 2026\n03:45 PM', type: 'Follow-up', dept: 'Orthopedics', doctor: 'Dr. Daniel Wondimu', summary: 'Knee pain improved. Continue physiotherapy.', typeColor: '#DBEAFE', typeText: '#1D4ED8' },
];

const history = [
    { name: 'Hypertension', date: 'Oct 15, 2026', status: 'Ongoing', icon: '❤️', bg: '#FEF2F2', color: '#EF4444' },
    { name: 'Common Cold', date: 'Oct 08, 2026', status: 'Resolved', icon: '🤧', bg: '#EFF6FF', color: '#3B82F6' },
    { name: 'CBC Test', date: 'Sep 28, 2026', status: 'Completed', icon: '🧪', bg: '#F0FDF4', color: '#10B981' },
    { name: 'Fever and Cough', date: 'Sep 20, 2026', status: 'Resolved', icon: '🌡️', bg: '#FFF7ED', color: '#F59E0B' },
];

const histStatus = (s: string) => {
    if (s === 'Ongoing') return { bg: '#FEF3C7', color: '#B45309' };
    if (s === 'Resolved') return { bg: '#F0FDF4', color: '#065F46' };
    return { bg: '#EFF6FF', color: '#1D4ED8' };
};

const tabs = ['Overview', 'Medical Records', 'Diagnoses', 'Prescriptions', 'Lab Results', 'Imaging', 'Documents'];

export function MedicalRecordsContent() {
    const [activeTab, setActiveTab] = useState('Medical Records');

    return (
        <div style={{ display: 'flex', gap: 14, height: '100%' }}>
            {/* Main */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>📋</span>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Medical Records</h1>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>View and manage patient medical history, diagnoses, treatments and documents.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', fontSize: 11, color: '#374151' }}>
                            📅 Oct 19, 2026 – Oct 19, 2026
                        </div>
                        <button style={primaryBtn}>+ Add Medical Record</button>
                    </div>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>🔍</span>
                        <input placeholder="Search by patient name, phone, or patient ID..." style={{ width: '100%', height: 36, paddingLeft: 30, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <button style={secondaryBtn}>🔽 Filter</button>
                </div>

                {/* Patient Card */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#F44336,#E91E63)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>LK</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Lidya Kebede</span>
                                <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>Active</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>PID-001020 · +251 911 765 432 · 31 years · Female</div>
                        </div>
                        <div style={{ display: 'flex', gap: 24 }}>
                            {[{ label: 'Total Visits', val: '5', icon: '👤' }, { label: 'Last Visit', val: 'Oct 15, 2026', icon: '📅' }, { label: 'Next Appointment', val: 'Oct 22, 2026\n09:00 AM', icon: '📅' }].map((s, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{s.icon} {s.label}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'pre' }}>{s.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #F1F5F9' }}>
                    {tabs.map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: activeTab === t ? 600 : 400, color: activeTab === t ? '#2979FF' : '#6B7280', borderBottom: activeTab === t ? '2px solid #2979FF' : '2px solid transparent', marginBottom: -2 }}>{t}</button>
                    ))}
                </div>

                {/* Records Table */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', flex: 1 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 14 }}>📋</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Medical Records</span>
                            </div>
                            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>Complete history of patient visits, diagnoses and treatments.</div>
                        </div>
                        <button style={primaryBtn}>+ Add Record</button>
                    </div>
                    {/* Sub-filters */}
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 8, alignItems: 'center' }}>
                        {['All Visit Types', 'All Doctors', 'All Departments'].map((s, i) => (
                            <select key={i} style={{ height: 30, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', background: '#F9FAFB', padding: '0 8px', outline: 'none' }}>
                                <option>{s}</option>
                            </select>
                        ))}
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#9CA3AF' }}>🔍</span>
                            <input placeholder="Search records..." style={{ width: '100%', height: 30, paddingLeft: 26, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F9FAFB' }}>
                                <th style={{ width: 28, padding: '8px 14px' }}><input type="checkbox" /></th>
                                {['Date', 'Visit Type', 'Department', 'Doctor', 'Diagnosis / Summary', 'Actions'].map((h, i) => (
                                    <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={i} style={{ borderTop: '1px solid #F9FAFB' }}>
                                    <td style={{ padding: '10px 14px' }}><input type="checkbox" /></td>
                                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151', whiteSpace: 'pre' }}>{r.date}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: r.typeColor, color: r.typeText }}>{r.type}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#2979FF' }}>
                                            <span>🏥</span>{r.dept}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151' }}>{r.doctor}</td>
                                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#6B7280', maxWidth: 200 }}>{r.summary}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button style={iconBtn}>👁️</button>
                                            <button style={iconBtn}>✏️</button>
                                            <button style={iconBtn}>⋮</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '10px 16px', borderTop: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3].map(p => <button key={p} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: p === 1 ? '#2979FF' : '#fff', color: p === 1 ? '#fff' : '#374151', fontSize: 11, cursor: 'pointer' }}>{p}</button>)}
                            <button style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 11, cursor: 'pointer' }}>›</button>
                        </div>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Showing 1–5 of 15 records</span>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Patient Info */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Patient Information</span>
                        <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>✏️ Edit</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#F44336,#E91E63)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>LK</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Lidya Kebede</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>PID-001020</div>
                            <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 9, fontWeight: 600, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>Active</span>
                        </div>
                    </div>
                    {[
                        { icon: '📞', text: '+251 911 765 432' },
                        { icon: '✉️', text: 'lidya.kebede@e...' },
                        { icon: '🎂', text: 'Feb 14, 1995 (31 years)' },
                        { icon: '👤', text: 'Female' },
                        { icon: '📍', text: 'Bole Sub City, Addis Ababa' },
                    ].map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < 4 ? '1px solid #F5F7FA' : 'none', fontSize: 11, color: '#374151' }}>
                            <span>{d.icon}</span>{d.text}
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span>⚡</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Quick Actions</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[{ icon: '📅', label: 'New Appointment' }, { icon: '💊', label: 'Add Prescription' }, { icon: '🧪', label: 'View Lab Results' }, { icon: '📎', label: 'Upload Document' }].map((a, i) => (
                            <button key={i} style={{ padding: '10px 4px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 9, color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 16 }}>{a.icon}</span>{a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent History */}
                <div style={{ ...panel, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Recent Medical History</span>
                        <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                    </div>
                    {history.map((h, i) => {
                        const sc = histStatus(h.status);
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < history.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: h.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{h.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                                    <div style={{ fontSize: 9, color: '#9CA3AF' }}>{h.date}</div>
                                </div>
                                <span style={{ padding: '1px 6px', borderRadius: 999, fontSize: 9, fontWeight: 600, background: sc.bg, color: sc.color, flexShrink: 0 }}>{h.status}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const secondaryBtn: React.CSSProperties = { background: '#fff', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' };
const iconBtn: React.CSSProperties = { width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 11 };
