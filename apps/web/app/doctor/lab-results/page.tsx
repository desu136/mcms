'use client';

import React, { useState } from 'react';
import { FlaskConical, Plus, Search, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';

export default function DoctorLabResultsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const labResults = [
    {
      id: 'lab-1',
      orderId: 'LAB-202610-001',
      patient: 'Aster Mulu',
      pid: 'PID-001024',
      test: 'High Sensitivity Troponin I',
      result: '< 0.01 ng/mL',
      reference: '0.00 - 0.04 ng/mL',
      flag: 'Normal',
      verifiedBy: 'Dr. Fitsum Alemu',
      date: 'Oct 19, 2026',
      status: 'Verified',
    },
    {
      id: 'lab-2',
      orderId: 'LAB-202610-002',
      patient: 'Aster Mulu',
      pid: 'PID-001024',
      test: 'Total Serum Cholesterol',
      result: '235 mg/dL',
      reference: '< 200 mg/dL',
      flag: 'High',
      verifiedBy: 'Dr. Fitsum Alemu',
      date: 'Oct 19, 2026',
      status: 'Verified',
    },
    {
      id: 'lab-3',
      orderId: 'LAB-202610-003',
      patient: 'Samuel Girma',
      pid: 'PID-001087',
      test: 'Complete Blood Count (CBC)',
      result: 'WBC: 6.8, Hb: 14.5 g/dL',
      reference: 'Standard Ranges',
      flag: 'Normal',
      verifiedBy: 'Pathologist Dr. Mengesha',
      date: 'Oct 18, 2026',
      status: 'Verified',
    },
    {
      id: 'lab-4',
      orderId: 'LAB-202610-004',
      patient: 'Tigist Alemu',
      pid: 'PID-001045',
      test: 'Serum Potassium (K+)',
      result: '5.6 mmol/L',
      reference: '3.5 - 5.0 mmol/L',
      flag: 'Critical',
      verifiedBy: 'Pathologist Dr. Mengesha',
      date: 'Oct 18, 2026',
      status: 'Critical Alert',
    },
  ];

  const filtered = labResults.filter(
    (l) =>
      l.patient.toLowerCase().includes(search.toLowerCase()) ||
      l.test.toLowerCase().includes(search.toLowerCase()) ||
      l.orderId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
            <FlaskConical className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Laboratory Diagnostic Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Verified clinical pathology findings, cardiac markers, and specimen panels.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Order New Lab Test</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lab results by patient, test name, or order ID..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Patient</th>
                <th className="py-3 px-5">Diagnostic Test</th>
                <th className="py-3 px-5">Result Value</th>
                <th className="py-3 px-5">Reference Range</th>
                <th className="py-3 px-5">Flag</th>
                <th className="py-3 px-5">Verification</th>
                <th className="py-3 px-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-orange-600">{r.orderId}</td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-800">{r.patient}</div>
                    <div className="text-[10px] text-slate-400">{r.pid}</div>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">{r.test}</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-800">{r.result}</td>
                  <td className="py-3.5 px-5 text-slate-500">{r.reference}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        r.flag === 'Normal'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : r.flag === 'High'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                      }`}
                    >
                      {r.flag}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-medium">{r.verifiedBy}</td>
                  <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DoctorLabOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
