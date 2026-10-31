import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Eye,
  Pill,
  FlaskConical,
  ChevronRight,
  ChevronLeft,
  FileText,
  UserCheck,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import {
  CURRENT_NURSE,
  NURSE_PATIENTS,
  NURSE_APPOINTMENTS,
  NURSE_TASKS,
  NursePatient,
} from '../../components/nurse/nurseMockData';
import { NursePageShell } from '../../components/nurse/NursePageShell';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import NursePatientDetailsModal from '../../components/nurse/NursePatientDetailsModal';
import RecordVitalsModal from '../../components/nurse/RecordVitalsModal';
import AdministerMedModal from '../../components/nurse/AdministerMedModal';
import CollectLabModal from '../../components/nurse/CollectLabModal';
import AddNoteModal from '../../components/nurse/AddNoteModal';

export interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
}

export function DashboardPage({ onNavigateTab }: DashboardPageProps) {
  const [selectedPatient, setSelectedPatient] = useState<NursePatient>(NURSE_PATIENTS[0]!);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const handleOpenPatientDetails = (patient: NursePatient) => {
    setSelectedPatient(patient);
    setDetailsModalOpen(true);
  };

  /* ── 1. Top Banner Section ── */
  const bannerContent = (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-xl p-3.5 sm:p-4 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-2.5 sm:gap-3 z-10">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
          <HeartPulse className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Good morning, {CURRENT_NURSE.name}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              On Duty
            </span>
          </div>
          <p className="text-xs text-blue-100/80 mt-0.5">
            {CURRENT_NURSE.ward} · 4 patients awaiting vital check, 2 scheduled for 10:00 AM med pass
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 z-10 self-end sm:self-auto">
        <div className="bg-white/15 backdrop-blur-md rounded-lg px-2.5 py-1 text-xs border border-white/15 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-blue-200" />
          <span className="font-semibold text-white">Oct 19, 2026 · Shift A</span>
        </div>
        <button
          onClick={() => setVitalsModalOpen(true)}
          className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Quick Vitals</span>
        </button>
      </div>
    </div>
  );

  /* ── 2. KPI Cards ── */
  const kpisContent = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      <NurseStatCard
        title="Total In Ward"
        value={18}
        iconName="users"
        trendText="+2 from yesterday"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="blue"
      />
      <NurseStatCard
        title="In Active Care"
        value={14}
        iconName="activity"
        trendText="85% occupancy"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="green"
      />
      <NurseStatCard
        title="Meds Due (Shift A)"
        value={8}
        iconName="syringe"
        trendText="4 completed"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="purple"
      />
      <NurseStatCard
        title="Vitals Observation"
        value={6}
        iconName="heart"
        trendText="2 high priority"
        trendDirection="down"
        trendIsPositive={false}
        colorTheme="orange"
      />
    </div>
  );

  /* ── 3. Right Sidebar Panel ── */
  const rightPanelContent = (
    <div className="space-y-3">
      {/* Nurse Profile Card */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={CURRENT_NURSE.avatar}
              alt={CURRENT_NURSE.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-slate-800 leading-tight">{CURRENT_NURSE.name}</h3>
            <p className="text-[11px] text-slate-400">{CURRENT_NURSE.role} · {CURRENT_NURSE.department}</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold mt-1">
              Station Ready
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 italic mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          &ldquo;{CURRENT_NURSE.quote}&rdquo;
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Station Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVitalsModalOpen(true)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 border border-blue-100 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-2xs text-blue-600 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Record Vitals</span>
          </button>

          <button
            onClick={() => setAdministerModalOpen(true)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-purple-50/70 hover:bg-purple-100/70 text-purple-700 border border-purple-100 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-2xs text-purple-600 group-hover:scale-105 transition-transform">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Administer Med</span>
          </button>

          <button
            onClick={() => setLabModalOpen(true)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-cyan-50/70 hover:bg-cyan-100/70 text-cyan-700 border border-cyan-100 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-2xs text-cyan-600 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Collect Sample</span>
          </button>

          <button
            onClick={() => setNoteModalOpen(true)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-700 border border-emerald-100 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-2xs text-emerald-600 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Add Note</span>
          </button>
        </div>
      </div>

      {/* Today's Shift Schedule */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Shift A Schedule</span>
          </h4>
          <span className="text-[10px] text-blue-600 font-semibold">07:00 – 15:30</span>
        </div>
        <div className="space-y-2 text-xs">
          {[
            { time: '07:30 AM', task: 'Shift handover briefing & vitals audit', status: 'Completed', dot: 'bg-emerald-500' },
            { time: '09:00 AM', task: 'Cardiology Dr. Fitsum rounds & orders', status: 'Completed', dot: 'bg-emerald-500' },
            { time: '10:00 AM', task: 'Morning medication administration pass', status: 'In Progress', dot: 'bg-blue-500' },
            { time: '12:30 PM', task: 'Pre-lunch capillary glucose testing', status: 'Upcoming', dot: 'bg-amber-400' },
            { time: '02:00 PM', task: 'Wound dressing change (Room 304)', status: 'Upcoming', dot: 'bg-slate-300' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${item.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-800 text-[11px] truncate">{item.task}</span>
                  <span className="text-[9px] text-slate-400 shrink-0">{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Handover Clinical Notes */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Handover Notes</h4>
          <button
            onClick={() => setNoteModalOpen(true)}
            className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
          >
            + Add Note
          </button>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
          <p className="text-slate-700">Bed 02 Aster Mulu: BP responding well to IV fluid adjustment. Stable.</p>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>By: Aster Mulu (RN)</span>
            <span>08:45 AM</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <NursePageShell banner={bannerContent} kpis={kpisContent} rightPanel={rightPanelContent}>
      {/* ── Row 1: Nursing Care Plan & Vitals Overview ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
        {/* Care Plan / Tasks List */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Nursing Tasks & Care Plan</h3>
              <p className="text-xs text-slate-400">Scheduled treatments and vital checks for today</p>
            </div>
            <button
              onClick={() => onNavigateTab?.('tasks')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({NURSE_TASKS.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {NURSE_TASKS.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => onNavigateTab?.('tasks')}
                className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    {task.type === 'Medication' && <Pill className="w-4 h-4" />}
                    {task.type === 'Vital Signs' && <Activity className="w-4 h-4" />}
                    {task.type === 'Wound Care' && <Heart className="w-4 h-4" />}
                    {task.type !== 'Medication' && task.type !== 'Vital Signs' && task.type !== 'Wound Care' && (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate">{task.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {task.patientName} · {task.room}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {task.dueTime}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{task.priority} Priority</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vital Signs Observation Grid */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Latest Vital Observations</h3>
              <p className="text-xs text-slate-400">Ward patients with recent biometric recordings</p>
            </div>
            <button
              onClick={() => onNavigateTab?.('vitals')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Vitals Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1">
            {NURSE_PATIENTS.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => handleOpenPatientDetails(p)}
                className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <span className="font-bold text-xs text-slate-800 truncate">{p.name}</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    Rm {p.room}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] bg-slate-50/80 p-1.5 rounded-md">
                  <div>
                    <span className="text-[9px] text-slate-400 block">BP</span>
                    <span className="font-bold text-slate-800">{p.vitals.bp}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Pulse</span>
                    <span className="font-bold text-slate-800">{p.vitals.hr} bpm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Active Patients Table ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Assigned Ward Patients</h3>
            <p className="text-xs text-slate-400">Current patients in Ward 3A under active nursing observation</p>
          </div>
          <button
            onClick={() => onNavigateTab?.('patients')}
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Patient Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Room / Bed</th>
                <th className="py-2.5 px-3">Condition / Reason</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Attending Doctor</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {NURSE_PATIENTS.slice(0, 5).map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handleOpenPatientDetails(p)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{p.name}</span>
                        <span className="text-[10px] text-slate-400">{p.age}y · {p.gender}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{p.pid}</td>
                  <td className="py-2 px-3 font-medium text-slate-700">Room {p.room} · Bed {p.bed}</td>
                  <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">{p.visitReason}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600">{p.doctor}</td>
                  <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenPatientDetails(p)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="View Patient Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NursePatientDetailsModal
        patient={selectedPatient}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onRecordVitals={() => setVitalsModalOpen(true)}
        onAdministerMed={() => setAdministerModalOpen(true)}
        onCollectSample={() => setLabModalOpen(true)}
      />
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

export default React.memo(DashboardPage);
