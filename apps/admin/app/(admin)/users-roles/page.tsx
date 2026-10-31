'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Building2,
  Search,
  MoreHorizontal,
  Plus,
  ChevronDown,
  X,
  Check,
  Edit3,
  UserX,
  UserPlus2,
  Info,
  Crown,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  adminUsersApi,
  adminRolesApi,
  type AdminUserSummary,
  type AdminRole,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '../services/admin-api';
import { StatCard } from '../components/StatCard';
import {
  PageHeader,
  AdminCard,
  UserAvatar,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
  Pagination,
} from '../components/AdminUI';
import { StatusBadge, RoleBadge } from '../components/StatusBadge';

// â”€â”€â”€ System Admin only manages these roles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Clinical staff (DOCTOR, NURSE, RECEPTIONIST, etc.) are managed by each
// Clinic Admin within their own tenant scope â€” NOT by the System Admin.
const SYSTEM_ROLES = ['SUPER_ADMIN', 'CLINIC_ADMIN'];

// â”€â”€â”€ Add / Edit Clinic Admin Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ClinicAdminFormData {
  displayName: string;
  email: string;
  password: string;
  role: 'CLINIC_ADMIN' | 'SUPER_ADMIN';
  phoneNumber: string;
}

interface ClinicAdminDialogProps {
  open: boolean;
  roles: AdminRole[];
  user?: AdminUserSummary | null;
  onClose: () => void;
  onSubmit: (data: ClinicAdminFormData) => Promise<void>;
}

function ClinicAdminDialog({ open, roles, user, onClose, onSubmit }: ClinicAdminDialogProps) {
  const systemRoleObjects = roles.filter((r) => SYSTEM_ROLES.includes(r.name));

  const [form, setForm] = useState<ClinicAdminFormData>({
    displayName: user?.displayName ?? '',
    email: user?.email ?? '',
    password: '',
    role: (user?.roles?.find((r) => SYSTEM_ROLES.includes(r)) as 'CLINIC_ADMIN' | 'SUPER_ADMIN') ?? 'CLINIC_ADMIN',
    phoneNumber: user?.staffProfile?.phoneNumber ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        displayName: user?.displayName ?? '',
        email: user?.email ?? '',
        password: '',
        role: (user?.roles?.find((r) => SYSTEM_ROLES.includes(r)) as 'CLINIC_ADMIN' | 'SUPER_ADMIN') ?? 'CLINIC_ADMIN',
        phoneNumber: user?.staffProfile?.phoneNumber ?? '',
      });
      setError('');
    }
  }, [open, user]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      return;
    }
    if (!user && !form.password.trim()) {
      setError('Password is required for new accounts.');
      return;
    }
    if (!user && form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Crown size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {user ? 'Edit Clinic Administrator' : 'Add Clinic Administrator'}
              </h3>
              <p className="text-[10px] text-gray-400">Platform-level admin account</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Info banner */}
        <div className="mb-4 flex gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Clinic Admins manage their own clinic&apos;s staff, departments, and operations.
            Clinical staff (doctors, nurses, etc.) are added by the Clinic Admin in their tenant portal.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              placeholder="e.g. Dr. Bethlehem Tadesse"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="admin@clinic.com"
              disabled={!!user}
              required
            />
            {user && <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed after creation.</p>}
          </div>

          {!user && (
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
              <p className="text-[10px] text-gray-400 mt-1">User will be prompted to change on first login.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              placeholder="+251 911 000 000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">System Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'CLINIC_ADMIN' | 'SUPER_ADMIN' }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              {systemRoleObjects.length > 0
                ? systemRoleObjects.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name === 'CLINIC_ADMIN' ? 'Clinic Administrator' : 'Super Administrator'}
                    </option>
                  ))
                : SYSTEM_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r === 'CLINIC_ADMIN' ? 'Clinic Administrator' : 'Super Administrator'}
                    </option>
                  ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#2979FF] rounded-xl hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {user ? 'Save Changes' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_FILTER = ['All Statuses', 'Active', 'Inactive', 'Locked'];
const PER_PAGE = 8;

