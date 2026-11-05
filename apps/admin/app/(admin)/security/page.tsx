'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Lock,
  Key,
  Clock,
  Fingerprint,
  MapPin,
  Eye,
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
} from 'recharts';
import { PageHeader, AdminCard, TabBar, UserAvatar } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';
import { adminUsersApi, AdminUserSummary } from '../services/admin-api';
import { useAuth } from '@/lib/auth/auth-context';

const TABS = ['Access Policies', 'Authentication', 'Sessions', 'Security Events', 'Settings'];

const accessPolicies = [
  { icon: Lock, label: 'Password Policy', desc: 'Strong password requirements', status: 'Enabled', statusVariant: 'active' as const },
  { icon: Shield, label: 'Account Lockout', desc: 'Lock after 5 failed attempts', status: 'Enabled', statusVariant: 'active' as const },
  { icon: Clock, label: 'Session Timeout', desc: '8 hours of inactivity', status: 'Enabled', statusVariant: 'active' as const },
  { icon: Fingerprint, label: 'MFA (Multi-Factor Auth)', desc: 'Required for administrators', status: 'Enabled', statusVariant: 'active' as const },
  { icon: MapPin, label: 'IP Restrictions', desc: 'No restrictions configured', status: 'Disabled', statusVariant: 'error' as const },
];

const quickActions = [
  { icon: Key, label: 'Update Password Policy', desc: 'Configure password rules', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Shield, label: 'Manage IP Restrictions', desc: 'Allow or block IP ranges', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Eye, label: 'View Security Events', desc: 'Check recent security logs', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Lock, label: 'Lockout Settings', desc: 'Configure account lockout', color: 'text-orange-500', bg: 'bg-orange-50' },
];

const accessControlSummary = [
  { label: 'Authentication', status: 'Healthy', variant: 'active' as const },
  { label: 'Authorization', status: 'Healthy', variant: 'active' as const },
  { label: 'Sessions', status: 'Healthy', variant: 'active' as const },
  { label: 'Database Access', status: 'Healthy', variant: 'active' as const },
];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: '#AA00FF',
  CLINIC_ADMIN: '#2979FF',
  DOCTOR: '#00C853',
  NURSE: '#00B0FF',
  RECEPTIONIST: '#FF9100',
  LAB_TECHNICIAN: '#FF3D00',
  PHARMACIST: '#7C4DFF',
  PATIENT: '#78909C',
};

