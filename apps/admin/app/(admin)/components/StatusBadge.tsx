import React from 'react';

type BadgeVariant = 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple' | 'orange' | 'teal';

const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-600 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
};

const dotStyles: Record<BadgeVariant, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  showDot?: boolean;
}

export function StatusBadge({ variant, label, showDot = false }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {label}
    </span>
  );
}

// Role badge helper
const roleVariantMap: Record<string, BadgeVariant> = {
  'System Admin': 'info',
  'SUPER_ADMIN': 'info',
  'CLINIC_ADMIN': 'info',
  Doctor: 'purple',
  DOCTOR: 'purple',
  Receptionist: 'teal',
  RECEPTIONIST: 'teal',
  'Lab Technician': 'orange',
  Nurse: 'error',
  NURSE: 'error',
  'Clinical Staff': 'success',
};

export function RoleBadge({ role }: { role: string }) {
  const variant = roleVariantMap[role] ?? 'neutral';
  return <StatusBadge variant={variant} label={role} />;
}
