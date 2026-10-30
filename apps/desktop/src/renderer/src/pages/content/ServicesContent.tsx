import React, { useState } from 'react';

const services = [
    { id: 1, name: 'General Consultation', category: 'Consultation', dept: 'General Medicine', price: 'ETB 300', duration: '30 min', status: 'Active', icon: '🩺' },
    { id: 2, name: 'ECG / EKG', category: 'Diagnostics', dept: 'Cardiology', price: 'ETB 500', duration: '20 min', status: 'Active', icon: '❤️' },
    { id: 3, name: 'Complete Blood Count', category: 'Lab Tests', dept: 'Laboratory', price: 'ETB 250', duration: '2 hrs', status: 'Active', icon: '🔬' },
    { id: 4, name: 'Chest X-Ray', category: 'Imaging', dept: 'Radiology', price: 'ETB 700', duration: '30 min', status: 'Active', icon: '🫁' },
    { id: 5, name: 'Pediatric Checkup', category: 'Consultation', dept: 'Pediatrics', price: 'ETB 350', duration: '30 min', status: 'Active', icon: '👶' },
    { id: 6, name: 'Ultrasound Scan', category: 'Imaging', dept: 'Radiology', price: 'ETB 800', duration: '45 min', status: 'Active', icon: '📡' },
    { id: 7, name: 'Dental Cleaning', category: 'Dental', dept: 'Dentistry', price: 'ETB 400', duration: '45 min', status: 'Active', icon: '🦷' },
    { id: 8, name: 'Eye Examination', category: 'Eye Care', dept: 'Ophthalmology', price: 'ETB 450', duration: '40 min', status: 'Inactive', icon: '👁️' },
    { id: 9, name: 'Physiotherapy Session', category: 'Therapy', dept: 'Orthopedics', price: 'ETB 600', duration: '60 min', status: 'Active', icon: '🦴' },
    { id: 10, name: 'Skin Biopsy', category: 'Procedure', dept: 'Dermatology', price: 'ETB 1,200', duration: '1 hr', status: 'Active', icon: '🧴' },
];

const categories = ['All Categories', 'Consultation', 'Diagnostics', 'Lab Tests', 'Imaging', 'Dental', 'Therapy', 'Procedure'];

const catColor = (cat: string) => {
    const map: Record<string, [string, string]> = {
        'Consultation': ['#DBEAFE', '#1D4ED8'],
        'Diagnostics': ['#ECFDF5', '#065F46'],
        'Lab Tests': ['#FEF3C7', '#B45309'],
        'Imaging': ['#F5F3FF', '#5B21B6'],
        'Dental': ['#FDF4FF', '#7C3AED'],
        'Eye Care': ['#EFF6FF', '#1D4ED8'],
        'Therapy': ['#FFF7ED', '#C2410C'],
        'Procedure': ['#FEF2F2', '#B91C1C'],
    };
    return map[cat] ?? ['#F3F4F6', '#374151'];
};

