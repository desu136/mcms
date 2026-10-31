import React, { useState } from 'react';

const invoices = [
    { id: 'INV-001024', patient: 'Aster Mulu', av: 'AM', c: '#2979FF', date: 'Oct 19, 2026', services: 'General Consultation, CBC', amount: 'ETB 550', status: 'Paid', method: 'Cash' },
    { id: 'INV-001023', patient: 'Abebe Assefa', av: 'AA', c: '#00C853', date: 'Oct 18, 2026', services: 'Pediatric Checkup', amount: 'ETB 350', status: 'Pending', method: '—' },
    { id: 'INV-001022', patient: 'Tigist Alemu', av: 'TA', c: '#AA00FF', date: 'Oct 17, 2026', services: 'Ultrasound Scan, ECG', amount: 'ETB 1,300', status: 'Paid', method: 'Bank Transfer' },
    { id: 'INV-001021', patient: 'Getachew Tadesse', av: 'GT', c: '#FF6D00', date: 'Oct 16, 2026', services: 'Physiotherapy Session × 3', amount: 'ETB 1,800', status: 'Partial', method: 'Cash' },
    { id: 'INV-001020', patient: 'Lidya Kebede', av: 'LK', c: '#F44336', date: 'Oct 15, 2026', services: 'Chest X-Ray, Consultation', amount: 'ETB 1,000', status: 'Paid', method: 'Mobile' },
    { id: 'INV-001019', patient: 'Samuel Girma', av: 'SG', c: '#00BCD4', date: 'Oct 14, 2026', services: 'Dental Cleaning', amount: 'ETB 400', status: 'Overdue', method: '—' },
    { id: 'INV-001018', patient: 'Mekdes Worku', av: 'MW', c: '#10B981', date: 'Oct 13, 2026', services: 'Eye Examination', amount: 'ETB 450', status: 'Paid', method: 'Cash' },
    { id: 'INV-001017', patient: 'Daniel Wondimu', av: 'DW', c: '#8B5CF6', date: 'Oct 12, 2026', services: 'Skin Biopsy', amount: 'ETB 1,200', status: 'Pending', method: '—' },
];

const statusStyle = (s: string): React.CSSProperties => {
    const map: Record<string, [string, string, string]> = {
        Paid: ['#ECFDF5', '#065F46', '#A7F3D0'],
        Pending: ['#FEF3C7', '#B45309', '#FCD34D'],
        Partial: ['#EFF6FF', '#1D4ED8', '#BFDBFE'],
        Overdue: ['#FEF2F2', '#B91C1C', '#FECACA'],
    };
    const [bg, color, border] = map[s] ?? ['#F3F4F6', '#374151', '#E5E7EB'];
    return { padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: bg, color, border: `1px solid ${border}` };
};

const monthRevenue = [
    { month: 'Jun', val: 48 }, { month: 'Jul', val: 62 }, { month: 'Aug', val: 55 },
    { month: 'Sep', val: 70 }, { month: 'Oct', val: 85 },
];

function MiniBarChart() {
    const max = 100, W = 180, H = 70;
    const barW = 24, gap = (W - 5 * barW) / 6;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
            {monthRevenue.map((d, i) => {
                const h = (d.val / max) * (H - 20);
                const x = gap + i * (barW + gap);
                const y = H - 16 - h;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={barW} height={h} rx={4} fill={i === monthRevenue.length - 1 ? '#2979FF' : '#DBEAFE'} />
                        <text x={x + barW / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="#94A3B8">{d.month}</text>
                    </g>
                );
            })}
        </svg>
    );
}

