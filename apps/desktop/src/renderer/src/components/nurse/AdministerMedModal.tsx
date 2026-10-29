'use client';

import React, { useState } from 'react';
import { X, Pill, Check, AlertCircle } from 'lucide-react';
import { NURSE_PATIENTS } from './nurseMockData';

interface AdministerMedModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatientId?: string | undefined;
  onAdminister?: ((data: any) => void) | undefined;
}

export default function AdministerMedModal({
  isOpen,
  onClose,
  selectedPatientId,
  onAdminister,
}: AdministerMedModalProps) {
  const [patientId, setPatientId] = useState(selectedPatientId || NURSE_PATIENTS[0]!.id);
  const [medication, setMedication] = useState('Amoxicillin 500mg');
  const [dosage, setDosage] = useState('1 Tablet Oral');
  const [route, setRoute] = useState<'Oral' | 'IV' | 'IM' | 'Subcutaneous'>('Oral');
  const [verifiedFiveRights, setVerifiedFiveRights] = useState(true);
  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onAdminister) {
      onAdminister({
        patientId,
        medication,
        dosage,
        route,
        verifiedFiveRights,
        note,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Administer Medication</h2>
              <p className="text-xs text-slate-500">Log prescription administration for eMAR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
            >
              {NURSE_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pid}) â€” Room {p.room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name *</label>
            <input
              type="text"
              required
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dosage *</label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Route *</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
              >
                <option value="Oral">Oral</option>
                <option value="IV">IV</option>
                <option value="IM">IM</option>
                <option value="Subcutaneous">Subcutaneous</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100/80 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedFiveRights}
              onChange={(e) => setVerifiedFiveRights(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-xs text-purple-900 leading-tight">
              Verified 5 Rights: Right Patient, Drug, Dose, Route, Time
            </span>
          </label>

          <button
            type="submit"
            disabled={isSaved || !verifiedFiveRights}
            className={`w-full py-3 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-md ${
              isSaved
                ? 'bg-emerald-600'
                : verifiedFiveRights
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Medication Administered!
              </>
            ) : (
              'Confirm Administration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
