import React, { useState, useEffect, useCallback } from 'react';
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
  Share2,
  ChevronDown,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { PatientItem } from '../../components/doctor/doctorMockData';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorReferralModal } from '../../components/doctor/DoctorReferralModal';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import { fetchAppointments } from '../../api/appointments';
import { fetchPrescriptions, fetchLabOrders } from '../../api/clinical';
import type { PatientDTO, AppointmentDTO, PrescriptionDTO, LabOrderDTO } from '@mcms/contracts';

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

const visitTypeStyle: Record<VisitType, string> = {
  'Follow-up': 'bg-blue-50 text-blue-700 border-blue-100',
  'Consultation': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Lab Visit': 'bg-purple-50 text-purple-700 border-purple-100',
  'Imaging': 'bg-amber-50 text-amber-700 border-amber-100',
  'Prescription': 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export function MedicalRecordsPage() {
  const { accessToken } = useAuth();

  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [records, setRecords] = useState<MedicalRecordRow[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordRow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitType, setSelectedVisitType] = useState<string>('All');

  // Drawer / Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  // Load patients
  const loadPatients = useCallback(async () => {
    if (!accessToken) return;
    setLoadingPatients(true);
    try {
      const res = await fetchPatients(accessToken, { limit: 100 });
      if (res && res.data && res.data.length > 0) {
        setPatients(res.data);
        if (!selectedPatientId) {
          setSelectedPatientId(res.data[0]!.id);
        }
      }
    } catch (e) {
      console.error('Failed to load patients for records:', e);
    } finally {
      setLoadingPatients(false);
    }
  }, [accessToken, selectedPatientId]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  // Load patient clinical history
  const loadPatientHistory = useCallback(async (patientId: string) => {
    if (!accessToken || !patientId) return;
    setLoadingRecords(true);
    try {
      const [aptRes, rxRes, labRes] = await Promise.allSettled([
        fetchAppointments(accessToken, { patientId }),
        fetchPrescriptions(accessToken, { patientId }),
        fetchLabOrders(accessToken, { patientId }),
      ]);

      const rows: MedicalRecordRow[] = [];

      if (aptRes.status === 'fulfilled' && Array.isArray(aptRes.value)) {
        aptRes.value.forEach((apt) => {
          rows.push({
            id: `apt-${apt.id}`,
            visitDate: apt.appointmentDate.split('T')[0] || 'Recent',
            visitTime: apt.startTime || '09:00 AM',
            visitType: apt.type === 'FOLLOW_UP' ? 'Follow-up' : 'Consultation',
            department: 'General OPD',
            doctor: {
              name: apt.doctorName || 'Attending Physician',
              specialty: 'Physician',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctorName || 'Physician')}&size=80&background=dbeafe&color=1e40af`,
            },
            diagnosisSummary: apt.notes || apt.reason || 'General clinical consultation encounter.',
            status: 'Completed',
          });
        });
      }

      if (rxRes.status === 'fulfilled' && Array.isArray(rxRes.value)) {
        rxRes.value.forEach((rx) => {
          rows.push({
            id: `rx-${rx.id}`,
            visitDate: new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            visitTime: new Date(rx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            visitType: 'Prescription',
            department: 'Pharmacy',
            doctor: {
              name: rx.doctorName || 'Attending Physician',
              specialty: 'Physician',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(rx.doctorName || 'Physician')}&size=80&background=dbeafe&color=1e40af`,
            },
            diagnosisSummary: rx.diagnosis ? `Prescribed for: ${rx.diagnosis}` : 'Medication order fulfilled.',
            status: 'Completed',
          });
        });
      }

      if (labRes.status === 'fulfilled' && Array.isArray(labRes.value)) {
        labRes.value.forEach((lab) => {
          rows.push({
            id: `lab-${lab.id}`,
            visitDate: new Date(lab.orderedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            visitTime: new Date(lab.orderedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            visitType: 'Lab Visit',
            department: 'Laboratory',
            doctor: {
              name: 'Diagnostic Pathology',
              specialty: 'Laboratory',
              avatar: 'https://ui-avatars.com/api/?name=Lab+Team&size=80&background=ede9fe&color=6d28d9',
            },
            diagnosisSummary: lab.clinicalNotes || (lab.results?.[0]?.testName ? `Lab result: ${lab.results[0].testName}` : 'Diagnostic order recorded.'),
            status: 'Completed',
          });
        });
      }

      setRecords(rows);
      if (rows.length > 0) {
        setSelectedRecord(rows[0]!);
      } else {
        setSelectedRecord(null);
      }
    } catch (e) {
      console.error('Failed to load patient history:', e);
      setRecords([]);
      setSelectedRecord(null);
    } finally {
      setLoadingRecords(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedPatientId) {
      void loadPatientHistory(selectedPatientId);
    }
  }, [selectedPatientId, loadPatientHistory]);

  const selectedPatientDto = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patient: PatientItem | null = selectedPatientDto
    ? {
        id: selectedPatientDto.id,
        name: selectedPatientDto.fullName || `${selectedPatientDto.firstName} ${selectedPatientDto.lastName}`.trim(),
        pid: selectedPatientDto.pid,
        age: selectedPatientDto.dateOfBirth
          ? Math.max(1, new Date().getFullYear() - new Date(selectedPatientDto.dateOfBirth).getFullYear())
          : 35,
        gender: (selectedPatientDto.gender || '').toLowerCase().startsWith('f') ? 'Female' : 'Male',
        phone: selectedPatientDto.phoneNumber || '—',
        email: selectedPatientDto.email || '—',
        address: selectedPatientDto.address || selectedPatientDto.city || 'Addis Ababa, Ethiopia',
        department: 'General OPD',
        lastVisit: new Date(selectedPatientDto.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastVisitReason: 'General Consultation',
        status: selectedPatientDto.status === 'INACTIVE' ? 'Inactive' : 'Active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPatientDto.fullName || selectedPatientDto.firstName)}&size=150&background=dbeafe&color=1e40af`,
        totalVisits: records.length || 1,
        conditions: [],
      }
    : null;

  const filteredRows = records.filter((r) => {
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

      {/* Patient Selector Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative min-w-[220px]">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            disabled={loadingPatients || patients.length === 0}
            className="w-full appearance-none px-3 py-2 pr-8 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            {patients.length === 0 ? (
              <option value="">{loadingPatients ? 'Loading patients...' : 'No patients found'}</option>
            ) : (
              patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.pid})
                </option>
              ))
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          onClick={() => {
            void loadPatients();
            if (selectedPatientId) void loadPatientHistory(selectedPatientId);
          }}
          disabled={loadingRecords}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh Record"
        >
          <RefreshCw className={`w-4 h-4 ${loadingRecords ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Patient Card */}
      {patient ? (
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
                {patient.age} years • {patient.gender}
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
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 text-center text-xs text-slate-400">
          No patient selected
        </div>
      )}

      {/* Record Inspection Card */}
      {selectedRecord ? (
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

          <div className="pt-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => setRxModalOpen(true)}
              className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-blue-600" /> Rx
            </button>
            <button
              onClick={() => setLabModalOpen(true)}
              className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-orange-500" /> Lab
            </button>
            <button
              onClick={() => setReferralModalOpen(true)}
              className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" /> Refer
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 text-center text-xs text-slate-400">
          Select an encounter row to view clinical notes
        </div>
      )}
    </>
  );

  return (
    <>
      <DoctorPageShell header={headerContent} rightPanel={rightPanelContent} rightPanelWidth="lg:w-[320px] xl:w-[360px]">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Filters & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['All', 'Follow-up', 'Consultation', 'Lab Visit', 'Prescription'].map((type) => (
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
                {loadingRecords ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading clinical encounters...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No clinical records found for the selected patient.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const isSelected = selectedRecord?.id === row.id;
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
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${visitTypeStyle[row.visitType] || 'bg-slate-50 text-slate-600'}`}
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
                  })
                )}
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
        onOpenReferralModal={() => setReferralModalOpen(true)}
      />
      <DoctorPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        defaultPatientId={patient?.id}
        onSuccess={() => {
          if (selectedPatientId) void loadPatientHistory(selectedPatientId);
        }}
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={patient?.id}
        onSuccess={() => {
          if (selectedPatientId) void loadPatientHistory(selectedPatientId);
        }}
      />
      <DoctorReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        patientId={patient?.id}
        patientName={patient?.name}
        onSuccess={() => {
          if (selectedPatientId) void loadPatientHistory(selectedPatientId);
        }}
      />
    </>
  );
}

export default MedicalRecordsPage;
