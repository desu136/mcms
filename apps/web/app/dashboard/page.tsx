'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const role = user.roles?.[0] || '';
    if (role === 'DOCTOR') {
      router.replace('/doctor');
    } else if (role === 'NURSE') {
      router.replace('/nurse');
    } else if (role === 'RECEPTIONIST') {
      router.replace('/receptionist');
    } else {
      router.replace('/admin');
    }
  }, [user, isLoading, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        Redirecting to your workstation...
      </div>
    </div>
  );
}
