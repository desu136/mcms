'use client';

import React, { useState } from 'react';
import { X, FlaskConical, Check } from 'lucide-react';
import { NURSE_PATIENTS } from './nurseMockData';

interface CollectLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatientId?: string | undefined;
  onCollect?: ((data: any) => void) | undefined;
}

export default function CollectLabModal({
  isOpen,
  onClose,
  selectedPatientId,
  onCollect,
}: CollectLabModalProps) {
  const [patientId, setPatientId] = useState(selectedPatientId || NURSE_PATIENTS[0]!.id);
  const [sampleType, setSampleType] = useState('Venous Blood (CBC)');
  const [barcode, setBarcode] = useState(`SMP-${Math.floor(100000 + Math.random() * 900000)}`);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onCollect) {
      onCollect({
        patientId,
        sampleType,
        barcode,
        notes,
        collectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Collect Lab Sample</h2>
              <p className="text-xs text-slate-500">Log specimen collection and assign barcode</p>
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
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            >
              {NURSE_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pid}) â€” Room {p.room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specimen / Sample Type *</label>
            <select
              value={sampleType}
              onChange={(e) => setSampleType(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            >
              <option value="Venous Blood (CBC)">Venous Blood (CBC / Differential)</option>
              <option value="Fasting Blood Glucose">Fasting Blood Glucose</option>
              <option value="Clean Catch Urine">Clean Catch Urine</option>
              <option value="Wound Swab / Culture">Wound Swab / Culture</option>
              <option value="Sputum Specimen">Sputum Specimen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specimen Barcode ID</label>
            <input
              type="text"
              readOnly
              value={barcode}
              className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Collector Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Left antecubital vein, single stick..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaved}
            className={`w-full py-3 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-md ${
              isSaved
                ? 'bg-emerald-600'
                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Specimen Collected & Dispatched!
              </>
            ) : (
              'Confirm Specimen Collection'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
