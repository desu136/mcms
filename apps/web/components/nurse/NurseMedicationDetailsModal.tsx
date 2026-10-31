'use client';

import React from 'react';
import {
  X,
  Pill,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { NurseMedicationRecord } from './nurseMockData';

interface NurseMedicationDetailsModalProps {
  medication: NurseMedicationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onAdminister?: (medication: NurseMedicationRecord) => void;
}

export default function NurseMedicationDetailsModal({
  medication,
  isOpen,
  onClose,
  onAdminister,
}: NurseMedicationDetailsModalProps) {
  if (!isOpen || !medication) return null;

  const STATUS_BADGES: Record<string, string> = {
    Administered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    'Due Soon': 'bg-orange-100 text-orange-800 border-orange-200',
    Missed: 'bg-rose-100 text-rose-800 border-rose-200',
    'Refill Due': 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Pill size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{medication.medicationName}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border shadow-2xs"
                  style={{
                    backgroundColor: medication.status === 'Administered' ? '#ECFDF5' : medication.status === 'Missed' ? '#FFF1F2' : '#FEF3C7',
                    color: medication.status === 'Administered' ? '#047857' : medication.status === 'Missed' ? '#BE123C' : '#B45309',
                    borderColor: medication.status === 'Administered' ? '#A7F3D0' : medication.status === 'Missed' ? '#FECDD3' : '#FDE68A',
                  }}>
                  {medication.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dose: <span className="font-semibold text-slate-700">{medication.dose}</span> • Route: <span className="font-semibold text-slate-700">{medication.route}</span> • Schedule: <span className="font-semibold text-slate-700">{medication.schedule}</span>
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
          {/* Patient Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-3">
              <img
                src={medication.patientAvatar}
                alt={medication.patientName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{medication.patientName}</h4>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    {medication.patientPid}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {medication.age} yrs • {medication.gender} • {medication.room} • {medication.department}
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-400 block">Indication / Condition:</span>
              <span className="font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 mt-1 inline-block">
                {medication.condition}
              </span>
            </div>
          </div>

          {/* Dosing Details & Schedule Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block mb-1">Prescribed Dose</span>
              <span className="font-bold text-slate-900 text-sm">{medication.dose}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block mb-1">Administration Route</span>
              <span className="font-bold text-slate-900 text-sm">{medication.route}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block mb-1">Schedule / Frequency</span>
              <span className="font-bold text-slate-900 text-sm">{medication.schedule}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block mb-1">Next Scheduled Dose</span>
              <span className="font-semibold text-blue-600">{medication.nextDue}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block mb-1">Last Administered</span>
              <span className="font-semibold text-slate-700">{medication.lastAdministered || 'None recorded today'}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block mb-1">Prescribing Doctor</span>
              <span className="font-semibold text-slate-800">{medication.prescribingDoctor}</span>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Nurse Administration Instructions</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {medication.instructions}
            </p>
            {medication.sideEffects && (
              <div className="flex items-start gap-1.5 pt-2 text-[11px] text-amber-700 border-t border-blue-200/60 mt-2">
                <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-600" />
                <span>Known precautions / potential side effects: {medication.sideEffects}</span>
              </div>
            )}
          </div>

          {/* Verification Protocol Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Five Rights Verification Protocol</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Right Patient ({medication.patientName})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Right Drug ({medication.medicationName})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Right Dose ({medication.dose})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Right Route ({medication.route})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer size={14} />
            Print Administration Sheet
          </button>
          <div className="flex items-center gap-2">
            {onAdminister && medication.status !== 'Administered' && (
              <button
                onClick={() => {
                  onClose();
                  onAdminister(medication);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Pill size={14} />
                Administer Now
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