export default function SecurityPage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('Access Policies');
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminUsersApi
      .list(accessToken)
      .then((res: AdminUserSummary[]) => {
        if (!mounted) return;
        setUsers(res ?? []);
      })
      .catch(() => {
        if (mounted) setUsers([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const totalUsers = users.length;
  const activeSessions = users.filter((u) => u.isActive).length;
  const blockedAccounts = users.filter((u) => !u.isActive).length;

  const roleDistData = useMemo(() => {
    if (users.length === 0) {
      return [{ name: 'No registered users', value: 1, color: '#E0E0E0' }];
    }
    const counts: Record<string, number> = {};
    for (const u of users) {
      const r = u.roles?.[0] || 'OTHER';
      counts[r] = (counts[r] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
      color: ROLE_COLORS[name] || '#9E9E9E',
    }));
  }, [users]);

  const securityEvents = useMemo(() => {
    return users.slice(0, 8).map((u) => {
      const timeStr = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        : 'Recent';
      return {
        time: timeStr,
        user: u.displayName || u.email,
        eventType: u.isActive ? 'Active Session' : 'Account Disabled',
        desc: u.isActive ? 'Authenticated & active' : 'Account status inactive',
        ip: '127.0.0.1',
        status: u.isActive ? ('success' as const) : ('warning' as const),
      };
    });
  }, [users]);

  const securityAlerts = useMemo(() => {
    const inactiveUsers = users.filter((u) => !u.isActive);
    if (inactiveUsers.length === 0) {
      return [];
    }
    return inactiveUsers.slice(0, 5).map((u) => ({
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      color: 'text-amber-500',
      label: 'Inactive Account',
      sub: `User: ${u.displayName || u.email}`,
      time: 'Attention needed',
    }));
  }, [users]);

  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        icon={<Shield size={20} className="text-blue-500" />}
        title="Security"
        subtitle="Manage access policies, authentication settings, session management, and security events."
        dateRange={dateStr}
        dateSubtitle={now.toLocaleDateString('en-US', { weekday: 'long' })}
        systemStatus="online"
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Access Policies' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard title="Total Users" value={totalUsers} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-500" />
            <StatCard title="Active Sessions" value={activeSessions} icon={Activity} iconBg="bg-green-50" iconColor="text-green-500" />
            <StatCard title="Failed Login Attempts" value={0} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500" />
            <StatCard title="Blocked Accounts" value={blockedAccounts} icon={Lock} iconBg="bg-orange-50" iconColor="text-orange-500" />
            <StatCard title="Password Resets" value={0} icon={Key} iconBg="bg-purple-50" iconColor="text-purple-500" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Left: Role Distribution + Access Policy Overview + Events */}
            <div className="xl:col-span-2 space-y-4">
              {/* Top row: User Roles + Access Policy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Roles & Permissions */}
                <AdminCard>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Shield size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">User Roles & Permissions</h2>
                      <p className="text-xs text-gray-500">Overview of role distribution and permission levels.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <PieChart width={130} height={110}>
                        <Pie data={roleDistData} cx={60} cy={50} innerRadius={30} outerRadius={48} paddingAngle={2} dataKey="value">
                          {roleDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-sm font-bold text-gray-900">{totalUsers}</span>
                        <span className="text-[9px] text-gray-500">Total Users</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {roleDistData.map((r) => (
                        <div key={r.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                            <span className="text-gray-600 truncate">{r.name}</span>
                          </div>
                          <span className="text-gray-500 font-medium">
                            {r.value} ({totalUsers > 0 ? Math.round((r.value / totalUsers) * 100) : 0}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AdminCard>

                {/* Access Policy Overview */}
                <AdminCard>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Shield size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Access Policy Overview</h2>
                      <p className="text-xs text-gray-500">Current system access policy configuration.</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {accessPolicies.map(({ icon: Icon, label, desc, status, statusVariant }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Icon size={13} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-800">{label}</p>
                            <p className="text-[10px] text-gray-500">{desc}</p>
                          </div>
                        </div>
                        <StatusBadge variant={statusVariant} label={status} />
                      </div>
                    ))}
                  </div>
                </AdminCard>
              </div>

              {/* Recent Security Events */}
              <AdminCard
                title="Recent Security Events"
                titleIcon={<Activity size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left font-medium text-gray-500 px-5 py-2.5">Date & Time</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">User</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Event Type</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Description</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">IP Address</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityEvents.length > 0 ? (
                        securityEvents.map((ev, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                            <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{ev.time}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <UserAvatar name={ev.user} size="sm" />
                                <span className="font-medium text-gray-800 whitespace-nowrap">{ev.user}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`font-medium ${ev.status === 'warning' ? 'text-amber-600' : 'text-gray-700'
                                }`}>
                                {ev.eventType}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 max-w-[160px] truncate">{ev.desc}</td>
                            <td className="px-3 py-2.5 text-gray-500 font-mono">{ev.ip}</td>
                            <td className="px-3 py-2.5">
                              <StatusBadge
                                variant={ev.status === 'success' ? 'success' : 'warning'}
                                label={ev.status === 'success' ? 'Success' : 'Warning'}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                            {loading ? 'Loading security events...' : 'No security events recorded.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </AdminCard>

              {/* Access Control Summary */}
              <AdminCard title="Access Control Summary" titleIcon={<Shield size={15} className="text-blue-500" />}>
                <p className="text-xs text-gray-500 mb-3">Quick overview of key security metrics and system status.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {accessControlSummary.map(({ label, status, variant }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
                      <StatusBadge variant={variant} label={status} showDot />
                    </div>
                  ))}
                </div>
              </AdminCard>
            </div>

            {/* Right Panel */}
            <div className="space-y-4">
              {/* Security Quick Actions */}
              <AdminCard title="Security Quick Actions" titleIcon={<Activity size={15} className="text-blue-500" />}>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(({ icon: Icon, label, desc, bg, color }) => (
                    <button
                      key={label}
                      className="flex flex-col items-start gap-2 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition text-left group"
                    >
                      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon size={14} className={color} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-800 leading-tight">{label}</p>
                        <p className="text-[10px] text-gray-500 leading-tight">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </AdminCard>

              {/* Security Alerts */}
              <AdminCard
                title="Security Alerts"
                titleIcon={<AlertTriangle size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
              >
                <div className="space-y-3">
                  {securityAlerts.length > 0 ? (
                    securityAlerts.map(({ icon: Icon, bg, color, label, sub, time }) => (
                      <div key={label + sub} className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon size={12} className={color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 leading-tight">{label}</p>
                          <p className="text-[10px] text-gray-500 truncate">{sub}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No active security alerts.</p>
                  )}
                </div>
              </AdminCard>
            </div>
          </div>
        </>
      )}

      {activeTab !== 'Access Policies' && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">{activeTab}</p>
            <p className="text-xs text-gray-400 mt-1">This section is under development.</p>
          </div>
        </div>
      )}
    </div>
  );
}
