'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  User,
  Users,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileText,
  X,
  Check,
  Barcode,
  History,
  Building2,
  FlaskConical,
  TestTube2,
  BarChart2,
  ClipboardList,
  Sparkles,
  Camera,
  Activity,
  HeartPulse,
} from 'lucide-react';
import {
  PRIMARY_PATIENT,
  ALL_MOCK_PATIENTS,
  PatientRecord,
  PatientOrderedTest,
} from '../../../components/lab/patientLookupMockData';

type ActiveTab = 'ordered' | 'results' | 'history' | 'specimen';

export default function LabPatientLookupPage() {
  const [patient, setPatient] = useState<PatientRecord>(PRIMARY_PATIENT);
  const [searchQuery, setSearchQuery] = useState('Aster Mulu');
  const [searchBy, setSearchBy] = useState('Name');
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState('All Statuses');
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');
  const [activeTab, setActiveTab] = useState<ActiveTab>('ordered');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewingTestResult, setViewingTestResult] = useState<PatientOrderedTest | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    const found = ALL_MOCK_PATIENTS.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
    if (found) {
      setPatient(found);
      showToast(`Loaded records for ${found.name}.`);
    } else {
      showToast('No patient found with that query. Showing Aster Mulu.');
      setPatient(PRIMARY_PATIENT);
    }
  };

  // Status badge helper for ordered tests
  const renderStatusBadge = (testStatus: PatientOrderedTest['status']) => {
    switch (testStatus) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            Processing
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4 bg-[#F4F7FB]">
      {/* 1. Page Header matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle with User Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <User className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Patient Lookup
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Find patient records, view ordered tests, and access laboratory information.
            </p>
          </div>
        </div>

        {/* Date Selector & + New Patient Search */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">{calendarDate}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Tuesday</div>
            </div>
            <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setCalendarDate('Oct 18, 2026')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCalendarDate('Oct 20, 2026')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Patient Search</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar matching screenshot */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by patient name, ID, phone number, or sample ID..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition shrink-0 active:scale-[0.98]"
        >
          Search
        </button>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
            <span>Search By</span>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="Name">Name</option>
              <option value="Patient ID">Patient ID</option>
              <option value="Phone Number">Phone Number</option>
              <option value="Sample ID">Sample ID</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
            <span>Department</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              <option value="Hematology">Hematology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Immunology">Immunology</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Discharged">Discharged</option>
              <option value="Outpatient">Outpatient</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Three-Column Main Body matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ================= LEFT COLUMN (Patient Identity & Visit) ================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Patient Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-16 h-16 rounded-full object-cover ring-3 ring-blue-500/20 shrink-0"
                />
                <button
                  onClick={() => showToast('Update patient photo')}
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs hover:bg-blue-700 transition"
                  title="Photo"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-slate-800 leading-snug truncate">
                  {patient.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-500">{patient.patientId}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {patient.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium">{patient.gender}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium">{patient.dob}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium">{patient.address}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Current Visit */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Current Visit</span>
            </div>

            <div className="pt-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Visit ID</span>
                <span className="font-bold text-slate-800">{patient.currentVisit.visitId}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-semibold text-slate-700">{patient.currentVisit.department}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Admitted</span>
                <span className="font-semibold text-slate-700">{patient.currentVisit.admitted}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Room</span>
                <span className="font-semibold text-slate-800">{patient.currentVisit.room}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Attending Doctor</span>
                <span className="font-semibold text-slate-800">{patient.currentVisit.attendingDoctor}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Patient Details */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Patient Details</span>
            </div>

            <div className="pt-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-800">{patient.dob}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Gender</span>
                <span className="font-semibold text-slate-700">{patient.gender}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Phone</span>
                <span className="font-semibold text-slate-700">{patient.phone}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Address</span>
                <span className="font-semibold text-slate-700">{patient.address}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Blood Group</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {patient.bloodGroup}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Emergency Contact</span>
                <span className="font-semibold text-slate-700 text-right">{patient.emergencyContact}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-medium">Allergies</span>
                <span className="font-semibold text-slate-700">{patient.allergies}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CENTER COLUMN (Stats, Tabs, Ordered Tests) ================= */}
        <div className="lg:col-span-6 space-y-4">
          {/* 4 Stat KPI Cards - Compact & displayed at one row without icons */}
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5 xl:gap-3">
            {/* Total Tests Ordered */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Total Tests Ordered</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-1">
                  {patient.stats.totalTests}
                </div>
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-1">This visit</div>
            </div>

            {/* Completed */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Completed</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-1">
                  {patient.stats.completed}
                </div>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-1">{patient.stats.completedPct}</div>
            </div>

            {/* Pending */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Pending</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-1">
                  {patient.stats.pending}
                </div>
              </div>
              <div className="text-[10px] font-bold text-amber-500 mt-1">{patient.stats.pendingChange}</div>
            </div>

            {/* Abnormal */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Abnormal</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-1">
                  {patient.stats.abnormal}
                </div>
              </div>
              <div className="text-[10px] font-bold text-rose-500 mt-1">{patient.stats.abnormalChange}</div>
            </div>
          </div>

          {/* Navigation Tabs matching screenshot */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('ordered')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                activeTab === 'ordered'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ordered Tests</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Test Results</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Lab History</span>
            </button>

            <button
              onClick={() => setActiveTab('specimen')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'specimen'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <TestTube2 className="w-3.5 h-3.5" />
              <span>Specimen Details</span>
            </button>
          </div>

          {/* Tests Ordered for This Patient Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Table Header Bar */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                Tests Ordered for This Patient
              </h2>
              <button
                onClick={() => showToast('Displaying full test history...')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Test Name</th>
                    <th className="py-3 px-3">Sample Type</th>
                    <th className="py-3 px-3">Ordered Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {patient.orderedTests.map((test) => (
                    <tr key={test.num} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-bold">
                        {test.num}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {test.testName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {test.sampleType}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                        <div>{test.orderedDate.split(' ').slice(0, 3).join(' ')}</div>
                        <div className="text-[10px] text-slate-400">
                          {test.orderedDate.split(' ').slice(3).join(' ')}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderStatusBadge(test.status)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {test.hasResult ? (
                          <button
                            onClick={() => setViewingTestResult(test)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (Quick Actions, History, Help) ================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Quick Actions (2x3 Grid matching screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Quick Actions</span>
            </div>

            <div className="pt-3.5 grid grid-cols-3 gap-2.5">
              {/* 1. View Patient Record */}
              <button
                onClick={() => showToast(`Opening record for ${patient.name}...`)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <User className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  View Patient Record
                </span>
              </button>

              {/* 2. View Test Orders */}
              <button
                onClick={() => showToast(`Opening orders for ${patient.name}...`)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <ClipboardList className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  View Test Orders
                </span>
              </button>

              {/* 3. Add Test Result */}
              <button
                onClick={() => showToast('Opening test result entry form...')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <FlaskConical className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Add Test Result
                </span>
              </button>

              {/* 4. Print Report */}
              <button
                onClick={() => showToast(`Printing comprehensive lab report for ${patient.name}...`)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <Printer className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Print Report
                </span>
              </button>

              {/* 5. Print Label */}
              <button
                onClick={() => showToast(`Printing specimen barcode label for ${patient.patientId}...`)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <Barcode className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Print Label
                </span>
              </button>

              {/* 6. Check History */}
              <button
                onClick={() => showToast(`Checking historical laboratory records for ${patient.name}...`)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <History className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Check History
                </span>
              </button>
            </div>
          </div>

          {/* Card 2: Recent Patient Tests */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Recent Patient Tests</span>
              </div>
              <button
                onClick={() => showToast('Viewing all recent tests...')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="pt-3.5 space-y-3">
              {patient.recentTests.map((item, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs">
                  {item.status === 'Completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {item.status} • {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Lab History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Lab History</span>
              </div>
              <button
                onClick={() => showToast('Opening historical trends...')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="pt-3.5 space-y-2.5 text-xs">
              {patient.history.map((hist, index) => (
                <div key={index} className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 font-medium">{hist.date}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{hist.testName} -</span>
                    <span
                      className={`font-bold ${
                        hist.isAbnormal ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {hist.resultStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Need to verify a sample? (Help Box) */}
          <div className="rounded-2xl p-4.5 bg-gradient-to-br from-sky-50 to-blue-50/60 border border-sky-100 flex items-start gap-3.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <FlaskConical className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Need to verify a sample?</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                Use the sample barcode or patient ID to find related test orders and results quickly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Test Result Modal */}
      {viewingTestResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">{viewingTestResult.testName}</h3>
              </div>
              <button
                onClick={() => setViewingTestResult(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60">
                <div className="font-bold text-blue-900">{patient.name} ({patient.patientId})</div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  Ordered: {viewingTestResult.orderedDate} • Sample: {viewingTestResult.sampleType}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Result Summary</span>
                <div className="p-3 mt-1 rounded-xl bg-slate-50 border border-slate-200/80 font-semibold text-slate-800">
                  {viewingTestResult.resultSummary || 'Normal findings recorded.'}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => setViewingTestResult(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewingTestResult(null);
                  showToast(`Printed result report for ${viewingTestResult.testName}`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Patient Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Select Patient</h3>
              </div>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {ALL_MOCK_PATIENTS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setPatient(p);
                    setSearchQuery(p.name);
                    setIsSearchModalOpen(false);
                    showToast(`Selected ${p.name}`);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.patientId} • {p.gender} • {p.age} yrs
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 hover:underline">Select</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

