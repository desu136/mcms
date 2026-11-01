'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Users,
  DoorOpen,
  Layers,
  CheckCircle2,
  XCircle,
  Edit3,
  Star,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  X,
  Check,
  Building,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';
import {
  fetchBranches,
  createBranch,
  updateBranch,
} from '../../../lib/api/staff';
import type { BranchDTO, CreateBranchRequest, UpdateBranchRequest } from '@mcms/contracts';

interface BranchFormData {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  isMainBranch: boolean;
  isActive: boolean;
}

const INITIAL_FORM: BranchFormData = {
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
  isMainBranch: false,
  isActive: true,
};

export default function AdminBranchesPage() {
  const { accessToken, user } = useAuth();
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDTO | null>(null);
  const [formData, setFormData] = useState<BranchFormData>(INITIAL_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await fetchBranches(accessToken);
      setBranches(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load clinic branches';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (branch: BranchDTO) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address ?? '',
      phone: branch.phone ?? '',
      email: branch.email ?? '',
      isMainBranch: branch.isMainBranch,
      isActive: branch.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (formSubmitting) return;
    setModalOpen(false);
    setEditingBranch(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Branch name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Branch code is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingBranch) {
        const payload: UpdateBranchRequest = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          ...(formData.address.trim() ? { address: formData.address.trim() } : {}),
          ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
          ...(formData.email.trim() ? { email: formData.email.trim() } : {}),
          isMainBranch: formData.isMainBranch,
          isActive: formData.isActive,
        };
        const updated = await updateBranch(editingBranch.id, payload, accessToken);
        setBranches((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : formData.isMainBranch ? { ...b, isMainBranch: false } : b)),
        );
        showToast(`Branch "${updated.name}" updated successfully.`);
      } else {
        const payload: CreateBranchRequest = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          ...(formData.address.trim() ? { address: formData.address.trim() } : {}),
          ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
          ...(formData.email.trim() ? { email: formData.email.trim() } : {}),
          isMainBranch: formData.isMainBranch,
        };
        const created = await createBranch(payload, accessToken);
        setBranches((prev) => [
          ...prev.map((b) => (formData.isMainBranch ? { ...b, isMainBranch: false } : b)),
          created,
        ]);
        showToast(`Branch "${created.name}" created successfully.`);
      }
      setModalOpen(false);
      loadData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        (b.address && b.address.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && b.isActive) ||
        (statusFilter === 'INACTIVE' && !b.isActive);

      return matchesQuery && matchesStatus;
    });
  }, [branches, searchQuery, statusFilter]);

  // Statistics
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.isActive).length;
  const mainBranch = branches.find((b) => b.isMainBranch);
  const totalStaffAllocated = branches.reduce((acc, b) => acc + (b.usersCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Branches & Facilities</h1>
              <p className="text-sm text-gray-500">
                Manage your healthcare network branches, operational locations, and facility details
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh branch list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Branch
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Branches</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{totalBranches}</span>
            <span className="text-xs text-gray-400">across network</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Main Facility</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base font-bold text-gray-900 truncate block">
              {mainBranch ? mainBranch.name : 'Not set'}
            </span>
            <span className="text-xs text-gray-500">{mainBranch ? `Code: ${mainBranch.code}` : 'Set primary branch'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Facilities</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{activeBranches}</span>
            <span className="text-xs text-gray-400">of {totalBranches} operational</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Staff Allocated</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{totalStaffAllocated}</span>
            <span className="text-xs text-gray-400">staff members</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches by name, code, address, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'ALL' ? 'All Status' : mode === 'ACTIVE' ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
          <button onClick={() => loadData()} className="ml-auto underline font-medium text-xs">
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-4/5"></div>
              </div>
              <div className="h-8 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No branches found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria or filters.'
              : 'Add your first branch to start expanding your healthcare facility network.'}
          </p>
          {!searchQuery && statusFilter === 'ALL' && (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Branch
            </button>
          )}
        </div>
      ) : (
        /* Branch Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className={`bg-white rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                branch.isMainBranch
                  ? 'border-blue-200 ring-1 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base leading-snug truncate">
                        {branch.name}
                      </h3>
                      {branch.isMainBranch && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Main HQ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-xs font-mono font-medium bg-gray-100 text-gray-700 rounded">
                        {branch.code}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          branch.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            branch.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                          }`}
                        />
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(branch)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Branch"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details / Contact */}
                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="truncate">{branch.address || 'No physical address provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{branch.phone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{branch.email || 'No email registered'}</span>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-semibold text-gray-500">Staff</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{branch.usersCount ?? 0}</span>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-semibold text-gray-500">Depts</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{branch.departmentsCount ?? 0}</span>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-semibold text-gray-500">Rooms</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{branch.roomsCount ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-gray-50/75 border-t border-gray-100 rounded-b-xl flex items-center justify-between text-xs font-medium">
                <Link
                  href={`/admin/staff?branchId=${branch.id}`}
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Manage Staff</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => openEditModal(branch)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                disabled={formSubmitting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Downtown Medical Center"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="e.g. DWTN"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-sm uppercase font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Physical Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Healthcare Ave, Block C, Suite 400"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      placeholder="e.g. contact@downtown.clinic.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isMainBranch}
                      onChange={(e) => setFormData({ ...formData, isMainBranch: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Set as Main Branch / Headquarters
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Designates this facility as the primary flagship center of the clinic network.
                      </span>
                    </div>
                  </label>

                  {editingBranch && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block">
                          Facility Active
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          When disabled, staff and appointments cannot be scheduled at this facility.
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
