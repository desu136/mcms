import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Calendar,
  FileText,
  AlertCircle,
  ShieldCheck,
  History,
  ClipboardList,
} from 'lucide-react';
import {
  NURSE_MEDICATIONS,
  NurseMedicationRecord,
  NURSE_MEDICATION_ALERTS,
} from '../../components/nurse/nurseMockData';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import NurseMedicationDetailsModal from '../../components/nurse/NurseMedicationDetailsModal';
import AdministerMedModal from '../../components/nurse/AdministerMedModal';
import { useAuth } from '../../auth/AuthContext';
import { fetchMedications, administerMedication } from '../../api/clinical';
import type { MedicationAdminDTO } from '@mcms/contracts';

function mapDTOToRecord(dto: MedicationAdminDTO): NurseMedicationRecord {
  const dtoStatus = (dto.status || '').toUpperCase();
  let uiStatus: NurseMedicationRecord['status'] = 'Pending';
  if (dtoStatus === 'ADMINISTERED') uiStatus = 'Administered';
  else if (dtoStatus === 'MISSED') uiStatus = 'Missed';
  else if (dtoStatus === 'DUE_SOON') uiStatus = 'Due Soon';
  else if (dtoStatus === 'REFILL_DUE') uiStatus = 'Refill Due';

  const validRoute = (['Oral', 'Subcutaneous', 'Intravenous', 'Intramuscular', 'Inhalation', 'Topical'] as const).find(
    (r) => r.toLowerCase() === (dto.route || '').toLowerCase()
  ) ?? 'Oral';

  const validSchedule = (['BID', 'TID', 'QID', 'Daily', 'Before Meals', 'PRN', 'Every 8 hrs'] as const).find(
    (s) => s.toLowerCase() === (dto.schedule || '').toLowerCase()
  ) ?? 'Daily';

  return {
    id: dto.id,
    patientId: dto.patientId,
    patientName: dto.patientName,
    patientPid: `PID-${dto.patientId.slice(0, 6).toUpperCase()}`,
    patientAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.patientName)}&background=EFF6FF&color=2563EB&size=64`,
    age: 35,
    gender: 'Female',
    phone: '+251 911 000 000',
    email: `${dto.patientName.toLowerCase().replace(/\s+/g, '.')}@mcms.local`,
    address: 'Addis Ababa, Ethiopia',
    room: 'Ward 3A',
    department: 'Cardiology',
    condition: 'Under Care',
    medicationName: dto.medicationName,
    dose: dto.dose,
    route: validRoute,
    schedule: validSchedule,
    nextDue: dto.scheduledTime ?? 'Today 12:00 PM',
    status: uiStatus,
    prescribingDoctor: dto.administeredByName ?? 'Attending Physician',
    instructions: dto.instructions ?? 'Administer per schedule',
    ...(dto.administeredAt ? { lastAdministered: dto.administeredAt } : {}),
  };
}

export function MedicationsPage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'records' | 'pending' | 'missed' | 'refills'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [meds, setMeds] = useState<NurseMedicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMed, setSelectedMed] = useState<NurseMedicationRecord | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [medForAdminister, setMedForAdminister] = useState<NurseMedicationRecord | null>(null);

  const loadMeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMedications(accessToken);
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDTOToRecord);
        setMeds(mapped);
        if (!selectedMed) setSelectedMed(mapped[0]!);
      } else {
        setMeds(NURSE_MEDICATIONS);
        if (!selectedMed) setSelectedMed(NURSE_MEDICATIONS[0]!);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load medications');
      setMeds(NURSE_MEDICATIONS);
      if (!selectedMed) setSelectedMed(NURSE_MEDICATIONS[0]!);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadMeds();
  }, [loadMeds]);

  const handleAdminister = async (med: NurseMedicationRecord) => {
    try {
      await administerMedication(
        med.id,
        { status: 'ADMINISTERED', administeredAt: new Date().toISOString() },
        accessToken,
      );
      await loadMeds();
    } catch (err) {
      try {
        await (window as any).electron?.ipcRenderer?.invoke('enqueue-operation', {
          type: 'ADMINISTER_MEDICATION',
          payload: { medId: med.id, status: 'ADMINISTERED', administeredAt: new Date().toISOString() },
        });
      } catch { /* ignore */ }
    }
    setAdministerModalOpen(false);
  };

  const filteredMeds = useMemo(() => {
    return meds.filter((med) => {
      if (activeTab === 'pending' && med.status !== 'Pending' && med.status !== 'Due Soon') return false;
      if (activeTab === 'missed' && med.status !== 'Missed') return false;
      if (activeTab === 'refills' && med.status !== 'Refill Due') return false;
      if (activeTab === 'records' && med.status !== 'Administered') return false;

      if (selectedStatus !== 'All Statuses' && med.status !== selectedStatus) return false;
      if (selectedDept !== 'All Departments' && med.department !== selectedDept) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = med.patientName.toLowerCase().includes(query);
        const matchPid = med.patientPid.toLowerCase().includes(query);
        const matchMed = med.medicationName.toLowerCase().includes(query);
        const matchRoom = med.room.toLowerCase().includes(query);
        if (!matchName && !matchPid && !matchMed && !matchRoom) return false;
      }
      return true;
    });
  }, [meds, activeTab, selectedStatus, selectedDept, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMeds.length / rowsPerPage));
  const paginatedMeds = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMeds.slice(start, start + rowsPerPage);
  }, [filteredMeds, currentPage, rowsPerPage]);

  const handleOpenDetails = (med: NurseMedicationRecord) => {
    setSelectedMed(med);
    setDetailsModalOpen(true);
  };

  const handleOpenAdminister = (med: NurseMedicationRecord) => {
    setMedForAdminister(med);
    setAdministerModalOpen(true);
  };

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Pill size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Medications & eMAR</h1>
              <p className="text-xs text-gray-400 mt-0.5">Administer, verify and track patient pharmacological rounds</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white border border-gray-200/80 rounded-lg px-2.5 py-1 text-xs text-gray-600 flex items-center gap-1.5 shadow-xs">
              <Clock size={13} className="text-purple-600" />
              <span className="font-medium text-[11px]">Shift Round: 08:00 - 16:00</span>
            </div>
            <button
              onClick={() => void loadMeds()}
              disabled={loading}
              className="bg-white border border-gray-200/80 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard
            title="Scheduled Today"
            value={meds.length}
            iconName="calendar"
            trendText="total doses"
            trendDirection="up"
            trendIsPositive={true}
            color="purple"
          />
          <NurseStatCard
            title="Administered"
            value={meds.filter((m) => m.status === 'Administered').length}
            iconName="check"
            trendText="verified given"
            trendDirection="up"
            trendIsPositive={true}
            color="emerald"
          />
          <NurseStatCard
            title="Pending Due"
            value={meds.filter((m) => m.status === 'Pending' || m.status === 'Due Soon').length}
            iconName="clock"
            trendText="next rounds"
            trendDirection="up"
            trendIsPositive={false}
            color="amber"
          />
          <NurseStatCard
            title="Missed / Refill"
            value={meds.filter((m) => m.status === 'Missed' || m.status === 'Refill Due').length}
            iconName="alert"
            trendText="requires action"
            trendDirection="down"
            trendIsPositive={false}
            color="rose"
          />
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All Medications' },
                  { id: 'pending', label: 'Pending / Due' },
                  { id: 'records', label: 'Administered' },
                  { id: 'missed', label: 'Missed' },
                  { id: 'refills', label: 'Refills Needed' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search med, patient, room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Administered">Administered</option>
                <option value="Pending">Pending</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Missed">Missed</option>
                <option value="Refill Due">Refill Due</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Medication</th>
                  <th className="py-2.5 px-3">Dosage / Route</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMeds.map((med) => {
                  const isSelected = selectedMed?.id === med.id;
                  return (
                    <tr
                      key={med.id}
                      onClick={() => setSelectedMed(med)}
                      className={`hover:bg-purple-50/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-purple-50/60' : ''
                      }`}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={med.patientAvatar}
                            alt={med.patientName}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-800 block leading-tight">{med.patientName}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {med.patientPid} · {med.room}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-gray-800 block">{med.medicationName}</span>
                        <span className="text-[10px] text-gray-400">{med.condition}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-gray-700">{med.dose}</span>
                        <span className="text-[10px] text-purple-600 block">{med.route}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-gray-700">{med.schedule}</span>
                        <span className="text-[10px] text-gray-400 block">Due: {med.nextDue}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            med.status === 'Administered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : med.status === 'Due Soon' || med.status === 'Pending'
                              ? 'bg-amber-100 text-amber-700'
                              : med.status === 'Missed'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetails(med)}
                            className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </button>
                          {med.status !== 'Administered' && (
                            <button
                              onClick={() => handleOpenAdminister(med)}
                              className="px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Administer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-2.5 sm:p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredMeds.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * rowsPerPage, filteredMeds.length)} of {filteredMeds.length} records
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-72 xl:w-80 border-l border-gray-200 bg-white overflow-y-auto p-3 space-y-3 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2.5">Selected Dose Details</h3>
          {selectedMed ? (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                <div className="font-bold text-gray-900 text-sm">{selectedMed.medicationName}</div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {selectedMed.dose} · {selectedMed.route} ({selectedMed.schedule})
                </p>
                <div className="mt-2 pt-2 border-t border-blue-100/60 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Scheduled:</span>
                  <span className="font-bold text-blue-700">{selectedMed.nextDue}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Patient:</span>
                  <span className="font-semibold text-gray-800">{selectedMed.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-gray-700">Room {selectedMed.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prescriber:</span>
                  <span className="text-gray-700">{selectedMed.prescribingDoctor}</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenAdminister(selectedMed)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Verify & Administer
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-3 text-center">Select a medication to view details</p>
          )}
        </div>

        {/* Clinical Alerts */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2">eMAR Safety Alerts</h3>
          <div className="space-y-2 text-xs">
            {NURSE_MEDICATION_ALERTS.map((alert, i) => (
              <div key={i} className="p-2 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <AlertCircle size={13} className="text-amber-600" />
                  <span>{alert.patientName}</span>
                </div>
                <p className="text-[10px] text-amber-800 mt-1">{alert.details}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Modals */}
      <NurseMedicationDetailsModal
        medication={selectedMed}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onAdminister={() => {
          setDetailsModalOpen(false);
          if (selectedMed) handleOpenAdminister(selectedMed);
        }}
      />
      <AdministerMedModal
        isOpen={administerModalOpen}
        onClose={() => setAdministerModalOpen(false)}
        selectedPatientId={medForAdminister?.patientId}
      />
    </div>
  );
}

export default React.memo(MedicationsPage);
