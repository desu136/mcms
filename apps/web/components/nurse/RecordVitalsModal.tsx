'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Check,
  AlertCircle,
  Scale,
  Ruler,
  User,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { recordVitals } from '@/lib/api/clinical';
import { fetchPatients } from '@/lib/api/patients';
import { fetchQueue, updateQueueEntry } from '@/lib/api/appointments';
import { fetchDoctors, fetchDepartments } from '@/lib/api/staff';
import type { DoctorDTO, ClinicDepartmentDTO, QueueEntryDTO } from '@mcms/contracts';

interface RecordVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatientId?: string | undefined;
  queueEntryId?: string | undefined;
  onSave?: ((vitals: any) => void) | undefined;
}

export default function RecordVitalsModal({
  isOpen,
  onClose,
  selectedPatientId,
  queueEntryId,
  onSave,
}: RecordVitalsModalProps) {
  const { accessToken } = useAuth();
  const [patientsList, setPatientsList] = useState<{ id: string; name: string; pid: string }[]>([]);
  const [patientId, setPatientId] = useState(selectedPatientId || '');

  // Vitals inputs
  const [temp, setTemp] = useState('36.8');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [systolic, setSystolic] = useState('118');
  const [diastolic, setDiastolic] = useState('76');
  const [hr, setHr] = useState('72');
  const [spo2, setSpo2] = useState('98');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [complaints, setComplaints] = useState('');
  const [note, setNote] = useState('');

  // Queue forwarding
  const [forwardToDoctor, setForwardToDoctor] = useState(false);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  // Form states
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-calculated BMI
  const bmi = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return null;
  }, [weightKg, heightCm]);

  // Derived Condition
  const condition = useMemo(() => {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    const ox = parseFloat(spo2);
    let t = parseFloat(temp);
    if (tempUnit === 'F') {
      t = (t - 32) * (5 / 9);
    }

    if (isNaN(sys) || isNaN(dia)) return 'NORMAL';
    if (sys >= 180 || dia >= 120 || ox < 90 || t >= 39.5) return 'CRITICAL';
    if (sys >= 140 || dia >= 90) return 'HIGH_BP';
    if (sys < 90 || dia < 60) return 'LOW_BP';
    if (sys >= 120 && sys <= 139) return 'ELEVATED';
    return 'NORMAL';
  }, [systolic, diastolic, spo2, temp, tempUnit]);

  useEffect(() => {
    if (selectedPatientId) setPatientId(selectedPatientId);
  }, [selectedPatientId]);

  useEffect(() => {
    if (!accessToken || !isOpen) return;

    let mounted = true;
    Promise.allSettled([
      fetchPatients(accessToken, { limit: 100 }),
      fetchDoctors(accessToken),
      fetchDepartments(accessToken),
    ]).then(([patRes, docRes, deptRes]) => {
      if (!mounted) return;
      if (patRes.status === 'fulfilled' && patRes.value.data.length > 0) {
        const mapped = patRes.value.data.map((p) => ({
          id: p.id,
          name: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
          pid: p.pid,
        }));
        setPatientsList(mapped);
        if (!patientId && mapped[0]) {
          setPatientId(mapped[0].id);
        }
      }
      if (docRes.status === 'fulfilled') {
        setDoctors(docRes.value);
      }
      if (deptRes.status === 'fulfilled') {
        setDepartments(deptRes.value);
        if (deptRes.value.length > 0 && !selectedDepartmentId) {
          setSelectedDepartmentId(deptRes.value[0]!.id);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [accessToken, isOpen, patientId, selectedDepartmentId]);

  if (!isOpen) return null;

  const validateInputs = (): boolean => {
    if (!patientId) {
      setValidationError('Please select a patient.');
      return false;
    }

    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    if (isNaN(sys) || sys < 50 || sys > 260) {
      setValidationError('Systolic BP must be between 50 and 260 mmHg.');
      return false;
    }
    if (isNaN(dia) || dia < 30 || dia > 160) {
      setValidationError('Diastolic BP must be between 30 and 160 mmHg.');
      return false;
    }
    if (sys <= dia) {
      setValidationError('Systolic BP must be greater than Diastolic BP.');
      return false;
    }

    const heartRate = parseInt(hr, 10);
    if (isNaN(heartRate) || heartRate < 30 || heartRate > 240) {
      setValidationError('Heart rate must be between 30 and 240 bpm.');
      return false;
    }

    const parsedTemp = parseFloat(temp);
    const tempC = tempUnit === 'F' ? (parsedTemp - 32) * (5 / 9) : parsedTemp;
    if (isNaN(tempC) || tempC < 30 || tempC > 45) {
      setValidationError('Temperature must be between 30°C and 45°C (86°F - 113°F).');
      return false;
    }

    const ox = parseFloat(spo2);
    if (isNaN(ox) || ox < 50 || ox > 100) {
      setValidationError('Oxygen saturation (SpO2) must be between 50% and 100%.');
      return false;
    }

    const rr = parseInt(respiratoryRate, 10);
    if (isNaN(rr) || rr < 5 || rr > 60) {
      setValidationError('Respiratory rate must be between 5 and 60 breaths/min.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsSaving(true);
    setValidationError(null);

    try {
      const parsedTemp = parseFloat(temp);
      const tempCelsius =
        tempUnit === 'F'
          ? Math.round((parsedTemp - 32) * (5 / 9) * 10) / 10
          : parsedTemp;

      // Construct comprehensive triage summary in notes
      const summaryLines = [
        complaints.trim() ? `Chief Complaints: ${complaints.trim()}` : '',
        weightKg ? `Weight: ${weightKg} kg` : '',
        heightCm ? `Height: ${heightCm} cm` : '',
        bmi ? `BMI: ${bmi}` : '',
        respiratoryRate ? `RR: ${respiratoryRate} bpm` : '',
        note.trim() ? `Nurse Observations: ${note.trim()}` : '',
      ].filter(Boolean);

      const combinedNotes = summaryLines.join(' | ');

      const savedReading = await recordVitals(
        {
          patientId,
          temperature: tempCelsius,
          systolicBp: parseInt(systolic, 10),
          diastolicBp: parseInt(diastolic, 10),
          heartRate: parseInt(hr, 10),
          spo2: parseFloat(spo2),
          respiratoryRate: parseInt(respiratoryRate, 10) || 16,
          ...(combinedNotes ? { notes: combinedNotes } : {}),
        },
        accessToken,
      );

      // If forwarding patient to doctor or updating queue ticket
      if (accessToken && (forwardToDoctor || queueEntryId)) {
        try {
          if (queueEntryId) {
            await updateQueueEntry(
              queueEntryId,
              {
                assignedDoctorId: selectedDoctorId || undefined,
                departmentId: selectedDepartmentId || undefined,
                status: 'WAITING',
              },
              accessToken,
            );
          } else if (forwardToDoctor) {
            // Find active queue entry for this patient
            const activeQueue = await fetchQueue(accessToken, { status: 'WAITING' });
            const patientQueueEntry = activeQueue.find((q) => q.patientId === patientId);
            if (patientQueueEntry) {
              await updateQueueEntry(
                patientQueueEntry.id,
                {
                  assignedDoctorId: selectedDoctorId || undefined,
                  departmentId: selectedDepartmentId || undefined,
                  status: 'WAITING',
                },
                accessToken,
              );
            }
          }
        } catch (queueErr) {
          console.warn('Queue update after vitals recording non-fatal:', queueErr);
        }
      }

      setIsSaving(false);
      setIsSaved(true);

      onSave?.({
        patientId,
        reading: savedReading,
        temp: tempCelsius,
        bp: `${systolic}/${diastolic}`,
        hr: parseInt(hr, 10),
        spo2: parseFloat(spo2),
        respiratoryRate: parseInt(respiratoryRate, 10),
        weightKg,
        heightCm,
        bmi,
        complaints,
        condition,
      });

      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 900);
    } catch (err: any) {
      setIsSaving(false);
      setValidationError(err?.message || 'Failed to record vital signs. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Heart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Patient Triage & Vital Signs</h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    condition === 'CRITICAL'
                      ? 'bg-red-100 text-red-700'
                      : condition === 'HIGH_BP'
                      ? 'bg-amber-100 text-amber-700'
                      : condition === 'LOW_BP'
                      ? 'bg-sky-100 text-sky-700'
                      : condition === 'ELEVATED'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  Condition: {condition}
                </span>
              </div>
              <p className="text-xs text-slate-500">Record clinical measurements, complaints, and patient triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Patient *</label>
            <div className="relative">
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                required
              >
                {patientsList.length === 0 ? (
                  <option value="">Loading patients...</option>
                ) : (
                  patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.pid})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Blood Pressure Systolic */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> Systolic BP
                </span>
                <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
              </div>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                min={50}
                max={260}
                required
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Blood Pressure Diastolic */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> Diastolic BP
                </span>
                <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
              </div>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                min={30}
                max={160}
                required
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Heart Rate / Pulse */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Pulse / HR
                </span>
                <span className="text-[10px] text-slate-400 font-normal">bpm</span>
              </div>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="72"
                min={30}
                max={240}
                required
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Temperature */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp
                </span>
                <div className="flex items-center bg-white border border-slate-200 rounded px-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTempUnit('C')}
                    className={`font-bold ${tempUnit === 'C' ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                    °C
                  </button>
                  <span className="mx-0.5 text-slate-300">/</span>
                  <button
                    type="button"
                    onClick={() => setTempUnit('F')}
                    className={`font-bold ${tempUnit === 'F' ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                    °F
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="36.8"
                required
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* SpO2 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-600" /> SpO2
                </span>
                <span className="text-[10px] text-slate-400 font-normal">%</span>
              </div>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="98"
                min={50}
                max={100}
                required
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Respiratory Rate */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-600" /> Resp Rate
                </span>
                <span className="text-[10px] text-slate-400 font-normal">bpm</span>
              </div>
              <input
                type="number"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
                placeholder="16"
                min={5}
                max={60}
                required
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Physical Measurements: Weight, Height, BMI */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2.5 flex items-center justify-between">
              <span>Anthropometric Measurements</span>
              {bmi && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                  Calculated BMI: {bmi} kg/m²
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Scale className="w-3.5 h-3.5 text-slate-500" /> Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                  className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-slate-500" /> Height (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
                  className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Chief Complaints */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Patient Chief Complaints & Symptoms
            </label>
            <input
              type="text"
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              placeholder="e.g. Headache for 3 days, mild shortness of breath, fever..."
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Nurse Preliminary Observations / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nurse Preliminary Observations & Triage Notes
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Patient conscious and oriented. Skin warm to touch. Alerted for elevated BP..."
              className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Forward to Doctor Option */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={forwardToDoctor || !!queueEntryId}
                  onChange={(e) => setForwardToDoctor(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Forward Patient to Doctor Consultation Queue</span>
              </label>
              <span className="text-[10px] text-slate-500">Updates clinic queue</span>
            </div>

            {(forwardToDoctor || !!queueEntryId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Receiving Department
                  </label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Assigned Doctor (Optional)
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="">Any available physician</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.displayName} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isSaved}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-md shadow-blue-500/20 ${
                isSaved
                  ? 'bg-emerald-600'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Vitals...</span>
                </>
              ) : isSaved ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Vitals & Triage Recorded!</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Save Vitals & Triage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
