import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Heart,
  FlaskConical,
  Activity,
  User,
  Phone,
  Mail,
  MapPin,
  Pill,
} from 'lucide-react';
import { INITIAL_PATIENTS, PatientItem } from '../../components/doctor/doctorMockData';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';

type VisitType = 'Follow-up' | 'Consultation' | 'Lab Visit' | 'Imaging' | 'Prescription';

interface MedicalRecordRow {
  id: string;
  visitDate: string;
  visitTime: string;
  visitType: VisitType;
  department: string;
  doctor: { name: string; specialty: string; avatar: string };
  diagnosisSummary: string;
  status: 'Completed';
}

const MEDICAL_HISTORY_ROWS: MedicalRecordRow[] = [
  { id: 'rec-1', visitDate: 'Oct 18, 2026', visitTime: '09:40 AM', visitType: 'Follow-up', department: 'Cardiology', doctor: { name: 'Dr. Fitsum Alemu', specialty: 'Cardiologist', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Hypertension - controlled. Continue current medication...', status: 'Completed' },
  { id: 'rec-2', visitDate: 'Oct 12, 2026', visitTime: '10:15 AM', visitType: 'Consultation', department: 'Internal Medicine', doctor: { name: 'Dr. Hiwet Desta', specialty: 'General Physician', avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Common cold. Rest and hydration...', status: 'Completed' },
  { id: 'rec-3', visitDate: 'Oct 05, 2026', visitTime: '02:30 PM', visitType: 'Lab Visit', department: 'Laboratory', doctor: { name: 'Lab Tech Team', specialty: 'Laboratory', avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'CBC - Normal. WBC, RBC, Platelets within range...', status: 'Completed' },
  { id: 'rec-4', visitDate: 'Sep 28, 2026', visitTime: '11:20 AM', visitType: 'Follow-up', department: 'Cardiology', doctor: { name: 'Dr. Fitsum Alemu', specialty: 'Cardiologist', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Post-angiogram follow-up. Stable condition...', status: 'Completed' },
  { id: 'rec-5', visitDate: 'Sep 20, 2026', visitTime: '04:10 PM', visitType: 'Consultation', department: 'Internal Medicine', doctor: { name: 'Dr. Hiwet Desta', specialty: 'General Physician', avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Gastritis. Prescribed medication...', status: 'Completed' },
];

const visitTypeStyle: Record<VisitType, string> = {
  'Follow-up': 'bg-blue-50 text-blue-700 border-blue-100',
  'Consultation': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Lab Visit': 'bg-purple-50 text-purple-700 border-purple-100',
  'Imaging': 'bg-amber-50 text-amber-700 border-amber-100',
  'Prescription': 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export function MedicalRecordsPage() {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordRow>(MEDICAL_HISTORY_ROWS[0]!);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitType, setSelectedVisitType] = useState<string>('All');

  // Drawer / Modals
  const patient = INITIAL_PATIENTS[0]!;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  const filteredRows = MEDICAL_HISTORY_ROWS.filter((r) => {
    if (selectedVisitType !== 'All' && r.visitType !== selectedVisitType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.diagnosisSummary.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.doctor.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <FileText className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Medical Records
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Clinical history, diagnostic documentation, and past consultation summaries.
          </p>
        </div>
      </div>
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Patient Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Current Patient</h3>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Full Profile
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <img
            src={patient.avatar}
            alt={patient.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div>
            <div className="text-sm font-bold text-slate-800">{patient.name}</div>
            <div className="text-xs text-blue-600 font-semibold">{patient.pid}</div>
            <div className="text-[11px] text-slate-400">
              {patient.age} years • {patient.gender} • Blood: A+
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{patient.email}</span>
          </div>
        </div>
      </div>

      {/* Record Inspection Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Selected Record Details</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            {selectedRecord.status}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visit Date &amp; Time</div>
            <div className="font-bold text-slate-800">
              {selectedRecord.visitDate} • {selectedRecord.visitTime}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department &amp; Attending</div>
            <div className="font-semibold text-slate-700">
              {selectedRecord.department} ({selectedRecord.doctor.name})
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnosis &amp; Clinical Notes</div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 leading-relaxed font-medium mt-1">
              {selectedRecord.diagnosisSummary}
            </div>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => setRxModalOpen(true)}
            className="py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Pill className="w-3.5 h-3.5 text-blue-600" /> New Rx
          </button>
          <button
            onClick={() => setLabModalOpen(true)}
            className="py-2 px-3 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-orange-500" /> Order Lab
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DoctorPageShell header={headerContent} rightPanel={rightPanelContent} rightPanelWidth="lg:w-[320px] xl:w-[360px]">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Filters & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['All', 'Follow-up', 'Consultation', 'Lab Visit'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedVisitType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedVisitType === type
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search diagnosis or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-5">Date &amp; Time</th>
                  <th className="py-3 px-5">Visit Type</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Attending Doctor</th>
                  <th className="py-3 px-5">Diagnosis Summary</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRows.map((row) => {
                  const isSelected = selectedRecord.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRecord(row)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-800">{row.visitDate}</div>
                        <div className="text-[11px] text-slate-400">{row.visitTime}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${visitTypeStyle[row.visitType]}`}
                        >
                          {row.visitType}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-700">{row.department}</td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-slate-800">{row.doctor.name}</div>
                        <div className="text-[10px] text-slate-400">{row.doctor.specialty}</div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate">{row.diagnosisSummary}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(row);
                            setDrawerOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DoctorPageShell>

      <DoctorPatientDrawer
        patient={patient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setRxModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />
      <DoctorPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        defaultPatientId="p-1"
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId="p-1"
      />
    </>
  );
}
export default MedicalRecordsPage;
