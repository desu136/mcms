'use client';

import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { NURSE_PATIENTS, CURRENT_NURSE } from './nurseMockData';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatientId?: string | undefined;
  onAddNote?: ((data: any) => void) | undefined;
}

export default function AddNoteModal({
  isOpen,
  onClose,
  selectedPatientId,
  onAddNote,
}: AddNoteModalProps) {
  const [patientId, setPatientId] = useState(selectedPatientId || NURSE_PATIENTS[0]!.id);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Education' | 'Care' | 'Medication' | 'Vitals'>('Care');
  const [text, setText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onAddNote) {
      const patient = NURSE_PATIENTS.find((p) => p.id === patientId);
      onAddNote({
        id: `note-${Date.now()}`,
        patientName: patient?.name || 'Unknown Patient',
        patientPid: patient?.pid || 'PID-000000',
        title,
        category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: `${CURRENT_NURSE.name} (Nurse)`,
        text,
      });
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add Nursing Note</h2>
              <p className="text-xs text-slate-500">Record care observation or education event</p>
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
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {NURSE_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pid}) â€” Room {p.room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Note Category *</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Care', 'Education', 'Medication', 'Vitals'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Note Headline *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wound dressing done, Vitals monitored..."
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Observation *</label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe observation, patient feedback, care provided..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaved}
            className={`w-full py-3 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-md ${
              isSaved
                ? 'bg-emerald-600'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Note Recorded in Patient Chart!
              </>
            ) : (
              'Save Nursing Note'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
