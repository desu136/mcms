import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Pill,
  FlaskConical,
  FileText,
  Shield,
  Heart,
  ChevronDown,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  PatientItem,
} from '../../components/doctor/doctorMockData';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPatientModal } from '../../components/doctor/DoctorPatientModal';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorReferralModal } from '../../components/doctor/DoctorReferralModal';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import type { PatientDTO } from '@mcms/contracts';

function mapDtoToPatientItem(p: PatientDTO): PatientItem {
  const isFemale = (p.gender || '').toLowerCase().startsWith('f');
  const birthYear = p.dateOfBirth ? new Date(p.dateOfBirth).getFullYear() : 1990;
  const age = Math.max(1, new Date().getFullYear() - birthYear);

  return {
    id: p.id,
    name: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
    pid: p.pid,
    age: isNaN(age) ? 35 : age,
    gender: isFemale ? 'Female' : 'Male',
    phone: p.phoneNumber || '+251 911 000 000',
    email: p.email || `${p.firstName.toLowerCase()}@mcms.local`,
    address: p.address || p.city || 'Addis Ababa, Ethiopia',
    department: 'General OPD',
    lastVisit: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    lastVisitReason: 'General Consultation',
    status: p.status === 'INACTIVE' ? 'Inactive' : 'Active',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName || p.firstName)}&size=150&background=dbeafe&color=1e40af`,
    totalVisits: 1,
    conditions: p.allergies
      ? [{ title: `Allergy: ${p.allergies}`, diagnosedDate: '2026-01-01', status: 'Active', type: 'allergy' }]
      : [],
  };
}

export function PatientsPage() {
  const { accessToken } = useAuth();
  const [patientsList, setPatientsList] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedGender, setSelectedGender] = useState('All Genders');
  const [highlightedPatient, setHighlightedPatient] = useState<PatientItem | null>(null);

  // Modals & Drawers
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPatients(accessToken, { limit: 50 });
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        const liveItems = res.data.map(mapDtoToPatientItem);
        setPatientsList(liveItems);
        if (!highlightedPatient) {
          setHighlightedPatient(liveItems[0]!);
        }
      } else {
        // No patients returned from API
        setPatientsList([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch patients');
      setPatientsList([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const filteredPatients = patientsList.filter((p) => {
    if (activeTab === 'active' && p.status !== 'Active') return false;
    if (activeTab === 'inactive' && p.status !== 'Inactive') return false;
    if (selectedDepartment !== 'All Departments' && p.department !== selectedDepartment) return false;
    if (selectedGender !== 'All Genders' && p.gender !== selectedGender) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.pid.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.lastVisitReason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenDrawer = (patient: PatientItem) => {
    setHighlightedPatient(patient);
    setDrawerOpen(true);
  };

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Users className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Patients Registry
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Electronic health registry, clinical demographics, and past visit summaries.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => void loadPatients()}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => setAddPatientModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>
    </div>
  );

  const totalCount = patientsList.length;
  const activeCount = patientsList.filter((p) => p.status === 'Active').length;

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Total Patients"
        value={loading ? '—' : totalCount}
        icon={Users}
        color="blue"
        change={{ value: '', trend: 'up', label: 'live registry' }}
      />
      <DoctorStatCard
        title="Active Patients"
        value={loading ? '—' : activeCount}
        icon={Users}
        color="emerald"
        change={{ value: '', trend: 'up', label: 'active records' }}
      />
      <DoctorStatCard
        title="New This Month"
        value={loading ? '—' : totalCount}
        icon={UserPlus}
        color="purple"
        change={{ value: '', trend: 'up', label: 'registered' }}
      />
      <DoctorStatCard
        title="Critical Follow-ups"
        value={2}
        icon={Heart}
        color="rose"
        change={{ value: '', trend: 'down', label: 'high priority' }}
      />
    </div>
  );

  const rightPanelContent = highlightedPatient ? (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Selected Dossier</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              highlightedPatient.status === 'Active'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {highlightedPatient.status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={highlightedPatient.avatar}
            alt={highlightedPatient.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div>
            <h4 className="text-base font-extrabold text-slate-900 leading-tight">
              {highlightedPatient.name}
            </h4>
            <div className="text-xs font-mono font-bold text-blue-600 mt-0.5">
              {highlightedPatient.pid}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {highlightedPatient.age} yrs • {highlightedPatient.gender}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{highlightedPatient.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{highlightedPatient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{highlightedPatient.address}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Clinical History
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last Visit:</span>
            <span className="font-semibold text-slate-800">{highlightedPatient.lastVisit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Visit Reason:</span>
            <span className="font-semibold text-slate-800">{highlightedPatient.lastVisitReason}</span>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={() => handleOpenDrawer(highlightedPatient)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Full Medical Chart
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPrescriptionModalOpen(true)}
              className="py-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-blue-600" /> Prescribe
            </button>
            <button
              onClick={() => setLabModalOpen(true)}
              className="py-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-orange-600" /> Order Lab
            </button>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={rightPanelContent}
        rightPanelWidth="lg:w-[320px] xl:w-[360px]"
      >
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {(['all', 'active', 'inactive'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer shrink-0 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, PID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
              >
                <option value="All Genders">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Loading patients…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-5">Patient Name</th>
                    <th className="py-3 px-5">PID</th>
                    <th className="py-3 px-5">Age / Gender</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Last Visit</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPatients.map((p) => {
                    const isSelected = highlightedPatient?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setHighlightedPatient(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.avatar}
                              alt={p.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800">{p.name}</div>
                              <div className="text-[11px] text-slate-400">{p.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-semibold text-blue-600">{p.pid}</td>
                        <td className="py-3.5 px-5 text-slate-600">
                          {p.age} yrs • {p.gender}
                        </td>
                        <td className="py-3.5 px-5 text-slate-700">{p.department}</td>
                        <td className="py-3.5 px-5">
                          <div className="text-slate-800 font-medium">{p.lastVisit}</div>
                          <div className="text-[10px] text-slate-400">{p.lastVisitReason}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              p.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDrawer(p);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors cursor-pointer"
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DoctorPageShell>

      {/* Patient Drawer & Modals */}
      <DoctorPatientDrawer
        patient={highlightedPatient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
        onOpenReferralModal={() => setReferralModalOpen(true)}
      />
      <DoctorPatientModal
        isOpen={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        onPatientAdded={(newPatient) => {
          setPatientsList((prev) => [newPatient, ...prev]);
          setHighlightedPatient(newPatient);
        }}
      />
      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        defaultPatientId={highlightedPatient?.id}
        realPatientId={highlightedPatient?.id}
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={highlightedPatient?.id}
        realPatientId={highlightedPatient?.id}
      />
      <DoctorReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        patientId={highlightedPatient?.id}
        patientName={highlightedPatient?.name}
        onSuccess={() => void loadPatients()}
      />
    </>
  );
}
export default PatientsPage;
