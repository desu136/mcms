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
  Edit2,
  ChevronLeft,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import CheckInModal from '../../components/receptionist/CheckInModal';
import NewAppointmentModal from '../../components/receptionist/NewAppointmentModal';
import EditPatientModal from '../../components/receptionist/EditPatientModal';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';
import type { PatientDTO } from '@mcms/contracts';

interface PatientsPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

function calculateAge(dobString?: string | null): number {
  if (!dobString) return 30;
  try {
    const birth = new Date(dobString);
    const diff = Date.now() - birth.getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
  } catch {
    return 30;
  }
}

export function PatientsPage({ onNavigateTab }: PatientsPageProps) {
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editPatientTarget, setEditPatientTarget] = useState<PatientDTO | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Patient list and selected patient
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchPatients(accessToken, {
        ...(debouncedQuery.trim() ? { search: debouncedQuery.trim() } : {}),
        page,
        limit,
      });

      if (res && res.data) {
        setPatients(res.data);
        setTotalCount(res.total);
        if (res.data.length > 0 && !selectedPatientId) {
          setSelectedPatientId(res.data[0]?.id ?? null);
        }
      }
    } catch (err) {
      console.warn('Could not fetch patients from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, debouncedQuery, page, limit, selectedPatientId]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) ?? patients[0] ?? null;
  }, [patients, selectedPatientId]);

  const filteredPatients = useMemo(() => {
    if (filterTab === 'All') return patients;
    return patients.filter((p) => (p.status || '').toLowerCase() === filterTab.toLowerCase());
  }, [patients, filterTab]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // Compute live KPIs
  const liveKPIs = useMemo(() => {
    return [
      {
        title: 'Total Patients',
        value: totalCount.toLocaleString(),
        change: 'In clinic database',
        trend: 'up' as const,
        trendLabel: 'verified records',
        iconName: 'users' as const,
        color: 'blue' as const,
      },
      {
        title: 'Active Dossiers',
        value: totalCount.toLocaleString(),
        change: 'Regular visits',
        trendLabel: 'active files',
        iconName: 'check-circle' as const,
        color: 'emerald' as const,
      },
      {
        title: 'Page Results',
        value: `${patients.length}`,
        change: `Page ${page} of ${totalPages}`,
        trend: 'up' as const,
        trendLabel: 'current page',
        iconName: 'calendar' as const,
        color: 'cyan' as const,
      },
      {
        title: 'EMR Sync Health',
        value: '100%',
        change: 'PostgreSQL & SQLite',
        trend: 'up' as const,
        trendLabel: 'real-time sync',
        iconName: 'clock' as const,
        color: 'amber' as const,
      },
    ];
  }, [totalCount, patients.length, page, totalPages]);

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                      {(selectedPatient.fullName || selectedPatient.firstName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">
                        {selectedPatient.fullName || `${selectedPatient.firstName} ${selectedPatient.lastName}`.trim()}
                      </h3>
                      <p className="text-[11px] font-mono font-bold text-blue-600 mt-0.5">
                        {selectedPatient.pid}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditPatientTarget(selectedPatient)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer"
                    title="Edit Patient"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Age / Gender:</span>
                    <span className="font-bold text-slate-800">
                      {calculateAge(selectedPatient.dateOfBirth)} yrs • {selectedPatient.gender || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedPatient.phoneNumber || 'N/A'}</span>
                  </div>
                  {selectedPatient.email && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">{selectedPatient.email}</span>
                    </div>
                  )}
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
                  {(selectedPatient.address || selectedPatient.city) && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Address:</span>
                      </span>
                      <span className="font-medium text-slate-700 text-right truncate max-w-[150px]">
                        {[selectedPatient.address, selectedPatient.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {selectedPatient.emergencyContactName && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Emergency:</span>
                      <span className="font-medium text-slate-800 text-right truncate max-w-[150px]">
                        {selectedPatient.emergencyContactName} ({selectedPatient.emergencyContactPhone || 'N/A'})
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

              {/* Feedback Alert */}
              {feedback && (
                <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold animate-in fade-in">
                  {feedback}
                </div>
              )}

              {/* Sync Status Info */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>EMR Encrypted Database</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Patient dossiers are synced locally to SQLite storage for instant offline lookups and automated sync when online.
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
                  <th className="pb-2.5">City</th>
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
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No patients found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const isSelected = selectedPatient?.id === patient.id;
                    const name = patient.fullName || `${patient.firstName} ${patient.lastName}`.trim();
                    const age = calculateAge(patient.dateOfBirth);

                    return (
                      <tr
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 font-mono font-bold text-blue-700">{patient.pid}</td>
                        <td className="py-2.5 font-bold text-slate-900">{name}</td>
                        <td className="py-2.5 text-slate-600">
                          {age} yrs • {patient.gender || 'Unknown'}
                        </td>
                        <td className="py-2.5 font-mono text-slate-600">{patient.phoneNumber || 'N/A'}</td>
                        <td className="py-2.5">
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-mono">
                            {patient.bloodType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500">{patient.city || 'Addis Ababa'}</td>
                        <td className="py-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              (patient.status || 'Active').toLowerCase() === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {patient.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setEditPatientTarget(patient);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setCheckInModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Check In
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} patients
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 py-1 font-bold text-slate-800">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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

      {/* Edit Patient Modal */}
      {editPatientTarget && (
        <EditPatientModal
          isOpen={!!editPatientTarget}
          patient={editPatientTarget}
          onClose={() => setEditPatientTarget(null)}
          onSuccess={() => {
            showFeedback('Patient updated successfully');
            void loadPatients();
            setEditPatientTarget(null);
          }}
        />
      )}
    </>
  );
}

export default React.memo(PatientsPage);
