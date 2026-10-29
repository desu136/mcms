'use client';

import React, { useState } from 'react';
import {
  User,
  Settings,
  Edit3,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Globe,
  Clock,
  CheckCircle2,
  Bell,
  Lock,
  Upload,
  Trash2,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
  Activity,
  Pill,
} from 'lucide-react';
import {
  CURRENT_NURSE,
  NURSE_PROFILE_DATA,
  NURSE_RECENT_ACTIVITIES,
  NurseProfileInfo,
} from '@/components/nurse/nurseMockData';

export default function NurseProfilePage() {
  const [profile, setProfile] = useState<NurseProfileInfo>(NURSE_PROFILE_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    messages: true,
    appointments: true,
    tasks: true,
    system: false,
  });
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');

  const handleInputChange = (field: keyof NurseProfileInfo, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F4F7FC] overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Profile & Professional Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your personal information, professional credentials, and preferences.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all ${
            isEditing
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Edit3 size={15} />
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Main Grid: Left nurse avatar card, Center forms, Right quick stats & preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Card (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
            {/* Avatar with camera badge */}
            <div className="relative mb-3">
              <img
                src={CURRENT_NURSE.avatar}
                alt={CURRENT_NURSE.name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-blue-50 shadow-md"
              />
              <button
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white shadow-md hover:bg-blue-700 transition-colors"
                title="Change Photo"
              >
                <Camera size={14} />
              </button>
            </div>

            <h2 className="text-base font-bold text-slate-900">{profile.fullName}</h2>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">{profile.role}</p>
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Online</span>
            </div>

            <div className="w-full border-t border-slate-100 my-4" />

            <div className="w-full space-y-3 text-left text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Employee ID</span>
                <span className="font-bold text-slate-800 font-mono">PID-001024</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">{profile.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone</span>
                <span className="font-semibold text-slate-800">+251 912 345 678</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email</span>
                <span className="font-semibold text-slate-800">aster.mulu@email.com</span>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 my-4" />

            {/* Profile Completion */}
            <div className="w-full text-left space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Profile Completion</span>
                <span className="font-bold text-blue-600">100%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-full" />
              </div>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 pt-1">
                <CheckCircle2 size={13} />
                Your profile is complete!
              </p>
            </div>
          </div>
        </div>

        {/* Center Column: Personal, Professional, Hours & Activity (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Emergency Contact</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Gender</label>
                <select
                  disabled={!isEditing}
                  value={profile.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Relationship</label>
                <select
                  disabled={!isEditing}
                  value={profile.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Mother</option>
                  <option>Father</option>
                  <option>Spouse</option>
                  <option>Sibling</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Nationality</label>
                <select
                  disabled={!isEditing}
                  value={profile.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Ethiopian</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Languages</label>
                <select
                  disabled={!isEditing}
                  value={profile.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Amharic, English</option>
                  <option>Amharic, Afaan Oromo, English</option>
                  <option>Tigrinya, English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Professional Information */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Briefcase size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Professional Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Role</label>
                <select
                  disabled={!isEditing}
                  value={profile.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Registered Nurse</option>
                  <option>Head Nurse</option>
                  <option>Clinical Nurse Specialist</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Years of Experience</label>
                <select
                  disabled={!isEditing}
                  value={profile.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>4 Years</option>
                  <option>1-3 Years</option>
                  <option>5+ Years</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">License Number</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Specialization</label>
                <select
                  disabled={!isEditing}
                  value={profile.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>General Nursing</option>
                  <option>Critical Care</option>
                  <option>Cardiology Nursing</option>
                  <option>Pediatric Care</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Qualification</label>
                <select
                  disabled={!isEditing}
                  value={profile.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Bachelor of Science in Nursing</option>
                  <option>Diploma in Clinical Nursing</option>
                  <option>Master of Science in Nursing</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Department</label>
                <select
                  disabled={!isEditing}
                  value={profile.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 disabled:opacity-80 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Nursing</option>
                  <option>Cardiology Ward</option>
                  <option>Emergency Department</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Consultation Hours & Availability */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Consultation Hours</h3>
                  <p className="text-[11px] text-slate-400">Set your available consultation hours</p>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Edit Hours
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-50">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-800">{day}</span>
                  </div>
                  <span className="text-slate-500 font-mono">08:00 AM - 05:00 PM</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold text-slate-800">Saturday</span>
                </div>
                <span className="text-slate-500 font-mono">08:00 AM - 12:00 PM</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="font-semibold text-slate-500">Sunday</span>
                </div>
                <span className="text-slate-400 font-medium">Closed</span>
              </div>
            </div>
          </div>

          {/* Section 4: Recent Activity */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              </div>
              <button className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {NURSE_RECENT_ACTIVITIES.map((act) => {
                const getIcon = () => {
                  if (act.type === 'profile') return <User size={14} className="text-blue-600" />;
                  if (act.type === 'task') return <CheckCircle2 size={14} className="text-emerald-600" />;
                  if (act.type === 'message') return <MessageSquare size={14} className="text-purple-600" />;
                  if (act.type === 'medication') return <Pill size={14} className="text-amber-600" />;
                  return <Clock size={14} className="text-cyan-600" />;
                };

                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900">{act.title}</span>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Stats, Working Hours, Photo, Notification Settings & Security (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Quick Statistics */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <TrendingUp size={16} className="text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quick Statistics
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                <span className="text-[11px] text-slate-500 block">Total Patients</span>
                <span className="text-lg font-bold text-slate-900 block mt-0.5">48</span>
                <span className="text-[10px] font-semibold text-emerald-600">↑ 12%</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                <span className="text-[11px] text-slate-500 block">Today's Tasks</span>
                <span className="text-lg font-bold text-slate-900 block mt-0.5">7</span>
                <span className="text-[10px] font-semibold text-emerald-600">↑ 25%</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                <span className="text-[11px] text-slate-500 block">Messages</span>
                <span className="text-lg font-bold text-slate-900 block mt-0.5">3</span>
                <span className="text-[10px] font-semibold text-emerald-600">↑ 50%</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                <span className="text-[11px] text-slate-500 block">Completed Tasks</span>
                <span className="text-lg font-bold text-slate-900 block mt-0.5">20</span>
                <span className="text-[10px] font-semibold text-emerald-600">↑ 15%</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Working Hours
                </h3>
              </div>
              <button className="text-[11px] text-blue-600 font-semibold hover:underline">
                View Schedule
              </button>
            </div>

            {/* Day Pills */}
            <div className="flex items-center justify-between gap-1">
              {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-8 h-8 rounded-xl text-[11px] font-bold transition-all ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Monday - Friday</span>
                <span className="font-bold text-slate-800">08:00 AM - 05:00 PM</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">Break Time</span>
                <span className="font-semibold text-slate-700">12:00 PM - 01:00 PM</span>
              </div>
            </div>
          </div>

          {/* Profile Photo Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Profile Photo
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Update your profile photo JPG, PNG (max 2MB)
            </p>
            <div className="flex items-center gap-2">
              <button className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors">
                <Upload size={14} />
                <span>Change Photo</span>
              </button>
              <button className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-600 flex items-center justify-center gap-1.5 transition-colors">
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Bell size={16} className="text-blue-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notification Preferences
                </h3>
                <p className="text-[10px] text-slate-400">Manage your notification settings</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">New Messages</span>
                <button
                  onClick={() =>
                    setNotifications((n) => ({ ...n, messages: !n.messages }))
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    notifications.messages ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      notifications.messages ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Appointment Reminders</span>
                <button
                  onClick={() =>
                    setNotifications((n) => ({ ...n, appointments: !n.appointments }))
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    notifications.appointments ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      notifications.appointments ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Task Assignments</span>
                <button
                  onClick={() =>
                    setNotifications((n) => ({ ...n, tasks: !n.tasks }))
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    notifications.tasks ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      notifications.tasks ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">System Updates</span>
                <button
                  onClick={() =>
                    setNotifications((n) => ({ ...n, system: !n.system }))
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    notifications.system ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      notifications.system ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Security
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Change your password and security settings
            </p>
            <button className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 transition-colors">
              <Lock size={14} className="text-blue-600" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
