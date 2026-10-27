'use client';

import React, { useState } from 'react';
import {
  CalendarClock,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Tag,
  Stethoscope,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';

const CheckInModal = dynamic(() => import('../../../components/receptionist/CheckInModal'), { ssr: false });
import {
  QUEUE_KPIS,
  QUEUE_PATIENTS_LIST,
  QueuePatient,
  QUEUE_SUMMARY_DONUT,
  TODAYS_CHECK_INS,
  RECENT_COMPLETED_VISITS,
} from '../../../components/receptionist/receptionistMockData';

export default function CheckInQueuePage() {
  const [filterTab, setFilterTab] = useState<'All' | 'Waiting' | 'In Consultation' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient>(QUEUE_PATIENTS_LIST[0]!);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [patients, setPatients] = useState<QueuePatient[]>(QUEUE_PATIENTS_LIST);

  // Filter patients by tab and search
  const filteredPatients = patients.filter((p) => {
    const matchesFilter = filterTab === 'All' || p.status === filterTab;
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.queueNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCheckInAction = (queueNo: string) => {
    setPatients((prev) =>
      prev.map((item) =>
        item.queueNo === queueNo ? { ...item, status: 'In Consultation' } : item,
      ),
    );
  };

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Check-in / Queue Management"
            subtitle="Manage patient check-ins, view queue, and track consultation status."
            icon={CalendarClock}
            actionElement={
              <button
                type="button"
                onClick={() => setCheckInModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Check In Patient
              </button>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {QUEUE_KPIS.map((kpi, idx) => (
              <ReceptionistStatCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                suffix={kpi.suffix}
                change={kpi.change}
                trend={kpi.trend}
                iconName={kpi.iconName}
                color={kpi.color}
              />
            ))}
          </div>
        }
        subnav={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'All', label: 'All', count: 44 },
                { id: 'Waiting', label: 'Waiting', count: 12 },
                { id: 'In Consultation', label: 'In Consultation', count: 8 },
                { id: 'Completed', label: 'Completed', count: 24 },
              ].map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, queue number, or patient ID..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shrink-0"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>
          </div>
        }
        rightPanelWidth="lg:w-[320px] xl:w-[350px] 2xl:w-[380px]"
        rightPanel={
          <div className="space-y-3.5">
            {/* Patient Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Patient Information</h2>
                </div>
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View Full Record</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedPatient.avatar} alt={selectedPatient.patientName} className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-blue-500/20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-900 truncate">{selectedPatient.patientName}</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{selectedPatient.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{selectedPatient.pid}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{selectedPatient.age} years • {selectedPatient.gender === 'F' ? 'Female' : 'Male'}</div>
                  <div className="text-xs text-blue-600 font-bold mt-0.5">{selectedPatient.doctor}</div>
                </div>
              </div>
            </div>

            {/* Current Visit */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Current Visit</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Visit Type</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.visitType}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Department</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.department}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Doctor</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.doctor}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Check-in</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.checkInTime || '08:15 AM'}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs flex justify-between items-center">
                <span className="text-blue-700 font-semibold">Waiting Time:</span>
                <span className="font-black text-blue-900">{selectedPatient.waitingTime}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setCheckInModalOpen(true)} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><UserCheck className="w-3.5 h-3.5" /></div>
                  <span className="text-[11px] font-bold text-slate-700">Check In</span>
                </button>
                <button type="button" className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                  <span className="text-[11px] font-bold text-slate-700">Record</span>
                </button>
                <button type="button" className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                  <span className="text-[11px] font-bold text-slate-700">Notes</span>
                </button>
                <button type="button" onClick={() => window.print()} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Printer className="w-3.5 h-3.5" /></div>
                  <span className="text-[11px] font-bold text-slate-700">Ticket</span>
                </button>
                <button type="button" onClick={() => window.print()} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left col-span-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Tag className="w-3.5 h-3.5" /></div>
                  <span className="text-[11px] font-bold text-slate-700">Print Label</span>
                </button>
              </div>
            </div>

            {/* Queue Summary Donut */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Queue Summary</h2>
              </div>
              <div className="relative h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={QUEUE_SUMMARY_DONUT} innerRadius={45} outerRadius={62} paddingAngle={3} dataKey="value" isAnimationActive={false}>
                      {QUEUE_SUMMARY_DONUT.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-lg font-black text-slate-900 leading-none">44</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Total</span>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                {QUEUE_SUMMARY_DONUT.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <div className="font-bold text-slate-800">{item.value} <span className="font-normal text-slate-400">({item.percent}%)</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        {/* ─── Main: Patient Queue Table + Bottom Tables ─── */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Patient Queue Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Patient Queue</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2.5 font-medium">Queue #</th>
                    <th className="pb-2.5 font-medium">Patient Name</th>
                    <th className="pb-2.5 font-medium">Age</th>
                    <th className="pb-2.5 font-medium">Gender</th>
                    <th className="pb-2.5 font-medium">Visit Type</th>
                    <th className="pb-2.5 font-medium">Department</th>
                    <th className="pb-2.5 font-medium">Doctor</th>
                    <th className="pb-2.5 font-medium">Wait</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => {
                    const isSelected = selectedPatient.queueNo === patient.queueNo;
                    return (
                      <tr
                        key={patient.queueNo}
                        onClick={() => setSelectedPatient(patient)}
                        className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70' : ''}`}
                      >
                        <td className="py-2.5 font-black text-blue-600 whitespace-nowrap">{patient.queueNo}</td>
                        <td className="py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={patient.avatar} alt={patient.patientName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                            <div>
                              <div className="font-bold text-slate-800 leading-tight">{patient.patientName}</div>
                              <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{patient.pid}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-700">{patient.age}</td>
                        <td className="py-2.5 text-slate-700">{patient.gender}</td>
                        <td className="py-2.5 text-slate-600">{patient.visitType}</td>
                        <td className="py-2.5 text-slate-600">{patient.department}</td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{patient.doctor}</td>
                        <td className="py-2.5 text-slate-600">{patient.waitingTime}</td>
                        <td className="py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            patient.status === 'In Consultation' ? 'bg-blue-100 text-blue-700'
                            : patient.status === 'Waiting' ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {patient.status === 'Waiting' && (
                              <button
                                type="button"
                                onClick={() => handleCheckInAction(patient.queueNo)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors"
                              >
                                Call
                              </button>
                            )}
                            <button type="button" className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded text-slate-400">
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
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div>Showing 1-10 of 44 patients</div>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronLeft className="w-3.5 h-3.5" /></button>
                {[1,2,3,4].map((n) => (
                  <button key={n} className={`px-2.5 py-1 rounded text-xs ${n === 1 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100 text-slate-600'}`}>{n}</button>
                ))}
                <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
              <div>
                <select className="border border-slate-200 rounded px-2 py-0.5 text-xs bg-white text-slate-700">
                  <option>10 / page</option>
                  <option>20 / page</option>
                  <option>50 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Today's Check-ins */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Today&apos;s Check-ins</h3>
                </div>
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Patient Name</th>
                      <th className="pb-2 font-medium">Queue #</th>
                      <th className="pb-2 font-medium">Department</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TODAYS_CHECK_INS.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2 text-slate-500 whitespace-nowrap">{item.time}</td>
                        <td className="py-2 font-bold text-slate-800 whitespace-nowrap">{item.patientName}</td>
                        <td className="py-2 font-bold text-blue-600">{item.queueNo}</td>
                        <td className="py-2 text-slate-600">{item.department}</td>
                        <td className="py-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Completed Visits */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Recent Completed Visits</h3>
                </div>
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Patient Name</th>
                      <th className="pb-2 font-medium">Doctor</th>
                      <th className="pb-2 font-medium">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RECENT_COMPLETED_VISITS.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2 text-slate-500 whitespace-nowrap">{item.time}</td>
                        <td className="py-2 font-bold text-slate-800 whitespace-nowrap">{item.patientName}</td>
                        <td className="py-2 text-slate-600 whitespace-nowrap">{item.doctor}</td>
                        <td className="py-2 text-slate-600">{item.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
        />
      )}
    </>
  );
}