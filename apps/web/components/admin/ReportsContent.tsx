'use client';

import React from 'react';

const recentReports = [
    { name: 'Patient Summary Report', type: 'Patient', typeColor: '#DBEAFE', typeText: '#1D4ED8', range: 'Oct 12 – Oct 19, 2026', generated: 'Oct 19, 2026  09:15 AM', by: 'Desu Kasaye' },
    { name: 'Appointment Report', type: 'Appointment', typeColor: '#ECFDF5', typeText: '#065F46', range: 'Oct 12 – Oct 19, 2026', generated: 'Oct 18, 2026  04:32 PM', by: 'Desu Kasaye' },
    { name: 'Revenue Report', type: 'Billing', typeColor: '#FEF3C7', typeText: '#B45309', range: 'Oct 12 – Oct 19, 2026', generated: 'Oct 17, 2026  11:20 AM', by: 'Desu Kasaye' },
    { name: 'Department Performance', type: 'Department', typeColor: '#F5F3FF', typeText: '#5B21B6', range: 'Oct 12 – Oct 19, 2026', generated: 'Oct 15, 2026  02:45 PM', by: 'Desu Kasaye' },
    { name: 'Lab Results Report', type: 'Lab', typeColor: '#FDF4FF', typeText: '#7C3AED', range: 'Oct 12 – Oct 19, 2026', generated: 'Oct 15, 2026  10:10 AM', by: 'Desu Kasaye' },
];

const deptAppts = [
    { name: 'Cardiology', pct: 28, color: '#2979FF' },
    { name: 'Pediatrics', pct: 19, color: '#00C853' },
    { name: 'Gynecology', pct: 17, color: '#AA00FF' },
    { name: 'Internal Medicine', pct: 14, color: '#FF6D00' },
    { name: 'Orthopedics', pct: 11, color: '#F44336' },
    { name: 'Other', pct: 11, color: '#90A4AE' },
];

const trendData = [22, 35, 30, 38, 55, 40, 45, 35, 40, 42, 38, 32, 36, 42, 45, 30, 35, 38, 36];
const trendDays = ['Oct 12', '', '', 'Oct 13', '', '', 'Oct 14', '', '', 'Oct 15', '', '', 'Oct 16', '', '', 'Oct 17', '', '', 'Oct 18', '', '', 'Oct 19'];

function TrendChart() {
    const W = 320, H = 130, pad = { t: 10, r: 10, b: 26, l: 28 };
    const cW = W - pad.l - pad.r;
    const cH = H - pad.t - pad.b;
    const max = 80, min = 0;
    const xStep = cW / (trendData.length - 1);
    const pts = trendData.map((v, i): [number, number] => [
        pad.l + i * xStep,
        pad.t + cH - ((v - min) / (max - min)) * cH,
    ]);
    const polyline = pts.map(p => p.join(',')).join(' ');
    const area = [...pts, [pad.l + (trendData.length - 1) * xStep, pad.t + cH], [pad.l, pad.t + cH]].map(p => (p as number[]).join(',')).join(' ');
    const yTicks = [0, 20, 40, 60, 80];
    const xLabels = ['Oct 12', 'Oct 13', 'Oct 14', 'Oct 15', 'Oct 16', 'Oct 17', 'Oct 18', 'Oct 19'];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
            {yTicks.map(v => {
                const y = pad.t + cH - ((v - min) / (max - min)) * cH;
                return <g key={v}>
                    <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    <text x={pad.l - 4} y={y + 3} fontSize="8" fill="#94A3B8" textAnchor="end">{v}</text>
                </g>;
            })}
            {xLabels.map((l, i) => {
                const x = pad.l + (i / (xLabels.length - 1)) * cW;
                return <text key={l} x={x} y={H - 6} fontSize="8" fill="#94A3B8" textAnchor="middle">{l}</text>;
            })}
            <polygon points={area} fill="rgba(41,121,255,0.07)" />
            <polyline points={polyline} fill="none" stroke="#2979FF" strokeWidth="2" />
            {pts.filter((_, i) => i % 3 === 0).map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3" fill="#2979FF" />
            ))}
        </svg>
    );
}

