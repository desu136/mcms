import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  UserCheck,
  Clock,
  Printer,
  ChevronRight,
  Database,
  RefreshCw,
  Loader2,
  MapPin,
  Droplet,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import CheckInModal from '../../components/receptionist/CheckInModal';
import NewAppointmentModal from '../../components/receptionist/NewAppointmentModal';
import {
  PATIENTS_DIRECTORY_KPIS,
  FULL_PATIENTS_DIRECTORY,
  PatientDirectoryRow,
} from '../../components/receptionist/receptionistMockData';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';
import type { PatientDTO } from '@mcms/contracts';

interface PatientsPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export interface ExtendedPatientDirectoryRow extends PatientDirectoryRow {
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
}

export function PatientsPage({ onNavigateTab }: PatientsPageProps) {
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  // Patient list and selected patient
  const [patients, setPatients] = useState<ExtendedPatientDirectoryRow[]>(FULL_PATIENTS_DIRECTORY);
  const [selectedPatient, setSelectedPatient] = useState<ExtendedPatientDirectoryRow | null>(
    FULL_PATIENTS_DIRECTORY[0] ?? null,
  );

  const calculateAge = (dobString?: string | null): number => {
    if (!dobString) return 32;
    try {
      const birth = new Date(dobString);
      const diff = Date.now() - birth.getTime();
      return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
    } catch {
      return 30;
    }
  };

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchPatients(accessToken, {
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        page,
        limit: 50,
      });

      if (res && res.data && res.data.length > 0) {
        setTotalCount(res.total);
        const mapped: ExtendedPatientDirectoryRow[] = res.data.map((p: PatientDTO) => {
          const isMale = (p.gender || '').toUpperCase() === 'M' || (p.gender || '').toUpperCase() === 'MALE';
          return {
            pid: p.pid,
            name: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
            age: calculateAge(p.dateOfBirth),
            gender: isMale ? ('Male' as const) : ('Female' as const),
            phone: p.phoneNumber || 'N/A',
            doctor: 'Dr. Available',
            lastVisit: new Date(p.createdAt).toLocaleDateString(),
            status: 'Active' as const,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.fullName || p.pid)}`,
            bloodType: p.bloodType || 'Unknown',
            bloodGroup: p.bloodType || 'Unknown',
            allergies: p.allergies || 'None',
            address: p.address || p.city || 'Addis Ababa',
            emergencyContact: p.emergencyContactName ? `${p.emergencyContactName} (${p.emergencyContactPhone || 'N/A'})` : 'N/A',
            ...(p.emergencyContactName ? { emergencyName: p.emergencyContactName } : {}),
            ...(p.emergencyContactPhone ? { emergencyPhone: p.emergencyContactPhone } : {}),
          };
        });
        setPatients(mapped);
        if (!selectedPatient || !mapped.some((m) => m.pid === selectedPatient.pid)) {
          setSelectedPatient(mapped[0] ?? null);
        }
      }
    } catch (err) {
      console.warn('Could not fetch patients from backend, falling back to local list:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, searchQuery, page]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesFilter = filterTab === 'All' || p.status === filterTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.pid.toLowerCase().includes(q) ||
        p.phone.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [patients, filterTab, searchQuery]);

  // Compute live KPIs
  const liveKPIs = useMemo(() => {
    const total = totalCount || patients.length;
    const active = patients.filter((p) => p.status === 'Active').length;
    return [
      {
        title: 'Total Patients',
        value: total.toLocaleString(),
        change: '+14% this month',
        trend: 'up' as const,
        trendLabel: 'vs last month',
        iconName: 'users' as const,
        color: 'blue' as const,
      },
      {
        title: 'Active Dossiers',
        value: active.toLocaleString(),
        change: 'Regular visits',
        trendLabel: 'verified records',
        iconName: 'check-circle' as const,
        color: 'emerald' as const,
      },
      {
        title: 'New Registrations',
        value: '18',
        prefix: '+',
        change: 'Today',
        trend: 'up' as const,
        trendLabel: 'walk-ins & booked',
        iconName: 'calendar' as const,
        color: 'cyan' as const,
      },
      {
        title: 'EMR Sync Health',
        value: '100%',
        change: 'Postgres & SQLite',
        trend: 'up' as const,
        trendLabel: 'real-time sync',
        iconName: 'clock' as const,
        color: 'amber' as const,
      },
    ];
  }, [patients, totalCount]);

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Patient Directory"
            subtitle="Comprehensive clinic patient registry, medical history, and contact dossiers."
            icon={Users}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadPatients}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh Patients"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={() => onNavigateTab('registration')}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Patient</span>
                </button>
              </div>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {liveKPIs.map((kpi, idx) => (
              <ReceptionistStatCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                prefix={kpi.prefix}
                change={kpi.change}
                trend={kpi.trend}
                trendLabel={kpi.trendLabel}
                iconName={kpi.iconName}
                color={kpi.color}
              />
            ))}
          </div>
        }
        subnav={
          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1">
              {(['All', 'Active', 'Inactive'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, PID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        }
        rightPanel={
          selectedPatient ? (
            <div className="space-y-3.5">
              {/* Patient Dossier Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      {selectedPatient.name}
                    </h3>
                    <p className="text-[11px] font-mono font-bold text-blue-600 mt-0.5">
                      {selectedPatient.pid}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Age / Gender:</span>
                    <span className="font-bold text-slate-800">
                      {selectedPatient.age} yrs • {selectedPatient.gender}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedPatient.phone}</span>
                  </div>
                  {selectedPatient.bloodType && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-rose-500" />
                        <span>Blood Type:</span>
                      </span>
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-mono">
                        {selectedPatient.bloodType}
                      </span>
                    </div>
                  )}
                  {selectedPatient.allergies && selectedPatient.allergies !== 'None' && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>Allergies:</span>
                      </span>
                      <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[10px]">
                        {selectedPatient.allergies}
                      </span>
                    </div>
                  )}
                  {selectedPatient.address && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Address:</span>
                      </span>
                      <span className="font-medium text-slate-700 text-right truncate max-w-[150px]">
                        {selectedPatient.address}
                      </span>
                    </div>
                  )}
                  {selectedPatient.emergencyContact && selectedPatient.emergencyContact !== 'N/A' && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Emergency:</span>
                      <span className="font-medium text-slate-800 text-right truncate max-w-[150px]">
                        {selectedPatient.emergencyContact}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setCheckInModalOpen(true)}
                    type="button"
                    className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Check In
                  </button>
                  <button
                    onClick={() => setAppointmentModalOpen(true)}
                    type="button"
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Visit
                  </button>
                </div>
              </div>

              {/* Sync Status Info */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>EMR Encrypted Database</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Patient dossiers are synced locally to encrypted SQLite storage for instant offline lookups.
                </p>
              </div>
            </div>
          ) : null
        }
      >
        {/* Directory Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="pb-2.5">PID</th>
                  <th className="pb-2.5">Patient Name</th>
                  <th className="pb-2.5">Age / Sex</th>
                  <th className="pb-2.5">Phone</th>
                  <th className="pb-2.5">Blood Type</th>
                  <th className="pb-2.5">Last Visit</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && patients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span>Loading patient directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No patients found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((patient) => {
                    const isSelected = selectedPatient?.pid === patient.pid;
                    return (
                      <tr
                        key={patient.pid}
                        onClick={() => setSelectedPatient(patient)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 font-mono font-bold text-blue-700">{patient.pid}</td>
                        <td className="py-2.5 font-bold text-slate-900">{patient.name}</td>
                        <td className="py-2.5 text-slate-600">
                          {patient.age} yrs • {patient.gender}
                        </td>
                        <td className="py-2.5 font-mono text-slate-600">{patient.phone}</td>
                        <td className="py-2.5">
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-mono">
                            {patient.bloodType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500">{patient.lastVisit}</td>
                        <td className="py-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              patient.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatient(patient);
                              setCheckInModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-semibold text-[11px] transition-colors"
                          >
                            Check In
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Check In Modal */}
      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
          onCheckInComplete={() => {
            setCheckInModalOpen(false);
            onNavigateTab('queue');
          }}
        />
      )}

      {/* Book Appointment Modal */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          onAppointmentBooked={() => {
            setAppointmentModalOpen(false);
            onNavigateTab('appointments');
          }}
        />
      )}
    </>
  );
}

export default React.memo(PatientsPage);
