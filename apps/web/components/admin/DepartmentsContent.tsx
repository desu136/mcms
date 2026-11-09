'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, RefreshCw, Search, Edit2, Eye, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { fetchDepartments, createDepartment } from '../../lib/api/staff';
import type { ClinicDepartmentDTO, CreateClinicDepartmentRequest } from '@mcms/contracts';

// ─── Color palette for department dots ───────────────────────────────────────
const DEPT_COLORS = [
  '#2979FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

function getColor(index: number): string {
  return DEPT_COLORS[index % DEPT_COLORS.length] ?? '#2979FF';
}

// ─── Add Department Modal ─────────────────────────────────────────────────────
interface AddDeptModalProps {
  onClose: () => void;
  onSave: (dept: CreateClinicDepartmentRequest) => Promise<void>;
  saving: boolean;
}

function AddDeptModal({ onClose, onSave, saving }: AddDeptModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2979FF');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    await onSave({ name: name.trim(), code: code.trim().toUpperCase(), description: description.trim(), color });
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Add Department</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6B7280' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={labelStyle}>
            Department Name *
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Department Name"
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Department Code *
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. CARD"
              required
              maxLength={10}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Description
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this department..."
              rows={3}
              style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
            />
          </label>
          <label style={labelStyle}>
            Color
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DEPT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, border: color === c ? '3px solid #111827' : '2px solid transparent',
                    cursor: 'pointer', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              ))}
            </div>
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={secondaryBtn}>Cancel</button>
            <button type="submit" disabled={saving || !name.trim() || !code.trim()} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DepartmentsContent() {
  const { accessToken } = useAuth();
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDepartments = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDepartments(accessToken);
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load departments. Make sure the API server is running.');
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  const handleAddDept = async (data: CreateClinicDepartmentRequest) => {
    setSaving(true);
    try {
      const created = await createDepartment(data, accessToken);
      setDepartments(prev => [created, ...prev]);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err?.message ?? 'Failed to create department');
    } finally {
      setSaving(false);
    }
  };

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeDepts = departments.filter(d => d.isActive).length;
  const totalDoctors = departments.reduce((sum, d) => sum + (d.doctorsCount ?? 0), 0);
  const totalRooms = departments.reduce((sum, d) => sum + (d.roomsCount ?? 0), 0);

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building2 size={22} style={{ color: '#2979FF' }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Departments</h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>Manage clinic departments and their staff assignments.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => void loadDepartments()}
              disabled={isLoading}
              style={{ ...secondaryBtn, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button onClick={() => setShowAddModal(true)} style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Add Department
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Total Departments', value: isLoading ? '—' : departments.length.toString(), icon: '🏢', bg: '#EFF6FF', color: '#1D4ED8' },
            { label: 'Active Departments', value: isLoading ? '—' : activeDepts.toString(), icon: '✅', bg: '#F0FDF4', color: '#166534' },
            { label: 'Assigned Doctors', value: isLoading ? '—' : totalDoctors.toString(), icon: '👨‍⚕️', bg: '#FDF4FF', color: '#7C3AED' },
            { label: 'Total Rooms', value: isLoading ? '—' : totalRooms.toString(), icon: '🚪', bg: '#FFF7ED', color: '#C2410C' },
          ].map((c, i) => (
            <div key={i} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{c.icon}</div>
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: c.color, margin: '4px 0' }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search departments by name, code or description..."
              style={{ ...inputStyle, paddingLeft: 32 }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 12, color: '#B91C1C' }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', flex: 1 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Departments</span>
            <span style={{ fontSize: 11, color: '#6B7280' }}>{filtered.length} department{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Loading departments...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
                  {search ? 'No departments match your search' : 'No departments yet'}
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                  {search ? 'Try a different search term.' : 'Click "Add Department" to create your first department.'}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['#', 'Department', 'Code', 'Description', 'Doctors', 'Rooms', 'Status', 'Actions'].map((h, i) => (
                      <th key={i} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <tr key={d.id} style={{ borderTop: '1px solid #F9FAFB' }}>
                      <td style={td}>{i + 1}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color ?? getColor(i), flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{d.name}</span>
                        </div>
                      </td>
                      <td style={td}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6366F1', background: '#EEF2FF', padding: '2px 7px', borderRadius: 6 }}>
                          {d.code}
                        </span>
                      </td>
                      <td style={{ ...td, maxWidth: 220 }}>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{d.description || '—'}</span>
                      </td>
                      <td style={td}><span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{d.doctorsCount ?? 0}</span></td>
                      <td style={td}><span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{d.roomsCount ?? 0}</span></td>
                      <td style={td}>
                        <span style={d.isActive ? activeBadge : inactiveBadge}>{d.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button title="View" style={iconBtn}><Eye size={12} /></button>
                          <button title="Edit" style={iconBtn}><Edit2 size={12} /></button>
                          <button title="More" style={iconBtn}><MoreHorizontal size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Summary */}
        <div style={rightPanel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={panelTitle}>Department Overview</span>
          </div>
          {isLoading ? (
            <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: '16px 0' }}>Loading...</p>
          ) : departments.length === 0 ? (
            <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: '16px 0' }}>No departments to display.</p>
          ) : (
            departments.slice(0, 6).map((d, i) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < Math.min(departments.length, 6) - 1 ? '1px solid #F5F7FA' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color ?? getColor(i) }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{d.name}</div>
                    <div style={{ fontSize: 9, color: '#9CA3AF' }}>{d.doctorsCount ?? 0} doctors · {d.roomsCount ?? 0} rooms</div>
                  </div>
                </div>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>›</span>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div style={rightPanel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span>⚡</span><span style={panelTitle}>Quick Actions</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '🏢', label: 'Add Dept', action: () => setShowAddModal(true) },
              { icon: '🔄', label: 'Refresh', action: () => void loadDepartments() },
            ].map((a, i) => (
              <button key={i} onClick={a.action} style={{ padding: '10px 6px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 10, color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recently Added */}
        <div style={rightPanel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={panelTitle}>Recently Added</span>
          </div>
          {isLoading ? (
            <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: '12px 0' }}>Loading...</p>
          ) : departments.length === 0 ? (
            <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: '12px 0' }}>None yet.</p>
          ) : (
            [...departments]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((d, i, arr) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color ?? getColor(i) }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{d.name}</div>
                      <div style={{ fontSize: 9, color: '#9CA3AF' }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {showAddModal && (
        <AddDeptModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddDept}
          saving={saving}
        />
      )}
    </div>
  );
}

// ─── Inline Styles ────────────────────────────────────────────────────────────
const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const rightPanel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const panelTitle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#111827' };
const td: React.CSSProperties = { padding: '10px 14px', fontSize: 12, color: '#374151' };
const activeBadge: React.CSSProperties = { padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' };
const inactiveBadge: React.CSSProperties = { padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const secondaryBtn: React.CSSProperties = { background: '#fff', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const iconBtn: React.CSSProperties = { width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 24, width: 440, maxWidth: '90vw', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' };
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600, color: '#374151' };
const inputStyle: React.CSSProperties = { width: '100%', height: 36, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#111827', outline: 'none', boxSizing: 'border-box' };
