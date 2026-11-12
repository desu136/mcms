'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Camera,
  UploadCloud,
  Trash2,
  Stethoscope,
  Briefcase,
  ChevronDown,
  FileText,
  Pill,
  FlaskConical,
  Save,
  RefreshCw,
} from 'lucide-react';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchAppointments } from '../../../lib/api/appointments';
import { fetchPatients } from '../../../lib/api/patients';
import { fetchPrescriptions, fetchLabOrders } from '../../../lib/api/clinical';
import type { AppointmentDTO, PrescriptionDTO } from '@mcms/contracts';

export default function DoctorProfilePage() {
  const { user, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'Profile' | 'Professional Details' | 'Availability' | 'Account Settings' | 'Security'
  >('Profile');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+251 912 345 678');
  const [dob, setDob] = useState('1988-06-15');
  const [gender, setGender] = useState('Male');
  const [nationality, setNationality] = useState('Ethiopian');
  const [address, setAddress] = useState('Addis Ababa, Ethiopia');
  const [bio, setBio] = useState(
    'Attending Physician with clinical experience in outpatient consultations, internal medicine, and patient care management.'
  );

  // Professional form
  const [department, setDepartment] = useState('Cardiology');
  const [designation, setDesignation] = useState('Consultant');
  const [consultationRoom, setConsultationRoom] = useState('Room 3');
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');

  // Stats from live database
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [activePatientsCount, setActivePatientsCount] = useState(0);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [labOrdersCount, setLabOrdersCount] = useState(0);
  const [recentAppointments, setRecentAppointments] = useState<AppointmentDTO[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Feedback toast
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.displayName.startsWith('Dr.') ? user.displayName : `Dr. ${user.displayName}`);
      setEmail(user.email || 'doctor@mcms.local');
      if (user.staffProfile?.jobTitle) {
        setDesignation(user.staffProfile.jobTitle);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoadingStats(true);
    Promise.allSettled([
      fetchAppointments(accessToken),
      fetchPatients(accessToken, { limit: 1 }),
      fetchPrescriptions(accessToken),
      fetchLabOrders(accessToken),
    ]).then(([apptRes, patRes, rxRes, labRes]) => {
      if (apptRes.status === 'fulfilled') {
        setTotalAppointments(apptRes.value.length);
        setRecentAppointments(apptRes.value.slice(0, 4));
      }
      if (patRes.status === 'fulfilled') {
        setActivePatientsCount(patRes.value.total);
      }
      if (rxRes.status === 'fulfilled') {
        setPrescriptionsCount(rxRes.value.length);
        setRecentPrescriptions(rxRes.value.slice(0, 3));
      }
      if (labRes.status === 'fulfilled') {
        setLabOrdersCount(labRes.value.length);
      }
      setIsLoadingStats(false);
    });
  }, [accessToken]);

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
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Doctor')}&background=0284c7&color=fff&rounded=true&bold=true`;

  const profileHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Profile &amp; Professional Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your doctor credentials, clinical specialty, and workstation preferences.
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
  );

  return (
    <DoctorPageShell header={profileHeader}>
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['Profile', 'Professional Details', 'Availability'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'Profile' ? <User className="w-3.5 h-3.5" /> : tab === 'Professional Details' ? <Briefcase className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Main Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMN 1 & 2: FORMS */}
        <div className="lg:col-span-8 space-y-5">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5"
          >
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Doctor Credentials &amp; Bio</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Fields with * are required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Phone Number
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
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nationality</label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  <option>Ethiopian</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bio / About</label>
                <textarea
                  rows={3}
                  value={bio}
                  maxLength={500}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
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
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
              />
              <div className="flex-1 w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50/50">
                <UploadCloud className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-800">Automated Avatar Generated</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Synchronized with healthcare practitioner identity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: STATS & ACTIVITY */}
        <div className="lg:col-span-4 space-y-4">
          {/* Professional Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Professional Assignment</h3>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Clinical Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Consultation Room</label>
                <input
                  type="text"
                  value={consultationRoom}
                  onChange={(e) => setConsultationRoom(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Clinical Statistics</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {isLoadingStats ? '—' : totalAppointments}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600">Total Visits</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {isLoadingStats ? '—' : activePatientsCount}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600">Patients</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {isLoadingStats ? '—' : labOrdersCount}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600">Lab Orders</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {isLoadingStats ? '—' : prescriptionsCount}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600">Prescriptions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Recent Encounters</h3>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {recentAppointments.length === 0 && recentPrescriptions.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No recent encounters recorded.</p>
              ) : (
                <>
                  {recentAppointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 truncate">{apt.patientName}</div>
                        <div className="text-[11px] text-slate-500">{apt.reason || apt.type}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {apt.appointmentDate.split('T')[0]}
                      </span>
                    </div>
                  ))}

                  {recentPrescriptions.slice(0, 2).map((rx) => (
                    <div key={rx.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 truncate">{rx.patientName}</div>
                        <div className="text-[11px] text-slate-500">
                          {rx.items?.[0]?.medicationName || 'Prescription issued'}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {rx.createdAt.split('T')[0]}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DoctorPageShell>
  );
}
