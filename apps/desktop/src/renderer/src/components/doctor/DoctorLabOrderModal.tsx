import React, { useState } from 'react';
import { X, FlaskConical, CheckCircle2 } from 'lucide-react';
import { INITIAL_PATIENTS } from './doctorMockData';

export interface DoctorLabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPatientId?: string | undefined;
}

const AVAILABLE_TESTS = [
  { id: 't-1', name: 'Complete Blood Count (CBC)', dept: 'Hematology', tat: '2 hrs' },
  { id: 't-2', name: 'Comprehensive Lipid Profile', dept: 'Biochemistry', tat: '4 hrs' },
  { id: 't-3', name: 'Cardiac Troponin I (High Sensitivity)', dept: 'Cardiac Markers', tat: '45 mins' },
  { id: 't-4', name: 'Serum Creatinine & eGFR', dept: 'Renal Panel', tat: '2 hrs' },
  { id: 't-5', name: 'HbA1c Glycated Hemoglobin', dept: 'Endocrinology', tat: '3 hrs' },
  { id: 't-6', name: '12-Lead Diagnostic Electrocardiogram (ECG)', dept: 'Cardiology', tat: 'Immediate' },
];

export function DoctorLabOrderModal({
  isOpen,
  onClose,
  defaultPatientId = 'p-1',
}: DoctorLabOrderModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatientId);
  const [selectedTests, setSelectedTests] = useState<string[]>(['t-2', 't-3']);
  const [urgency, setUrgency] = useState<'ROUTINE' | 'URGENT' | 'STAT'>('ROUTINE');
  const [clinicalNotes, setClinicalNotes] = useState('Evaluate atypical chest discomfort and rule out acute coronary syndrome.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleTest = (id: string) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Order Laboratory Diagnostic Tests</h3>
              <p className="text-xs text-slate-500">Fast digital lab order requisition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Lab Order Placed Successfully!</h4>
            <p className="text-xs text-slate-500">Transmitted to laboratory triage queue for specimen collection.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Patient Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Patient
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white"
              >
                {INITIAL_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.pid}) — {p.age} yrs, {p.gender}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Select Diagnostic Tests ({selectedTests.length} selected)
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {AVAILABLE_TESTS.map((test) => {
                  const isChecked = selectedTests.includes(test.id);
                  return (
                    <div
                      key={test.id}
                      onClick={() => toggleTest(test.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isChecked
                          ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs">{test.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {test.dept} • TAT ~{test.tat}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4 pointer-events-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority / Urgency */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Clinical Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ROUTINE', 'URGENT', 'STAT'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      urgency === lvl
                        ? lvl === 'STAT'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : lvl === 'URGENT'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Indication */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Clinical Indication & Instructions
              </label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedTests.length === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 shadow-md shadow-orange-500/25 transition-all"
              >
                Submit Lab Requisition
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
export default DoctorLabOrderModal;
