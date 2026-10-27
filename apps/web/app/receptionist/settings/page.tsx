'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Sliders,
  Bell,
  Save,
  Camera,
  Edit2,
  Calendar,
  Lock,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  History,
  Image,
} from 'lucide-react';
import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';
import { RECEPTIONIST_PROFILE_DATA } from '../../../components/receptionist/receptionistMockData';

export default function ReceptionistProfileSettingsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'Profile' | 'Security' | 'Preferences' | 'Notifications' | 'System'>('Profile');
  const [activeNavPill, setActiveNavPill] = useState('personal');

  // Form State
  const [profile, setProfile] = useState(RECEPTIONIST_PROFILE_DATA);
  const [twoFactor, setTwoFactor] = useState(false);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyAppointments, setNotifyAppointments] = useState(true);
  const [notifyBilling, setNotifyBilling] = useState(true);
  const [notifySystem, setNotifySystem] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <ReceptionistPageShell
      banner={
        <>
          <ReceptionistBanner
            title="Profile & Settings"
            subtitle="Manage your profile, account settings, and system preferences."
            icon={Settings}
            actionElement={
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            }
          />

          {/* Save Alert */}
          {saveSuccess && (
            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-semibold animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile changes and preferences saved successfully!</span>
            </div>
          )}
        </>
      }
      subnav={
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto text-xs font-bold">
          {[
            { id: 'Profile', label: 'Profile', icon: User },
            { id: 'Security', label: 'Account Security', icon: Lock },
            { id: 'Preferences', label: 'Preferences', icon: Sliders },
            { id: 'Notifications', label: 'Notifications', icon: Bell },
            { id: 'System', label: 'System Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      }
    >
      {/* ─── 3 Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* ─── LEFT COLUMN: Profile Card & Quick Nav & Actions (3 cols) ─── */}
        <div className="lg:col-span-3 space-y-5">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-center">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-blue-500/10 shadow-sm"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-900">{profile.name}</h2>
              <p className="text-xs text-blue-600 font-semibold">{profile.role}</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold mt-1.5 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Employee ID</span>
                <span className="font-bold text-slate-800">{profile.employeeId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Department</span>
                <span className="font-semibold text-slate-800">{profile.department}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Email</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Phone</span>
                <span className="font-semibold text-slate-800">{profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Vertical Navigation Pills */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs space-y-1 text-xs font-semibold">
            {[
              { id: 'personal', label: 'Personal Information' },
              { id: 'contact', label: 'Contact Information' },
              { id: 'work', label: 'Work Information' },
              { id: 'photo', label: 'Profile Photo' },
            ].map((item) => {
              const isActive = activeNavPill === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNavPill(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              );
            })}
          </div>

          {/* Security Alert Badge */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Your profile information is secure and only visible to authorized personnel.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-800">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <User className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-700">Update Profile</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <Lock className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-700">Change Password</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <Image className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-700">Upload Photo</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <History className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-700">View Activity Log</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── MIDDLE COLUMN: Personal & Professional & About Me (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Employee ID</label>
                <input
                  type="text"
                  readOnly
                  value={profile.employeeId}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Nationality</label>
                <select
                  value={profile.nationality}
                  onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option>Ethiopian</option>
                  <option>Kenyan</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Position</label>
                <select
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option>Receptionist</option>
                  <option>Lead Receptionist</option>
                  <option>Front Desk Officer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Professional Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Department</label>
                <select
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option>Reception</option>
                  <option>Administration</option>
                  <option>Billing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Role</label>
                <select
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option>Receptionist</option>
                  <option>Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Hire Date</label>
                <input
                  type="date"
                  value={profile.hireDate}
                  onChange={(e) => setProfile({ ...profile, hireDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Work Schedule</label>
                <select
                  value={profile.workSchedule}
                  onChange={(e) => setProfile({ ...profile, workSchedule: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option>Mon - Fri (8:00 AM - 5:00 PM)</option>
                  <option>Mon - Sat (8:00 AM - 2:00 PM)</option>
                  <option>Rotating Shift</option>
                </select>
              </div>
            </div>
          </div>

          {/* About Me */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800">About Me</h3>
            <textarea
              rows={3}
              value={profile.about}
              onChange={(e) => setProfile({ ...profile, about: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 resize-none text-slate-700 leading-relaxed"
            />
            <div className="text-right text-[10px] text-slate-400 font-medium">
              {profile.about.length}/500
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Contact & Emergency & Security & Notifications (4 cols) ─── */}
        <div className="lg:col-span-4 space-y-5">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">Contact Information</h3>
              <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Edit
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Address</span>
                <span className="font-semibold text-slate-800">{profile.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">City</span>
                  <span className="font-semibold text-slate-800">{profile.city}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Woreda / Sub-city</span>
                  <span className="font-semibold text-slate-800">{profile.woreda}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Kebele</span>
                <span className="font-semibold text-slate-800">{profile.kebele}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">Emergency Contact</h3>
              <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Name</span>
                <span className="font-semibold text-slate-800">{profile.emergencyName}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Relationship</span>
                <span className="font-semibold text-slate-800">{profile.emergencyRel}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                <span className="font-semibold text-slate-800">{profile.emergencyPhone}</span>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Account Security</h3>
              </div>
              <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Change Password
              </button>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Password</div>
                  <div className="text-[10px] text-slate-400">Last changed: Oct 10, 2025</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">Two-Factor Authentication (2FA)</div>
                  <div className="text-[10px] text-slate-400">{twoFactor ? 'Enabled' : 'Disabled'}</div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">Login Sessions</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">1 active session</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Notification Preferences</h3>
              </div>
              <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Edit
              </button>
            </div>

            <p className="text-[11px] text-slate-400">Choose how you want to receive notifications.</p>

            <div className="space-y-2.5 pt-1 text-xs">
              {[
                { label: 'New messages', checked: notifyMessages, setter: setNotifyMessages },
                { label: 'Appointment updates', checked: notifyAppointments, setter: setNotifyAppointments },
                { label: 'Billing notifications', checked: notifyBilling, setter: setNotifyBilling },
                { label: 'System announcements', checked: notifySystem, setter: setNotifySystem },
              ].map((n, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{n.label}</span>
                  <input
                    type="checkbox"
                    checked={n.checked}
                    onChange={(e) => n.setter(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ReceptionistPageShell>
  );
}

