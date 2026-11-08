'use client';

import React, { useState } from 'react';

const STATIC_CATEGORIES = ['All Categories', 'Consultation', 'Diagnostics', 'Lab Tests', 'Imaging', 'Dental', 'Therapy', 'Procedure'];

export function ServicesContent() {
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('All Categories');
    const [view, setView] = useState<'grid' | 'list'>('list');

    return (
        <div style={{ display: 'flex', gap: 14, height: '100%', minHeight: 'calc(100vh - 120px)' }}>
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
                    <button style={primaryBtn} disabled title="Services API not yet available">+ Add New Service</button>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[
                        { label: 'Total Services', val: '—', sub: 'No data yet', icon: '🔧', bg: '#EFF6FF' },
                        { label: 'Active Services', val: '—', sub: 'No data yet', icon: '✅', bg: '#F0FDF4' },
                        { label: 'Categories', val: '—', sub: 'No data yet', icon: '📁', bg: '#FDF4FF' },
                        { label: 'Avg. Price', val: '—', sub: 'No data yet', icon: '💰', bg: '#FFF7ED' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
                            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#9CA3AF', margin: '3px 0' }}>{s.val}</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Category Chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                    {STATIC_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCat(cat)}
                            style={{
                                padding: '5px 14px',
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 600,
                                border: `1px solid ${activeCat === cat ? '#2979FF' : '#E5E7EB'}`,
                                background: activeCat === cat ? '#2979FF' : '#fff',
                                color: activeCat === cat ? '#fff' : '#374151',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search & View Toggle */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>🔍</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search services by name or department..."
                            style={{ width: '100%', height: 36, paddingLeft: 30, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' as const }}
                        />
                    </div>
                    {['All Departments', 'All Statuses'].map((opt, i) => (
                        <select key={i} disabled style={{ height: 36, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 11, color: '#9CA3AF', background: '#F9FAFB', padding: '0 10px', outline: 'none', cursor: 'not-allowed' }}>
                            <option>{opt}</option>
                        </select>
                    ))}
                    <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                        {(['list', 'grid'] as const).map((v) => (
                            <button key={v} onClick={() => setView(v)} style={{ width: 36, height: 36, border: 'none', background: view === v ? '#2979FF' : '#fff', color: view === v ? '#fff' : '#374151', cursor: 'pointer', fontSize: 16 }}>
                                {v === 'list' ? '≡' : '⊞'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Area — Empty State */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Services List</span>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>0 services</span>
                    </div>

                    {/* Coming-soon banner */}
                    <div style={{ margin: 16, padding: '12px 16px', borderRadius: 10, background: '#FFF7ED', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>🚧</span>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E' }}>Services API Coming Soon</div>
                            <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>
                                The services catalog endpoint is not yet available. Services will appear here automatically once the API is configured.
                            </div>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 12 }}>
                        <div style={{ width: 60, height: 60, borderRadius: 16, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔧</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>No services configured yet</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', maxWidth: 320 }}>
                            Services will appear here once they have been added via the API. Contact your system administrator to set up the services catalog.
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '10px 16px', borderTop: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button disabled style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#2979FF', color: '#fff', fontSize: 11, cursor: 'not-allowed' }}>1</button>
                        </div>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Showing 0 of 0 services</span>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Categories Breakdown — Empty */}
                <div style={panel}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Services by Category</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>📁</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>No category data available yet</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={panel}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Quick Actions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                            { icon: '🔧', label: 'Add Service' },
                            { icon: '📁', label: 'Add Category' },
                            { icon: '💰', label: 'Update Pricing' },
                            { icon: '📊', label: 'View Report' },
                        ].map((a, i) => (
                            <button
                                key={i}
                                disabled
                                title="Coming soon"
                                style={{ padding: '10px 4px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'not-allowed', fontSize: 9, color: '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: 0.6 }}
                            >
                                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Services — Empty */}
                <div style={{ ...panel, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Top Services</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>📈</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>Usage data will appear here once services are configured</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'not-allowed', opacity: 0.5 };
