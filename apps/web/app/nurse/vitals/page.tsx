'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Scale,
  Ruler,
  Clock,
  RefreshCw,
  Users,
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
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchPatients } from '../../../lib/api/patients';
import { fetchPatientVitals, recordVitals } from '../../../lib/api/clinical';
import type { VitalReadingDTO, PatientDTO } from '@mcms/contracts';

interface FormattedPatientItem {
  id: string;
  pid: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male';
  avatar: string;
  phone: string;
  email: string;
  address: string;
  room: string;
  bed: string;
  department: string;
  status: string;
  vitalsStatus: string;
}

export default function NurseVitalsPage() {
  const { accessToken } = useAuth();

  // Patient state - live from API
  const [patients, setPatients] = useState<FormattedPatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<FormattedPatientItem | null>(null);
  const [liveVitals, setLiveVitals] = useState<VitalReadingDTO[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingVitals, setIsLoadingVitals] = useState(false);

  const [activeMetricTab, setActiveMetricTab] = useState<'temp' | 'bp' | 'hr' | 'spo2'>('temp');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [tempInput, setTempInput] = useState('36.8');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [systolicInput, setSystolicInput] = useState('118');
  const [diastolicInput, setDiastolicInput] = useState('76');
  const [hrInput, setHrInput] = useState('72');
  const [spo2Input, setSpo2Input] = useState('98');
  const [rrInput, setRrInput] = useState('16');
  const [weightInput, setWeightInput] = useState('70');
  const [heightInput, setHeightInput] = useState('175');
  const [complaintsInput, setComplaintsInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const [isSavedForm, setIsSavedForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modals state
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Auto-calculated BMI
  const calculatedBmi = useMemo(() => {
    const w = parseFloat(weightInput);
    const h = parseFloat(heightInput) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return null;
  }, [weightInput, heightInput]);

  // Load live patients
  const loadPatients = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingPatients(true);
    try {
      const res = await fetchPatients(accessToken, { limit: 100 });
      if (res.data.length > 0) {
        const mapped: FormattedPatientItem[] = res.data.map((p, idx) => ({
          id: p.id,
          pid: p.pid,
          name: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
          age: p.dateOfBirth
            ? Math.max(0, new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear())
            : 30,
          gender: p.gender === 'MALE' ? 'Male' : 'Female',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.firstName)}`,
          phone: p.phoneNumber || '—',
          email: p.email || '—',
          address: p.address || 'Addis Ababa, Ethiopia',
          room: `Room ${Math.floor(idx / 3) + 1}A`,
          bed: `Bed ${(idx % 4) + 1}`,
          department: 'Outpatient Triage',
          status: p.status === 'ACTIVE' ? 'In Care' : 'Completed',
          vitalsStatus: 'Normal',
        }));
        setPatients(mapped);
        if (!selectedPatient && mapped[0]) {
          setSelectedPatient(mapped[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load patients for vitals:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  }, [accessToken, selectedPatient]);

  // Load vitals for selected patient
  const loadVitals = useCallback(
    async (patientId: string) => {
      if (!accessToken || !patientId) return;
      setIsLoadingVitals(true);
      try {
        const v = await fetchPatientVitals(patientId, accessToken, 30);
        setLiveVitals(v);
      } catch (err) {
        console.error('Failed to load vitals:', err);
      } finally {
        setIsLoadingVitals(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (selectedPatient?.id) {
      void loadVitals(selectedPatient.id);
    }
  }, [selectedPatient, loadVitals]);

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.pid.toLowerCase().includes(q) ||
      p.room.toLowerCase().includes(q)
    );
  });

  // Chart data from real vitals
  const chartData = useMemo(() => {
    if (liveVitals.length === 0) return [];
    // Sort chronological
    const sorted = [...liveVitals].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );
    return sorted.map((v) => {
      const d = new Date(v.recordedAt);
      const timeStr = `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      return {
        time: timeStr,
        temp: v.temperature,
        systolic: v.systolicBp,
        diastolic: v.diastolicBp,
        hr: v.heartRate,
        spo2: v.spo2,
      };
    });
  }, [liveVitals]);

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedPatient) return;

    const sys = parseInt(systolicInput, 10);
    const dia = parseInt(diastolicInput, 10);
    const hr = parseInt(hrInput, 10);
    const ox = parseFloat(spo2Input);
    const parsedTemp = parseFloat(tempInput);
    const tempCelsius =
      tempUnit === 'F' ? Math.round((parsedTemp - 32) * (5 / 9) * 10) / 10 : parsedTemp;

    if (isNaN(sys) || sys < 50 || sys > 260 || isNaN(dia) || dia < 30 || dia > 160) {
      setFormError('Please enter valid blood pressure readings.');
      return;
    }
    if (isNaN(hr) || hr < 30 || hr > 240) {
      setFormError('Please enter a valid pulse / heart rate (30-240 bpm).');
      return;
    }
    if (isNaN(tempCelsius) || tempCelsius < 30 || tempCelsius > 45) {
      setFormError('Please enter a valid body temperature.');
      return;
    }
    if (isNaN(ox) || ox < 50 || ox > 100) {
      setFormError('Please enter a valid oxygen saturation (50-100%).');
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      const combinedNotes = [
        complaintsInput.trim() ? `Complaints: ${complaintsInput.trim()}` : '',
        weightInput ? `Weight: ${weightInput} kg` : '',
        heightInput ? `Height: ${heightInput} cm` : '',
        calculatedBmi ? `BMI: ${calculatedBmi}` : '',
        noteInput.trim() ? `Notes: ${noteInput.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      await recordVitals(
        {
          patientId: selectedPatient.id,
          temperature: tempCelsius,
          systolicBp: sys,
          diastolicBp: dia,
          heartRate: hr,
          spo2: ox,
          respiratoryRate: parseInt(rrInput, 10) || 16,
          ...(combinedNotes ? { notes: combinedNotes } : {}),
        },
        accessToken,
      );

      setIsSavedForm(true);
      void loadVitals(selectedPatient.id);

      setTimeout(() => {
        setIsSavedForm(false);
        setComplaintsInput('');
        setNoteInput('');
      }, 1500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save vital signs.');
    } finally {
      setIsSaving(false);
    }
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
            Patient Triage & Vital Signs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor and record patient vital signs. Track trends, anthropometric measurements, and detect abnormal readings.
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          void loadPatients();
          if (selectedPatient) void loadVitals(selectedPatient.id);
        }}
        disabled={isLoadingPatients || isLoadingVitals}
        className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs transition self-start sm:self-auto disabled:opacity-50"
      >
        <RefreshCw size={14} className={`text-blue-600 ${isLoadingPatients || isLoadingVitals ? 'animate-spin' : ''}`} />
        <span>Refresh Vitals</span>
      </button>
    </div>
  );

  // ── 4 KPI Stat Cards ────────────────────────────────────────────────────────
  const kpis = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      <NurseStatCard
        title="Patients Monitored"
        value={isLoadingPatients ? '—' : patients.length}
        iconName="users"
        trendText="Registered Patients"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="blue"
      />
      <NurseStatCard
        title="Total Readings"
        value={isLoadingVitals ? '—' : liveVitals.length}
        iconName="check"
        trendText={selectedPatient ? `For ${selectedPatient.name.split(' ')[0]}` : 'Recorded'}
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="green"
      />
      <NurseStatCard
        title="Abnormal Readings"
        value={liveVitals.filter((v) => v.condition === 'CRITICAL' || v.condition === 'HIGH_BP').length}
        iconName="alert"
        trendText="Clinical Alerts"
        trendDirection="down"
        trendIsPositive={false}
        colorTheme="orange"
      />
      <NurseStatCard
        title="Normal Range"
        value={liveVitals.filter((v) => v.condition === 'NORMAL').length}
        iconName="clock"
        trendText="Within Standard Limits"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="purple"
      />
    </div>
  );

  // ── Right Side Panel ────────────────────────────────────────────────────────
  const rightPanel = selectedPatient ? (
    <div className="space-y-4">
      {/* 1. Current Patient Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" /> Current Patient
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            {selectedPatient.status}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <img
            src={selectedPatient.avatar}
            alt={selectedPatient.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
          />
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">
              {selectedPatient.name}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5 font-mono">
              {selectedPatient.pid} • {selectedPatient.age}y • {selectedPatient.gender}
            </div>
            <div className="text-[11px] font-semibold text-blue-600 mt-0.5">
              {selectedPatient.room} • {selectedPatient.bed}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{selectedPatient.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{selectedPatient.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{selectedPatient.address}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setVitalsModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1"
          >
            <Heart size={12} />
            <span>Triage Modal</span>
          </button>
          <button
            onClick={() => setMedModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1"
          >
            <Pill size={12} className="text-purple-600" />
            <span>Give Med</span>
          </button>
        </div>
      </div>

      {/* 2. Recent Clinical Readings List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
          <span>Recent Readings</span>
          <span className="text-[10px] text-slate-400 font-normal">{liveVitals.length} total</span>
        </h3>

        {liveVitals.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No readings recorded for this patient yet. Use the form to record initial vitals.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {liveVitals.slice(0, 5).map((v) => (
              <div
                key={v.id}
                className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {v.systolicBp}/{v.diastolicBp} mmHg • {v.heartRate} bpm
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.condition === 'CRITICAL'
                        ? 'bg-red-100 text-red-700'
                        : v.condition === 'HIGH_BP'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {v.condition}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {v.temperature}°C • SpO2: {v.spo2}%
                  </span>
                  <span>{new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {v.notes && (
                  <p className="text-[10px] text-slate-600 italic bg-white p-1 rounded border border-slate-100">
                    {v.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-200">
      Select a patient to inspect triage records.
    </div>
  );

  return (
    <>
      <NursePageShell banner={banner} kpis={kpis} rightPanel={rightPanel}>
        <div className="space-y-5">
          {/* Patient Selector Row */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search patient to triage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border-none focus:outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Active Patient:</span>
              <select
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const p = patients.find((item) => item.id === e.target.value);
                  if (p) setSelectedPatient(p);
                }}
                className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                {filteredPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.pid})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vitals Trend Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Vital Signs Historical Trends
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedPatient ? `Monitoring chart for ${selectedPatient.name}` : 'Select a patient'}
                </p>
              </div>

              {/* Metric Selector Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveMetricTab('temp')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeMetricTab === 'temp'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Temperature
                </button>
                <button
                  onClick={() => setActiveMetricTab('bp')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeMetricTab === 'bp'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Blood Pressure
                </button>
                <button
                  onClick={() => setActiveMetricTab('hr')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeMetricTab === 'hr'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Heart Rate
                </button>
                <button
                  onClick={() => setActiveMetricTab('spo2')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeMetricTab === 'spo2'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  SpO2
                </button>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="h-64 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 gap-2 border border-dashed border-slate-200 rounded-xl">
                  <Activity className="w-8 h-8 text-slate-300" />
                  <span>No vital readings on record for this patient yet.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    />
                    {activeMetricTab === 'temp' && (
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#F59E0B"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#F59E0B' }}
                        name="Temp (°C)"
                      />
                    )}
                    {activeMetricTab === 'bp' && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="systolic"
                          stroke="#1E40AF"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#1E40AF' }}
                          name="Systolic (mmHg)"
                        />
                        <Line
                          type="monotone"
                          dataKey="diastolic"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#3B82F6' }}
                          name="Diastolic (mmHg)"
                        />
                      </>
                    )}
                    {activeMetricTab === 'hr' && (
                      <Line
                        type="monotone"
                        dataKey="hr"
                        stroke="#EF4444"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#EF4444' }}
                        name="Heart Rate (bpm)"
                      />
                    )}
                    {activeMetricTab === 'spo2' && (
                      <Line
                        type="monotone"
                        dataKey="spo2"
                        stroke="#06B6D4"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#06B6D4' }}
                        name="SpO2 (%)"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Vital Entry & Triage Form */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Record New Triage & Vitals
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedPatient ? `Submitting for ${selectedPatient.name}` : 'Select a patient'}
                  </p>
                </div>
              </div>

              {calculatedBmi && (
                <div className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">
                  Calculated BMI: {calculatedBmi} kg/m²
                </div>
              )}
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveVitals} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Systolic BP */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Systolic BP (mmHg) *
                  </label>
                  <input
                    type="number"
                    value={systolicInput}
                    onChange={(e) => setSystolicInput(e.target.value)}
                    placeholder="120"
                    required
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Diastolic BP */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Diastolic BP (mmHg) *
                  </label>
                  <input
                    type="number"
                    value={diastolicInput}
                    onChange={(e) => setDiastolicInput(e.target.value)}
                    placeholder="80"
                    required
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Pulse / HR */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Heart Rate (bpm) *
                  </label>
                  <input
                    type="number"
                    value={hrInput}
                    onChange={(e) => setHrInput(e.target.value)}
                    placeholder="72"
                    required
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Temperature (°C) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    placeholder="36.8"
                    required
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* SpO2 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    SpO2 Saturation (%) *
                  </label>
                  <input
                    type="number"
                    value={spo2Input}
                    onChange={(e) => setSpo2Input(e.target.value)}
                    placeholder="98"
                    required
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Respiratory Rate */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Respiratory Rate (bpm) *
                  </label>
                  <input
                    type="number"
                    value={rrInput}
                    onChange={(e) => setRrInput(e.target.value)}
                    placeholder="16"
                    required
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="70"
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    placeholder="175"
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Complaints & Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Chief Complaints
                  </label>
                  <input
                    type="text"
                    value={complaintsInput}
                    onChange={(e) => setComplaintsInput(e.target.value)}
                    placeholder="e.g. Mild headache, chest tightness..."
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nurse Notes & Observations
                  </label>
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="e.g. Alert, oriented x3, resting comfortably..."
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving || isSavedForm}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-md shadow-blue-500/20 ${
                    isSavedForm
                      ? 'bg-emerald-600'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Recording Vitals...</span>
                    </>
                  ) : isSavedForm ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Vitals Recorded Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Save Patient Vitals</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </NursePageShell>

      {/* Modals */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
        onSave={() => {
          if (selectedPatient) void loadVitals(selectedPatient.id);
        }}
      />
      <AdministerMedModal
        isOpen={medModalOpen}
        onClose={() => setMedModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
      />
      <CollectLabModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
      />
      <AddNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
      />
    </>
  );
}
