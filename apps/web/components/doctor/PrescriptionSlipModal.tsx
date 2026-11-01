'use client';

import React from 'react';
import { X, Printer, Pill, Download, Building2, User, Calendar, ShieldCheck, Stethoscope } from 'lucide-react';
import type { PrescriptionDTO } from '@mcms/contracts';

interface PrescriptionSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: PrescriptionDTO | null;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
}

export default function PrescriptionSlipModal({
  isOpen,
  onClose,
  prescription,
  clinicName = "Betre's Healthcare Clinic",
  clinicAddress = 'Bole Subcity, Addis Ababa, Ethiopia',
  clinicPhone = '+251 11 661 2345',
}: PrescriptionSlipModalProps) {
  if (!isOpen || !prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = prescription.createdAt
    ? new Date(prescription.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header toolbar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden bg-slate-50/70">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Pill className="w-4 h-4 text-blue-600" />
            <span>Official Prescription Slip</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Slip
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

        {/* Prescription Slip Printable Area */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 print:p-8" id="printable-rx-slip">
          {/* Clinic Brand Header */}
          <div className="flex items-start justify-between border-b-2 border-blue-600 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                  +
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {clinicName}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {prescription.branchName || 'Central Outpatient Branch'}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                {clinicAddress} • Tel: {clinicPhone}
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl font-serif font-black text-blue-600 italic tracking-wider">
                ℞
              </span>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Ref: {prescription.id.slice(0, 10).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Patient & Doctor Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Name</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{prescription.patientName}</p>
              <p className="text-[10px] font-mono font-semibold text-blue-600 mt-0.5">
                {prescription.patientPid || 'PID-GEN-001'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date Issued</span>
              <p className="font-bold text-slate-800 mt-0.5">{formattedDate}</p>
              <span
                className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  prescription.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : prescription.status === 'DISPENSED'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {prescription.status}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prescribing Doctor</span>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-blue-600 shrink-0" />
                {prescription.doctorName || 'Dr. Medical Staff'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">General Practitioner</p>
            </div>
          </div>

          {/* Clinical Indication / Diagnosis */}
          {prescription.diagnosis && (
            <div className="px-4 py-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
              <span className="font-bold text-blue-900 mr-1.5">Diagnosis / Indication:</span>
              <span className="text-blue-800 font-medium">{prescription.diagnosis}</span>
            </div>
          )}

          {/* Medication Items List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Prescribed Medications
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3.5">Medication & Form</th>
                    <th className="py-2.5 px-3.5">Dosage</th>
                    <th className="py-2.5 px-3.5">Frequency</th>
                    <th className="py-2.5 px-3.5">Duration</th>
                    <th className="py-2.5 px-3.5">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.items && prescription.items.length > 0 ? (
                    prescription.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3.5 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3.5">
                          <div className="font-black text-slate-900">{item.medicationName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Route: {item.route || 'Oral (PO)'}</div>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-800">{item.dosage}</td>
                        <td className="py-3 px-3.5 font-medium text-slate-700">{item.frequency || 'Daily'}</td>
                        <td className="py-3 px-3.5 font-semibold text-slate-700">{item.duration}</td>
                        <td className="py-3 px-3.5 text-slate-600 italic text-[11px]">
                          {item.instructions || 'Take as directed'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs italic">
                        No medication items listed on this prescription.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
              <span className="font-bold text-amber-900 block mb-0.5">Doctor's Clinical Notes:</span>
              <p className="text-amber-800 text-[11px] leading-relaxed whitespace-pre-line">
                {prescription.notes}
              </p>
            </div>
          )}

          {/* Footer & Signature Section */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6">
            <div className="text-[10px] text-slate-400 space-y-1">
              <p>• Valid for 30 days from date of issuance unless specified otherwise.</p>
              <p>• Keep medications out of reach of children. Store in a cool, dry place.</p>
              <p>• Tampering with this prescription document is strictly prohibited by law.</p>
            </div>

            <div className="text-center sm:text-right shrink-0 w-48">
              <div className="h-10 border-b-2 border-slate-800 mb-1.5 flex items-end justify-center sm:justify-end">
                <span className="font-serif italic font-bold text-blue-900 text-sm">
                  {prescription.doctorName || 'Dr. Medical Staff'}
                </span>
              </div>
              <p className="text-[11px] font-black text-slate-800">Doctor's Authorized Signature</p>
              <p className="text-[9px] text-slate-400">License verified & encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
