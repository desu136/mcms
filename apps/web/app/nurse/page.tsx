'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  Calendar,
  CalendarDays,
  Clock,
  Eye,
  Heart,
  MoreVertical,
  Plus,
  Thermometer,
  Wind,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Pill,
  FlaskConical,
  FileText,
  Users,
  ShieldAlert,
  ClipboardList,
  RefreshCw,
} from 'lucide-react';
import NursePageShell from '../../components/nurse/NursePageShell';
import NurseStatCard from '../../components/nurse/NurseStatCard';
import RecordVitalsModal from '../../components/nurse/RecordVitalsModal';
import AdministerMedModal from '../../components/nurse/AdministerMedModal';
import CollectLabModal from '../../components/nurse/CollectLabModal';
import AddNoteModal from '../../components/nurse/AddNoteModal';
import { useAuth } from '../../lib/auth/auth-context';
import { fetchPatients } from '../../lib/api/patients';
import { fetchNursingTasks, fetchPatientVitals, updateNursingTask } from '../../lib/api/clinical';
import { fetchAppointments, fetchQueue } from '../../lib/api/appointments';
import type { NursingTaskDTO, AppointmentDTO, QueueEntryDTO, PatientDTO } from '@mcms/contracts';


export default function NurseDashboardPage() {
  const { accessToken, user } = useAuth();
  const [notes, setNotes] = useState<{ id: string; patientName: string; patientPid: string; title: string; category: string; timestamp: string; author: string; text: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  );

  // Live data
  const [liveTasks, setLiveTasks] = useState<NursingTaskDTO[]>([]);
  const [liveAppointments, setLiveAppointments] = useState<AppointmentDTO[]>([]);
  const [liveQueue, setLiveQueue] = useState<QueueEntryDTO[]>([]);
  const [livePatients, setLivePatients] = useState<PatientDTO[]>([]);
  const [patientCount, setPatientCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const loadLiveData = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [taskRes, patRes, apptRes, queueRes] = await Promise.allSettled([
        fetchNursingTasks(accessToken),
        fetchPatients(accessToken, { limit: 5 }),
        fetchAppointments(accessToken),
        fetchQueue(accessToken),
      ]);
      if (taskRes.status === 'fulfilled') setLiveTasks(taskRes.value);
      if (patRes.status === 'fulfilled') {
        setLivePatients(patRes.value.data || []);
        setPatientCount(patRes.value.total);
      }
      if (apptRes.status === 'fulfilled') setLiveAppointments(Array.isArray(apptRes.value) ? apptRes.value : []);
      if (queueRes.status === 'fulfilled') setLiveQueue(queueRes.value);
    } catch (err) {
      console.error('Nurse dashboard live data error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { void loadLiveData(); }, [loadLiveData]);

  // Derived KPIs from live data
  const totalPatients = patientCount;
  const pendingTasks = liveTasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
  const completedTasks = liveTasks.filter((t) => t.status === 'COMPLETED').length;
  const nurseName = user?.displayName || 'Nurse';

  const toggleTask = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setLiveTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus as any } : t))
    );
    if (accessToken) {
      try {
        await updateNursingTask(id, { status: nextStatus as any }, accessToken);
      } catch (err) {
        console.error('Failed to toggle nursing task:', err);
      }
    }
  };

  // ── Top Banner ──────────────────────────────────────────────────────────────
  const banner = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
          <Activity className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Nurse Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Good morning, {nurseName.split(' ')[0]}! Here&apos;s what&apos;s happening in your ward today.
          </p>
        </div>
      </div>

      {/* Date Pill Widget */}
      <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <div className="text-left text-xs font-semibold text-slate-800">
          <span>{selectedDate}</span>
          <span className="text-[10px] text-slate-400 font-normal ml-1">· Monday</span>
        </div>
        <div className="flex items-center gap-0.5 ml-1.5 pl-1.5 border-l border-slate-200">
          <button className="p-0.5 rounded hover:bg-slate-200 text-slate-500">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button className="p-0.5 rounded hover:bg-slate-200 text-slate-500">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── 4 KPI Stat Cards ────────────────────────────────────────────────────────
  const kpis = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      <NurseStatCard
        title="Total Patients"
        value={isLoading ? '—' : totalPatients}
        iconName="users"
        trendText={isLoading ? 'Loading…' : `${totalPatients} registered`}
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="blue"
      />
      <NurseStatCard
        title="Today's Appointments"
        value={isLoading ? '—' : liveAppointments.length}
        iconName="calendar"
        trendText="Today's schedule"
        trendDirection="up"
        trendIsPositive={true}
        colorTheme="green"
      />
      <NurseStatCard
        title="Pending Tasks"
        value={isLoading ? '—' : pendingTasks}
        iconName="syringe"
        trendText={isLoading ? 'Loading…' : `${completedTasks} completed`}
        trendDirection="down"
        trendIsPositive={true}
        colorTheme="purple"
      />
      <NurseStatCard
        title="Alerts"
        value={3}
        iconName="bell"
        trendText="↑ 1 new"
        trendDirection="up"
        trendIsPositive={false}
        colorTheme="orange"
      />
    </div>
  );

  // ── Right Side Panel ────────────────────────────────────────────────────────
  const rightPanel = (
    <div className="space-y-3">
      {/* 1. Welcome Card */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.displayName || 'nurse')}`}
              alt={nurseName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {nurseName}
              </h3>
              <span className="text-[11px] font-medium text-slate-500 block">
                {user?.role || 'Nurse'}
              </span>
            </div>
          </div>
          <Link
            href="/nurse/profile"
            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition border border-blue-100 shadow-2xs shrink-0"
          >
            Profile
          </Link>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{user?.staffProfile?.phoneNumber || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{user?.email || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">Medical Center</span>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100/60 flex items-center justify-between">
          <p className="text-[11px] font-medium italic text-blue-900 line-clamp-2">
            &ldquo;Caring for patients is a work of heart.&rdquo;
          </p>
          <div className="w-7 h-7 rounded-full bg-white text-blue-500 flex items-center justify-center shrink-0 shadow-2xs ml-2">
            <Heart className="w-3.5 h-3.5 fill-blue-500/20 stroke-blue-500" />
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
          <span className="text-blue-600">⚡</span> Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVitalsModalOpen(true)}
            className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 transition-all text-left flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">
              Record Vitals
            </span>
          </button>

          <button
            onClick={() => setMedModalOpen(true)}
            className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-purple-50 hover:border-purple-200 transition-all text-left flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Pill className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">
              Administer Med
            </span>
          </button>

          <button
            onClick={() => setLabModalOpen(true)}
            className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-teal-50 hover:border-teal-200 transition-all text-left flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">
              Collect Sample
            </span>
          </button>

          <button
            onClick={() => setNoteModalOpen(true)}
            className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 transition-all text-left flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">
              Add Note
            </span>
          </button>

          <Link
            href="/nurse/patients"
            className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-200 transition-all text-left flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">
              Patients
            </span>
          </Link>

          <Link
            href="/nurse/appointments"
            className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-200 transition-all text-left flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">
              Appointments
            </span>
          </Link>
        </div>
      </div>

      {/* 3. Nursing Notes */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Nursing Notes
          </h3>
          <Link
            href="/nurse/patients"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            View All
          </Link>
        </div>

        <div className="space-y-2">
          {notes.map((n) => {
            const badgeColor =
              n.category === 'Education'
                ? 'bg-purple-50 text-purple-600 border-purple-200'
                : n.category === 'Care'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : n.category === 'Medication'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-amber-50 text-amber-600 border-amber-200';

            return (
              <div
                key={n.id}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {n.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {n.patientName} ({n.patientPid}) • {n.timestamp}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeColor} shrink-0`}
                  >
                    {n.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <NursePageShell banner={banner} kpis={kpis} rightPanel={rightPanel}>
      <div className="space-y-3.5">
        {/* ── ROW 1: Today's Tasks & Vital Signs Overview ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Today's Nursing Tasks (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Today&apos;s Nursing Tasks
                  </h3>
                </div>
                <Link
                  href="/nurse/tasks"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2">
                {liveTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No nursing tasks due today</div>
                ) : (
                  liveTasks.slice(0, 5).map((task) => {
                    const isCompleted = task.status === 'COMPLETED';

                    return (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-lg border transition flex items-center justify-between gap-2.5 ${
                          isCompleted
                            ? 'bg-slate-50 border-slate-100 opacity-60'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => void toggleTask(task.id, task.status)}
                            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                          />

                          {/* Priority Pill */}
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                              task.priority === 'URGENT' || task.priority === 'HIGH'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : task.priority === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}
                          >
                            {task.priority || 'ROUTINE'}
                          </span>

                          {/* Task Description */}
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-xs font-bold text-slate-800 truncate ${
                                isCompleted ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {task.title || task.taskType}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {task.dueTime ? new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                              {task.patientName ? ` • Patient: ${task.patientName}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                            {task.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Vital Signs Overview (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Vital Signs Overview
                  </h3>
                </div>
                <Link
                  href="/nurse/patients"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  View All
                </Link>
              </div>

              {/* 2x2 Grid of Vitals Overview */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. BP */}
                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">BP (Avg)</span>
                    <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-base font-extrabold text-slate-900 leading-tight">
                      118/76 <span className="text-[10px] font-medium text-slate-500">mmHg</span>
                    </div>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Normal
                    </span>
                  </div>
                </div>

                {/* 2. Temperature */}
                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Temp (Avg)</span>
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Thermometer className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-base font-extrabold text-slate-900 leading-tight">
                      36.8 <span className="text-[10px] font-medium text-slate-500">°C</span>
                    </div>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Normal
                    </span>
                  </div>
                </div>

                {/* 3. Pulse */}
                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Pulse (Avg)</span>
                    <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-base font-extrabold text-slate-900 leading-tight">
                      78 <span className="text-[10px] font-medium text-slate-500">bpm</span>
                    </div>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Normal
                    </span>
                  </div>
                </div>

                {/* 4. SpO2 */}
                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">SpO₂ (Avg)</span>
                    <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Wind className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-base font-extrabold text-slate-900 leading-tight">
                      98%
                    </div>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Normal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Recent Patients Table & Upcoming Appointments ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Recent Patients Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Recent Patients</h3>
              </div>
              <Link
                href="/nurse/patients"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-2.5">Patient</th>
                    <th className="py-2 px-2.5">Age / Gender</th>
                    <th className="py-2 px-2.5">Visit Reason</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {livePatients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No registered patients found
                      </td>
                    </tr>
                  ) : (
                    livePatients.map((p) => {
                      const name = p.fullName || `${p.firstName} ${p.lastName}`.trim();
                      const age = p.dateOfBirth
                        ? Math.max(0, new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear())
                        : '—';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2 px-2.5">
                            <div className="flex items-center gap-2">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`}
                                alt={name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-800 text-xs">
                                  {name}
                                </div>
                                <div className="text-[10px] text-slate-400">{p.pid}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 text-slate-600">
                            {age} / {p.gender || '—'}
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 font-medium">
                            {p.bloodType ? `Blood: ${p.bloodType}` : 'General Consultation'}
                          </td>
                          <td className="py-2 px-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-100">
                              Active
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <Link
                              href={`/nurse/patients?pid=${p.pid}`}
                              className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 inline-flex items-center justify-center transition"
                              title="View Patient Chart"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Showing {livePatients.length} of {patientCount} patients</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </button>
                <button className="w-5 h-5 rounded hover:bg-slate-100 font-medium text-xs flex items-center justify-center">
                  2
                </button>
                <button className="w-5 h-5 rounded hover:bg-slate-100 font-medium text-xs flex items-center justify-center">
                  3
                </button>
                <span className="px-0.5 text-slate-300">...</span>
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Upcoming Appointments
                  </h3>
                </div>
                <Link
                  href="/nurse/appointments"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2">
                {liveAppointments.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No scheduled appointments</div>
                ) : (
                  liveAppointments.slice(0, 5).map((apt, index) => {
                    const isOnTime = index < 4;
                    const aptTime = apt.appointmentDate
                      ? new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Today';

                    return (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-200/60 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Time indicator pill */}
                          <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap pl-0.5">
                            {aptTime}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {apt.patientName || 'Assigned Patient'}{' '}
                              {apt.patientPid && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({apt.patientPid})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {apt.reason || 'General Consultation'}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border ${
                            isOnTime
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}
                        >
                          {apt.status || 'Scheduled'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-center">
              <Link
                href="/nurse/appointments"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                View Full Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
      />
      <AdministerMedModal
        isOpen={medModalOpen}
        onClose={() => setMedModalOpen(false)}
      />
      <CollectLabModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
      />
      <AddNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onAddNote={(newNote) => setNotes((prev) => [newNote, ...prev])}
      />
    </NursePageShell>
  );
}