export function ServicesContent() {
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('All Categories');
    const [view, setView] = useState<'grid' | 'list'>('list');

    const filtered = services.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.dept.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCat === 'All Categories' || s.category === activeCat;
        return matchSearch && matchCat;
    });

    return (
        <div style={{ display: 'flex', gap: 14, height: '100%' }}>
            {/* Main */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>🔧</span>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Services</h1>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>Manage medical services, pricing, and availability across departments.</p>
                    </div>
                    <button style={primaryBtn}>+ Add New Service</button>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[
                        { label: 'Total Services', val: '86', sub: '+5 new services', icon: '🔧', bg: '#EFF6FF' },
                        { label: 'Active Services', val: '79', sub: '91.8% active', icon: '✅', bg: '#F0FDF4' },
                        { label: 'Categories', val: '8', sub: 'service groups', icon: '📁', bg: '#FDF4FF' },
                        { label: 'Avg. Price', val: 'ETB 568', sub: 'per service', icon: '💰', bg: '#FFF7ED' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
                            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '3px 0' }}>{s.val}</div>
                            <div style={{ fontSize: 10, color: '#059669' }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Category Chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as 'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCat(cat)} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1px solid ${activeCat === cat ? '#2979FF' : '#E5E7EB'}`, background: activeCat === cat ? '#2979FF' : '#fff', color: activeCat === cat ? '#fff' : '#374151', cursor: 'pointer', transition: 'all 0.15s' }}>{cat}</button>
                    ))}
                </div>

                {/* Search & View Toggle */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services by name or department..." style={{ width: '100%', height: 36, paddingLeft: 30, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' as 'border-box' }} />
                    </div>
                    {['All Departments', 'All Statuses'].map((opt, i) => (
                        <select key={i} style={{ height: 36, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 11, color: '#374151', background: '#fff', padding: '0 10px', outline: 'none', cursor: 'pointer' }}>
                            <option>{opt}</option>
                        </select>
                    ))}
                    <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                        {([['≡', 'list'], ['⊞', 'grid']] as const).map(([ico, v]) => (
                            <button key={v} onClick={() => setView(v)} style={{ width: 36, height: 36, border: 'none', background: view === v ? '#2979FF' : '#fff', color: view === v ? '#fff' : '#374151', cursor: 'pointer', fontSize: 16 }}>{ico}</button>
                        ))}
                    </div>
                </div>

                {/* Table / Grid */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Services List</span>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{filtered.length} services</span>
                    </div>
                    {view === 'list' ? (
                        <div style={{ overflowY: 'auto', maxHeight: 420 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#F9FAFB' }}>
                                        {['#', 'Service Name', 'Category', 'Department', 'Price', 'Duration', 'Status', 'Actions'].map((h, i) => (
                                            <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((s, i) => {
                                        const [bg, color] = catColor(s.category);
                                        const isActive = s.status === 'Active';
                                        return (
                                            <tr key={i} style={{ borderTop: '1px solid #F9FAFB' }}>
                                                <td style={td}>{s.id}</td>
                                                <td style={td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{s.icon}</div>
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{s.name}</span>
                                                    </div>
                                                </td>
                                                <td style={td}><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: bg, color }}>{s.category}</span></td>
                                                <td style={{ ...td, fontSize: 11, color: '#2979FF' }}>{s.dept}</td>
                                                <td style={{ ...td, fontWeight: 700, color: '#111827' }}>{s.price}</td>
                                                <td style={{ ...td, color: '#6B7280' }}>{s.duration}</td>
                                                <td style={td}>
                                                    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: isActive ? '#ECFDF5' : '#FEF2F2', color: isActive ? '#065F46' : '#B91C1C', border: `1px solid ${isActive ? '#A7F3D0' : '#FECACA'}` }}>{s.status}</span>
                                                </td>
                                                <td style={td}>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button style={iconBtn}>👁️</button>
                                                        <button style={iconBtn}>✏️</button>
                                                        <button style={iconBtn}>⋮</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, overflowY: 'auto', maxHeight: 420 }}>
                            {filtered.map((s, i) => {
                                const [bg, color] = catColor(s.category);
                                const isActive = s.status === 'Active';
                                return (
                                    <div key={i} style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
                                            <div>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{s.name}</div>
                                                <div style={{ fontSize: 9, color: '#2979FF' }}>{s.dept}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ padding: '1px 6px', borderRadius: 6, fontSize: 9, fontWeight: 600, background: bg, color }}>{s.category}</span>
                                            <span style={{ padding: '1px 6px', borderRadius: 999, fontSize: 9, fontWeight: 600, background: isActive ? '#ECFDF5' : '#FEF2F2', color: isActive ? '#065F46' : '#B91C1C' }}>{s.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B7280' }}>
                                            <span>💰 {s.price}</span><span>⏱ {s.duration}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div style={{ padding: '10px 16px', borderTop: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3].map(p => <button key={p} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: p === 1 ? '#2979FF' : '#fff', color: p === 1 ? '#fff' : '#374151', fontSize: 11, cursor: 'pointer' }}>{p}</button>)}
                            <button style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 11, cursor: 'pointer' }}>›</button>
                        </div>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Showing 1–{filtered.length} of {services.length} services</span>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Categories Breakdown */}
                <div style={panel}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Services by Category</div>
                    {[
                        { cat: 'Consultation', count: 12, pct: 14 },
                        { cat: 'Diagnostics', count: 18, pct: 21 },
                        { cat: 'Lab Tests', count: 22, pct: 26 },
                        { cat: 'Imaging', count: 10, pct: 12 },
                        { cat: 'Therapy', count: 8, pct: 9 },
                        { cat: 'Other', count: 16, pct: 18 },
                    ].map((c, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
                                <span style={{ color: '#374151', fontWeight: 500 }}>{c.cat}</span>
                                <span style={{ color: '#6B7280' }}>{c.count} · {c.pct}%</span>
                            </div>
                            <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${c.pct}%`, background: '#2979FF', borderRadius: 3 }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={panel}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Quick Actions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[{ icon: '🔧', label: 'Add Service' }, { icon: '📁', label: 'Add Category' }, { icon: '💰', label: 'Update Pricing' }, { icon: '📊', label: 'View Report' }].map((a, i) => (
                            <button key={i} style={{ padding: '10px 4px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 9, color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Services */}
                <div style={{ ...panel, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Top Services</div>
                    {[
                        { name: 'General Consultation', count: '248 this month' },
                        { name: 'Complete Blood Count', count: '186 this month' },
                        { name: 'Chest X-Ray', count: '142 this month' },
                        { name: 'Ultrasound Scan', count: '118 this month' },
                        { name: 'ECG / EKG', count: '98 this month' },
                    ].map((s, i) => (
                        <div key={i} style={{ padding: '7px 0', borderBottom: i < 4 ? '1px solid #F5F7FA' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: '#111827' }}>{s.name}</div>
                                    <div style={{ fontSize: 9, color: '#9CA3AF' }}>{s.count}</div>
                                </div>
                                <span style={{ fontSize: 12, color: '#9CA3AF' }}>›</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const td: React.CSSProperties = { padding: '10px 14px', fontSize: 12, color: '#374151' };
const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const iconBtn: React.CSSProperties = { width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 11 };
