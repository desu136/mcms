import React, { useState } from 'react';
import {
  TestTube2,
  Search,
  Scan,
  Printer,
  CheckCircle2,
  AlertOctagon,
  Clock,
  PlusCircle,
  X,
  Tag,
} from 'lucide-react';
import { EXACT_SAMPLE_ROWS, SampleItem } from '../../components/lab/sampleMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export function SamplesPage() {
  const [samples, setSamples] = useState<SampleItem[]>(EXACT_SAMPLE_ROWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [specimenFilter, setSpecimenFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<SampleItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Hemolyzed sample');

  const filteredSamples = samples.filter((s) => {
    const matchesSearch =
      s.sampleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecimen = specimenFilter === 'ALL' || s.sampleType.toUpperCase().includes(specimenFilter.toUpperCase());
    const matchesStatus = statusFilter === 'ALL' || s.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesSpecimen && matchesStatus;
  });

  const handleProcessSample = (sampleId: string) => {
    setSamples(
      samples.map((s) =>
        s.sampleId === sampleId ? { ...s, status: 'In Processing' as const } : s
      )
    );
  };

  const handleConfirmReject = () => {
    if (!selectedSample) return;
    setSamples(
      samples.map((s) =>
        s.sampleId === selectedSample.sampleId
          ? { ...s, status: 'Rejected' as const }
          : s
      )
    );
    setRejectModalOpen(false);
    setSelectedSample(null);
  };

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Specimen Accessioning & Sample Tracking
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Barcode verification, tube type routing, and pre-analytical quality assurance.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Barcode scanner ready. Please scan accession tube label.')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Scan Tube Barcode</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="Total Samples" value={samples.length} color="cyan" />
      <LabStatCard title="Collected Queue" value={samples.filter((s) => s.status === 'Collected').length} color="blue" />
      <LabStatCard title="In Processing" value={samples.filter((s) => s.status === 'In Processing').length} color="amber" />
      <LabStatCard title="Completed Runs" value={samples.filter((s) => s.status === 'Completed').length} color="emerald" />
      <LabStatCard title="Rejected / QA" value={samples.filter((s) => s.status === 'Rejected').length} color="rose" />
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent}>
      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Scan barcode or search by sample ID, patient, test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={specimenFilter}
            onChange={(e) => setSpecimenFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Specimens</option>
            <option value="BLOOD">Blood</option>
            <option value="URINE">Urine</option>
            <option value="SWAB">Swab</option>
          </select>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 font-bold text-[11px]">
            {['ALL', 'COLLECTED', 'IN PROCESSING', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white text-cyan-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Sample ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Specimen Type</th>
                <th className="py-2.5 px-3">Test Panel</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Collection Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSamples.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-cyan-700">{s.sampleId}</div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{s.testCode}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{s.patientName}</div>
                    <div className="text-[10px] text-slate-400">{s.patientId} • {s.patientRoom}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-700">{s.sampleType}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{s.testName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{s.department}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{s.collectionTime}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        s.status === 'Collected'
                          ? 'bg-blue-50 text-blue-700'
                          : s.status === 'In Processing'
                          ? 'bg-amber-50 text-amber-700'
                          : s.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {s.status === 'Collected' && (
                        <button
                          onClick={() => handleProcessSample(s.sampleId)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition cursor-pointer"
                        >
                          Process
                        </button>
                      )}
                      {s.status !== 'Rejected' && s.status !== 'Completed' && (
                        <button
                          onClick={() => {
                            setSelectedSample(s);
                            setRejectModalOpen(true);
                          }}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Reject Sample"
                        >
                          <AlertOctagon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Printing barcode label for ${s.sampleId}`)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title="Print Barcode"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Specimen Modal */}
      {rejectModalOpen && selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-rose-600 font-black">
                <AlertOctagon className="w-5 h-5" />
                <span>Reject Specimen QA Check</span>
              </div>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-100 text-rose-800">
                You are rejecting sample <span className="font-mono font-bold">{selectedSample.sampleId}</span> for{' '}
                <span className="font-bold">{selectedSample.patientName}</span>. A re-collection request will be sent to the nursing staff.
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Rejection Reason
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                >
                  <option value="Hemolyzed sample">Hemolyzed sample (Red cells lysed)</option>
                  <option value="Clotted blood in EDTA tube">Clotted blood in EDTA tube</option>
                  <option value="Insufficient volume (QNS)">Insufficient volume (Quantity Not Sufficient)</option>
                  <option value="Incorrect container / tube type">Incorrect container / tube type</option>
                  <option value="Mislabeled or unlabeled specimen">Mislabeled or unlabeled specimen</option>
                </select>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </LabPageShell>
  );
}

export default SamplesPage;
