'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserCheck,
  Search,
  Plus,
  ChevronDown,
  X,
  Check,
  Edit3,
  UserX,
  UserPlus2,
  MoreHorizontal,
  Shield,
  Stethoscope,
  Syringe,
  ClipboardList,
  FlaskConical,
  Pill,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffMember {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  isLocked: boolean;
  roles: string[];
  createdAt: string;
  staffProfile?: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
    licenseNumber?: string;
    specialization?: string;
  };
}

interface StaffRole {
  id: string;
  name: string;
  description: string;
}

interface CreateStaffPayload {
  email: string;
  password: string;
  displayName: string;
  roleIds: string[];
  staffProfile?: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
    licenseNumber?: string;
    specialization?: string;
  } | undefined;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Clinical staff roles managed by the Clinic Admin
const CLINICAL_ROLES = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECH', 'PHARMACIST'];

const DEPARTMENTS = [
  'General Medicine', 'Pediatrics', 'Gynecology & Obstetrics',
  'Surgery', 'Orthopedics', 'Cardiology', 'Neurology',
  'Radiology', 'Laboratory', 'Pharmacy', 'Emergency',
  'ICU', 'Dermatology', 'ENT', 'Psychiatry', 'Front Desk', 'Nursing',
];

const ROLE_ICONS: Record<string, React.ElementType> = {
  DOCTOR: Stethoscope,
  NURSE: Syringe,
  RECEPTIONIST: ClipboardList,
  LAB_TECH: FlaskConical,
  PHARMACIST: Pill,
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DOCTOR: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  NURSE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  RECEPTIONIST: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  LAB_TECH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  PHARMACIST: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

const STATUS_FILTERS = ['All', 'Active', 'Inactive', 'Locked'];
const PER_PAGE = 8;

// ─── API helpers ──────────────────────────────────────────────────────────────

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const API_BASE = `${rawApiUrl.replace(/\/+$/, '')}/api/v1`;

async function apiRequest<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, unknown>)?.message as string ?? `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Avatar helper ────────────────────────────────────────────────────────────

function StaffAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#2979FF', '#00C853', '#FF6D00', '#AA00FF', '#F44336', '#10B981', '#F59E0B', '#8B5CF6'];
  const bg = colors[name.charCodeAt(0) % colors.length] ?? '#2979FF';
  const cls = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_COLORS[role] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  const Icon = ROLE_ICONS[role];
  const label = role === 'LAB_TECH' ? 'Lab Tech' : role.charAt(0) + role.slice(1).toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {Icon && <Icon size={9} />}{label}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusDot({ isActive, isLocked }: { isActive: boolean; isLocked: boolean }) {
  if (isLocked) return <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Locked</span>;
  if (isActive) return <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Inactive</span>;
}

// ─── Add/Edit Staff Dialog ────────────────────────────────────────────────────

interface StaffFormData {
  displayName: string;
  email: string;
  password: string;
  role: string;
  department: string;
  jobTitle: string;
  phoneNumber: string;
  licenseNumber: string;
  specialization: string;
}

interface StaffDialogProps {
  open: boolean;
  staffRoles: StaffRole[];
  member?: StaffMember | null;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => Promise<void>;
}

function StaffDialog({ open, staffRoles, member, onClose, onSubmit }: StaffDialogProps) {
  const [form, setForm] = useState<StaffFormData>({
    displayName: member?.displayName ?? '',
    email: member?.email ?? '',
    password: '',
    role: member?.roles?.find((r) => CLINICAL_ROLES.includes(r)) ?? 'DOCTOR',
    department: member?.staffProfile?.department ?? '',
    jobTitle: member?.staffProfile?.jobTitle ?? '',
    phoneNumber: member?.staffProfile?.phoneNumber ?? '',
    licenseNumber: member?.staffProfile?.licenseNumber ?? '',
    specialization: member?.staffProfile?.specialization ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        displayName: member?.displayName ?? '',
        email: member?.email ?? '',
        password: '',
        role: member?.roles?.find((r) => CLINICAL_ROLES.includes(r)) ?? 'DOCTOR',
        department: member?.staffProfile?.department ?? '',
        jobTitle: member?.staffProfile?.jobTitle ?? '',
        phoneNumber: member?.staffProfile?.phoneNumber ?? '',
        licenseNumber: member?.staffProfile?.licenseNumber ?? '',
        specialization: member?.staffProfile?.specialization ?? '',
      });
      setError('');
    }
  }, [open, member]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    if (!member && !form.password.trim()) { setError('Password is required for new accounts.'); return; }
    if (!member && form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!form.role) { setError('Please select a role.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : null) ?? 'Failed to save staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = form.role === 'LAB_TECH' ? 'Lab Technician' : form.role.charAt(0) + form.role.slice(1).toLowerCase();
  const RoleIcon = ROLE_ICONS[form.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              {RoleIcon ? <RoleIcon size={18} className="text-blue-600" /> : <Users size={18} className="text-blue-600" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{member ? `Edit ${roleLabel}` : 'Add Staff Member'}</h3>
              <p className="text-[10px] text-gray-400">Clinical staff account for your clinic</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Role *</label>
            <div className="grid grid-cols-3 gap-2">
              {(staffRoles.length > 0
                ? staffRoles.filter((r) => CLINICAL_ROLES.includes(r.name))
                : CLINICAL_ROLES.map((r) => ({ id: r, name: r, description: '' }))
              ).map((r) => {
                const Icon = ROLE_ICONS[r.name];
                const active = form.role === r.name;
                const label = r.name === 'LAB_TECH' ? 'Lab Tech' : r.name.charAt(0) + r.name.slice(1).toLowerCase();
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r.name }))}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-xl border text-xs font-medium transition ${
                      active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon size={12} />}{label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="e.g. Dr. Mekdes Bekele"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="staff@clinic.com"
                disabled={!!member}
                required
              />
            </div>
          </div>

          {!member && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Temporary Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="Min 8 characters"
                minLength={8}
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Staff will be prompted to change on first login.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">Select dept.</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={form.jobTitle}
                onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="e.g. Senior Cardiologist"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="+251 911 000 000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">License No.</label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="e.g. MD-12345"
              />
            </div>
          </div>

          {(form.role === 'DOCTOR') && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="e.g. Cardiologist, Pediatrician..."
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#2979FF] rounded-xl hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {submitting
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Check size={15} />}
              {member ? 'Save Changes' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmModal({
  open, title, message, confirmLabel, danger, onConfirm, onCancel,
}: {
  open: boolean; title: string; message: string; confirmLabel: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-xs text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-xl transition ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2979FF] hover:bg-blue-700'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffManagementPage() {
  const { accessToken } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffRoles, setStaffRoles] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: string; action: 'activate' | 'deactivate' }>({ open: false, id: '', action: 'deactivate' });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [allUsers, roles] = await Promise.all([
        apiRequest<StaffMember[]>('users', accessToken),
        apiRequest<StaffRole[]>('roles', accessToken).catch(() => [] as StaffRole[]),
      ]);
      // Clinic admin only sees clinical staff (not SUPER_ADMIN / CLINIC_ADMIN)
      const clinicalStaff = allUsers.filter((u) =>
        u.roles.some((r) => CLINICAL_ROLES.includes(r))
      );
      setStaff(clinicalStaff);
      setStaffRoles(roles.filter((r) => CLINICAL_ROLES.includes(r.name)));
    } catch {
      showToast('Failed to load staff data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-action-menu]')) setActionMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.displayName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.staffProfile?.department ?? '').toLowerCase().includes(q);
    const matchRole = roleFilter === 'All' || s.roles.includes(roleFilter);
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && s.isActive && !s.isLocked) ||
      (statusFilter === 'Inactive' && !s.isActive && !s.isLocked) ||
      (statusFilter === 'Locked' && s.isLocked);
    return matchSearch && matchRole && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const activeCount = staff.filter((s) => s.isActive && !s.isLocked).length;

  const handleCreate = async (data: StaffFormData) => {
    if (!accessToken) return;
    const roleObj = staffRoles.find((r) => r.name === data.role);
    const payload: CreateStaffPayload = {
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      roleIds: roleObj ? [roleObj.id] : [data.role],
      staffProfile: Object.fromEntries(
        Object.entries({
          department: data.department,
          jobTitle: data.jobTitle,
          phoneNumber: data.phoneNumber,
          licenseNumber: data.licenseNumber,
          specialization: data.specialization,
        }).filter(([, v]) => Boolean(v))
      ) as NonNullable<CreateStaffPayload['staffProfile']>,
    };
    await apiRequest<StaffMember>('users', accessToken, { method: 'POST', body: JSON.stringify(payload) });
    showToast('Staff member created successfully!');
    void fetchData();
  };

  const handleUpdate = async (data: StaffFormData) => {
    if (!accessToken || !editingMember) return;
    const roleObj = staffRoles.find((r) => r.name === data.role);
    await apiRequest<StaffMember>(`users/${editingMember.id}`, accessToken, {
      method: 'PATCH',
      body: JSON.stringify({
        displayName: data.displayName,
        roleIds: roleObj ? [roleObj.id] : undefined,
        staffProfile: Object.fromEntries(
          Object.entries({
            department: data.department,
            jobTitle: data.jobTitle,
            phoneNumber: data.phoneNumber,
            licenseNumber: data.licenseNumber,
            specialization: data.specialization,
          }).filter(([, v]) => Boolean(v))
        ),
      }),
    });
    showToast('Staff member updated successfully!');
    void fetchData();
  };

  const handleStatusChange = async () => {
    if (!accessToken) return;
    try {
      const endpoint = confirmDialog.action === 'deactivate'
        ? `users/${confirmDialog.id}/deactivate`
        : `users/${confirmDialog.id}/activate`;
      await apiRequest<void>(endpoint, accessToken, { method: 'PATCH', body: JSON.stringify({}) });
      showToast(confirmDialog.action === 'deactivate' ? 'Staff member deactivated.' : 'Staff member activated.');
      void fetchData();
    } catch (err: unknown) {
      showToast((err instanceof Error ? err.message : null) ?? 'Action failed.', 'error');
    } finally {
      setConfirmDialog((c) => ({ ...c, open: false }));
    }
  };

  // Role distribution counts
  const roleDist = CLINICAL_ROLES.map((r) => ({
    name: r,
    count: staff.filter((s) => s.roles.includes(r)).length,
  }));

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Staff Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage clinic staff accounts, roles, and access</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingMember(null); setDialogOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2979FF] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
        >
          <Plus size={15} />
          Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff.length, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Active', value: activeCount, icon: UserCheck, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Doctors', value: staff.filter((s) => s.roles.includes('DOCTOR')).length, icon: Stethoscope, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Nurses', value: staff.filter((s) => s.roles.includes('NURSE')).length, icon: Syringe, bg: 'bg-orange-50', color: 'text-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-[#F1F5F9] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Table */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-[#F1F5F9] shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-800">All Staff</h2>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{staff.length} members</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by name, email, or department"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  className="pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none text-gray-700"
                >
                  <option value="All">All Roles</option>
                  {CLINICAL_ROLES.map((r) => (
                    <option key={r} value={r}>{r === 'LAB_TECH' ? 'Lab Tech' : r.charAt(0) + r.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none text-gray-700"
                >
                  {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table body */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Users size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No staff found</p>
              <p className="text-xs text-gray-400">{search ? 'Try adjusting your search or filters.' : 'Click "Add Staff" to create the first staff account.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] font-semibold text-gray-400 px-5 py-3">Staff Member</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-3">Role</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-3">Department</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-3">Phone</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-3">Since</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-3">Status</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <StaffAvatar name={s.displayName} />
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{s.displayName}</p>
                            <p className="text-[10px] text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <RoleBadge role={s.roles[0] ?? 'STAFF'} />
                      </td>
                      <td className="px-3 py-3.5 text-xs text-gray-600">
                        {s.staffProfile?.department ?? <span className="text-gray-300 italic">—</span>}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-gray-500">
                        {s.staffProfile?.phoneNumber ?? <span className="text-gray-300 italic">—</span>}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusDot isActive={s.isActive} isLocked={s.isLocked} />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="relative" data-action-menu>
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === s.id ? null : s.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
                          >
                            {s.isLocked ? <Lock size={14} className="text-gray-300" /> : <MoreHorizontal size={15} />}
                          </button>
                          {actionMenuOpen === s.id && !s.isLocked && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                              <button
                                onClick={() => { setEditingMember(s); setDialogOpen(true); setActionMenuOpen(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition"
                              >
                                <Edit3 size={13} />Edit Account
                              </button>
                              {s.isActive && !s.isLocked ? (
                                <button
                                  onClick={() => { setConfirmDialog({ open: true, id: s.id, action: 'deactivate' }); setActionMenuOpen(null); }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-orange-600 hover:bg-orange-50 transition"
                                >
                                  <UserX size={13} />Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setConfirmDialog({ open: true, id: s.id, action: 'activate' }); setActionMenuOpen(null); }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 transition"
                                >
                                  <UserPlus2 size={13} />Activate
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition ${p === page ? 'bg-[#2979FF] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Role Distribution */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-blue-500" />
              <h3 className="text-xs font-semibold text-gray-800">Staff by Role</h3>
            </div>
            <div className="space-y-3">
              {roleDist.map((r) => {
                const Icon = ROLE_ICONS[r.name];
                const style = ROLE_COLORS[r.name] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
                const label = r.name === 'LAB_TECH' ? 'Lab Tech' : r.name.charAt(0) + r.name.slice(1).toLowerCase();
                return (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${style.bg} flex items-center justify-center`}>
                        {Icon && <Icon size={12} className={style.text} />}
                      </div>
                      <span className="text-xs text-gray-700">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-blue-800 mb-2">Staff Role Guide</h3>
            <ul className="space-y-1.5">
              {[
                { role: 'DOCTOR', desc: 'Sees patients, writes prescriptions, manages records' },
                { role: 'NURSE', desc: 'Assists doctors, monitors patients, administers medications' },
                { role: 'RECEPTIONIST', desc: 'Manages appointments, check-in, patient registration' },
                { role: 'LAB_TECH', desc: 'Processes lab tests and uploads results' },
                { role: 'PHARMACIST', desc: 'Manages prescriptions and drug dispensing' },
              ].map((item) => (
                <li key={item.role} className="text-[10px] text-blue-700">
                  <strong>{item.role === 'LAB_TECH' ? 'Lab Tech' : item.role.charAt(0) + item.role.slice(1).toLowerCase()}:</strong>{' '}
                  {item.desc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <StaffDialog
        open={dialogOpen}
        staffRoles={staffRoles}
        member={editingMember}
        onClose={() => setDialogOpen(false)}
        onSubmit={editingMember ? handleUpdate : handleCreate}
      />
      <ConfirmModal
        open={confirmDialog.open}
        title={confirmDialog.action === 'deactivate' ? 'Deactivate Staff Member?' : 'Activate Staff Member?'}
        message={
          confirmDialog.action === 'deactivate'
            ? 'This will prevent the staff member from logging in. Their data will be preserved.'
            : "This will restore the staff member's access to the clinic system."
        }
        confirmLabel={confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        danger={confirmDialog.action === 'deactivate'}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmDialog((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}
