import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  UserCheck,
  Clock,
  Printer,
  ChevronRight,
  Database,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import {
  PATIENTS_DIRECTORY_KPIS,
  FULL_PATIENTS_DIRECTORY,
  PatientDirectoryRow,
} from '../../components/receptionist/receptionistMockData';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';

interface PatientsPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export function PatientsPage({ onNavigateTab }: PatientsPageProps) {
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDirectoryRow>(
    FULL_PATIENTS_DIRECTORY[0]!,
  );

  const filtered = FULL_PATIENTS_DIRECTORY.filter((p) => {
    const matchesFilter = filterTab === 'All' || p.status === filterTab;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <ReceptionistPageShell
      banner={
        <ReceptionistBanner
          title="Patient Directory"
          subtitle="Comprehensive clinic patient registry, medical history, and contact dossiers."
          icon={Users}
          actionElement={
            <button
              onClick={() => onNavigateTab('registration')}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </button>
          }
        />
      }
      kpis={
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {PATIENTS_DIRECTORY_KPIS.map((kpi, idx) => (
            <ReceptionistStatCard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              prefix={kpi.prefix}
              suffix={kpi.suffix}
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
        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1">
            {(['All', 'Active', 'Inactive'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === tab
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, PID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      }
      rightPanel={
        selectedPatient ? (
          <div className="space-y-3.5">
            {/* Patient Dossier Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-[11px] font-mono font-bold text-blue-600 mt-0.5">
                    {selectedPatient.pid}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Age / Gender:</span>
                  <span className="font-bold text-slate-800">
                    {selectedPatient.age} yrs • {selectedPatient.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-bold text-slate-800">{selectedPatient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Visit:</span>
                  <span className="font-bold text-slate-800">{selectedPatient.lastVisit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Doctor:</span>
                  <span className="font-bold text-blue-700">{selectedPatient.doctor}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onNavigateTab('queue')}
                  type="button"
                  className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Check In
                </button>
                <button
                  onClick={() => onNavigateTab('appointments')}
                  type="button"
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Visit
                </button>
              </div>
            </div>
          </div>
        ) : null
      }
    >
      {/* Directory Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="pb-2.5">PID</th>
                <th className="pb-2.5">Patient Name</th>
                <th className="pb-2.5">Age / Sex</th>
                <th className="pb-2.5">Phone</th>
                <th className="pb-2.5">Primary Doctor</th>
                <th className="pb-2.5">Last Visit</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((patient) => {
                const isSelected = selectedPatient?.pid === patient.pid;
                return (
                  <tr
                    key={patient.pid}
                    onClick={() => setSelectedPatient(patient)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 font-mono font-bold text-blue-700">{patient.pid}</td>
                    <td className="py-2.5 font-bold text-slate-900">{patient.name}</td>
                    <td className="py-2.5 text-slate-600">
                      {patient.age} yrs • {patient.gender}
                    </td>
                    <td className="py-2.5 font-mono text-slate-600">{patient.phone}</td>
                    <td className="py-2.5 font-medium text-slate-700">{patient.doctor}</td>
                    <td className="py-2.5 text-slate-500">{patient.lastVisit}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          patient.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ReceptionistPageShell>
  );
}

export default React.memo(PatientsPage);
