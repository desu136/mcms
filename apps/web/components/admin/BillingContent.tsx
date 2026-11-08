'use client';

import React, { useState } from 'react';

export interface InvoiceItem {
  id: string;
  patient: string;
  av: string;
  c: string;
  date: string;
  services: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
  method: string;
}

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

export function BillingContent() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [invoices] = useState<InvoiceItem[]>([]);
  const tabs = ['All', 'Paid', 'Pending', 'Partial', 'Overdue'];

  const filtered = invoices.filter((inv) => {
    const matchTab = activeTab === 'All' || inv.status === activeTab;
    const matchSearch =
      inv.patient.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.services.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

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
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Total Revenue', val: 'ETB 0', sub: 'No invoices recorded', icon: '💰', bg: '#EFF6FF', c: '#059669' },
            { label: "Today's Revenue", val: 'ETB 0', sub: 'Today', icon: '📅', bg: '#F0FDF4', c: '#059669' },
            { label: 'Pending Payments', val: 'ETB 0', sub: '0 invoices due', icon: '⏳', bg: '#FEF3C7', c: '#B45309' },
            { label: 'Overdue Invoices', val: '0', sub: '0 overdue', icon: '⚠️', bg: '#FEF2F2', c: '#DC2626' },
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
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeTab === t ? '#fff' : 'transparent',
                    color: activeTab === t ? '#111827' : '#6B7280',
                    fontSize: 11,
                    fontWeight: activeTab === t ? 600 : 400,
                    cursor: 'pointer',
                    boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices..."
                style={{ width: '100%', height: 32, paddingLeft: 30, paddingRight: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#374151', background: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>No billing records found</div>
                <p style={{ fontSize: 12, color: '#6B7280', maxWidth: 360, margin: '6px auto 0' }}>
                  There are currently no invoices or billing transactions recorded in the system.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Invoice #', 'Patient', 'Date', 'Services', 'Amount', 'Status', 'Payment Method'].map((h, i) => (
                      <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} style={{ borderTop: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#2979FF' }}>{inv.id}</td>
                      <td style={{ padding: '10px 14px', fontSize: 11, fontWeight: 500, color: '#111827' }}>{inv.patient}</td>
                      <td style={{ padding: '10px 14px', fontSize: 11, color: '#6B7280' }}>{inv.date}</td>
                      <td style={{ padding: '10px 14px', fontSize: 11, color: '#374151' }}>{inv.services}</td>
                      <td style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#111827' }}>{inv.amount}</td>
                      <td style={{ padding: '10px 14px' }}><span style={statusStyle(inv.status)}>{inv.status}</span></td>
                      <td style={{ padding: '10px 14px', fontSize: 11, color: '#6B7280' }}>{inv.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