export default function UsersRolesPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; userId: string; action: 'activate' | 'deactivate';
  }>({ open: false, userId: '', action: 'deactivate' });
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
      const [allUsers, r] = await Promise.all([
        adminUsersApi.list(accessToken),
        adminRolesApi.list(accessToken).catch(() => [] as AdminRole[]),
      ]);
      // System Admin only sees SUPER_ADMIN and CLINIC_ADMIN accounts
      const adminUsers = allUsers.filter((u) =>
        u.roles.some((role) => SYSTEM_ROLES.includes(role))
      );
      setUsers(adminUsers);
      setRoles(r);
    } catch {
      showToast('Failed to load users.', 'error');
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

  const systemRoles = roles.filter((r) => SYSTEM_ROLES.includes(r.name));
  const allRoleOptions = ['All Roles', 'CLINIC_ADMIN', 'SUPER_ADMIN'];

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All Roles' || u.roles.includes(roleFilter);
    const matchStatus =
      statusFilter === 'All Statuses' ||
      (statusFilter === 'Active' && u.isActive && !u.isLocked) ||
      (statusFilter === 'Inactive' && !u.isActive && !u.isLocked) ||
      (statusFilter === 'Locked' && u.isLocked);
    return matchSearch && matchRole && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = users.filter((u) => u.isActive && !u.isLocked).length;
  const clinicAdminCount = users.filter((u) => u.roles.includes('CLINIC_ADMIN')).length;
  const superAdminCount = users.filter((u) => u.roles.includes('SUPER_ADMIN')).length;

  const handleCreateUser = async (data: ClinicAdminFormData) => {
    if (!accessToken) return;
    const roleObj = systemRoles.find((r) => r.name === data.role);
    const payload: CreateUserPayload = {
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      roleIds: roleObj ? [roleObj.id] : [],
      staffProfile: data.phoneNumber ? { phoneNumber: data.phoneNumber } : undefined,
    };
    await adminUsersApi.create(payload, accessToken);
    showToast('Admin account created successfully!');
    void fetchData();
  };

  const handleUpdateUser = async (data: ClinicAdminFormData) => {
    if (!accessToken || !editingUser) return;
    const roleObj = systemRoles.find((r) => r.name === data.role);
    const payload: UpdateUserPayload = {
      displayName: data.displayName,
      roleIds: roleObj ? [roleObj.id] : [],
      staffProfile: data.phoneNumber ? { phoneNumber: data.phoneNumber } : undefined,
    };
    await adminUsersApi.update(editingUser.id, payload, accessToken);
    showToast('Admin account updated successfully!');
    void fetchData();
  };

  const handleStatusChange = async () => {
    if (!accessToken) return;
    try {
      if (confirmDialog.action === 'deactivate') {
        await adminUsersApi.deactivate(confirmDialog.userId, accessToken);
        showToast('Account deactivated.');
      } else {
        await adminUsersApi.activate(confirmDialog.userId, accessToken);
        showToast('Account activated.');
      }
      void fetchData();
    } catch (err: any) {
      showToast(err.message ?? 'Action failed.', 'error');
    } finally {
      setConfirmDialog((c) => ({ ...c, open: false }));
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        icon={<Crown size={20} className="text-blue-500" />}
        title="Clinic Administrators"
        subtitle="Manage platform-level admin accounts. Each Clinic Admin manages their own clinic's doctors, nurses, and staff."
        actions={
          <button
            onClick={() => { setEditingUser(null); setDialogOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2979FF] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
          >
            <Plus size={15} />
            Add Clinic Admin
          </button>
        }
      />

      {/* Scope notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800">System Admin Scope</p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            You can only manage <strong>Super Admin</strong> and <strong>Clinic Admin</strong> accounts here.
            Clinic-level staff (doctors, nurses, receptionists, lab techs, etc.) are registered and managed
            by each Clinic Administrator within their own clinic portal at{' '}
            <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="underline">localhost:3000</a>.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Admins" value={users.length} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-500" change="0%" changeDir="neutral" changeLabel="platform accounts" />
        <StatCard title="Active" value={activeCount} icon={UserCheck} iconBg="bg-green-50" iconColor="text-green-500" change="0%" changeDir="neutral" changeLabel="currently active" />
        <StatCard title="Clinic Admins" value={clinicAdminCount} icon={Building2} iconBg="bg-purple-50" iconColor="text-purple-500" change="0%" changeDir="neutral" changeLabel="clinic tenants" />
        <StatCard title="Super Admins" value={superAdminCount} icon={Crown} iconBg="bg-orange-50" iconColor="text-orange-500" change="0%" changeDir="neutral" changeLabel="platform-wide" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Table */}
        <div className="xl:col-span-3">
          <AdminCard noPadding>
            <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-800">Admin Accounts</h2>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{users.length} accounts</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by name or email"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700"
                  >
                    {allRoleOptions.map((r) => (
                      <option key={r} value={r}>{r === 'CLINIC_ADMIN' ? 'Clinic Admin' : r === 'SUPER_ADMIN' ? 'Super Admin' : r}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700"
                  >
                    {STATUS_FILTER.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : filtered.length === 0 ? (
              <EmptyState icon={<Crown size={40} />} message="No admin accounts found" description="Try adjusting filters or add a new clinic administrator." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Administrator</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Role</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Phone</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Since</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((u) => {
                      const isSuperAdmin = u.roles.includes('SUPER_ADMIN');
                      return (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <UserAvatar name={u.displayName} />
                                {isSuperAdmin && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                    <Crown size={8} className="text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">{u.displayName}</p>
                                <p className="text-[10px] text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <RoleBadge role={u.roles[0] ?? 'User'} />
                          </td>
                          <td className="px-3 py-3.5 text-xs text-gray-500">
                            {u.staffProfile?.phoneNumber ?? <span className="text-gray-300 italic">â€”</span>}
                          </td>
                          <td className="px-3 py-3.5 text-xs text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-3 py-3.5">
                            <StatusBadge
                              variant={u.isActive && !u.isLocked ? 'active' : u.isLocked ? 'error' : 'inactive'}
                              label={u.isActive && !u.isLocked ? 'Active' : u.isLocked ? 'Locked' : 'Inactive'}
                              showDot
                            />
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="relative" data-action-menu>
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 disabled:opacity-30"
                                disabled={isSuperAdmin}
                                title={isSuperAdmin ? 'Super Admin accounts are protected' : 'Actions'}
                              >
                                {isSuperAdmin ? <Lock size={14} className="text-gray-300" /> : <MoreHorizontal size={15} />}
                              </button>
                              {actionMenuOpen === u.id && !isSuperAdmin && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                                  <button
                                    onClick={() => { setEditingUser(u); setDialogOpen(true); setActionMenuOpen(null); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition"
                                  >
                                    <Edit3 size={13} />Edit Account
                                  </button>
                                  {u.isActive && !u.isLocked ? (
                                    <button
                                      onClick={() => { setConfirmDialog({ open: true, userId: u.id, action: 'deactivate' }); setActionMenuOpen(null); }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-orange-600 hover:bg-orange-50 transition"
                                    >
                                      <UserX size={13} />Deactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => { setConfirmDialog({ open: true, userId: u.id, action: 'activate' }); setActionMenuOpen(null); }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-green-600 hover:bg-green-50 transition"
                                    >
                                      <UserPlus2 size={13} />Activate
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-gray-100">
                  <Pagination current={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
                </div>
              </div>
            )}
          </AdminCard>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <AdminCard title="Role Definitions" titleIcon={<Shield size={15} className="text-blue-500" />}>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Crown size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Super Administrator</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Cross-tenant access. Manages all tenants, system settings, database, and all clinic admins.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Clinic Administrator</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Scoped to their clinic. Registers doctors, nurses, departments, appointments, and billing.
                  </p>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Staff Management" titleIcon={<Info size={15} className="text-amber-500" />}>
            <div className="space-y-3">
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Clinical staff are created by the <strong>Clinic Administrator</strong> within their clinic portal. Roles include:
              </p>
              <ul className="space-y-1.5">
                {['Doctor / Specialist', 'Nurse / Nursing Staff', 'Receptionist', 'Lab Technician', 'Pharmacist'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[11px] text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="http://localhost:3000/login"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[11px] text-blue-500 underline mt-1"
              >
                Open Clinical Admin Portal â†’
              </a>
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Dialogs */}
      <ClinicAdminDialog
        open={dialogOpen}
        roles={roles}
        user={editingUser}
        onClose={() => setDialogOpen(false)}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.action === 'deactivate' ? 'Deactivate Admin Account?' : 'Activate Admin Account?'}
        message={
          confirmDialog.action === 'deactivate'
            ? 'This will prevent this administrator from logging in. Their clinic data will be preserved.'
            : "This will restore this administrator's access to the system."
        }
        confirmLabel={confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        danger={confirmDialog.action === 'deactivate'}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmDialog((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}
