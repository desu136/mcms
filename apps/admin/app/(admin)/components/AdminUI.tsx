import React from 'react';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  dateRange?: string;
  dateSubtitle?: string;
  systemStatus?: 'online' | 'offline' | 'maintenance';
}

export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
  dateRange,
  dateSubtitle,
  systemStatus,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {actions}
        {(dateRange || systemStatus) && (
          <div className="flex items-center gap-2">
            {dateRange && (
              <div className="bg-white border border-[#E6EEFF] rounded-xl px-3 py-2 text-center min-w-[130px]">
                <p className="text-xs font-semibold text-gray-800">{dateRange}</p>
                {dateSubtitle && <p className="text-[10px] text-gray-500">{dateSubtitle}</p>}
              </div>
            )}
            {systemStatus && (
              <div className="flex items-center gap-1.5 bg-white border border-[#E6EEFF] rounded-xl px-3 py-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemStatus === 'online'
                      ? 'bg-emerald-500'
                      : systemStatus === 'maintenance'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                />
                <span
                  className={`text-xs font-semibold ${
                    systemStatus === 'online'
                      ? 'text-emerald-600'
                      : systemStatus === 'maintenance'
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {systemStatus === 'online'
                    ? 'System Online'
                    : systemStatus === 'maintenance'
                    ? 'Maintenance'
                    : 'System Offline'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function AdminCard({ children, className = '', title, titleIcon, action, noPadding }: AdminCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E6EEFF] shadow-sm ${noPadding ? '' : 'p-5'} ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between ${noPadding ? 'px-5 pt-5' : 'mb-4'}`}>
          <div className="flex items-center gap-2">
            {titleIcon}
            <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

interface TabBarProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 mb-5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === tab
              ? 'border-[#2979FF] text-[#2979FF]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  description?: string;
}

export function EmptyState({ icon, message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

export function UserAvatar({ name, size = 'md' }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-teal-500 to-cyan-600',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-600',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];

  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';

  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2979FF] hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PaginationProps {
  current: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, perPage, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (current <= 3) return i + 1;
    if (current >= totalPages - 2) return totalPages - 4 + i;
    return current - 2 + i;
  });

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-gray-500">
        Showing {Math.min((current - 1) * perPage + 1, total)}–{Math.min(current * perPage, total)} of{' '}
        {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="w-7 h-7 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center"
        >
          «
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
              p === current
                ? 'bg-[#2979FF] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          className="w-7 h-7 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center"
        >
          »
        </button>
      </div>
    </div>
  );
}
