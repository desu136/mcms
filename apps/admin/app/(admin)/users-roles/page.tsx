'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Mail,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  ChevronDown,
  X,
  Check,
  Edit3,
  UserX,
  UserPlus2,
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

const DEPARTMENTS = ['General Medicine', 'Pediatrics', 'Gynecology & Obstetrics', 'Laboratory', 'Pharmacy', 'Emergency', 'Front Desk', 'IT', 'Nursing'];

// ─── Add/Edit User Dialog ─────────────────────────────────────────────────────

interface UserFormData {
  displayName: string;
  email: string;
  password: string;
  roleId: string;
  department: string;
  jobTitle: string;
}

interface UserDialogProps {
  open: boolean;
  roles: AdminRole[];
  user?: AdminUserSummary | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
}

function UserDialog({ open, roles, user, onClose, onSubmit }: UserDialogProps) {
  const [form, setForm] = useState<UserFormData>({
    displayName: user?.displayName ?? '',
    email: user?.email ?? '',
    password: '',
    roleId: user?.roles?.[0] ? (roles.find((r) => r.name === user.roles[0])?.id ?? '') : '',
    department: user?.staffProfile?.department ?? '',
    jobTitle: user?.staffProfile?.jobTitle ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        displayName: user?.displayName ?? '',
        email: user?.email ?? '',
        password: '',
        roleId: user?.roles?.[0] ? (roles.find((r) => r.name === user.roles[0])?.id ?? '') : '',
        department: user?.staffProfile?.department ?? '',
        jobTitle: user?.staffProfile?.jobTitle ?? '',
      });
      setError('');
    }
  }, [open, user, roles]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!user && !form.password.trim()) {
      setError('Password is required for new users.');
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
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">{user ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
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
              placeholder="Dr. John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50"
              placeholder="john@cityhealthclinic.com"
              disabled={!!user}
              required
            />
          </div>
          {!user && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="Min 8 characters"
                minLength={8}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={form.roleId}
                onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">Select Dept.</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              value={form.jobTitle}
              onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              placeholder="e.g. General Practitioner"
            />
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
              {user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ROLES_FILTER = ['All Roles'];
const DEPT_FILTER = ['All Departments'];
const STATUS_FILTER = ['All Statuses', 'Active', 'Inactive'];
const PER_PAGE = 6;

export default function UsersRolesPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; userId: string; action: 'activate' | 'deactivate' }>({
    open: false, userId: '', action: 'deactivate',
  });
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
      const [u, r] = await Promise.all([
        adminUsersApi.list(accessToken),
        adminRolesApi.list(accessToken).catch(() => [] as AdminRole[]),
      ]);
      setUsers(u);
      setRoles(r);
    } catch {
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // Close action menus when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-action-menu]')) setActionMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allRoles = ['All Roles', ...roles.map((r) => r.name)];
  const allDepts = ['All Departments', ...Array.from(new Set(users.map((u) => u.staffProfile?.department ?? 'General').filter(Boolean)))];

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All Roles' || u.roles.includes(roleFilter);
    const matchDept = deptFilter === 'All Departments' || u.staffProfile?.department === deptFilter;
    const matchStatus =
      statusFilter === 'All Statuses' ||
      (statusFilter === 'Active' && u.isActive) ||
      (statusFilter === 'Inactive' && !u.isActive);
    return matchSearch && matchRole && matchDept && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = users.filter((u) => u.isActive).length;

  const handleCreateUser = async (data: UserFormData) => {
    if (!accessToken) return;
    const payload: CreateUserPayload = {
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      roleIds: data.roleId ? [data.roleId] : [],
      staffProfile: { department: data.department, jobTitle: data.jobTitle },
    };
    await adminUsersApi.create(payload, accessToken);
    showToast('User created successfully!');
    void fetchData();
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!accessToken || !editingUser) return;
    const payload: UpdateUserPayload = {
      displayName: data.displayName,
      roleIds: data.roleId ? [data.roleId] : [],
      staffProfile: { department: data.department, jobTitle: data.jobTitle },
    };
    await adminUsersApi.update(editingUser.id, payload, accessToken);
    showToast('User updated successfully!');
    void fetchData();
  };

  const handleStatusChange = async () => {
    if (!accessToken) return;
    try {
      if (confirmDialog.action === 'deactivate') {
        await adminUsersApi.deactivate(confirmDialog.userId, accessToken);
        showToast('User deactivated.');
      } else {
        await adminUsersApi.activate(confirmDialog.userId, accessToken);
        showToast('User activated.');
      }
      void fetchData();
    } catch (err: any) {
      showToast(err.message ?? 'Action failed.', 'error');
    } finally {
      setConfirmDialog((c) => ({ ...c, open: false }));
    }
  };

  // Role distribution
  const roleCounts = roles.map((r) => {
    const count = users.filter((u) => u.roles.includes(r.name)).length;
    return { name: r.name, count, pct: users.length ? Math.round((count / users.length) * 100) : 0 };
  });
  const roleColors = ['#2979FF', '#00C853', '#AA00FF', '#FF9100', '#9E9E9E'];

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <PageHeader
        icon={<Users size={20} className="text-blue-500" />}
        title="Users & Roles"
        subtitle="Manage staff accounts, access roles, and permissions across your clinic."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => { setEditingUser(null); setDialogOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2979FF] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
            >
              <Plus size={15} />
              Add User
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-[#E6EEFF] text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
              <Shield size={15} className="text-blue-500" />
              Manage Roles
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          change="6%"
          changeDir="up"
        />
        <StatCard
          title="Active Users"
          value={activeCount}
          icon={UserCheck}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          change="12%"
          changeDir="up"
        />
        <StatCard
          title="Roles"
          value={roles.length}
          icon={Shield}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          change="0%"
          changeDir="neutral"
          changeLabel="no change"
        />
        <StatCard
          title="Pending Invites"
          value={3}
          icon={Mail}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          change="50%"
          changeDir="up"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Users Table */}
        <div className="xl:col-span-3">
          <AdminCard noPadding>
            {/* Table header */}
            <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-800">All Users</h2>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                  {users.length} users
                </span>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[180px]">
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
                    {allRoles.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={deptFilter}
                    onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                    className="pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700"
                  >
                    {allDepts.map((d) => <option key={d}>{d}</option>)}
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
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#2979FF] rounded-xl hover:bg-blue-700 transition">
                  <Filter size={12} />
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <LoadingSpinner />
            ) : filtered.length === 0 ? (
              <EmptyState icon={<Users size={40} />} message="No users found" description="Try adjusting your search or filter." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="w-8 px-5 py-3">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500" readOnly />
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">User</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Role</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Department</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Last Login</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3.5">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500" readOnly />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={u.displayName} />
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{u.displayName}</p>
                              <p className="text-[10px] text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <RoleBadge role={u.roles[0] ?? 'User'} />
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-600">
                          {u.staffProfile?.department ?? 'General'}
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-3.5">
                          <StatusBadge
                            variant={u.isActive ? 'active' : u.isLocked ? 'error' : 'inactive'}
                            label={u.isActive ? 'Active' : u.isLocked ? 'Locked' : 'Inactive'}
                            showDot
                          />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="relative" data-action-menu>
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
                            >
                              <MoreHorizontal size={15} />
                            </button>
                            {actionMenuOpen === u.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                                <button
                                  onClick={() => { setEditingUser(u); setDialogOpen(true); setActionMenuOpen(null); }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition"
                                >
                                  <Edit3 size={13} />
                                  Edit User
                                </button>
                                {u.isActive ? (
                                  <button
                                    onClick={() => { setConfirmDialog({ open: true, userId: u.id, action: 'deactivate' }); setActionMenuOpen(null); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-orange-600 hover:bg-orange-50 transition"
                                  >
                                    <UserX size={13} />
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { setConfirmDialog({ open: true, userId: u.id, action: 'activate' }); setActionMenuOpen(null); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-green-600 hover:bg-green-50 transition"
                                  >
                                    <UserPlus2 size={13} />
                                    Activate
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
                <div className="px-5 py-3 border-t border-gray-100">
                  <Pagination
                    current={page}
                    total={filtered.length}
                    perPage={PER_PAGE}
                    onChange={setPage}
                  />
                </div>
              </div>
            )}
          </AdminCard>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Role Distribution */}
          <AdminCard
            title="Role Distribution"
            titleIcon={<Shield size={15} className="text-blue-500" />}
          >
            <div className="space-y-3">
              {roleCounts.length > 0 ? roleCounts.map((r, i) => (
                <div key={r.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700">{r.name}</span>
                    <span className="text-xs text-gray-500 font-medium">{r.count} ({r.pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${r.pct}%`, background: roleColors[i % roleColors.length] }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-400 text-center py-4">No role data available</p>
              )}
            </div>
          </AdminCard>

          {/* Recent Access Activity */}
          <AdminCard
            title="Recent Access Activity"
            titleIcon={<UserCheck size={15} className="text-blue-500" />}
          >
            <div className="space-y-3">
              {users.slice(0, 4).map((u) => (
                <div key={u.id} className="flex items-start gap-2.5">
                  <UserAvatar name={u.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{u.displayName}</p>
                    <p className="text-[10px] text-gray-500">
                      {u.isActive ? 'Successful login' : 'Account inactive'}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No activity data</p>
              )}
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Dialogs */}
      <UserDialog
        open={dialogOpen}
        roles={roles}
        user={editingUser}
        onClose={() => setDialogOpen(false)}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.action === 'deactivate' ? 'Deactivate User?' : 'Activate User?'}
        message={
          confirmDialog.action === 'deactivate'
            ? 'This will prevent the user from logging in. You can reactivate them later.'
            : 'This will restore the user\'s access to the system.'
        }
        confirmLabel={confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        danger={confirmDialog.action === 'deactivate'}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmDialog((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}
