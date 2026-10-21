'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Heart,
  GraduationCap,
  Clock,
  CheckCircle2,
  Camera,
  UploadCloud,
  Trash2,
  Stethoscope,
  Briefcase,
  Key,
  ShieldAlert,
  ChevronDown,
  FileText,
  Pill,
  FlaskConical,
  Info,
  Check,
  Save,
} from 'lucide-react';
import { CURRENT_DOCTOR } from '../../../components/doctor/doctorMockData';

export default function DoctorProfilePage() {
  const [activeTab, setActiveTab] = useState<
    'Profile' | 'Professional Details' | 'Availability' | 'Account Settings' | 'Security'
  >('Profile');

  // Form State
  const [fullName, setFullName] = useState(CURRENT_DOCTOR.name);
  const [email, setEmail] = useState('fitsum.alemu@email.com');
  const [phone, setPhone] = useState('+251 912 345 678');
  const [dob, setDob] = useState('1988-06-15');
  const [gender, setGender] = useState('Male');
  const [nationality, setNationality] = useState('Ethiopian');
  const [address, setAddress] = useState('Addis Ababa, Ethiopia');
  const [bio, setBio] = useState(
    'Cardiologist with 8 years of experience in diagnosing and treating cardiovascular diseases. Passionate about providing quality care and improving patient outcomes.'
  );

  // Professional form
  const [department, setDepartment] = useState('Cardiology');
  const [designation, setDesignation] = useState('Consultant');
  const [consultationRoom, setConsultationRoom] = useState('Room 3');
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');

  // Feedback toast
  const [savedMessage, setSavedMessage] = useState(false);

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Profile & Professional Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage your profile, professional details, and account settings.
            </p>
          </div>
        </div>

        {savedMessage && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Changes saved successfully!
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('Profile')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Profile'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Professional Details')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Professional Details'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Professional Details
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Availability')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Availability'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Availability
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Account Settings')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Account Settings'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Account Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Security')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Security'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Security
        </button>
      </div>

      {/* 3-Column Layout Matching Screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================== */}
        {/* COLUMN 1: DOCTOR PROFILE CARD (lg:col-span-3)                  */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Doctor Profile</h3>
            </div>

            <div className="pt-4 text-center">
              <div className="relative inline-block mx-auto mb-3">
                <img
                  src={CURRENT_DOCTOR.avatar}
                  alt={CURRENT_DOCTOR.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-50 shadow-md mx-auto"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md ring-2 ring-white transition-all cursor-pointer"
                  title="Change photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-base font-black text-slate-900">{CURRENT_DOCTOR.name}</h3>
              <p className="text-xs font-bold text-slate-500 mt-0.5">{CURRENT_DOCTOR.role}</p>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </div>

              {/* Contact list */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-left text-xs">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] font-medium">{phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] font-medium truncate">{email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] font-medium">{address}</span>
                </div>
              </div>

              {/* Credentials & Details */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-left">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-0.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Medical License</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-800">ML-2020-4587</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-0.5">
                    <Heart className="w-3.5 h-3.5 text-blue-600" />
                    <span>Specialization</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Cardiology</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Years of Experience</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">8 years</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Education</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Addis Ababa University</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Tip Box */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Keep your profile information up to date to ensure better patient care and communication.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: PERSONAL INFORMATION & PHOTO (lg:col-span-5)         */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Personal Info Form */}
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nationality <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option>Ethiopian</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bio / About Me</label>
                <textarea
                  rows={3}
                  value={bio}
                  maxLength={500}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
                <div className="flex justify-end text-[10px] text-slate-400 font-medium mt-1">
                  {bio.length}/500
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs shadow-blue-500/25 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Profile Photo Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Camera className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Profile Photo</h3>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={CURRENT_DOCTOR.avatar}
                  alt={CURRENT_DOCTOR.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white text-[10px]">
                  <Camera className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 w-full border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
                <UploadCloud className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-800">Click to upload a new photo</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Supported formats: JPG, PNG (Max 2MB)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                Change Photo
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Photo
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: PROFESSIONAL INFO, STATS & ACTIVITY (lg:col-span-4)  */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-4">
          {/* Professional Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Professional Information</h3>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option>Cardiology</option>
                    <option>Internal Medicine</option>
                    <option>Pediatrics</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option>Consultant</option>
                    <option>Senior Attending</option>
                    <option>Specialist</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Consultation Room <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={consultationRoom}
                    onChange={(e) => setConsultationRoom(e.target.value)}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option>Room 3</option>
                    <option>Room 4</option>
                    <option>Room 12</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Working Days <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allDays.map((day) => {
                    const active = workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Consultation Hours <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-slate-400 font-bold">—</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats (4 Metrics) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Quick Stats</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">124</div>
                  <div className="text-[10px] font-bold text-slate-600">Total Appointments</div>
                  <div className="text-[9px] text-slate-400">This Month</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">98</div>
                  <div className="text-[10px] font-bold text-slate-600">Active Patients</div>
                  <div className="text-[9px] text-slate-400">This Month</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">48</div>
                  <div className="text-[10px] font-bold text-slate-600">Medical Records</div>
                  <div className="text-[9px] text-slate-400">This Month</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">36</div>
                  <div className="text-[10px] font-bold text-slate-600">Prescriptions</div>
                  <div className="text-[9px] text-slate-400">This Month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Recent Activity</h3>
              </div>
              <button
                type="button"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800">Updated patient record</div>
                  <div className="text-[11px] text-slate-500">Aster Mulu (PID-001024)</div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">Today, 10:24 AM</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800">Prescribed medication</div>
                  <div className="text-[11px] text-slate-500">Samuel Girma (PID-001087)</div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">Oct 18, 2026</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FlaskConical className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800">Viewed lab results</div>
                  <div className="text-[11px] text-slate-500">Lidya Kebede (PID-001062)</div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">Oct 17, 2026</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800">Updated appointment status</div>
                  <div className="text-[11px] text-slate-500">Betlehem Abebe (PID-001098)</div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">Oct 16, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
