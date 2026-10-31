'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';

const NewAppointmentModal = dynamic(() => import('../../../components/receptionist/NewAppointmentModal'), { ssr: false });
const CheckInModal = dynamic(() => import('../../../components/receptionist/CheckInModal'), { ssr: false });
import {
  PATIENTS_DIRECTORY_KPIS,
  FULL_PATIENTS_DIRECTORY,
  PatientDirectoryRow,
  PATIENT_NOTES_LIST,
  TODAY_DASHBOARD_APPOINTMENTS,
} from '../../../components/receptionist/receptionistMockData';

export default function ReceptionistPatientsPage() {
  const [filterTab, setFilterTab] = useState<'All' | 'Recent' | 'New' | 'Active' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDirectoryRow>(FULL_PATIENTS_DIRECTORY[0]!);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  const filteredPatients = FULL_PATIENTS_DIRECTORY.filter((p) => {
    const matchesFilter =
      filterTab === 'All' ||
      (filterTab === 'Active' && p.status === 'Active') ||
      (filterTab === 'Inactive' && p.status === 'Inactive') ||
      filterTab === 'Recent' ||
      filterTab === 'New';

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Patients"
            subtitle="Search, view and manage patient information, appointments and medical history."
            icon={Users}
            actionElement={
              <Link
                href="/receptionist/registration"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register New Patient
              </Link>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {PATIENTS_DIRECTORY_KPIS.map((kpi, idx) => (
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
            {/* ─── Search Bar & Filter Controls ─── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients by name, phone number, national ID, or patient ID..."
                  className="w-full pl-9 pr-20 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md absolute right-3 top-1/2 -translate-y-1/2 shadow-2xs">
                  Ctrl + K
                </kbd>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Advanced Search
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Toggle View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ─── Filter Tabs ─── */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'All', label: 'All Patients', count: '1,248' },
                { id: 'Recent', label: 'Recent', count: '50' },
                { id: 'New', label: 'New', count: '142' },
                { id: 'Active', label: 'Active', count: '1,186' },
                { id: 'Inactive', label: 'Inactive', count: '62' },
              ].map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id as any)}
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
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-blue-500/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm truncate">
                    {selectedPatient.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    {selectedPatient.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedPatient.pid} • {selectedPatient.gender} • {selectedPatient.age} yrs
                </div>
                <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{selectedPatient.phone}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{selectedPatient.name.toLowerCase().replace(' ', '')}@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.dob || 'Oct 19, 1998'}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">National ID</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.nationalId || '1-2345-6789-0'}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Blood Group</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.bloodGroup || 'O+'}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Marital Status</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.maritalStatus || 'Single'}</span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-0.5">
                Contact Information
              </div>
              <div className="text-slate-600">
                <span className="text-slate-400">Address: </span>
                <span className="font-semibold text-slate-800">{selectedPatient.address || 'Bole Medhanialem, Addis Ababa'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <div>
                  <span className="text-slate-400">City: </span>
                  <span className="font-semibold text-slate-800">{selectedPatient.city || 'Addis Ababa'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Woreda: </span>
                  <span className="font-semibold text-slate-800">{selectedPatient.woreda || 'Bole'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Kebele: </span>
                  <span className="font-semibold text-slate-800">{selectedPatient.kebele || '01'}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-0.5">
                Emergency Contact
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Name: <span className="font-semibold text-slate-800">{selectedPatient.emergencyName || 'Tadesse Mulu'}</span></span>
                <span className="text-slate-600">Rel: <span className="font-semibold text-slate-800">{selectedPatient.emergencyRel || 'Brother'}</span></span>
              </div>
              <div className="text-slate-600">
                Phone: <span className="font-semibold text-slate-800">{selectedPatient.emergencyPhone || '+251 911 111 222'}</span>
              </div>
            </div>

            {/* Current Visit */}
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1 text-xs">
              <div className="font-bold text-blue-900 text-[10px] uppercase tracking-wider mb-0.5">
                Current Visit
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-slate-700 text-[11px]">
                <div>Visit: <span className="font-bold text-slate-900">{selectedPatient.visitType || 'Follow-up'}</span></div>
                <div>Dept: <span className="font-bold text-slate-900">{selectedPatient.department || 'Internal Medicine'}</span></div>
                <div>Doctor: <span className="font-bold text-blue-700">{selectedPatient.doctor || 'Dr. Tadesse'}</span></div>
                <div>Check-in: <span className="font-medium text-slate-600">{selectedPatient.checkInTime || 'Oct 19, 08:45 AM'}</span></div>
              </div>
            </div>

            {/* Quick Actions (2x3 grid) */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                type="button"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 leading-none">View Records</span>
              </button>

              <button
                type="button"
                onClick={() => setAppointmentModalOpen(true)}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 leading-none">Book Appt</span>
              </button>

              <Link
                href="/receptionist/billing"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 leading-none">Create Bill</span>
              </Link>

              <Link
                href="/receptionist/appointments"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <Clock className="w-3.5 h-3.5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 leading-none">View Appts</span>
              </Link>

              <button
                type="button"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <History className="w-3.5 h-3.5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 leading-none">History</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
              >
                <Tag className="w-3.5 h-3.5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 leading-none">Print Label</span>
              </button>
            </div>
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
                    <th className="pb-3 font-medium">Age</th>
                    <th className="pb-3 font-medium">Gender</th>
                    <th className="pb-3 font-medium">Phone Number</th>
                    <th className="pb-3 font-medium">Last Visit</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => {
                    const isSelected = selectedPatient.pid === patient.pid;
                    return (
                      <tr
                        key={patient.pid}
                        onClick={() => setSelectedPatient(patient)}
                        className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        <td className="py-2.5 font-bold text-slate-500 whitespace-nowrap">
                          {patient.pid}
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={patient.avatar}
                              alt={patient.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                            <span className="font-bold text-slate-800">{patient.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-700">{patient.age}</td>
                        <td className="py-2.5 text-slate-700">{patient.gender}</td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{patient.phone}</td>
                        <td className="py-2.5 text-slate-500 whitespace-nowrap">{patient.lastVisit}</td>
                        <td className="py-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div>Showing 1-10 of 1,248 patients</div>

              <div className="flex items-center gap-1">
                <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs">
                  1
                </button>
                <button className="px-2.5 py-1 rounded hover:bg-slate-100 text-slate-600 text-xs">
                  2
                </button>
                <button className="px-2.5 py-1 rounded hover:bg-slate-100 text-slate-600 text-xs">
                  3
                </button>
                <button className="px-2.5 py-1 rounded hover:bg-slate-100 text-slate-600 text-xs">
                  4
                </button>
                <button className="px-2.5 py-1 rounded hover:bg-slate-100 text-slate-600 text-xs">
                  5
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button className="px-2.5 py-1 rounded hover:bg-slate-100 text-slate-600 text-xs">
                  125
                </button>
                <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <select className="border border-slate-200 rounded px-2 py-0.5 text-xs bg-white text-slate-700">
                  <option>10 / page</option>
                  <option>20 / page</option>
                  <option>50 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── Bottom Split: Recent Appointments & Patient Notes ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Recent Appointments</h3>
                </div>
                <Link
                  href="/receptionist/appointments"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-2 font-medium">Date &amp; Time</th>
                      <th className="pb-2 font-medium">Patient Name</th>
                      <th className="pb-2 font-medium">Doctor</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TODAY_DASHBOARD_APPOINTMENTS.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/70">
                        <td className="py-2 text-slate-400 text-[11px] whitespace-nowrap">
                          Oct 19, {apt.time}
                        </td>
                        <td className="py-2 font-bold text-slate-800 whitespace-nowrap">
                          {apt.patientName}
                        </td>
                        <td className="py-2 text-slate-600 whitespace-nowrap">{apt.doctor}</td>
                        <td className="py-2 text-slate-600">{apt.type}</td>
                        <td className="py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              apt.status === 'Checked In'
                                ? 'bg-emerald-100 text-emerald-700'
                                : apt.status === 'Waiting'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Patient Notes */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Patient Notes</h3>
                </div>
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                  View All
                </span>
              </div>

              <div className="space-y-2.5">
                {PATIENT_NOTES_LIST.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{n.name}</span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {n.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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

