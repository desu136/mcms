'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  CreditCard,
  UserCheck,
  FileText,
  Clock,
  Printer,
  History,
  Tag,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchPatients } from '../../../lib/api';
import type { PatientDTO } from '@mcms/contracts';

const NewAppointmentModal = dynamic(() => import('../../../components/receptionist/NewAppointmentModal'), { ssr: false });
const CheckInModal = dynamic(() => import('../../../components/receptionist/CheckInModal'), { ssr: false });

function calculateAge(dobIso?: string | null): string {
  if (!dobIso) return '30';
  try {
    const dob = new Date(dobIso);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return String(Math.abs(ageDate.getUTCFullYear() - 1970));
  } catch {
    return '30';
  }
}

export default function ReceptionistPatientsPage() {
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load patients
  const loadPatients = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetchPatients(accessToken, {
        search: debouncedQuery ? debouncedQuery : undefined,
        page,
        limit,
      });
      setPatients(res.data);
      setTotalCount(res.total);
      if (res.data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(res.data[0]?.id ?? null);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [accessToken, debouncedQuery, page, limit, selectedPatientId]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) ?? patients[0] ?? null;
  }, [patients, selectedPatientId]);

  // Client filter for active/inactive tabs
  const filteredPatients = useMemo(() => {
    if (filterTab === 'All') return patients;
    return patients.filter((p) => p.status?.toLowerCase() === filterTab.toLowerCase());
  }, [patients, filterTab]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // KPIs
  const patientsKpis: Array<{
    title: string;
    value: string;
    change?: string | undefined;
    trend?: 'up' | 'down' | undefined;
    trendLabel?: string | undefined;
    iconName?: ('users' | 'calendar' | 'check-circle' | 'receipt' | 'clock' | 'dollar') | undefined;
    color?: ('blue' | 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose') | undefined;
  }> = [
    { title: 'Total Registered', value: String(totalCount), change: 'Total', trend: 'up', trendLabel: 'Lifetime', iconName: 'users', color: 'blue' },
    { title: 'Active Patients', value: String(totalCount), change: 'Active status', trend: 'up', trendLabel: 'In system', iconName: 'check-circle', color: 'emerald' },
    { title: 'Shown on Page', value: String(patients.length), change: `Page ${page} of ${totalPages}`, iconName: 'calendar', color: 'cyan' },
    { title: 'Page Size', value: `${limit}/page`, change: 'Configurable', iconName: 'receipt', color: 'purple' },
  ];

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Patients Directory"
            subtitle="Search, view and manage patient medical records, contact information, and appointments."
            icon={Users}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadPatients()}
                  title="Refresh Patients"
                  className="flex items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold shadow-2xs border border-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  href="/receptionist/registration"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register New Patient
                </Link>
              </div>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {patientsKpis.map((kpi, idx) => (
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
          <div className="space-y-2.5">
            {/* Search Bar & Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients by name, phone number, or patient ID..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'All', label: 'All Patients', count: totalCount },
                { id: 'Active', label: 'Active', count: totalCount },
                { id: 'Inactive', label: 'Inactive', count: 0 },
              ].map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id as typeof filterTab)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
          </div>
        }
        rightPanelWidth="lg:w-[350px] xl:w-[380px] 2xl:w-[410px]"
        rightPanel={
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Patient Details</h3>
              </div>
            </div>

            {selectedPatient ? (
              <>
                {/* Profile Card */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0 ring-2 ring-blue-500/20">
                    {selectedPatient.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {selectedPatient.fullName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {selectedPatient.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {selectedPatient.pid} • {selectedPatient.gender} • {calculateAge(selectedPatient.dateOfBirth)} yrs
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{selectedPatient.phoneNumber ?? 'No phone number'}</span>
                    </div>
                    {selectedPatient.email && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{selectedPatient.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {selectedPatient.dateOfBirth ? selectedPatient.dateOfBirth.split('T')[0] : 'Not specified'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">City</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.city || 'Addis Ababa'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Blood Group</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.bloodType || 'Unknown'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Registered</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {selectedPatient.createdAt ? selectedPatient.createdAt.split('T')[0] : 'Today'}
                    </span>
                  </div>
                </div>

                {/* Address & Emergency Contact */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Address &amp; Emergency</div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{selectedPatient.address || selectedPatient.city || 'Addis Ababa, Ethiopia'}</span>
                  </div>
                  {selectedPatient.emergencyContactName && (
                    <div className="text-slate-600 text-[11px] pt-1 border-t border-slate-200 mt-1">
                      Emergency: <span className="font-semibold text-slate-800">{selectedPatient.emergencyContactName}</span> ({selectedPatient.emergencyContactRel ?? 'Contact'}) • {selectedPatient.emergencyContactPhone ?? 'No phone'}
                    </div>
                  )}
                </div>

                {/* Patient Quick Actions */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckInModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Check In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppointmentModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Appt
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No patient selected
              </div>
            )}
          </div>
        }
      >
        {/* Table Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3 font-medium">Patient ID</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Gender</th>
                  <th className="pb-3 font-medium">Phone Number</th>
                  <th className="pb-3 font-medium">City</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {loading ? 'Loading patient records...' : 'No patient records found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const isSelected = selectedPatient?.id === patient.id;
                    return (
                      <tr
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        <td className="py-2.5 font-bold font-mono text-blue-600 whitespace-nowrap">
                          {patient.pid}
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {patient.fullName.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800">{patient.fullName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-700">{patient.gender}</td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">
                          {patient.phoneNumber || 'None'}
                        </td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">
                          {patient.city || 'Addis Ababa'}
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              title="Check In"
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setCheckInModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-[10px] transition"
                            >
                              Check-in
                            </button>
                            <button
                              type="button"
                              title="Book Appointment"
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setAppointmentModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] transition"
                            >
                              Appt
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

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing {filteredPatients.length > 0 ? (page - 1) * limit + 1 : 0}-
              {Math.min(page * limit, totalCount)} of {totalCount} patients
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 py-1 text-xs font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-slate-200 rounded px-2 py-0.5 text-xs bg-white text-slate-700"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
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
            selectedPatient
              ? { id: selectedPatient.id, fullName: selectedPatient.fullName, pid: selectedPatient.pid }
              : null
          }
        />
      )}
      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
          preselectedPatient={
            selectedPatient
              ? { id: selectedPatient.id, fullName: selectedPatient.fullName, pid: selectedPatient.pid }
              : null
          }
        />
      )}
    </>
  );
}
