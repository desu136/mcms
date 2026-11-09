'use client';

import React from 'react';
import { X, Printer, FlaskConical, AlertTriangle, CheckCircle2, ShieldCheck, Stethoscope } from 'lucide-react';
import type { LabOrderDTO } from '@mcms/contracts';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: LabOrderDTO | null;
  clinicName?: string;
}

export default function LabReportModal({
  isOpen,
  onClose,
  order,
  clinicName = "Betre's Healthcare Clinic",
}: LabReportModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.orderedAt
    ? new Date(order.orderedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  const hasAbnormal = order.results?.some((r) => r.isAbnormal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header toolbar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden bg-slate-50/70">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <FlaskConical className="w-4 h-4 text-purple-600" />
            <span>Diagnostic Laboratory Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Printable Area */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 print:p-8" id="printable-lab-report">
          {/* Clinic Brand Header */}
          <div className="flex items-start justify-between border-b-2 border-purple-600 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {clinicName} Laboratory
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Department of Pathology & Clinical Diagnostics • {order.branchName || 'Central Branch'}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Accredited Diagnostic Facility • ISO 15189 Standard
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono uppercase font-bold text-slate-400 block">
                Lab Order ID
              </span>
              <span className="text-sm font-mono font-extrabold text-slate-800">
                {order.id.slice(0, 10).toUpperCase()}
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hasAbnormal
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : order.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  {hasAbnormal ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Abnormal Flags Detected
                    </>
                  ) : order.status === 'COMPLETED' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Completed / Normal
                    </>
                  ) : (
                    'Processing / Pending'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Name</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{order.patientName}</p>
              <p className="text-[10px] font-mono font-semibold text-purple-600 mt-0.5">
                {order.patientPid || 'PID-GEN-001'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date Requested</span>
              <p className="font-bold text-slate-800 mt-0.5">{formattedDate}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Priority: <span className="font-bold uppercase text-slate-700">{order.priority || 'ROUTINE'}</span>
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ordering Doctor</span>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-purple-600 shrink-0" />
                {order.orderingDoctorName || 'Dr. Attending Physician'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Clinical Consultation</p>
            </div>
          </div>

          {/* Clinical Notes */}
          {order.clinicalNotes && (
            <div className="px-4 py-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs">
              <span className="font-bold text-purple-900 mr-1.5">Clinical Indication:</span>
              <span className="text-purple-800 font-medium">{order.clinicalNotes}</span>
            </div>
          )}

          {/* Test Results Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Laboratory Findings
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5">Test Parameter</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Measured Value</th>
                    <th className="py-2.5 px-3.5">Reference Range</th>
                    <th className="py-2.5 px-3.5 text-center">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {order.results && order.results.length > 0 ? (
                    order.results.map((r) => (
                      <tr
                        key={r.id}
                        className={r.isAbnormal ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50/50'}
                      >
                        <td className="py-3 px-3.5 font-sans font-bold text-slate-900">
                          {r.testName}
                        </td>
                        <td className="py-3 px-3.5 font-sans text-slate-500 text-[11px]">
                          {r.testCategory}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          {r.value} <span className="font-normal text-slate-500 text-[10px]">{r.unit || ''}</span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 text-[11px]">
                          {r.referenceRange || 'Within standard limits'}
                        </td>
                        <td className="py-3 px-3.5 text-center font-sans">
                          {r.isAbnormal ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              ABNORMAL
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              NORMAL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : order.samples && order.samples.length > 0 ? (
                    order.samples.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 font-sans">
                        <td className="py-3 px-3.5 font-bold text-slate-800">
                          Specimen Analysis ({s.sampleType})
                        </td>
                        <td className="py-3 px-3.5 text-slate-500">Specimen Processing</td>
                        <td className="py-3 px-3.5 italic text-slate-400">Specimen {s.status.toLowerCase()}</td>
                        <td className="py-3 px-3.5 text-slate-400">—</td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs italic font-sans">
                        Order received. Specimen processing in laboratory.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer & Technologist Certification */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6">
            <div className="text-[10px] text-slate-400 space-y-1">
              <p>• Results correspond strictly to the specimen submitted to the laboratory.</p>
              <p>• Clinical correlation is recommended for abnormal findings.</p>
              <p>• Electronically verified and signed by certified laboratory technologist.</p>
            </div>

            <div className="text-center sm:text-right shrink-0 w-48">
              <div className="h-10 border-b-2 border-slate-800 mb-1.5 flex items-end justify-center sm:justify-end">
                <span className="font-serif italic font-bold text-purple-900 text-sm">
                  Lab Technician Team
                </span>
              </div>
              <p className="text-[11px] font-black text-slate-800">Verified Technologist</p>
              <p className="text-[9px] text-slate-400">Department of Pathology</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
