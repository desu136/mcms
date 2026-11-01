'use client';

import React, { useState, useEffect } from 'react';
import { X, FlaskConical, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { createLabOrder } from '../../lib/api/clinical';
import { fetchPatients } from '../../lib/api/patients';
import type { PatientDTO } from '@mcms/contracts';

interface DoctorLabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Real DB patient ID */
  patientId?: string | undefined;
  /** Display name for the patient */
  patientName?: string | undefined;
  defaultPatientId?: string | undefined;
}

const AVAILABLE_TESTS = [
  { id: 't-1', name: 'Complete Blood Count (CBC)', dept: 'Hematology', tat: '2 hrs', sampleType: 'BLOOD' },
  { id: 't-2', name: 'Comprehensive Lipid Profile', dept: 'Biochemistry', tat: '4 hrs', sampleType: 'BLOOD' },
  { id: 't-3', name: 'Cardiac Troponin I (High Sensitivity)', dept: 'Cardiac Markers', tat: '45 mins', sampleType: 'BLOOD' },
  { id: 't-4', name: 'Serum Creatinine & eGFR', dept: 'Renal Panel', tat: '2 hrs', sampleType: 'BLOOD' },
  { id: 't-5', name: 'HbA1c Glycated Hemoglobin', dept: 'Endocrinology', tat: '3 hrs', sampleType: 'BLOOD' },
  { id: 't-6', name: '12-Lead Diagnostic ECG', dept: 'Cardiology', tat: 'Immediate', sampleType: 'OTHER' },
];

export default function DoctorLabOrderModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  defaultPatientId,
}: DoctorLabOrderModalProps) {
  const { accessToken } = useAuth();
  const [selectedPid, setSelectedPid] = useState(patientId ?? defaultPatientId ?? '');
  const [patientList, setPatientList] = useState<PatientDTO[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'ROUTINE' | 'URGENT' | 'STAT'>('ROUTINE');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialId = patientId ?? defaultPatientId ?? '';
      setSelectedPid(initialId);
      if (!initialId && accessToken) {
        setLoadingPatients(true);
        fetchPatients(accessToken, { limit: 100 })
          .then((res) => {
            setPatientList(res.data);
            if (res.data.length > 0) {
              setSelectedPid(res.data[0]!.id);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingPatients(false));
      }
    }
  }, [isOpen, patientId, defaultPatientId, accessToken]);

  if (!isOpen) return null;

  const toggleTest = (id: string) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPatientId = selectedPid || patientId || defaultPatientId;
    if (!finalPatientId) {
      setError('Please select a patient.');
      return;
    }
    if (selectedTests.length === 0) {
      setError('Please select at least one test.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const selectedTestDetails = AVAILABLE_TESTS.filter((t) => selectedTests.includes(t.id));
      await createLabOrder(
        {
          patientId: finalPatientId,
          priority: urgency,
          ...(clinicalNotes.trim() ? { clinicalNotes: clinicalNotes.trim() } : {}),
          tests: selectedTestDetails.map((t) => ({
            testName: t.name,
            testCategory: t.dept,
            sampleType: t.sampleType,
          })),
        },
        accessToken,
      );
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedTests([]);
        setClinicalNotes('');
        setUrgency('ROUTINE');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lab order.');
    } finally {
      setIsLoading(false);
    }
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
              <p className="text-xs text-slate-500">Transmitted directly to central clinical laboratory</p>
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
            <h4 className="text-lg font-bold text-slate-800">Lab Order Requisition Sent!</h4>
            <p className="text-xs text-slate-500">
              {selectedTests.length} tests ordered. Lab phlebotomy team notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Patient Info or Dropdown */}
            {patientName ? (
              <div className="px-3.5 py-2.5 rounded-xl border border-orange-100 bg-orange-50/60 text-sm font-semibold text-orange-900 flex items-center justify-between">
                <span>👤 {patientName}</span>
                <span className="text-[10px] text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded font-mono">Patient Selected</span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Patient *
                </label>
                <select
                  value={selectedPid}
                  onChange={(e) => setSelectedPid(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white"
                  required
                >
                  {loadingPatients ? (
                    <option>Loading tenant patients...</option>
                  ) : patientList.length === 0 ? (
                    <option value="">No patients registered in clinic</option>
                  ) : (
                    patientList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.pid})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Test Selection Checkboxes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Available Diagnostic Panels
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {AVAILABLE_TESTS.map((test) => {
                  const isChecked = selectedTests.includes(test.id);
                  return (
                    <label
                      key={test.id}
                      onClick={() => toggleTest(test.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-xs font-semibold">{test.name}</div>
                          <div className="text-[11px] text-slate-400">{test.dept}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {test.tat}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Priority / Urgency */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Requisition Urgency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ROUTINE', 'URGENT', 'STAT'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgency(level)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      urgency === level
                        ? level === 'STAT'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : level === 'URGENT'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {level === 'STAT' ? '⚡ STAT / Emergency' : level}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Indications */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Clinical Reason & Indications
              </label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Diagnostic query, symptoms or suspected ICD-10 pathology..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedTests.length === 0 || isLoading}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Submitting...' : `Dispatch Lab Order (${selectedTests.length})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
