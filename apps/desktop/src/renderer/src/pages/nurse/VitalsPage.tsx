import React, { useState } from 'react';
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
import { NursePageShell } from '../../components/nurse/NursePageShell';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import RecordVitalsModal from '../../components/nurse/RecordVitalsModal';
import AdministerMedModal from '../../components/nurse/AdministerMedModal';
import CollectLabModal from '../../components/nurse/CollectLabModal';
import AddNoteModal from '../../components/nurse/AddNoteModal';
import {
  NURSE_PATIENTS,
  VITALS_HISTORY_DATA,
  RECENT_VITALS_READINGS,
  RECENT_NURSE_ALERTS,
  CURRENT_NURSE,
  NursePatient,
} from '../../components/nurse/nurseMockData';

export function VitalsPage() {
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
  const [rrInput, setRrInput] = useState('16');
  const [spo2Input, setSpo2Input] = useState('98');
  const [painLevel, setPainLevel] = useState<number>(1);
  const [notesInput, setNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Modals
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }, 400);
  };

  const filteredPatients = NURSE_PATIENTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || p.department.includes(departmentFilter);
    const matchesStatus = statusFilter === 'All' || p.vitalsStatus === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <Activity size={18} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Vitals Triage & Monitoring</h1>
          <p className="text-xs text-gray-400 mt-0.5">Observe, measure and record live ward biometric trends</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="bg-white border border-gray-200/80 rounded-lg px-2.5 py-1 text-xs text-gray-600 flex items-center gap-1.5 shadow-xs">
          <Calendar size={13} className="text-blue-600" />
          <span className="font-medium text-[11px]">Ward 3A · Cardiology</span>
        </div>
        <button
          onClick={() => setVitalsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Activity size={13} />
          <span>New Reading</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      <NurseStatCard
        title="Patients Observed"
        value={18}
        iconName="users"
        trendText="100% of shift target"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="blue"
      />
      <NurseStatCard
        title="Normal Readings"
        value={15}
        iconName="check"
        trendText="83% within range"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="green"
      />
      <NurseStatCard
        title="Elevated Attention"
        value={3}
        iconName="alert"
        trendText="Requires recheck in 2h"
        trendDirection="up"
        trendIsPositive={false}
        colorTheme="orange"
      />
      <NurseStatCard
        title="Critical Alerts"
        value={1}
        iconName="heart"
        trendText="Dr. Fitsum notified"
        trendDirection="down"
        trendIsPositive={false}
        colorTheme="red"
      />
    </div>
  );

  const rightPanelContent = (
    <div className="space-y-3">
      {/* Patient Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Selected Patient</span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Room {selectedPatient.room} · Bed {selectedPatient.bed}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={selectedPatient.avatar}
            alt={selectedPatient.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-gray-900 truncate leading-tight">{selectedPatient.name}</h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedPatient.pid}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {selectedPatient.age}y · {selectedPatient.gender} · {selectedPatient.department}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-gray-400" />
            <span className="text-[11px]">{selectedPatient.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-gray-400" />
            <span className="text-[11px] truncate">{selectedPatient.address}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-gray-100">
          <button
            onClick={() => setAdministerModalOpen(true)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Pill size={12} className="text-purple-600" />
            <span>Medication</span>
          </button>
          <button
            onClick={() => setNoteModalOpen(true)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
          >
            <FileText size={12} className="text-blue-600" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Observation History Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Observation Logs</h4>
        <div className="space-y-1.5 text-xs">
          {RECENT_VITALS_READINGS.slice(0, 4).map((r, i) => (
            <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 text-[11px]">{r.dateTime}</span>
                <span className="text-[10px] text-gray-400 block">By: {CURRENT_NURSE.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-700 text-xs">{r.bp}</span>
                <span className="text-[10px] text-gray-400 block">{r.hr} bpm · {r.temp}°C</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <NursePageShell header={headerContent} kpis={kpisContent} rightPanel={rightPanelContent}>
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check size={14} className="text-emerald-600" />
          <span>Vitals recorded successfully for {selectedPatient.name}</span>
        </div>
      )}

      {/* ── Metric Chart Section ── */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-gray-800">24-Hour Biometric Trends</h3>
            <p className="text-xs text-gray-400">Telemetry observation trend for {selectedPatient.name}</p>
          </div>

          <div className="flex items-center gap-1 bg-gray-100/80 p-0.5 rounded-lg">
            {(['temp', 'bp', 'hr', 'spo2'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetricTab(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeMetricTab === m ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {m === 'temp' ? 'Temperature' : m === 'bp' ? 'Blood Pressure' : m === 'hr' ? 'Heart Rate' : 'SpO₂'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-44 sm:h-52 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={VITALS_HISTORY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '11px',
                }}
              />
              <Line
                type="monotone"
                dataKey={activeMetricTab}
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563EB' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Active Patients Vitals Table ── */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="font-bold text-sm text-gray-800">Ward Vitals Monitoring Board</h3>
            <p className="text-xs text-gray-400">Click a row to select patient telemetry</p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Blood Pressure</th>
                <th className="py-2.5 px-3">Heart Rate</th>
                <th className="py-2.5 px-3">Temp</th>
                <th className="py-2.5 px-3">SpO₂</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient.id === p.id;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                        <div>
                          <span className="font-bold text-gray-800 block leading-tight">{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{p.pid}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-700">Room {p.room}</td>
                    <td className="py-2 px-3 font-mono font-bold text-gray-800">{p.vitals.bp}</td>
                    <td className="py-2 px-3 text-gray-700">{p.vitals.hr} bpm</td>
                    <td className="py-2 px-3 text-gray-700">{p.vitals.temp}°C</td>
                    <td className="py-2 px-3 text-gray-700">{p.vitals.spo2}%</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.vitalsStatus === 'Normal'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.vitalsStatus === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {p.vitalsStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
      <AdministerMedModal
        isOpen={administerModalOpen}
        onClose={() => setAdministerModalOpen(false)}
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

export default React.memo(VitalsPage);
