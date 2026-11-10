import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Database,
  Calendar,
  Users,
  CreditCard,
  Check,
  ShieldCheck,
  Info,
  Clock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import { REGISTRATION_RECENT_PATIENTS } from '../../components/receptionist/receptionistMockData';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../auth/AuthContext';
import { createPatient, fetchPatients } from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';

interface RegistrationPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export function RegistrationPage({ onNavigateTab }: RegistrationPageProps) {
  const { enqueueOperation, isOnline } = useSync();
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'search'>('new');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [recentPatients, setRecentPatients] = useState<any[]>(REGISTRATION_RECENT_PATIENTS);

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('1994-05-12');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('+251 911 234 567');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('ET-ID-88412');
  const [regType, setRegType] = useState('Walk-in');
  const [city, setCity] = useState('Addis Ababa');
  const [address, setAddress] = useState('Bole Subcity, Woreda 03');
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+251 ');
  const [registeredPid, setRegisteredPid] = useState<string | null>(null);

  const loadRecent = useCallback(async () => {
    setIsLoadingRecent(true);
    try {
      const res = await fetchPatients(accessToken, { limit: 10 });
      if (res && res.data && res.data.length > 0) {
        setRecentPatients(
          res.data.map((p) => {
            const age = p.dateOfBirth
              ? Math.max(0, new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear())
              : 30;
            return {
              pid: p.pid,
              name: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
              time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
              type: 'Walk-in',
              gender: p.gender || 'Unknown',
              age,
            };
          }),
        );
      }
    } catch (err) {
      console.warn('Could not load live patients, falling back to mock:', err);
    } finally {
      setIsLoadingRecent(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || 'Patient';
    const lastName = parts.slice(1).join(' ') || 'User';

    let savedPatientId = `patient-${Date.now()}`;
    let finalPid = `P-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const liveRes = await createPatient(
        {
          firstName,
          lastName,
          ...(dob ? { dateOfBirth: dob } : {}),
          ...(gender ? { gender } : {}),
          ...(phone.trim() ? { phoneNumber: phone.trim() } : {}),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(address.trim() ? { address: address.trim() } : {}),
          ...(city.trim() ? { city: city.trim() } : {}),
          ...(bloodType ? { bloodType } : {}),
          ...(allergies.trim() ? { allergies: allergies.trim() } : {}),
          ...(emergencyName.trim() ? { emergencyContactName: emergencyName.trim() } : {}),
          ...(emergencyPhone.trim() ? { emergencyContactPhone: emergencyPhone.trim() } : {}),
        },
        accessToken,
      );

      if (liveRes && liveRes.id) {
        savedPatientId = liveRes.id;
        finalPid = liveRes.pid;
      }
    } catch (err) {
      console.warn('Live patient creation failed, falling back to local SQLite enqueue:', err);
    }

    const newPatientLocal = {
      id: savedPatientId,
      pid: finalPid,
      name: fullName,
      gender,
      dob,
      phone,
      email,
      nationalId,
      regType,
      city,
      emergencyName,
      emergencyPhone,
      registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Enqueue operation into local SQLite sync queue
    await enqueueOperation('patient', savedPatientId, 'CREATE', newPatientLocal);

    // Update local recent list
    setRecentPatients((prev: any) => [
      {
        pid: finalPid,
        name: fullName,
        time: 'Just now',
        type: regType,
        gender,
        age: dob ? Math.max(0, new Date().getFullYear() - new Date(dob).getFullYear()) : 30,
      },
      ...prev,
    ]);

    setRegisteredPid(finalPid);
    setSaveSuccess(true);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFullName('');
    setPhone('+251 ');
    setEmail('');
    setNationalId('');
    setEmergencyName('');
    setEmergencyPhone('+251 ');
    setRegisteredPid(null);
    setSaveSuccess(false);
  };

  return (
    <ReceptionistPageShell
      banner={
        <ReceptionistBanner
          title="Patient Intake & Registration"
          subtitle="Register new patients into the clinic database with automatic SQLite local sync."
          icon={UserPlus}
          actionElement={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold">
                <Database className="w-3.5 h-3.5" />
                <span>SQLite Offline Ready</span>
              </span>
            </div>
          }
        />
      }
      rightPanel={
        <div className="space-y-3.5">
          {/* Quick Registration Status */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Data Sync Guarantee
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every patient intake is committed immediately to your local SQLite workstation. Even if internet or power disconnects, data is safe and auto-pushes when online.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Storage Type:</span>
                <span className="font-bold text-slate-900">SQLite (better-sqlite3)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Network Status:</span>
                <span className={`font-bold ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isOnline ? 'Online (Auto-sync)' : 'Offline (Local only)'}
                </span>
              </div>
            </div>
          </div>

          {/* Today's Registrations Log */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Recent Registrations
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {recentPatients.length} today
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {recentPatients.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.pid} • {p.gender}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600">{p.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        {saveSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                Patient Successfully Registered!
              </h2>
              <p className="text-xs text-slate-500">
                New clinical file created with Patient ID: <strong className="text-blue-600 font-mono text-sm">{registeredPid}</strong>
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl bg-blue-50/70 border border-blue-200/70 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-900">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sync Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Enqueued into SQLite
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Register Another Patient
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('queue')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Go to Queue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900">Patient Personal Details</h2>
              <p className="text-[11px] text-slate-500">Enter demographic and contact information.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tigist Mengistu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">National ID / Kebele</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="border-b border-slate-100 pt-2 pb-3">
              <h2 className="text-sm font-black text-slate-900">Intake & Emergency Contact</h2>
              <p className="text-[11px] text-slate-500">Registration classification and contact in case of emergency.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Town</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Subcity, Woreda, House No..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies / Warnings</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts (leave blank if None)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intake Type</label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Walk-in">Walk-in</option>
                  <option value="Referral">Referral</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Abebe Mengistu"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>Enqueues directly into SQLite local storage</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Registering…' : 'Complete Registration'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </ReceptionistPageShell>
  );
}

export default React.memo(RegistrationPage);
