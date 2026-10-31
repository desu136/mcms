'use client';

import React from 'react';
import {
  X,
  FlaskConical,
  Barcode,
  CheckCircle2,
  Clock,
  Printer,
  Truck,
  User,
  FileCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { NurseLabSample } from './nurseMockData';

interface NurseLabSampleDetailsModalProps {
  sample: NurseLabSample | null;
  isOpen: boolean;
  onClose: () => void;
  onCollect?: (sample: NurseLabSample) => void;
  onHandover?: (sample: NurseLabSample) => void;
}

export default function NurseLabSampleDetailsModal({
  sample,
  isOpen,
  onClose,
  onCollect,
  onHandover,
}: NurseLabSampleDetailsModalProps) {
  if (!isOpen || !sample) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50/70 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <FlaskConical size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{sample.testName}</h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800">
                  {sample.sampleId}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  sample.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {sample.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Type: <span className="font-semibold text-slate-700">{sample.sampleType}</span> • Scheduled: <span className="font-semibold text-slate-700">{sample.collectionTime}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Barcode & Specimen ID card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Barcode Identifier</span>
              <div className="flex items-center gap-2 mt-1">
                <Barcode size={36} className="text-slate-800" />
                <span className="text-base font-mono font-bold tracking-widest text-slate-900">
                  {sample.sampleId}
                </span>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer size={13} />
              Print Barcode Label
            </button>
          </div>

          {/* Patient Card */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-3">
              <img
                src={sample.patientAvatar}
                alt={sample.patientName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{sample.patientName}</h4>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    {sample.patientPid}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Room {sample.room} • {sample.department} • Ref: {sample.doctor}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Sample Status</span>
              <span className="inline-block mt-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
                {sample.status}
              </span>
            </div>
          </div>

          {/* Lab Handover & Processing Timeline */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck size={15} className="text-blue-600" />
              Laboratory Handover & Tracking Lifecycle
            </h4>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Step 1 */}
              <div className="relative flex items-start gap-3">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                  sample.status !== 'Pending' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}>
                  <CheckCircle2 size={12} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sample Collected</p>
                  <p className="text-[11px] text-slate-500">
                    {sample.collectedAt ? `${sample.collectedAt} by Aster Mulu (Nurse)` : 'Pending collection by assigned nurse'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-3">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                  sample.status === 'In Lab' || sample.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}>
                  <CheckCircle2 size={12} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Delivered to Central Laboratory</p>
                  <p className="text-[11px] text-slate-500">
                    {sample.deliveredAt ? `${sample.deliveredAt} • Courier logged` : 'Awaiting transit to Central Laboratory'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-3">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                  sample.status === 'In Lab' ? 'bg-blue-500 animate-pulse' : sample.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}>
                  <Clock size={12} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Diagnostic Processing</p>
                  <p className="text-[11px] text-slate-500">
                    {sample.labTech ? `Assigned to ${sample.labTech} • Automated analyzer in progress` : 'Standard turnaround: 2-4 hours from receipt'}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-3">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                  sample.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}>
                  <FileCheck size={12} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Results Verified & Certified</p>
                  <p className="text-[11px] text-slate-500">
                    {sample.status === 'Completed' ? 'Results available in EHR & notified to physician' : 'Pending laboratory certification'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions Card */}
          {sample.instructions && (
            <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-100 text-xs">
              <span className="font-bold text-cyan-900 block mb-1">Collection & Handling Protocol:</span>
              <p className="text-slate-700 leading-relaxed">{sample.instructions}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onCollect && sample.status === 'Pending' && (
              <button
                onClick={() => {
                  onClose();
                  onCollect(sample);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FlaskConical size={14} />
                Mark Collected
              </button>
            )}
            {onHandover && sample.status === 'Collected' && (
              <button
                onClick={() => {
                  onClose();
                  onHandover(sample);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Truck size={14} />
                Handover to Lab
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
