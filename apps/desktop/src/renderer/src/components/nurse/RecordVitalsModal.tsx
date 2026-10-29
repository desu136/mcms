'use client';

import React, { useState } from 'react';
import { X, Heart, Activity, Thermometer, Wind, Check } from 'lucide-react';
import { NURSE_PATIENTS, NursePatient } from './nurseMockData';

interface RecordVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatientId?: string | undefined;
  onSave?: ((vitals: any) => void) | undefined;
}

export default function RecordVitalsModal({
  isOpen,
  onClose,
  selectedPatientId,
  onSave,
}: RecordVitalsModalProps) {
  const [patientId, setPatientId] = useState(selectedPatientId || NURSE_PATIENTS[0]!.id);
  const [mode, setMode] = useState<'manual' | 'quick'>('manual');
  const [temp, setTemp] = useState('36.8');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [systolic, setSystolic] = useState('118');
  const [diastolic, setDiastolic] = useState('76');
  const [hr, setHr] = useState('72');
  const [spo2, setSpo2] = useState('98');
  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onSave) {
      onSave({
        patientId,
        temp: parseFloat(temp),
        tempUnit,
        bp: `${systolic}/${diastolic}`,
        hr: parseInt(hr, 10),
        spo2: parseInt(spo2, 10),
        note,
      });
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Record Vital Signs</h2>
              <p className="text-xs text-slate-500">Enter clinical observations for patient chart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Manual vs Quick Entry */}
        <div className="px-6 pt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'manual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'quick'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Quick Entry
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Patient *
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {NURSE_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pid}) â€” Room {p.room} â€¢ {p.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Temperature */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                Temperature ({tempUnit === 'C' ? 'Â°C' : 'Â°F'}) *
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Â°{tempUnit}
                </button>
              </div>
            </div>

            {/* Heart Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Heart Rate (bpm) *
              </label>
              <input
                type="number"
                required
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="72"
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Blood Pressure (Systolic & Diastolic) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Blood Pressure (mmHg) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="118"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Systolic</span>
              </div>
              <div>
                <input
                  type="number"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="76"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Diastolic</span>
              </div>
            </div>
          </div>

          {/* SpO2 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-500" />
              Oxygen Saturation (%) *
            </label>
            <input
              type="number"
              required
              min="50"
              max="100"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value)}
              placeholder="98"
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Note */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Note (optional)</label>
              <span className="text-[10px] text-slate-400">{note.length}/200</span>
            </div>
            <textarea
              maxLength={200}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes or observations..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaved}
              className={`w-full py-3 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-md ${
                isSaved
                  ? 'bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Reading Saved Successfully!
                </>
              ) : (
                'Save Reading'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
