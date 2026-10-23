import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Pill,
  FlaskConical,
  FileText,
  Shield,
  Heart,
  ChevronDown,
} from 'lucide-react';
import {
  INITIAL_PATIENTS,
  PatientItem,
} from '../../components/doctor/doctorMockData';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPatientModal } from '../../components/doctor/DoctorPatientModal';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';

export function PatientsPage() {
  const [patientsList, setPatientsList] = useState<PatientItem[]>(INITIAL_PATIENTS);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedGender, setSelectedGender] = useState('All Genders');
  const [highlightedPatient, setHighlightedPatient] = useState<PatientItem>(INITIAL_PATIENTS[0]!);

  // Modals & Drawers
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  const filteredPatients = patientsList.filter((p) => {
    if (activeTab === 'active' && p.status !== 'Active') return false;
    if (activeTab === 'inactive' && p.status !== 'Inactive') return false;
    if (selectedDepartment !== 'All Departments' && p.department !== selectedDepartment) return false;
    if (selectedGender !== 'All Genders' && p.gender !== selectedGender) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.pid.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.lastVisitReason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenDrawer = (patient: PatientItem) => {
    setHighlightedPatient(patient);
    setDrawerOpen(true);
  };

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Users className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Patients Registry
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Electronic health registry, clinical demographics, and past visit summaries.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAddPatientModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        Register New Patient
      </button>
    </div>
  );

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Total Patients"
        value={128}
        icon={Users}
        color="blue"
        change={{ value: '+12', trend: 'up', label: 'this month' }}
      />
      <DoctorStatCard
        title="Active Patients"
        value={104}
        icon={Users}
        color="emerald"
        change={{ value: '+8', trend: 'up', label: 'active records' }}
      />
      <DoctorStatCard
        title="New This Month"
        value={24}
        icon={UserPlus}
        color="purple"
        change={{ value: '+4', trend: 'up', label: 'vs last month' }}
      />
      <DoctorStatCard
        title="Critical Follow-ups"
        value={6}
        icon={Heart}
        color="rose"
        change={{ value: '-2', trend: 'down', label: 'high priority' }}
      />
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Selected Patient Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Patient Quick View</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              highlightedPatient.status === 'Active'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {highlightedPatient.status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={highlightedPatient.avatar}
            alt={highlightedPatient.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-800 truncate">{highlightedPatient.name}</div>
            <div className="text-xs text-blue-600 font-semibold">{highlightedPatient.pid}</div>
            <div className="text-[11px] text-slate-400">
              {highlightedPatient.age} years • {highlightedPatient.gender} • Blood: A+
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{highlightedPatient.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{highlightedPatient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{highlightedPatient.address}</span>
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5 text-xs">
          <div className="font-bold text-slate-700">Recent Visit</div>
          <div className="text-slate-600">
            {highlightedPatient.lastVisit} — {highlightedPatient.lastVisitReason}
          </div>
          <div className="text-[11px] text-slate-500">Department: {highlightedPatient.department}</div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => handleOpenDrawer(highlightedPatient)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Electronic Record
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPrescriptionModalOpen(true)}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-blue-600" /> Prescribe
            </button>
            <button
              onClick={() => setLabModalOpen(true)}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-orange-500" /> Order Lab
            </button>
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
          {/* Filtering Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {[
                { id: 'all', label: `All Patients (${patientsList.length})` },
                { id: 'active', label: 'Active (8)' },
                { id: 'recent', label: 'Recent Visits (5)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, PID, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="General Medicine">General Medicine</option>
              </select>

              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none cursor-pointer"
              >
                <option value="All Genders">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-5">Patient Name</th>
                  <th className="py-3 px-5">PID</th>
                  <th className="py-3 px-5">Age / Gender</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Last Visit</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPatients.map((p) => {
                  const isSelected = highlightedPatient.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setHighlightedPatient(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-800">{p.name}</div>
                            <div className="text-[11px] text-slate-400">{p.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-semibold text-blue-600">{p.pid}</td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {p.age} yrs • {p.gender}
                      </td>
                      <td className="py-3.5 px-5 text-slate-700">{p.department}</td>
                      <td className="py-3.5 px-5">
                        <div className="text-slate-800 font-medium">{p.lastVisit}</div>
                        <div className="text-[10px] text-slate-400">{p.lastVisitReason}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(p);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors cursor-pointer"
                        >
                          View Record
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

      {/* Patient Drawer & Modals */}
      <DoctorPatientDrawer
        patient={highlightedPatient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />
      <DoctorPatientModal
        isOpen={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        onPatientAdded={(newPatient) => {
          setPatientsList((prev) => [newPatient, ...prev]);
          setHighlightedPatient(newPatient);
        }}
      />
      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        defaultPatientId={highlightedPatient.id}
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={highlightedPatient.id}
      />
    </>
  );
}
export default PatientsPage;
