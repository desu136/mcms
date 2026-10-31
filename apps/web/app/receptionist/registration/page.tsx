'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Search,
  Upload,
  Copy,
  Calendar,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Info,
  Users,
  FileText,
  CreditCard,
  UserCheck,
  Check,
} from 'lucide-react';

import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';

const NewAppointmentModal = dynamic(() => import('../../../components/receptionist/NewAppointmentModal'), { ssr: false });
const CheckInModal = dynamic(() => import('../../../components/receptionist/CheckInModal'), { ssr: false });
import { REGISTRATION_RECENT_PATIENTS } from '../../../components/receptionist/receptionistMockData';

export default function PatientRegistrationPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'existing' | 'scan'>('new');
  const [searchTab, setSearchTab] = useState<'quick' | 'advanced'>('quick');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('+251 ');
  const [email, setEmail] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [idType, setIdType] = useState('National ID');
  const [regType, setRegType] = useState('Walk-in');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [woreda, setWoreda] = useState('');
  const [kebele, setKebele] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+251 ');
  const [notes, setNotes] = useState('');

  // Duplicate Check State
  const [duplicateQuery, setDuplicateQuery] = useState('');
  const [duplicateChecked, setDuplicateChecked] = useState(false);

  // Registered Patient for summary preview
  const [registeredSummary, setRegisteredSummary] = useState<any | null>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText('P-2026-001245');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setFullName('');
    setDob('');
    setGender('');
    setPhone('+251 ');
    setEmail('');
    setMaritalStatus('');
    setNationalId('');
    setAddress('');
    setCity('');
    setWoreda('');
    setKebele('');
    setEmergencyName('');
    setEmergencyRel('');
    setEmergencyPhone('+251 ');
    setNotes('');
    setRegisteredSummary(null);
    setSaveSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient = {
      name: fullName || 'Abebe Bikila',
      pid: 'P-2026-001245',
      gender: gender || 'Male',
      dob: dob || '1995-04-12',
      phone: phone || '+251 912 345 678',
      address: address ? `${address}, ${city}` : 'Addis Ababa, Ethiopia',
      regDate: 'Oct 19, 2026',
      regType,
    };
    setRegisteredSummary(newPatient);
    setSaveSuccess(true);
  };

  const handleDuplicateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateChecked(true);
  };

  return (
    <>
      <ReceptionistPageShell
        banner={
          <>
            <ReceptionistBanner
              title="Patient Registration"
              subtitle="Register new patients, collect necessary information and create their medical record."
              icon={UserPlus}
              actionElement={
                <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900 max-w-sm">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold leading-tight">Already have a patient?</div>
                    <div className="text-[9px] text-blue-600 font-medium leading-tight">
                      Search for existing patient before registering to avoid duplicates.
                    </div>
                  </div>
                </div>
              }
            />

            {/* Success Notification */}
            {saveSuccess && (
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Patient successfully registered! Medical Record (P-2026-001245) generated.</span>
                </div>
                <button
                  onClick={() => setSaveSuccess(false)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </>
        }
      >
        {/* ─── 3 Column Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* ─── LEFT COLUMN: Patient Information Form (5 cols) ─── */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          {/* Header & Tabs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Patient Information</h2>
            </div>

            {/* Segmented Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`pb-2.5 px-3 transition-colors relative ${
                  activeTab === 'new'
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                New Patient
                {activeTab === 'new' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`pb-2.5 px-3 transition-colors relative ${
                  activeTab === 'existing'
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Existing Patient
                {activeTab === 'existing' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className={`pb-2.5 px-3 transition-colors relative ${
                  activeTab === 'scan'
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Scan ID
                {activeTab === 'scan' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Top Row: Photo Upload + Auto-generated ID + Reg Type */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-xs flex flex-col items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Upload</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1">JPG, PNG (Max 2MB)</span>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Patient ID (Auto-generated)
                    </label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800">
                      <span className="truncate">P-2026-001245</span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="text-slate-400 hover:text-blue-600 ml-auto"
                        title="Copy Patient ID"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Registration Date
                    </label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Oct 19, 2026</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Registration Type
                  </label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
                  >
                    <option>Walk-in</option>
                    <option>Appointment</option>
                    <option>Emergency</option>
                    <option>Referral</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Full Name & DOB & Gender */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter patient full name"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 912 345 678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ID Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option>National ID</option>
                    <option>Passport</option>
                    <option>Kebele ID</option>
                    <option>Driver License</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">National ID / Passport</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="Enter ID number"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* ─── Contact Information ─── */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Contact Information</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="">Select city</option>
                    <option value="Addis Ababa">Addis Ababa</option>
                    <option value="Dire Dawa">Dire Dawa</option>
                    <option value="Hawassa">Hawassa</option>
                    <option value="Adama">Adama</option>
                    <option value="Bahir Dar">Bahir Dar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Woreda / Sub-city</label>
                  <select
                    value={woreda}
                    onChange={(e) => setWoreda(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="">Select woreda</option>
                    <option value="Bole">Bole</option>
                    <option value="Kirkos">Kirkos</option>
                    <option value="Yeka">Yeka</option>
                    <option value="Arada">Arada</option>
                    <option value="Nifas Silk">Nifas Silk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kebele</label>
                  <input
                    type="text"
                    value={kebele}
                    onChange={(e) => setKebele(e.target.value)}
                    placeholder="Enter kebele"
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* ─── Emergency Contact ─── */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Emergency Contact</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Enter contact name"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={emergencyRel}
                    onChange={(e) => setEmergencyRel(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="">Select relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+251 911 234 567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all duration-150"
              >
                <UserPlus className="w-4 h-4" />
                Save Patient
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* ─── MIDDLE COLUMN: Duplicate Check & Summary & Notes (4 cols) ─── */}
        <div className="lg:col-span-4 space-y-5">
          {/* Check for Duplicate Patient */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Check for Duplicate Patient</h2>
            </div>

            <form onSubmit={handleDuplicateSearch} className="flex gap-2">
              <input
                type="text"
                value={duplicateQuery}
                onChange={(e) => setDuplicateQuery(e.target.value)}
                placeholder="Enter name, phone number, or national ID..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                We check for duplicate patients by name, phone number, National ID and date of birth
                to keep your records accurate.
              </span>
            </div>

            {duplicateChecked && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No duplicate found. Safe to proceed with new registration.</span>
              </div>
            )}
          </div>

          {/* Patient Summary (After Registration) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Patient Summary (After Registration)</h2>
            </div>

            {registeredSummary ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{registeredSummary.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    {registeredSummary.pid}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Gender: <span className="font-semibold text-slate-800">{registeredSummary.gender}</span></div>
                  <div>Phone: <span className="font-semibold text-slate-800">{registeredSummary.phone}</span></div>
                  <div>Type: <span className="font-semibold text-slate-800">{registeredSummary.regType}</span></div>
                  <div>Date: <span className="font-semibold text-slate-800">{registeredSummary.regDate}</span></div>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-400 mb-2">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-400 font-medium max-w-xs">
                  Patient information will appear here after registration.
                </p>
              </div>
            )}
          </div>

          {/* Registration Notes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Registration Notes</h2>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 resize-none text-slate-700"
            />
            <div className="text-right text-[11px] text-slate-400 font-medium">
              {notes.length}/500
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-slate-800">Privacy &amp; Security</div>
              <div className="text-[11px] text-slate-500">
                Patient information is kept confidential and used only for medical purposes.
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Search Existing & Recent & Quick Actions (3 cols) ─── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Search Existing Patient */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Search Existing Patient</h2>
            </div>

            {/* Quick vs Advanced tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSearchTab('quick')}
                className={`py-1.5 rounded-lg transition-colors ${
                  searchTab === 'quick' ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-500'
                }`}
              >
                Quick Search
              </button>
              <button
                type="button"
                onClick={() => setSearchTab('advanced')}
                className={`py-1.5 rounded-lg transition-colors ${
                  searchTab === 'advanced' ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-500'
                }`}
              >
                Advanced Search
              </button>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Name, phone number, MRN, or ID..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white text-slate-700">
                <option>All Patients</option>
                <option>Registered Today</option>
                <option>Active Patients</option>
              </select>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Recent Registrations</h2>
              </div>
              <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                View All
              </span>
            </div>

            <div className="space-y-3">
              {REGISTRATION_RECENT_PATIENTS.map((p) => (
                <div key={p.pid} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          p.badge === 'New'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{p.pid}</div>
                    <div className="text-[10px] text-slate-400">{p.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAppointmentModalOpen(true)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Book Appointment</span>
              </button>

              <button
                type="button"
                onClick={() => setCheckInModalOpen(true)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Check-in Patient</span>
              </button>

              <Link
                href="/receptionist/billing"
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Create Bill</span>
              </Link>

              <Link
                href="/receptionist/patients"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">View Patient List</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Line matching screenshot */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-200">
        <div>MCMS | Receptionist Module | Patient Registration</div>
        <div>Version 1.0.0</div>
      </div>

      </ReceptionistPageShell>

      {/* Modals */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
        />
      )}
      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
        />
      )}
    </>
  );
}