export function BillingContent() {
    const [activeTab, setActiveTab] = useState('All');
    const tabs = ['All', 'Paid', 'Pending', 'Partial', 'Overdue'];
    const filtered = activeTab === 'All' ? invoices : invoices.filter(inv => inv.status === activeTab);

    return (
        <div style={{ display: 'flex', gap: 14, height: '100%' }}>
            {/* Main */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>💰</span>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Billing & Payments</h1>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>Manage invoices, payments and financial records.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button style={secondaryBtn}>⬇ Export</button>
                        <button style={primaryBtn}>+ New Invoice</button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[
                        { label: 'Total Revenue', val: 'ETB 248,500', sub: '↑ 15% vs last month', icon: '💰', bg: '#EFF6FF', c: '#059669' },
                        { label: "Today's Revenue", val: 'ETB 12,480', sub: '↑ 8% vs yesterday', icon: '📅', bg: '#F0FDF4', c: '#059669' },
                        { label: 'Pending Payments', val: 'ETB 8,200', sub: '↓ 3 invoices due', icon: '⏳', bg: '#FEF3C7', c: '#B45309' },
                        { label: 'Overdue Invoices', val: '4', sub: '↑ 1 overdue', icon: '⚠️', bg: '#FEF2F2', c: '#DC2626' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                            </div>
                            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '3px 0' }}>{s.val}</div>
                            <div style={{ fontSize: 10, color: s.c, fontWeight: 500 }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Invoices Table */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Tab bar + Search */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 0, background: '#F3F4F6', borderRadius: 10, padding: 3 }}>
                            {tabs.map(t => (
                                <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '4px 12px', borderRadius: 8, border: 'none', background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#111827' : '#6B7280', fontSize: 11, fontWeight: activeTab === t ? 600 : 400, cursor: 'pointer', boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>{t}</button>
                            ))}
                        </div>
                        <div style={{ flex: 1 }} />
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#9CA3AF' }}>🔍</span>
                            <input placeholder="Search invoices..." style={{ height: 32, paddingLeft: 26, paddingRight: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, background: '#F9FAFB', outline: 'none', width: 200 }} />
                        </div>
                        <button style={secondaryBtn}>🔽 Filter</button>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F9FAFB' }}>
                                    <th style={{ width: 28, padding: '8px 14px' }}><input type="checkbox" /></th>
                                    {['Invoice #', 'Patient', 'Date', 'Services', 'Amount', 'Status', 'Payment Method', 'Actions'].map((h, i) => (
                                        <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((inv, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid #F9FAFB' }}>
                                        <td style={{ padding: '10px 14px' }}><input type="checkbox" /></td>
                                        <td style={{ padding: '10px 14px' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#2979FF' }}>{inv.id}</span>
                                        </td>
                                        <td style={{ padding: '10px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: inv.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{inv.av}</div>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{inv.patient}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px 14px', fontSize: 11, color: '#6B7280' }}>{inv.date}</td>
                                        <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151', maxWidth: 180 }}><span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{inv.services}</span></td>
                                        <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#111827' }}>{inv.amount}</td>
                                        <td style={{ padding: '10px 14px' }}><span style={statusStyle(inv.status)}>{inv.status}</span></td>
                                        <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151' }}>{inv.method}</td>
                                        <td style={{ padding: '10px 14px' }}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button style={iconBtn}>👁️</button>
                                                <button style={iconBtn}>🖨️</button>
                                                <button style={iconBtn}>⋮</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '10px 16px', borderTop: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3, 4].map(p => <button key={p} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: p === 1 ? '#2979FF' : '#fff', color: p === 1 ? '#fff' : '#374151', fontSize: 11, cursor: 'pointer' }}>{p}</button>)}
                            <button style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 11, cursor: 'pointer' }}>›</button>
                        </div>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Showing 1–{filtered.length} of {invoices.length} invoices</span>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Revenue Chart */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Monthly Revenue</span>
                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>2026</span>
                    </div>
                    <MiniBarChart />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11 }}>
                        <div>
                            <div style={{ color: '#9CA3AF', fontSize: 9 }}>This Month</div>
                            <div style={{ fontWeight: 700, color: '#111827' }}>ETB 84,500</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#9CA3AF', fontSize: 9 }}>vs Last Month</div>
                            <div style={{ fontWeight: 600, color: '#059669', fontSize: 10 }}>↑ 21%</div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div style={panel}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Payment Methods</div>
                    {[
                        { method: 'Cash', pct: 48, color: '#2979FF' },
                        { method: 'Bank Transfer', pct: 28, color: '#10B981' },
                        { method: 'Mobile Money', pct: 16, color: '#F59E0B' },
                        { method: 'Insurance', pct: 8, color: '#8B5CF6' },
                    ].map((m, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
                                    <span style={{ color: '#374151', fontWeight: 500 }}>{m.method}</span>
                                </div>
                                <span style={{ color: '#6B7280' }}>{m.pct}%</span>
                            </div>
                            <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3 }}>
                                <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 3 }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={panel}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Quick Actions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[{ icon: '📄', label: 'New Invoice' }, { icon: '💳', label: 'Record Payment' }, { icon: '📊', label: 'Revenue Report' }, { icon: '⬇', label: 'Export Data' }].map((a, i) => (
                            <button key={i} style={{ padding: '10px 4px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 9, color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div style={{ ...panel, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Recent Transactions</span>
                        <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                    </div>
                    {invoices.slice(0, 5).map((inv, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < 4 ? '1px solid #F5F7FA' : 'none' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: inv.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{inv.av}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.patient}</div>
                                <div style={{ fontSize: 9, color: '#9CA3AF' }}>{inv.date}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#111827' }}>{inv.amount}</div>
                                <span style={{ ...statusStyle(inv.status), padding: '1px 5px', fontSize: 8 }}>{inv.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const secondaryBtn: React.CSSProperties = { background: '#fff', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' };
const iconBtn: React.CSSProperties = { width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 11 };
