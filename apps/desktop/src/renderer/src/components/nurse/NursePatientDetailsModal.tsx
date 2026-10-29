'use client';

import React from 'react';
import {
  X,
  User,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
  FileText,
  Pill,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';
import { NursePatient } from './nurseMockData';

interface NursePatientDetailsModalProps {
  patient: NursePatient | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordVitals?: (patient: NursePatient) => void;
  onAdministerMed?: (patient: NursePatient) => void;
  onCollectSample?: (patient: NursePatient) => void;
}

export default function NursePatientDetailsModal({
  patient,
  isOpen,
  onClose,
  onRecordVitals,
  onAdministerMed,
  onCollectSample,
}: NursePatientDetailsModalProps) {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                  {patient.pid}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                  {patient.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.age} yrs • {patient.gender} • Room {patient.room} • {patient.bed} • {patient.department}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Patient Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md mb-3"
              />
              <h4 className="font-bold text-slate-900 text-sm">{patient.name}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{patient.pid}</p>
              <div className="w-full border-t border-slate-200/80 my-3" />
              <div className="w-full space-y-2 text-left text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400" />
                  <span className="truncate">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400" />
                  <span className="truncate">{patient.address}</span>
                </div>
              </div>
            </div>

            {/* Vitals Summary */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Latest Recorded Vitals</h4>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {patient.vitalsStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Heart size={14} className="text-red-500" />
                      <span>Blood Press.</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{patient.vitals.bp}</span>
                    <span className="text-[10px] text-slate-400">mmHg</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Activity size={14} className="text-rose-500" />
                      <span>Heart Rate</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{patient.vitals.hr}</span>
                    <span className="text-[10px] text-slate-400">bpm</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Thermometer size={14} className="text-amber-500" />
                      <span>Temp</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{patient.vitals.temp}</span>
                    <span className="text-[10px] text-slate-400">°C</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Droplets size={14} className="text-sky-500" />
                      <span>SpO2</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{patient.vitals.spo2}</span>
                    <span className="text-[10px] text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Admission & Physician Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Attending Physician:</span>
                  <span className="font-semibold text-slate-800">{patient.doctor}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Admission Date:</span>
                  <span className="font-semibold text-slate-800">{patient.admissionDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Reason for Visit:</span>
                  <span className="font-semibold text-slate-800">{patient.visitReason}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Next Scheduled Follow-up:</span>
                  <span className="font-semibold text-blue-600">{patient.nextFollowUp || 'Not scheduled'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Clinical Notes & Nursing Care Plan */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={15} className="text-blue-600" />
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Nursing Care Plan & Directives</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Patient is responding well to treatment. Continue monitoring blood pressure and respiratory parameters Q4H.
              Ensure hydration and timely medication administration. Alert attending physician if systolic BP exceeds 140 mmHg.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onRecordVitals && (
              <button
                onClick={() => {
                  onClose();
                  onRecordVitals(patient);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Activity size={14} className="text-blue-600" />
                Record Vitals
              </button>
            )}
            {onAdministerMed && (
              <button
                onClick={() => {
                  onClose();
                  onAdministerMed(patient);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Pill size={14} className="text-emerald-600" />
                Administer Med
              </button>
            )}
            {onCollectSample && (
              <button
                onClick={() => {
                  onClose();
                  onCollectSample(patient);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <FlaskConical size={14} className="text-indigo-600" />
                Collect Sample
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
