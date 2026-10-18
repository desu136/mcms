'use client';

import React, { useState, useEffect } from 'react';
import { getOfflineStorageStatus } from '@/lib/offline/indexeddb';
import { useAuth } from '../../../lib/auth/auth-context';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [offlineStatus, setOfflineStatus] = useState<string>('Initializing IndexedDB...');
  const [queueCount, setQueueCount] = useState<number>(0);

  useEffect(() => {
    getOfflineStorageStatus()
      .then((status) => {
        setOfflineStatus(status.initialized ? 'Online & Local Cache Active' : 'Offline Storage Unavailable');
        setQueueCount(status.pendingMutations);
      })
      .catch((err) => {
        setOfflineStatus('Error initializing local storage: ' + String(err));
      });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.displayName || 'Staff Member'}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Role: <span className="font-semibold text-blue-400">{user?.roles?.join(', ') || 'N/A'}</span> &bull;{' '}
              {user?.email}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Authenticated Session Active
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Local Persistence Engine</div>
          <div className="mt-2 text-lg font-bold text-white">{offlineStatus}</div>
          <div className="mt-1 text-xs text-slate-500">RxDB / IndexedDB client-side cache</div>
        </div>

        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outbound Queue</div>
          <div className="mt-2 text-lg font-bold text-white">{queueCount} pending</div>
          <div className="mt-1 text-xs text-slate-500">Queued for background server push</div>
        </div>

        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backend Gateway</div>
          <div className="mt-2 text-lg font-bold text-emerald-400">PostgreSQL + NestJS API</div>
          <div className="mt-1 text-xs text-slate-500">JWT family rotation &amp; audit active</div>
        </div>
      </div>

      {/* RBAC Profile & Granted Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Staff Identity Profile
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Account ID</span>
              <span className="text-slate-200 font-mono text-[11px] truncate max-w-[180px]">{user?.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Department</span>
              <span className="text-slate-200 font-medium">{user?.staffProfile?.department ?? 'General'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Job Title</span>
              <span className="text-slate-200 font-medium">{user?.staffProfile?.jobTitle ?? 'Staff'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Employee ID</span>
              <span className="text-slate-200 font-mono">{user?.staffProfile?.employeeNumber ?? 'EMP-0000'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Audit Status</span>
              <span className="text-emerald-400 font-medium">Logged &amp; Tracked</span>
            </div>
          </div>
        </div>

        {/* Permissions Cloud */}
        <div className="lg:col-span-2 bg-slate-950/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Enforced Granular Permissions
            </h3>
            <span className="text-xs text-slate-400">
              {user?.permissions?.length ?? 0} active slugs
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
            {user?.permissions && user.permissions.length > 0 ? (
              user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-blue-300 border border-blue-500/20"
                >
                  {perm}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No direct permissions assigned</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
