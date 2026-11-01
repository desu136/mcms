'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Layers,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  adminTenantsApi,
  type AdminTenantSummary,
} from '../services/admin-api';
import { PageHeader, AdminCard, EmptyState, LoadingSpinner } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';

export default function ClinicTenantsPage() {
  const { accessToken } = useAuth();
  const [tenants, setTenants] = useState<AdminTenantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await adminTenantsApi.list(accessToken);
      setTenants(data);
    } catch (err) {
      console.error('Failed to load clinic tenants:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredTenants = tenants.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.licenseNumber && t.licenseNumber.toLowerCase().includes(q));

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && t.isActive) ||
      (statusFilter === 'INACTIVE' && !t.isActive);

    return matchSearch && matchStatus;
  });

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.isActive).length;
  const totalBranchesAllocated = tenants.reduce((acc, t) => acc + (t.branchCount || 0), 0);
  const totalUsersAllocated = tenants.reduce((acc, t) => acc + (t.userCount || 0), 0);

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        icon={<Building2 size={20} className="text-blue-500" />}
        title="Registered Clinic Tenants"
        subtitle="Platform-level SaaS administration: manage healthcare organizations, subscriptions, branch caps, and licensing."
        dateRange={dateStr}
        dateSubtitle={dayStr}
        systemStatus="online"
      />

      {/* Role Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">System Admin Scope:</span> This portal manages high-level healthcare organizations, tenant quotas, and licensing.
          Internal clinic operations (such as departments, room assignments, clinical staff transfers, and facility schedules)
          are managed by each organization&apos;s designated <span className="font-semibold text-blue-800">Clinic Admin</span> in the Clinical Admin Portal.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Clinic Tenants"
          value={totalTenants}
          icon={Building2}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          change="0%"
          changeDir="neutral"
          changeLabel="registered healthcare orgs"
        />
        <StatCard
          title="Active Subscriptions"
          value={activeTenants}
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          change={`${totalTenants ? Math.round((activeTenants / totalTenants) * 100) : 100}%`}
          changeDir="up"
          changeLabel="operational status"
        />
        <StatCard
          title="Total Branches Across Network"
          value={totalBranchesAllocated}
          icon={Layers}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          change="6%"
          changeDir="up"
          changeLabel="physical facilities"
        />
        <StatCard
          title="Total Users Across Network"
          value={totalUsersAllocated}
          icon={Users}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          change="12%"
          changeDir="up"
          changeLabel="staff accounts"
        />
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinics by name, code, license, email..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-semibold">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === mode ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode === 'ACTIVE' ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>

          <button
            onClick={() => void loadData(true)}
            disabled={isRefreshing}
            className="p-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-xs transition-colors disabled:opacity-50"
            title="Refresh tenants"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <AdminCard
        title="Healthcare Clinic Organizations"
        titleIcon={<Building2 size={16} className="text-blue-500" />}
        noPadding
      >
        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            No registered clinic tenants found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-5">Clinic Name & Code</th>
                  <th className="py-3 px-3">License Number</th>
                  <th className="py-3 px-3">Subscription</th>
                  <th className="py-3 px-3">Branch Quota</th>
                  <th className="py-3 px-3">User Quota</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs shadow-inner">
                          {tenant.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{tenant.name}</span>
                          <span className="font-mono text-[10px] text-gray-500">{tenant.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-gray-600">
                      {tenant.licenseNumber || '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {tenant.subscriptionPlan || 'PROFESSIONAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-gray-700">
                      {tenant.branchCount} / {tenant.maxBranches} branches
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-gray-700">
                      {tenant.userCount} / {tenant.maxUsers} users
                    </td>
                    <td className="py-3.5 px-3 text-gray-500 space-y-0.5">
                      <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{tenant.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{tenant.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge
                        variant={tenant.isActive ? 'active' : 'inactive'}
                        label={tenant.isActive ? 'Active' : 'Suspended'}
                        showDot
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
