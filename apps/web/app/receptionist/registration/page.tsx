'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { createPatient, fetchPatients } from '../../../lib/api';
import type { PatientDTO } from '@mcms/contracts';

const NewAppointmentModal = dynamic(() => import('../../../components/receptionist/NewAppointmentModal'), { ssr: false });
const CheckInModal = dynamic(() => import('../../../components/receptionist/CheckInModal'), { ssr: false });

export default function PatientRegistrationPage() {
  const { accessToken } = useAuth();

  const [activeTab, setActiveTab] = useState<'new' | 'existing' | 'scan'>('new');
  const [searchTab, setSearchTab] = useState<'quick' | 'advanced'>('quick');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');
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
  const [duplicateResults, setDuplicateResults] = useState<PatientDTO[]>([]);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // Search existing patients state (right column)
  const [existingSearchQuery, setExistingSearchQuery] = useState('');
  const [existingSearchResults, setExistingSearchResults] = useState<PatientDTO[]>([]);
  const [searchingExisting, setSearchingExisting] = useState(false);

  // Registered Patient & recent patients
  const [registeredPatient, setRegisteredPatient] = useState<PatientDTO | null>(null);
  const [recentPatients, setRecentPatients] = useState<PatientDTO[]>([]);

  // Load recent patients
  const loadRecent = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetchPatients(accessToken, { limit: 5 });
      setRecentPatients(res.data);
    } catch {
      // Ignore
    }
  }, [accessToken]);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  const handleCopyId = () => {
    if (!registeredPatient?.pid) return;
    navigator.clipboard.writeText(registeredPatient.pid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setFullName('');
    setDob('');
    setGender('Male');
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
    setRegisteredPatient(null);
    setSaveSuccess(false);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = fullName.trim();
    if (!trimmed) {
      setFormError('Patient full name is required.');
      return;
    }

    const parts = trimmed.split(' ');
    const firstName = parts[0] ?? 'Unknown';
    const lastName = parts.slice(1).join(' ') || 'Patient';

    setSubmitting(true);
    try {
      const res = await createPatient(
        {
          firstName,
          lastName,
          dateOfBirth: dob ? dob : undefined,
          gender: gender ? gender : undefined,
          phoneNumber: phone.trim() ? phone.trim() : undefined,
          email: email.trim() ? email.trim() : undefined,
          address: address.trim() ? address.trim() : undefined,
          city: city ? city : undefined,
          emergencyContactName: emergencyName.trim() ? emergencyName.trim() : undefined,
          emergencyContactPhone: emergencyPhone.trim() ? emergencyPhone.trim() : undefined,
          emergencyContactRel: emergencyRel ? emergencyRel : undefined,
        },
        accessToken,
      );

      setRegisteredPatient(res);
      setSaveSuccess(true);
      void loadRecent();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to register patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateQuery.trim() || !accessToken) return;

    setCheckingDuplicate(true);
    try {
      const res = await fetchPatients(accessToken, { search: duplicateQuery.trim(), limit: 5 });
      setDuplicateResults(res.data);
      setDuplicateChecked(true);
    } catch {
      setDuplicateResults([]);
      setDuplicateChecked(true);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleExistingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingSearchQuery.trim() || !accessToken) return;

    setSearchingExisting(true);
    try {
      const res = await fetchPatients(accessToken, { search: existingSearchQuery.trim(), limit: 5 });
      setExistingSearchResults(res.data);
    } catch {
      setExistingSearchResults([]);
    } finally {
      setSearchingExisting(false);
    }
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
            {saveSuccess && registeredPatient && (
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Patient successfully registered! Medical Record PID ({registeredPatient.pid}) generated.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckInModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition"
                  >
                    Check In Now
                  </button>
                  <button
                    onClick={() => setSaveSuccess(false)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold ml-1"
                  >
                    Dismiss
                  </button>
                </div>
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
                    activeTab === 'new' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  New Patient
                  {activeTab === 'new' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Personal Info */}
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
                    placeholder="e.g. Abebe Bikila"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 912 345 678"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-800">Address &amp; Location</div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address / house number"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sub-city / Woreda</label>
                    <input
                      type="text"
                      value={woreda}
                      onChange={(e) => setWoreda(e.target.value)}
                      placeholder="e.g. Bole"
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Emergency Contact</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Enter contact name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+251 911 234 567"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {submitting ? 'Saving...' : 'Save Patient'}
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
                  placeholder="Enter name, phone, or PID to verify..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={checkingDuplicate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  {checkingDuplicate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                </button>
              </form>

              {duplicateChecked && (
                duplicateResults.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No duplicate found. Safe to proceed with new registration.</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{duplicateResults.length} potential duplicate patient(s) found:</span>
                    </div>
                    <div className="space-y-1">
                      {duplicateResults.map((p) => (
                        <div key={p.id} className="p-2 bg-white rounded-lg border border-amber-200 text-[11px] flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800">{p.fullName}</span>
                            <span className="text-slate-500 ml-1.5">({p.phoneNumber ?? 'No phone'})</span>
                          </div>
                          <span className="font-mono font-bold text-blue-600">{p.pid}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Patient Summary (After Registration) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Patient Summary</h2>
                </div>
                {registeredPatient && (
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy PID'}
                  </button>
                )}
              </div>

              {registeredPatient ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{registeredPatient.fullName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {registeredPatient.pid}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>Gender: <span className="font-semibold text-slate-800">{registeredPatient.gender}</span></div>
                    <div>Phone: <span className="font-semibold text-slate-800">{registeredPatient.phoneNumber ?? 'None'}</span></div>
                    <div>City: <span className="font-semibold text-slate-800">{registeredPatient.city ?? 'Addis Ababa'}</span></div>
                    <div>Registered: <span className="font-semibold text-slate-800">Today</span></div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckInModalOpen(true)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
                    >
                      Check-in Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppointmentModalOpen(true)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                    >
                      Book Appt
                    </button>
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

            {/* Privacy & Security */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">Privacy &amp; Security</div>
                <div className="text-[11px] text-slate-500">
                  Patient medical information is encrypted and secured according to healthcare standards.
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

              <form onSubmit={handleExistingSearch} className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={existingSearchQuery}
                    onChange={(e) => setExistingSearchQuery(e.target.value)}
                    placeholder="Name, phone number, or PID..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={searchingExisting}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  {searchingExisting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Search
                </button>
              </form>

              {existingSearchResults.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-48 overflow-y-auto">
                  {existingSearchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setRegisteredPatient(p)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-100 cursor-pointer transition text-xs"
                    >
                      <div className="font-bold text-slate-800">{p.fullName}</div>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>{p.phoneNumber ?? 'No phone'}</span>
                        <span className="font-mono text-blue-600 font-bold">{p.pid}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Registrations */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Recent Registrations</h2>
                </div>
                <Link href="/receptionist/patients" className="text-xs font-bold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentPatients.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">No recent patients found.</div>
                ) : (
                  recentPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setRegisteredPatient(p)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                        {p.fullName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 truncate">{p.fullName}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.pid}</div>
                      </div>
                    </div>
                  ))
                )}
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
                  href="/receptionist/queue"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">View Queue</span>
                </Link>

                <Link
                  href="/receptionist/patients"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Patient Directory</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Modals */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          preselectedPatient={
            registeredPatient
              ? { id: registeredPatient.id, fullName: registeredPatient.fullName, pid: registeredPatient.pid }
              : null
          }
        />
      )}
      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
          preselectedPatient={
            registeredPatient
              ? { id: registeredPatient.id, fullName: registeredPatient.fullName, pid: registeredPatient.pid }
              : null
          }
        />
      )}
    </>
  );
}
