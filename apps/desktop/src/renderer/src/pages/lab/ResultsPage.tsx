import React, { useState } from 'react';
import {
  CalendarCheck2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronRight,
  Eye,
  X,
  FileCheck,
  ShieldCheck,
  User,
  Activity,
} from 'lucide-react';
import {
  EXACT_RESULT_ROWS,
  TestResultItem,
} from '../../components/lab/resultsMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export function ResultsPage() {
  const [results, setResults] = useState<TestResultItem[]>(EXACT_RESULT_ROWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedResult, setSelectedResult] = useState<TestResultItem | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.resultId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sampleId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleVerify = (resultId: string) => {
    setResults(
      results.map((r) =>
        r.resultId === resultId
          ? { ...r, status: 'Verified' as const, verifiedBy: 'Dawit Tadesse', verifiedAt: 'Just now' }
          : r
      )
    );
  };

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Results Verification & Diagnostic Reports
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Validate quantitative analyzer outputs, review abnormal flags, and authorize EHR release.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Batch verification completed for all normal parameters.')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Batch Authorize</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="Total Results" value={results.length} color="blue" />
      <LabStatCard title="Pending Review" value={results.filter((r) => r.status === 'Pending' || r.status === 'Reviewed').length} color="amber" />
      <LabStatCard title="Abnormal / High" value={results.filter((r) => r.status === 'Abnormal').length} color="rose" />
      <LabStatCard title="Verified & Released" value={results.filter((r) => r.status === 'Verified').length} color="emerald" />
      <LabStatCard title="Turnaround Rate" value="98.4%" change={{ change: '+2.1%', trend: 'up' }} color="cyan" />
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent}>
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by result ID, patient name, test, sample..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 font-bold text-[11px]">
          {['ALL', 'VERIFIED', 'ABNORMAL', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === st ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Result ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Test</th>
                <th className="py-2.5 px-3">Primary Finding</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Completed At</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">
                    {r.resultId}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{r.patientName}</div>
                    <div className="text-[10px] text-slate-400">{r.patientId}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{r.testName}</div>
                    <div className="text-[10px] text-slate-400">{r.sampleId}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {r.resultValue}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{r.department}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        r.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.status === 'Abnormal'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{r.completedAt}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status !== 'Verified' && (
                        <button
                          onClick={() => handleVerify(r.resultId)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition cursor-pointer"
                        >
                          Verify & Sign
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedResult(r);
                          setReportModalOpen(true);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                        title="View Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Diagnostic Report Modal */}
      {reportModalOpen && selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-black text-slate-800 text-sm">Official Diagnostic Report</span>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Patient Details</div>
                  <div className="font-bold text-slate-900 text-sm">{selectedResult.patientName}</div>
                  <div className="text-slate-500">{selectedResult.patientId} • {selectedResult.patientAge}y • {selectedResult.patientGender}</div>
                  <div className="text-slate-500">{selectedResult.patientRoom}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Specimen & Test</div>
                  <div className="font-bold text-slate-900">{selectedResult.testFullName}</div>
                  <div className="font-mono text-cyan-700">Sample: {selectedResult.sampleId}</div>
                  <div className="text-slate-500">Collected: {selectedResult.collectedAt}</div>
                </div>
              </div>

              {/* Parameters Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Test Parameter</th>
                      <th className="py-2 px-3">Observed Value</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3">Reference Range</th>
                      <th className="py-2 px-3 text-right">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedResult.parameters.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{p.parameter}</td>
                        <td className={`py-2 px-3 font-bold ${p.status === 'High' ? 'text-rose-600' : p.status === 'Low' ? 'text-blue-600' : 'text-slate-800'}`}>
                          {p.result}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{p.unit}</td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{p.referenceRange}</td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                              p.status === 'Normal'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-400">Pathologist Comments</div>
                <div className="text-slate-700 mt-0.5">{selectedResult.notes || 'Normal analytical pattern verified.'}</div>
                <div className="text-[10px] text-slate-400 mt-2">
                  Verified by: {selectedResult.verifiedBy} • {selectedResult.verifiedAt}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center shrink-0">
              <button
                onClick={() => alert('Printing diagnostic report PDF to local printer...')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>

              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </LabPageShell>
  );
}

export default ResultsPage;
