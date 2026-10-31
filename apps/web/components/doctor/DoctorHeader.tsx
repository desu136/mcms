'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Settings,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { CURRENT_DOCTOR } from './doctorMockData';
import { useAuth } from '../../lib/auth/auth-context';
import Link from 'next/link';

interface DoctorHeaderProps {
  onOpenSearch: () => void;
  onOpenMobileSidebar: () => void;
}

export default function DoctorHeader({ onOpenSearch, onOpenMobileSidebar }: DoctorHeaderProps) {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const doctorName = user?.displayName || CURRENT_DOCTOR.name;
  const doctorSpecialty = user?.staffProfile?.jobTitle || CURRENT_DOCTOR.role;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Mobile hamburger & Search trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Matching screenshot) */}
        <div
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-slate-400 hover:text-slate-600 cursor-pointer transition-all shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
          <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 truncate flex-1 font-normal">
            Search patients, appointments, or anything...
          </span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="py-1 space-y-1">
                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Lab Results Ready</div>
                    <div className="text-[11px] text-slate-500">
                      Aster Mulu's Cardiac Panel results have been verified.
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">10 mins ago</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">New Consultation Added</div>
                    <div className="text-[11px] text-slate-500">
                      Samuel Girma scheduled for 01:00 PM today.
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">25 mins ago</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Prescription Refill Request</div>
                    <div className="text-[11px] text-slate-500">
                      Central Pharmacy requested verification for Lidya Kebede.
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">1 hr ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Doctor User Dropdown (Matching screenshot) */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={CURRENT_DOCTOR.avatar}
              alt={doctorName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                {doctorName}
              </div>
              <div className="text-[11px] text-slate-500 leading-none">
                {doctorSpecialty}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800">{doctorName}</div>
                <div className="text-[11px] text-blue-600 font-medium">{doctorSpecialty}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">doctor@mcms.local</div>
              </div>

              <div className="py-1">
                <Link
                  href="/doctor/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Doctor Profile
                </Link>
                <Link
                  href="/doctor/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Account Settings
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  Switch to Admin View
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
