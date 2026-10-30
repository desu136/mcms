import React, { useState } from 'react';

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
    { day: 'Sunday', hours: '', closed: true },
];

const quickActions = [
    { icon: '🖼️', label: 'Change Clinic Logo' },
    { icon: '🕐', label: 'Update Working Hours' },
    { icon: '💾', label: 'Manage Backup' },
    { icon: '📋', label: 'System Logs' },
];

export function SettingsContent() {
    const [activeMenu, setActiveMenu] = useState('clinic');

    return (
        <div style={{ display: 'flex', gap: 14, height: '100%' }}>
            {/* Left Menu */}
            <div style={{ width: 220, flexShrink: 0 }}>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F7FA' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Settings Menu</span>
                    </div>
                    {settingsMenu.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 16px', border: 'none', borderBottom: '1px solid #F9FAFB',
                                background: activeMenu === item.id ? '#EFF6FF' : '#fff',
                                cursor: 'pointer', textAlign: 'left',
                            }}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: activeMenu === item.id ? '#DBEAFE' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{item.icon}</div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: activeMenu === item.id ? '#1D4ED8' : '#111827' }}>{item.label}</div>
                                <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{item.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Center */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>⚙️</span>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Settings</h1>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>Configure your clinic information, system preferences and manage users.</p>
                    </div>
                    <button style={primaryBtn}>💾 Save Changes</button>
                </div>

                {/* Clinic Profile */}
                <div style={section}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Clinic Profile</div>
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Update your clinic's basic information and contact details.</div>
                        </div>
                        <button style={primaryBtn}>💾 Save Changes</button>
                    </div>

                    <div style={{ display: 'flex', gap: 24 }}>
                        {/* Logo */}
                        <div style={{ flexShrink: 0, textAlign: 'center' }}>
                            <div style={{
                                width: 100, height: 100, borderRadius: 20, border: '2px dashed #BFDBFE',
                                background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 10,
                            }}>
                                <span style={{ fontSize: 30 }}>🏥</span>
                                <div style={{ fontSize: 9, color: '#3B82F6', fontWeight: 600, marginTop: 4 }}>City Health Clinic</div>
                                <div style={{ fontSize: 8, color: '#93C5FD' }}>Better Health, Brighter Future</div>
                            </div>
                            <button style={secondaryBtn}>📷 Change Logo</button>
                            <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 4 }}>Recommended size: 200 × 200 px<br />PNG, JPG (Max 2MB)</div>
                        </div>

                        {/* Form */}
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                { label: 'Clinic Name *', val: 'City Health Clinic', },
                                { label: 'Registration No.', val: 'CLN-2025-001', },
                                { label: 'Phone Number *', val: '+251 911 234 567', },
                                { label: 'Email Address *', val: 'info@cityhealthclinic.com', },
                                { label: 'Website', val: 'www.cityhealthclinic.com', },
                                { label: 'Address *', val: 'Bole Sub City, Addis Ababa, Ethiopia', },
                            ].map((f, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{f.label}</div>
                                    <input defaultValue={f.val} style={{ width: '100%', height: 34, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', padding: '0 10px', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Working Hours */}
                <div style={section}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>🕐</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Working Hours</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Set your clinic's working hours for each day of the week.</div>
                        </div>
                        <button style={secondaryBtn}>✏️ Edit</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                        {workingHours.map((h, i) => (
                            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: i % 2 === 0 ? 20 : 0 }}>
                                <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{h.day}</span>
                                {h.closed
                                    ? <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>Closed</span>
                                    : <span style={{ fontSize: 11, color: '#2979FF', fontWeight: 500 }}>{h.hours}</span>
                                }
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Info */}
                <div style={section}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>📞</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Contact Information</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Additional contact details and social media links.</div>
                        </div>
                        <button style={secondaryBtn}>✏️ Edit</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                        {[
                            { icon: '📞', label: 'Phone', val: '+251 911 234 567', bg: '#ECFDF5', color: '#065F46' },
                            { icon: '✉️', label: 'Email', val: 'info@cityhealthclinic.com', bg: '#EFF6FF', color: '#1D4ED8' },
                            { icon: '🌐', label: 'Website', val: 'www.cityhealthclinic.com', bg: '#F0FDF4', color: '#166534' },
                            { icon: '📍', label: 'Location', val: 'Bole Sub City, Addis Ababa', bg: '#FFF7ED', color: '#C2410C' },
                        ].map((c, i) => (
                            <div key={i} style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 8px' }}>{c.icon}</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>{c.label}</div>
                                <div style={{ fontSize: 10, color: '#374151', wordBreak: 'break-all' }}>{c.val}</div>
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
                        <span>📊</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Clinic Statistics</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                            { label: 'Total Patients', val: '1,248', change: '↑ 12%', bg: '#EFF6FF', color: '#1D4ED8', icon: '👥' },
                            { label: 'Appts Today', val: '36', change: '↑ 8%', bg: '#F0FDF4', color: '#166534', icon: '📅' },
                            { label: 'Total Revenue', val: '$12,480', change: '↑ 15%', bg: '#FDF4FF', color: '#7C3AED', icon: '💰' },
                            { label: 'Active Doctors', val: '12', change: '↑ 0%', bg: '#FFF7ED', color: '#C2410C', icon: '👨‍⚕️' },
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
                        <span>⚙️</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>System Information</span>
                    </div>
                    {[
                        { label: 'System Version', val: 'v1.0.0' },
                        { label: 'Last Updated', val: 'Oct 19, 2026  10:24 AM' },
                        { label: 'Database Version', val: 'v1.0.0' },
                        { label: 'Environment', val: 'Production', badge: true },
                    ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? '1px solid #F5F7FA' : 'none' }}>
                            <span style={{ fontSize: 10, color: '#6B7280' }}>{r.label}</span>
                            {r.badge
                                ? <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 9, fontWeight: 600, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>{r.val}</span>
                                : <span style={{ fontSize: 10, fontWeight: 600, color: '#111827' }}>{r.val}</span>
                            }
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span>⚡</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Quick Actions</span>
                    </div>
                    {quickActions.map((a, i) => (
                        <button key={i} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', border: '1px solid #F1F5F9', borderRadius: 8, background: '#F9FAFB', cursor: 'pointer', marginBottom: 6, fontSize: 11, color: '#374151' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 15 }}>{a.icon}</span>{a.label}</span>
                            <span style={{ color: '#9CA3AF' }}>›</span>
                        </button>
                    ))}
                </div>

                {/* Help */}
                <div style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderRadius: 14, padding: 14, border: '1px solid #BFDBFE' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>🛡️</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8' }}>Need Help?</span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: 10, color: '#3B82F6' }}>Contact system administrator for support.</p>
                    <button style={{ ...primaryBtn, width: '100%', fontSize: 11 }}>👤 Contact Support</button>
                </div>
            </div>
        </div>
    );
}

const section: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const secondaryBtn: React.CSSProperties = { background: '#fff', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' };