function DonutChart() {
    const cx = 60, cy = 60, R = 50, r = 32;
    let cum = 0;
    const slices = deptAppts.map(d => {
        const sa = (cum / 100) * 2 * Math.PI - Math.PI / 2;
        cum += d.pct;
        const ea = (cum / 100) * 2 * Math.PI - Math.PI / 2;
        const large = d.pct > 50 ? 1 : 0;
        const path = `M ${cx + R * Math.cos(sa)} ${cy + R * Math.sin(sa)} A ${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(ea)} ${cy + R * Math.sin(ea)} L ${cx + r * Math.cos(ea)} ${cy + r * Math.sin(ea)} A ${r} ${r} 0 ${large} 0 ${cx + r * Math.cos(sa)} ${cy + r * Math.sin(sa)} Z`;
        return { ...d, path };
    });
    return (
        <svg viewBox="0 0 120 120" width={120} height={120}>
            {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">36</text>
            <text x={cx} y={cx + 10} textAnchor="middle" fontSize="8" fill="#9CA3AF">Total</text>
        </svg>
    );
}

export function ReportsContent() {
    return (
        <div style={{ display: 'flex', gap: 14, height: '100%', minHeight: 'calc(100vh - 120px)' }}>
            {/* Main */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>📊</span>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Reports</h1>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>View detailed reports and analytics for better decision making.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', fontSize: 11, color: '#374151' }}>
                            📅 Oct 19, 2026 – Oct 19, 2026
                        </div>
                        <button style={primaryBtn}>⬇ Export Report</button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[
                        { label: 'Total Patients', val: '1,248', change: '↑ 12%', cl: '#059669', icon: '👥', bg: '#EFF6FF' },
                        { label: 'Total Appointments', val: '36', change: '↑ 8%', cl: '#059669', icon: '📅', bg: '#F0FDF4' },
                        { label: 'Total Revenue', val: '$12,480', change: '↑ 15%', cl: '#059669', icon: '💰', bg: '#FDF4FF' },
                        { label: 'New Patients', val: '248', change: '↑ 20%', cl: '#059669', icon: '🆕', bg: '#FFF7ED' },
                    ].map((c, i) => (
                        <div key={i} style={card}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 10 }}>{c.icon}</div>
                            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{c.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '2px 0' }}>{c.val}</div>
                            <div style={{ fontSize: 10 }}><span style={{ color: c.cl, fontWeight: 600 }}>{c.change}</span> <span style={{ color: '#9CA3AF' }}>vs. last month</span></div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>
                    <div style={card}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>📈</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Patient Visits Trend</span>
                                </div>
                                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>Number of patient visits over the selected period.</div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#6B7280' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 16, height: 2, background: '#2979FF', display: 'inline-block', borderRadius: 2 }} /> This Period
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 16, height: 2, background: '#CBD5E1', display: 'inline-block', borderRadius: 2 }} /> Last Period
                                </span>
                            </div>
                        </div>
                        <TrendChart />
                    </div>
                    <div style={card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <span>📊</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Appointments by Department</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <DonutChart />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {deptAppts.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151' }}>
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, display: 'inline-block' }} />{d.name}
                                        </span>
                                        <span style={{ fontWeight: 600, color: '#111827' }}>{d.pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Reports */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📄</span>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Recent Reports</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>Latest generated reports.</div>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F9FAFB' }}>
                                {['Report Name', 'Type', 'Date Range', 'Generated On', 'Generated By', 'Actions'].map((h, i) => (
                                    <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentReports.map((r, i) => (
                                <tr key={i} style={{ borderTop: '1px solid #F9FAFB' }}>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#2979FF' }}>
                                            <span style={{ fontSize: 14 }}>📄</span>{r.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: r.typeColor, color: r.typeText }}>{r.type}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#6B7280' }}>{r.range}</td>
                                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151' }}>{r.generated}</td>
                                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151' }}>{r.by}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <button style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 13 }}>⬇</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '10px 16px', borderTop: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 4, 5].map(p => <button key={p} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: p === 1 ? '#2979FF' : '#fff', color: p === 1 ? '#fff' : '#374151', fontSize: 11, cursor: 'pointer' }}>{p}</button>)}
                            <button style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 11, cursor: 'pointer' }}>›</button>
                        </div>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Showing 1–5 of 20 reports</span>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Filters */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span>🔽</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Report Filters</span>
                    </div>
                    {[{ label: 'Report Type', val: 'Patient Report' }, { label: 'Date Range', val: 'Oct 19 – Oct 19, 2026' }, { label: 'Department', val: 'All Departments' }, { label: 'Doctor', val: 'All Doctors' }].map((f, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{f.label}</div>
                            <select style={{ width: '100%', height: 32, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', background: '#F9FAFB', padding: '0 8px', outline: 'none' }}>
                                <option>{f.val}</option>
                            </select>
                        </div>
                    ))}
                    <button style={{ ...primaryBtn, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>🔍 Generate Report</button>
                </div>

                {/* Quick Reports */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span>⚡</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Quick Reports</span>
                    </div>
                    {['Patient Summary', 'Appointment Report', 'Revenue Report', 'Department Performance', 'Lab Results Report'].map((r, i) => (
                        <button key={i} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', border: 'none', borderBottom: i < 4 ? '1px solid #F5F7FA' : 'none', background: 'none', cursor: 'pointer', fontSize: 11, color: '#374151' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 14 }}>📄</span>{r}</span>
                            <span style={{ color: '#9CA3AF' }}>›</span>
                        </button>
                    ))}
                </div>

                {/* Recent Exports */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>🕐</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Recent Exports</span>
                        </div>
                        <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                    </div>
                    {[
                        { name: 'Patient Report', time: 'Oct 19, 2026 · 09:15 AM' },
                        { name: 'Revenue Report', time: 'Oct 18, 2026 · 04:32 PM' },
                        { name: 'Appointment Report', time: 'Oct 17, 2026 · 11:30 AM' },
                    ].map((e, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid #F5F7FA' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>📄</span>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: '#111827' }}>{e.name}</div>
                                    <div style={{ fontSize: 9, color: '#9CA3AF' }}>{e.time}</div>
                                </div>
                            </div>
                            <button style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 12 }}>⬇</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
export default ReportsContent;
