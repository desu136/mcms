import React, { useState } from 'react';
import {
  Users,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Heart,
  Droplet,
  ChevronRight,
  Printer,
} from 'lucide-react';
import {
  ALL_MOCK_PATIENTS,
  PRIMARY_PATIENT,
  PatientRecord,
} from '../../components/lab/patientLookupMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([PRIMARY_PATIENT, ...ALL_MOCK_PATIENTS]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord>(PRIMARY_PATIENT);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Patient Diagnostic History & Lab Lookup
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Review longitudinal laboratory profiles, cumulative panel trends, and historical reports.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => alert(`Printing cumulative report for ${selectedPatient.name}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Cumulative Record</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="Total Lab History" value={selectedPatient.stats.totalTests} color="blue" />
      <LabStatCard title="Completed" value={selectedPatient.stats.completed} change={{ change: selectedPatient.stats.completedPct, trend: 'up' }} color="emerald" />
      <LabStatCard title="Pending" value={selectedPatient.stats.pending} color="amber" />
      <LabStatCard title="Abnormal Past" value={selectedPatient.stats.abnormal} color="rose" />
      <LabStatCard title="Blood Group" value={selectedPatient.bloodGroup || 'O+'} color="cyan" />
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: Patient List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col max-h-[70vh]">
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search patient by name, PID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-50/70 border-l-4 border-cyan-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {p.patientId} • {p.age}y • {p.gender}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Patient Diagnostic Profile (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Patient Header Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPatient.avatar}
                  alt={selectedPatient.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500/30 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">{selectedPatient.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-50 text-cyan-700">
                      {selectedPatient.status}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {selectedPatient.patientId} • DOB: {selectedPatient.dob} • {selectedPatient.gender}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-black text-xs border border-rose-100">
                  <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                  <span>{selectedPatient.bloodGroup}</span>
                </span>
                <div className="text-[10px] text-slate-400 mt-1">Allergies: {selectedPatient.allergies}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedPatient.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{selectedPatient.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{selectedPatient.address}</span>
              </div>
            </div>
          </div>

          {/* Test Orders & History for Patient */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Laboratory Requisitions ({selectedPatient.orderedTests.length})
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Attending: {selectedPatient.currentVisit.attendingDoctor}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Test Name</th>
                    <th className="py-2.5 px-3">Sample Type</th>
                    <th className="py-2.5 px-3">Ordered Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Result Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPatient.orderedTests.map((test) => (
                    <tr key={test.num} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{test.num}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{test.testName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{test.sampleType}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{test.orderedDate}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            test.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {test.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700 text-[11px]">
                        {test.resultSummary || 'Awaiting analytical processing'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </LabPageShell>
  );
}

export default PatientsPage;
