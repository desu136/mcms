import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { INITIAL_PATIENTS, PatientItem } from '../../components/doctor/doctorMockData';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';

interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  patient: {
    name: string;
    pid: string;
    avatar: string;
    age: number;
    gender: string;
  };
  medication: string;
  dosage: string;
  duration: string;
  prescribedDate: string;
  status: 'Active' | 'Completed' | 'Pending Refill' | 'Cancelled';
  department: string;
}

const PRESCRIPTIONS_DATA: PrescriptionItem[] = [
  {
    id: 'rx-1',
    prescriptionId: 'RX-2026-048',
    patient: {
      name: 'Aster Mulu',
      pid: 'PID-001024',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      age: 28,
      gender: 'Female',
    },
    medication: 'Amoxicillin 500mg',
    dosage: '500mg TID',
    duration: '7 days',
    prescribedDate: 'Oct 19, 2026 09:15 AM',
    status: 'Active',
    department: 'Cardiology',
  },
  {
    id: 'rx-2',
    prescriptionId: 'RX-2026-047',
    patient: {
      name: 'Samuel Girma',
      pid: 'PID-001087',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      age: 45,
      gender: 'Male',
    },
    medication: 'Metformin 500mg',
    dosage: '500mg BID',
    duration: '30 days',
    prescribedDate: 'Oct 18, 2026 04:20 PM',
    status: 'Active',
    department: 'Cardiology',
  },
  {
    id: 'rx-3',
    prescriptionId: 'RX-2026-046',
    patient: {
      name: 'Lidya Kebede',
      pid: 'PID-001062',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      age: 39,
      gender: 'Female',
    },
    medication: 'Amlodipine 5mg',
    dosage: '5mg Once Daily',
    duration: '30 days',
    prescribedDate: 'Oct 17, 2026 11:10 AM',
    status: 'Pending Refill',
    department: 'Cardiology',
  },
  {
    id: 'rx-4',
    prescriptionId: 'RX-2026-045',
    patient: {
      name: 'Betlehem Abebe',
      pid: 'PID-001098',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      age: 32,
      gender: 'Female',
    },
    medication: 'Omeprazole 20mg',
    dosage: '20mg Before Breakfast',
    duration: '14 days',
    prescribedDate: 'Oct 16, 2026 10:30 AM',
    status: 'Completed',
    department: 'Cardiology',
  },
];

export function PrescriptionsPage() {
  const [rxList, setRxList] = useState<PrescriptionItem[]>(PRESCRIPTIONS_DATA);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Pending Refill' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRx, setSelectedRx] = useState<PrescriptionItem>(PRESCRIPTIONS_DATA[0]!);

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPatient, setDrawerPatient] = useState<PatientItem | null>(null);

  const filteredRx = rxList.filter((item) => {
    if (activeTab !== 'All' && item.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.prescriptionId.toLowerCase().includes(q) ||
        item.medication.toLowerCase().includes(q) ||
        item.patient.name.toLowerCase().includes(q) ||
        item.patient.pid.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenPatientProfile = (patientName: string) => {
    const match = INITIAL_PATIENTS.find((p) => p.name === patientName) || INITIAL_PATIENTS[0]!;
    setDrawerPatient(match);
    setDrawerOpen(true);
  };

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Pill className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Prescriptions
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Electronic prescriptions queue, active medications, dosage instructions, and refill logs.
          </p>
        </div>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        New Prescription
      </button>
    </div>
  );

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Total Prescriptions"
        value={128}
        icon={Pill}
        color="blue"
        change={{ value: '+12', trend: 'up', label: 'this month' }}
      />
      <DoctorStatCard
        title="Active Regimens"
        value={84}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '+5', trend: 'up', label: 'active' }}
      />
      <DoctorStatCard
        title="Pending Refills"
        value={18}
        icon={Clock}
        color="amber"
        change={{ value: '-3', trend: 'down', label: 'needs review' }}
      />
      <DoctorStatCard
        title="Completed / Ended"
        value={26}
        icon={CheckCircle2}
        color="purple"
        change={{ value: '+10', trend: 'up', label: 'finished course' }}
      />
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Selected Prescription Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Prescription Details</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedRx.status === 'Active'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : selectedRx.status === 'Pending Refill'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {selectedRx.status}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Medication</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedRx.medication}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dosage</div>
              <div className="font-bold text-slate-700">{selectedRx.dosage}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</div>
              <div className="font-bold text-slate-700">{selectedRx.duration}</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescription ID</div>
            <div className="font-mono font-bold text-blue-600">{selectedRx.prescriptionId}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescribed Date</div>
            <div className="font-medium text-slate-600">{selectedRx.prescribedDate}</div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => handleOpenPatientProfile(selectedRx.patient.name)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Patient Record
          </button>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Patient Profile</h3>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <img
            src={selectedRx.patient.avatar}
            alt={selectedRx.patient.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
          />
          <div>
            <div className="text-sm font-bold text-slate-800">{selectedRx.patient.name}</div>
            <div className="text-[11px] text-blue-600 font-semibold">{selectedRx.patient.pid}</div>
            <div className="text-[10px] text-slate-400">
              {selectedRx.patient.age} years • {selectedRx.patient.gender}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={rightPanelContent}
        rightPanelWidth="lg:w-[320px] xl:w-[360px]"
      >
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Tabs & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['All', 'Active', 'Pending Refill', 'Completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search medication, Rx ID, patient..."
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
                  <th className="py-3 px-5">Prescription ID</th>
                  <th className="py-3 px-5">Patient</th>
                  <th className="py-3 px-5">Medication &amp; Dosage</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5">Date Prescribed</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRx.map((rx) => {
                  const isSelected = selectedRx.id === rx.id;
                  return (
                    <tr
                      key={rx.id}
                      onClick={() => setSelectedRx(rx)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600">{rx.prescriptionId}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={rx.patient.avatar}
                            alt={rx.patient.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-800">{rx.patient.name}</div>
                            <div className="text-[11px] text-slate-400">{rx.patient.pid}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-800">{rx.medication}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{rx.dosage}</div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{rx.duration}</td>
                      <td className="py-3.5 px-5 text-slate-500">{rx.prescribedDate}</td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            rx.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : rx.status === 'Pending Refill'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRx(rx);
                            handleOpenPatientProfile(rx.patient.name);
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
        patient={drawerPatient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setModalOpen(true)}
      />
      <DoctorPrescriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultPatientId="p-1"
      />
    </>
  );
}
export default PrescriptionsPage;
