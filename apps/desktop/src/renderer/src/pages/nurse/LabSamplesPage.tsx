import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  Truck,
  FileCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Calendar,
  Barcode,
  Printer,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { NurseLabSample } from '../../components/nurse/nurseMockData';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import NurseLabSampleDetailsModal from '../../components/nurse/NurseLabSampleDetailsModal';
import CollectLabModal from '../../components/nurse/CollectLabModal';
import { useAuth } from '../../auth/AuthContext';
import { fetchLabOrders } from '../../api/clinical';
import type { LabOrderDTO } from '@mcms/contracts';

// Map LabOrderDTO → NurseLabSample for desktop display
function mapLabOrderToSample(dto: LabOrderDTO): NurseLabSample {
  const rawStatus = dto.samples[0]?.status ?? dto.status;
  const statusMap: Record<string, NurseLabSample['status']> = {
    PENDING: 'Pending',
    COLLECTED: 'Collected',
    IN_LAB: 'In Lab',
    PROCESSING: 'In Lab',
    COMPLETED: 'Completed',
    VERIFIED: 'Completed',
  };
  const sampleType = dto.samples[0]?.sampleType;
  const allowedTypes: NurseLabSample['sampleType'][] = ['Blood', 'Urine', 'Stool', 'Swab', 'Sputum'];
  const normalizedType: NurseLabSample['sampleType'] =
    allowedTypes.find((t) => t.toLowerCase() === (sampleType ?? '').toLowerCase()) ?? 'Blood';

  return {
    id: dto.id,
    sampleId: dto.samples[0]?.sampleId ?? dto.orderNumber,
    patientId: dto.patientId,
    patientName: dto.patientName,
    patientPid: dto.patientPid,
    patientAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.patientName)}`,
    room: 'Ward 3A',
    phone: '—',
    email: '—',
    address: 'Addis Ababa, Ethiopia',
    department: 'General Lab',
    testName: dto.results[0]?.testName ?? (dto.samples[0] ? `${normalizedType} Panel` : 'Lab Test'),
    sampleType: normalizedType,
    priority: dto.priority === 'HIGH' ? 'High' : dto.priority === 'URGENT' ? 'Urgent' : 'Normal',
    collectionTime: dto.samples[0]?.collectedAt
      ? new Date(dto.samples[0].collectedAt).toLocaleString()
      : new Date(dto.orderedAt).toLocaleString(),
    status: statusMap[rawStatus.toUpperCase()] ?? 'Pending',
    doctor: dto.orderingDoctorName ?? 'Attending Doctor',
    ...(dto.clinicalNotes ? { instructions: dto.clinicalNotes } : {}),
    ...(dto.samples[0]?.collectedAt ? { collectedAt: new Date(dto.samples[0].collectedAt).toLocaleString() } : {}),
    ...(dto.samples[0]?.receivedAt ? { deliveredAt: new Date(dto.samples[0].receivedAt).toLocaleString() } : {}),
  };
}

export function LabSamplesPage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'collected' | 'in_lab' | 'completed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedSampleType, setSelectedSampleType] = useState('All Sample Types');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [samples, setSamples] = useState<NurseLabSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSample, setSelectedSample] = useState<NurseLabSample | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [collectModalOpen, setCollectModalOpen] = useState(false);

  const loadSamples = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const orders = await fetchLabOrders(accessToken);
      if (Array.isArray(orders) && orders.length > 0) {
        const mapped = orders.map(mapLabOrderToSample);
        setSamples(mapped);
        setSelectedSample((prev) => {
          if (prev) {
            const found = mapped.find((m) => m.id === prev.id);
            if (found) return found;
          }
          return mapped[0] ?? null;
        });
      } else {
        setSamples([]);
        setSelectedSample(null);
      }
    } catch (err) {
      console.error('Failed to load lab orders for desktop:', err);
      setSamples([]);
      setSelectedSample(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadSamples();
  }, [loadSamples]);

  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      if (activeTab === 'pending' && sample.status !== 'Pending') return false;
      if (activeTab === 'collected' && sample.status !== 'Collected') return false;
      if (activeTab === 'in_lab' && sample.status !== 'In Lab') return false;
      if (activeTab === 'completed' && sample.status !== 'Completed') return false;

      if (selectedDept !== 'All Departments' && sample.department !== selectedDept) return false;
      if (selectedSampleType !== 'All Sample Types' && sample.sampleType !== selectedSampleType) return false;
      if (selectedPriority !== 'All Priorities' && sample.priority !== selectedPriority) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sample.patientName.toLowerCase().includes(q);
        const matchPid = sample.patientPid.toLowerCase().includes(q);
        const matchTest = sample.testName.toLowerCase().includes(q);
        const matchBar = sample.sampleId.toLowerCase().includes(q);
        if (!matchName && !matchPid && !matchTest && !matchBar) return false;
      }
      return true;
    });
  }, [samples, activeTab, selectedDept, selectedSampleType, selectedPriority, searchQuery]);

  const totalPages = Math.ceil(filteredSamples.length / rowsPerPage) || 1;
  const paginatedSamples = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSamples.slice(start, start + rowsPerPage);
  }, [filteredSamples, currentPage, rowsPerPage]);

  const stats = useMemo(() => {
    const total = samples.length;
    const pending = samples.filter((s) => s.status === 'Pending').length;
    const collected = samples.filter((s) => s.status === 'Collected').length;
    const inLab = samples.filter((s) => s.status === 'In Lab').length;
    const completed = samples.filter((s) => s.status === 'Completed').length;
    return { total, pending, collected, inLab, completed };
  }, [samples]);

  const handleOpenDetails = (sample: NurseLabSample) => {
    setSelectedSample(sample);
    setDetailsModalOpen(true);
  };

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <FlaskConical size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Lab Sample Collection</h1>
              <p className="text-xs text-gray-400 mt-0.5">Collect phlebotomy, urine, and pathology specimens with barcode tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadSamples()}
              disabled={loading}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-2xs cursor-pointer"
              title="Refresh Samples"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-600' : ''} />
            </button>
            <button
              onClick={() => setCollectModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FlaskConical size={13} />
              <span>Collect Sample</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard
            icon={Clock}
            color="amber"
            label="Pending Collection"
            value={String(stats.pending)}
            trend="Awaiting phlebotomy"
            trendUp={stats.pending === 0}
          />
          <NurseStatCard
            icon={CheckCircle2}
            color="green"
            label="Specimens Collected"
            value={String(stats.collected)}
            trend="Labeled & barcoded"
            trendUp={true}
          />
          <NurseStatCard
            icon={Truck}
            color="blue"
            label="Processing in Lab"
            value={String(stats.inLab)}
            trend="Under pathology analysis"
            trendUp={true}
          />
          <NurseStatCard
            icon={FileCheck}
            color="purple"
            label="Results Completed"
            value={String(stats.completed)}
            trend="Reported to doctor"
            trendUp={true}
          />
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(
                [
                  { id: 'pending', label: 'Pending Collection' },
                  { id: 'collected', label: 'Collected / Transit' },
                  { id: 'in_lab', label: 'In Lab Analysis' },
                  { id: 'completed', label: 'Results Ready' },
                  { id: 'all', label: 'All Orders' },
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
                      ? 'bg-cyan-600 text-white shadow-2xs'
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
                  placeholder="Search barcode, test, patient..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <select
                value={selectedSampleType}
                onChange={(e) => {
                  setSelectedSampleType(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none"
              >
                <option value="All Sample Types">All Specimen Types</option>
                <option value="Blood">Blood</option>
                <option value="Urine">Urine</option>
                <option value="Stool">Stool</option>
                <option value="Swab">Swab</option>
                <option value="Sputum">Sputum</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-2.5 px-3">Barcode Tag</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Test / Panel</th>
                  <th className="py-2.5 px-3">Specimen</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <RefreshCw size={24} className="animate-spin text-cyan-600 mx-auto mb-2" />
                      Loading lab orders...
                    </td>
                  </tr>
                ) : paginatedSamples.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No lab specimen orders found.
                    </td>
                  </tr>
                ) : (
                  paginatedSamples.map((sample) => {
                    const isSelected = selectedSample?.id === sample.id;
                    return (
                      <tr
                        key={sample.id}
                        onClick={() => setSelectedSample(sample)}
                        className={`hover:bg-cyan-50/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-50/60' : ''
                        }`}
                      >
                        <td className="py-2 px-3">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                            {sample.sampleId}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={sample.patientAvatar}
                              alt={sample.patientName}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <span className="font-bold text-gray-800 block leading-tight">{sample.patientName}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{sample.patientPid}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-gray-800 block">{sample.testName}</span>
                          <span className="text-[10px] text-gray-400">By: {sample.doctor}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-gray-700">{sample.sampleType}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sample.priority === 'Urgent' || sample.priority === 'High'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {sample.priority}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sample.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : sample.status === 'In Lab'
                                  ? 'bg-blue-100 text-blue-700'
                                  : sample.status === 'Collected'
                                    ? 'bg-cyan-100 text-cyan-700'
                                    : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {sample.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenDetails(sample)}
                              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={13} />
                            </button>
                            {sample.status === 'Pending' && (
                              <button
                                onClick={() => {
                                  setSelectedSample(sample);
                                  setCollectModalOpen(true);
                                }}
                                className="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Collect
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-2.5 sm:p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredSamples.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * rowsPerPage, filteredSamples.length)} of {filteredSamples.length} records
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    currentPage === n ? 'bg-blue-600 text-white shadow-2xs' : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
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
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2.5">Specimen Barcode Tag</h3>
          {selectedSample ? (
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="font-mono text-base font-black tracking-widest text-slate-800">{selectedSample.sampleId}</div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mt-1">
                  <Barcode size={16} />
                  <span>2D Barcode Generated</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Patient:</span>
                  <span className="font-semibold text-gray-800">{selectedSample.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Test:</span>
                  <span className="text-gray-800 font-medium">{selectedSample.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Specimen:</span>
                  <span className="text-gray-700">{selectedSample.sampleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Priority:</span>
                  <span className="font-bold text-rose-600">{selectedSample.priority}</span>
                </div>
              </div>

              {selectedSample.status === 'Pending' && (
                <button
                  onClick={() => {
                    setSelectedSample(selectedSample);
                    setCollectModalOpen(true);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Collect & Print Tube Label
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-3 text-center">Select an order to view specimen barcode</p>
          )}
        </div>
      </aside>

      {/* Modals */}
      <NurseLabSampleDetailsModal
        sample={selectedSample}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onCollect={() => {
          setDetailsModalOpen(false);
          setCollectModalOpen(true);
        }}
      />
      <CollectLabModal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        onCollect={() => void loadSamples()}
        selectedPatientId={selectedSample?.patientId}
      />
    </div>
  );
}

export default React.memo(LabSamplesPage);
