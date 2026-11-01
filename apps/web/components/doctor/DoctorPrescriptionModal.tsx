'use client';

import React, { useState, useEffect } from 'react';
import { X, Pill, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { createPrescription } from '../../lib/api/clinical';
import { fetchPatients } from '../../lib/api/patients';
import type { PatientDTO } from '@mcms/contracts';

interface DoctorPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Real DB patient ID – required for API submission */
  patientId?: string | undefined;
  /** Display name shown in the form */
  patientName?: string | undefined;
  defaultPatientId?: string | undefined;
}

export default function DoctorPrescriptionModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  defaultPatientId,
}: DoctorPrescriptionModalProps) {
  const { accessToken } = useAuth();
  const [selectedPid, setSelectedPid] = useState(patientId ?? defaultPatientId ?? '');
  const [patientList, setPatientList] = useState<PatientDTO[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once Daily');
  const [duration, setDuration] = useState('30 Days');
  const [instructions, setInstructions] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPatientId = selectedPid || patientId || defaultPatientId;
    if (!finalPatientId) {
      setError('Please select a patient.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await createPrescription(
        {
          patientId: finalPatientId,
          ...(diagnosis.trim() ? { diagnosis: diagnosis.trim() } : {}),
          ...(instructions.trim() ? { notes: instructions.trim() } : {}),
          items: [
            {
              medicationName: medication,
              dosage,
              frequency,
              duration,
              ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
            },
          ],
        },
        accessToken,
      );
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMedication('');
        setDosage('');
        setFrequency('Once Daily');
        setDuration('30 Days');
        setInstructions('');
        setDiagnosis('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prescription.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Add Electronic Prescription</h3>
              <p className="text-xs text-slate-500">Fast digital Rx transmission to Central Dispensary</p>
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
            <h4 className="text-lg font-bold text-slate-800">Prescription Issued Successfully!</h4>
            <p className="text-xs text-slate-500">Sent to dispensary queue for verification & dispensation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Patient Info or Dropdown */}
            {patientName ? (
              <div className="px-3.5 py-2.5 rounded-xl border border-blue-100 bg-blue-50/60 text-sm font-semibold text-blue-800 flex items-center justify-between">
                <span>👤 {patientName}</span>
                <span className="text-[10px] text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded font-mono">Patient Selected</span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Patient *
                </label>
                <select
                  value={selectedPid}
                  onChange={(e) => setSelectedPid(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
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

            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Diagnosis / Clinical Indication
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            {/* Medication & Strength */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Medication (Generic / Brand)
                </label>
                <input
                  type="text"
                  required
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  placeholder="e.g. Atorvastatin 20mg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Dosage
                </label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 5mg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
              >
                <option>Once Daily</option>
                <option>Twice Daily</option>
                <option>Three Times Daily</option>
                <option>Four Times Daily</option>
                <option>Every 8 Hours</option>
                <option>Every 12 Hours</option>
                <option>As Needed</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Duration / Treatment Cycle
              </label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 30 Days (Repeatable)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Pharmacist & Patient Instructions
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Special notes on intake, meals, potential drug-drug warnings..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Footer Buttons */}
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
                disabled={isLoading}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Issuing...' : 'Confirm & Issue Rx'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
