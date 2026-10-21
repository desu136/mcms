'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit2,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Pill,
  FlaskConical,
  FileText,
  Shield,
  Heart,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import {
  INITIAL_PATIENTS,
  PatientItem,
} from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPatientModal from '../../../components/doctor/DoctorPatientModal';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';

export default function DoctorPatientsPage() {
  const [patientsList, setPatientsList] = useState<PatientItem[]>(INITIAL_PATIENTS);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedGender, setSelectedGender] = useState('All Genders');
  const [selectedVisitType, setSelectedVisitType] = useState('All Visit Types');
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Active highlighted patient for right panel
  const [highlightedPatient, setHighlightedPatient] = useState<PatientItem>(INITIAL_PATIENTS[0]!);
  const [rightPanelTab, setRightPanelTab] = useState<'overview' | 'medical' | 'appointments'>('overview');

  // Modals & Drawers
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  // Filtered patients
  const filteredPatients = patientsList.filter((p) => {
    if (activeTab === 'active' && p.status !== 'Active') return false;
    if (activeTab === 'inactive' && p.status !== 'Inactive') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.pid.toLowerCase().includes(q) ||
        p.phone.includes(q);
      if (!match) return false;
    }

    if (selectedDepartment !== 'All Departments' && p.department !== selectedDepartment) {
      return false;
    }
    if (selectedGender !== 'All Genders' && p.gender !== selectedGender) {
      return false;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedPatientIds.length === filteredPatients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(filteredPatients.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePatientAdded = (newP: PatientItem) => {
    setPatientsList([newP, ...patientsList]);
    setHighlightedPatient(newP);
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Header & Add Patient Button ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Patients
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              View and manage your patients information, medical history and care details.
            </p>
          </div>
        </div>

        {/* Action + Date */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setAddPatientModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Patient</span>
          </button>

          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">Oct 19, 2026</div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">Monday</div>
            </div>
            <div className="flex items-center gap-0.5 ml-2 border-l border-slate-200 pl-2 text-slate-400">
              <button className="p-0.5 rounded hover:bg-slate-100">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-0.5 rounded hover:bg-slate-100">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 Patients KPI Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-500">Total Patients</div>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">248</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>12% vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-500">Active Patients</div>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">232</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>10% vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-500">New Patients</div>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">18</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>5% vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-500">Inactive Patients</div>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">16</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>3% vs. last month</span>
          </div>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter Tabs, Multi-Filter Bar, Table & Pagination (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Patients (248)' },
              { id: 'active', label: 'Active (232)' },
              { id: 'inactive', label: 'Inactive (16)' },
              { id: 'recent', label: 'Recent (10)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Multi-Dropdown Filter Bar (Matching screenshot) */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or patient ID..."
                className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Department Dropdown */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs font-medium text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
            >
              <option value="All Departments">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Nursing">Nursing</option>
            </select>

            {/* Gender Dropdown */}
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="text-xs font-medium text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
            >
              <option value="All Genders">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>

            {/* Visit Type Dropdown */}
            <select
              value={selectedVisitType}
              onChange={(e) => setSelectedVisitType(e.target.value)}
              className="text-xs font-medium text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
            >
              <option value="All Visit Types">All Visit Types</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Consultation">Consultation</option>
              <option value="New Patient">New Patient</option>
            </select>

            {/* Filter Action Button */}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>
          </div>

          {/* Patients Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedPatientIds.length === filteredPatients.length &&
                          filteredPatients.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Patient ID</th>
                    <th className="py-3 px-4">Age / Gender</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Last Visit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPatients.map((patient) => {
                    const isChecked = selectedPatientIds.includes(patient.id);
                    const isHighlighted = highlightedPatient.id === patient.id;

                    return (
                      <tr
                        key={patient.id}
                        onClick={() => setHighlightedPatient(patient)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isHighlighted ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectOne(patient.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={patient.avatar}
                              alt={patient.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                {patient.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {patient.pid}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-500 text-[11px]">
                          {patient.pid}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {patient.age} / {patient.gender}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {patient.phone}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          <div className="font-semibold text-slate-700">{patient.lastVisit}</div>
                          <div className="text-[10px] text-slate-400">{patient.lastVisitReason}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              patient.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setHighlightedPatient(patient);
                                setDrawerOpen(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                              title="View Patient Record"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setHighlightedPatient(patient);
                                setDrawerOpen(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                              title="Edit Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded text-slate-400 hover:text-slate-600"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Matching screenshot) */}
            <div className="p-4 px-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-700">1-10</span> of{' '}
                <span className="font-bold text-slate-700">248</span> patients
              </div>

              <div className="flex items-center gap-1">
                <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  1
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  2
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  3
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  4
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  5
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  25
                </button>
                <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs font-semibold text-slate-700 focus:outline-none">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Selected Patient Details & History Panel (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient Details Card (Matching screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Patient Details</h3>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>

            {/* Profile Avatar & Demographics */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <img
                src={highlightedPatient.avatar}
                alt={highlightedPatient.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-2xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-slate-800 truncate">
                    {highlightedPatient.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                    ● Active
                  </span>
                </div>
                <div className="text-xs text-blue-600 font-semibold mb-1">
                  {highlightedPatient.pid}
                </div>
                <div className="text-xs text-slate-500">
                  {highlightedPatient.age} years / {highlightedPatient.gender}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{highlightedPatient.phone}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{highlightedPatient.email}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{highlightedPatient.address}</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs (Overview, Medical History, Appointments) */}
            <div className="flex items-center gap-2 my-4 p-1 rounded-xl bg-slate-100/70 border border-slate-200/50">
              {(['overview', 'medical', 'appointments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightPanelTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                    rightPanelTab === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'overview'
                    ? 'Overview'
                    : tab === 'medical'
                    ? 'Medical History'
                    : 'Appointments'}
                </button>
              ))}
            </div>

            {/* Sub-tab content */}
            {rightPanelTab === 'overview' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Total Visits</div>
                    <div className="text-lg font-extrabold text-slate-800">
                      {highlightedPatient.totalVisits}
                    </div>
                  </div>
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Last Visit</div>
                    <div className="text-xs font-bold text-slate-800">
                      {highlightedPatient.lastVisit}
                    </div>
                    <div className="text-[10px] text-slate-500">{highlightedPatient.department}</div>
                  </div>
                  <CalendarDays className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Next Appointment</div>
                    <div className="text-xs font-bold text-slate-800">
                      {highlightedPatient.nextAppointment || 'None Scheduled'}
                    </div>
                  </div>
                  <CalendarDays className="w-5 h-5 text-cyan-500" />
                </div>
              </div>
            )}

            {rightPanelTab === 'medical' && (
              <div className="space-y-2">
                {highlightedPatient.conditions.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{c.title}</div>
                      <div className="text-[10px] text-slate-400">Diagnosed: {c.diagnosedDate}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {rightPanelTab === 'appointments' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
                  <div className="font-bold text-blue-900">Upcoming Cardiology Consultation</div>
                  <div className="text-slate-600 mt-0.5">
                    {highlightedPatient.nextAppointment || 'Oct 25, 2026 - 09:00 AM'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions (Patients Card) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => alert(`Scheduling appointment for ${highlightedPatient.name}`)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-center transition-all group"
              >
                <CalendarDays className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">New Appointment</div>
              </button>
              <button
                onClick={() => setPrescriptionModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-center transition-all group"
              >
                <Pill className="w-5 h-5 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Add Prescription</div>
              </button>
              <button
                onClick={() => setLabModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 text-center transition-all group"
              >
                <FlaskConical className="w-5 h-5 text-orange-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Order Lab Test</div>
              </button>
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-center transition-all group"
              >
                <FileText className="w-5 h-5 text-cyan-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">View Records</div>
              </button>
            </div>
          </div>

          {/* Recent Medical History Card (Matching screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Recent Medical History</h3>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  title: 'Hypertension',
                  diagnosed: '2023-06-12',
                  status: 'Active',
                  color: 'orange',
                  icon: Shield,
                },
                {
                  title: 'Type 2 Diabetes',
                  diagnosed: '2022-11-03',
                  status: 'Active',
                  color: 'blue',
                  icon: Pill,
                },
                {
                  title: 'High Cholesterol',
                  diagnosed: '2023-08-14',
                  status: 'Active',
                  color: 'rose',
                  icon: Heart,
                },
                {
                  title: 'Allergy (Penicillin)',
                  diagnosed: '2021-04-20',
                  status: 'Resolved',
                  color: 'cyan',
                  icon: Shield,
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 flex items-center justify-between transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.color === 'orange'
                            ? 'bg-orange-100 text-orange-600'
                            : item.color === 'blue'
                            ? 'bg-blue-100 text-blue-600'
                            : item.color === 'rose'
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-cyan-100 text-cyan-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.title}</div>
                        <div className="text-[10px] text-slate-400">Diagnosed: {item.diagnosed}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Full Medical History</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Patient Drawer */}
      <DoctorPatientDrawer
        patient={highlightedPatient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />

      {/* Modals */}
      <DoctorPatientModal
        isOpen={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        defaultPatientId={highlightedPatient.id}
      />

      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={highlightedPatient.id}
      />
    </div>
  );
}
