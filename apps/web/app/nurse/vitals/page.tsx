'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Heart,
  Thermometer,
  Wind,
  Phone,
  Mail,
  MapPin,
  Pill,
  FlaskConical,
  FileText,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import NursePageShell from '../../../components/nurse/NursePageShell';
import NurseStatCard from '../../../components/nurse/NurseStatCard';
import RecordVitalsModal from '../../../components/nurse/RecordVitalsModal';
import AdministerMedModal from '../../../components/nurse/AdministerMedModal';
import CollectLabModal from '../../../components/nurse/CollectLabModal';
import AddNoteModal from '../../../components/nurse/AddNoteModal';
import {
  NURSE_PATIENTS,
  VITALS_HISTORY_DATA,
  RECENT_VITALS_READINGS,
  RECENT_NURSE_ALERTS,
  NursePatient,
} from '../../../components/nurse/nurseMockData';

export default function NurseVitalsPage() {
  const [selectedPatient, setSelectedPatient] = useState<NursePatient>(NURSE_PATIENTS[0]!);
  const [activeMetricTab, setActiveMetricTab] = useState<'temp' | 'bp' | 'hr' | 'spo2'>('temp');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [tempInput, setTempInput] = useState('36.8');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [systolicInput, setSystolicInput] = useState('118');
  const [diastolicInput, setDiastolicInput] = useState('76');
  const [hrInput, setHrInput] = useState('72');
  const [spo2Input, setSpo2Input] = useState('98');
  const [noteInput, setNoteInput] = useState('');
  const [isSavedForm, setIsSavedForm] = useState(false);
  const [entryMode, setEntryMode] = useState<'manual' | 'quick'>('manual');

  // Modals state
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Filter patients
  const filteredPatients = NURSE_PATIENTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || p.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || p.vitalsStatus === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedForm(true);
    setTimeout(() => {
      setIsSavedForm(false);
      setNoteInput('');
    }, 1200);
  };

  // ── Top Banner ──────────────────────────────────────────────────────────────
  const banner = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
          <Heart className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Vital Signs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor and record patient vital signs. Track trends and identify abnormal readings early.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
        <div className="text-left text-xs font-semibold text-slate-800">
          <div>Oct 19, 2026</div>
          <div className="text-[10px] text-slate-400 font-normal">Monday</div>
        </div>
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
          <button className="p-1 rounded hover:bg-slate-200 text-slate-500">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-200 text-slate-500">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── 4 KPI Stat Cards ────────────────────────────────────────────────────────
  const kpis = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      <NurseStatCard
        title="Total Patients"
        value={48}
        iconName="users"
        trendText="↑ 12% vs. yesterday"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="blue"
      />
      <NurseStatCard
        title="Vitals Recorded"
        value={42}
        iconName="check"
        trendText="↑ 18% vs. yesterday"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="green"
      />
      <NurseStatCard
        title="Abnormal Readings"
        value={6}
        iconName="alert"
        trendText="↓ 33% vs. yesterday"
        trendDirection="down"
        trendIsPositive={false}
        colorTheme="orange"
      />
      <NurseStatCard
        title="Pending"
        value={6}
        iconName="clock"
        trendText="↑ 20% vs. yesterday"
        trendDirection="up"
        trendIsPositive={false}
        colorTheme="purple"
      />
    </div>
  );

  // ── Right Side Panel ────────────────────────────────────────────────────────
  const rightPanel = (
    <div className="space-y-4">
      {/* 1. Current Patient Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" /> Current Patient
          </h3>
          <Link
            href={`/nurse/patients?pid=${selectedPatient.pid}`}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            View Patient Profile
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <img
            src={selectedPatient.avatar}
            alt={selectedPatient.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/20"
          />
          <div>
            <div className="text-base font-extrabold text-slate-900 leading-tight">
              {selectedPatient.name}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedPatient.pid} • {selectedPatient.age} years • {selectedPatient.gender}
            </div>
            <div className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              Room {selectedPatient.room}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{selectedPatient.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{selectedPatient.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{selectedPatient.address}</span>
          </div>
        </div>
      </div>

      {/* 2. Record Vital Signs Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-600" /> Record Vital Signs
          </h3>
        </div>

        {/* Manual vs Quick tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-3.5">
          <button
            type="button"
            onClick={() => setEntryMode('manual')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              entryMode === 'manual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('quick')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              entryMode === 'quick'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quick Entry
          </button>
        </div>

        <form onSubmit={handleSaveVitals} className="space-y-3.5">
          {/* Temperature */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-blue-500" />
              Temperature ({tempUnit === 'C' ? '°C' : '°F'}) *
            </label>
            <div className="flex gap-1.5">
              <input
                type="number"
                step="0.1"
                required
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
                className="px-2.5 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                °{tempUnit}
              </button>
            </div>
          </div>

          {/* Blood Pressure */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Blood Pressure (mmHg) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  required
                  value={systolicInput}
                  onChange={(e) => setSystolicInput(e.target.value)}
                  placeholder="118"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Systolic</span>
              </div>
              <div>
                <input
                  type="number"
                  required
                  value={diastolicInput}
                  onChange={(e) => setDiastolicInput(e.target.value)}
                  placeholder="76"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Diastolic</span>
              </div>
            </div>
          </div>

          {/* Heart Rate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Heart Rate (bpm) *
            </label>
            <input
              type="number"
              required
              value={hrInput}
              onChange={(e) => setHrInput(e.target.value)}
              placeholder="72"
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Oxygen Saturation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-500" />
              Oxygen Saturation (%) *
            </label>
            <input
              type="number"
              required
              min="50"
              max="100"
              value={spo2Input}
              onChange={(e) => setSpo2Input(e.target.value)}
              placeholder="98"
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Note */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Note (optional)</label>
              <span className="text-[10px] text-slate-400">{noteInput.length}/200</span>
            </div>
            <textarea
              maxLength={200}
              rows={2}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSavedForm}
            className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-md ${
              isSavedForm
                ? 'bg-emerald-600 shadow-emerald-500/30'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
            }`}
          >
            {isSavedForm ? (
              <>
                <Check className="w-4 h-4" />
                Reading Saved!
              </>
            ) : (
              'Save Reading'
            )}
          </button>
        </form>
      </div>

      {/* 3. Quick Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-3.5">
          <span className="text-blue-600">⚡</span> Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVitalsModalOpen(true)}
            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 transition text-left flex items-center gap-2"
          >
            <Heart className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">Record Vitals</span>
          </button>
          <button
            onClick={() => setMedModalOpen(true)}
            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-purple-50 hover:border-purple-200 transition text-left flex items-center gap-2"
          >
            <Pill className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-800">Administer Med</span>
          </button>
          <button
            onClick={() => setLabModalOpen(true)}
            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-teal-50 hover:border-teal-200 transition text-left flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800">Collect Lab Sample</span>
          </button>
          <button
            onClick={() => setNoteModalOpen(true)}
            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 transition text-left flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">Add Patient Note</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <NursePageShell banner={banner} kpis={kpis} rightPanel={rightPanel}>
      <div className="space-y-4">
        {/* Left & Middle Area */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Patients List Table (6 cols) */}
          <div className="xl:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Patients</h3>
              </div>

              {/* Filters Row */}
              <div className="space-y-2 mb-3.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-600 focus:outline-none"
                  >
                    <option value="All">All Departments</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Wound Care">Wound Care</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-600 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Normal">Normal</option>
                    <option value="High BP">High BP</option>
                    <option value="Critical">Critical</option>
                    <option value="Low BP">Low BP</option>
                    <option value="Elevated">Elevated</option>
                  </select>

                  <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-2.5 w-6">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </th>
                      <th className="py-2.5 px-2.5">Patient</th>
                      <th className="py-2.5 px-2.5">Room</th>
                      <th className="py-2.5 px-2.5">Last Vitals</th>
                      <th className="py-2.5 px-2.5">Status</th>
                      <th className="py-2.5 px-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((p) => {
                      const isSelected = selectedPatient.id === p.id;
                      const statusColor =
                        p.vitalsStatus === 'Normal'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : p.vitalsStatus === 'High BP'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : p.vitalsStatus === 'Critical'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : p.vitalsStatus === 'Low BP'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-orange-50 text-orange-600 border-orange-100';

                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedPatient(p)}
                          className={`hover:bg-slate-50/80 transition cursor-pointer ${
                            isSelected ? 'bg-blue-50/40 ring-1 ring-blue-500/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-2.5" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" className="rounded border-slate-300" />
                          </td>
                          <td className="py-2.5 px-2.5">
                            <div className="flex items-center gap-2">
                              <img
                                src={p.avatar}
                                alt={p.name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-800 text-xs">
                                  {p.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {p.pid} • {p.age}y • {p.gender}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-slate-700 text-xs">
                            {p.room}
                          </td>
                          <td className="py-2.5 px-2.5">
                            <div className="text-[11px] font-bold text-slate-800">
                              BP {p.vitals.bp} • HR {p.vitals.hr}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Temp {p.vitals.temp}°C • SpO₂ {p.vitals.spo2}%
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}
                            >
                              {p.vitalsStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 rounded text-slate-400 hover:text-slate-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Showing 1-10 of 48 patients</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-6 h-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </button>
                <button className="w-6 h-6 rounded hover:bg-slate-100 font-medium text-xs flex items-center justify-center">
                  2
                </button>
                <button className="w-6 h-6 rounded hover:bg-slate-100 font-medium text-xs flex items-center justify-center">
                  3
                </button>
                <button className="w-6 h-6 rounded hover:bg-slate-100 font-medium text-xs flex items-center justify-center">
                  4
                </button>
                <button className="w-6 h-6 rounded hover:bg-slate-100 font-medium text-xs flex items-center justify-center">
                  5
                </button>
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column: Vital Signs History, Recent Readings, Recent Alerts (6 cols) */}
          <div className="xl:col-span-6 space-y-4">
            {/* 1. Vital Signs History Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Vital Signs History
                  </h3>
                </div>
                <Link
                  href="/nurse/vitals"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  View Full History
                </Link>
              </div>

              {/* Metric Tabs */}
              <div className="flex gap-2 mb-3.5">
                {[
                  { key: 'temp', label: 'Temperature' },
                  { key: 'bp', label: 'Blood Pressure' },
                  { key: 'hr', label: 'Heart Rate' },
                  { key: 'spo2', label: 'SpO₂' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveMetricTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeMetricTab === tab.key
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Line Chart */}
              <div className="h-52 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={VITALS_HISTORY_DATA}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={activeMetricTab === 'temp' ? [34, 40] : ['auto', 'auto']}
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#FFF',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={
                        activeMetricTab === 'temp'
                          ? 'temperature'
                          : activeMetricTab === 'bp'
                          ? 'bpSystolic'
                          : activeMetricTab === 'hr'
                          ? 'heartRate'
                          : 'spo2'
                      }
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                      activeDot={{ r: 6, fill: '#1D4ED8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Recent Readings Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
              <h3 className="text-base font-extrabold text-slate-900 mb-3.5">
                Recent Readings
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2 px-2.5">Date & Time</th>
                      <th className="py-2 px-2.5">BP (mmHg)</th>
                      <th className="py-2 px-2.5">HR (bpm)</th>
                      <th className="py-2 px-2.5">Temp (°C)</th>
                      <th className="py-2 px-2.5">SpO₂ (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RECENT_VITALS_READINGS.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-2.5 font-semibold text-slate-700">
                          {r.dateTime}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">{r.bp}</td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">{r.hr}</td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">{r.temp}</td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">{r.spo2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Recent Alerts */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Recent Alerts
                </h3>
                <Link
                  href="/nurse/vitals"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {RECENT_NURSE_ALERTS.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          a.severity === 'High'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {a.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {a.patientName} • {a.details}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        a.severity === 'High'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
      <AdministerMedModal
        isOpen={medModalOpen}
        onClose={() => setMedModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
      <CollectLabModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
      <AddNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
    </NursePageShell>
  );
}
