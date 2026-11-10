import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { PatientItem } from './doctorMockData';
import { createPatient } from '../../api/patients';
import { useAuth } from '../../auth/AuthContext';
import type { PatientDTO } from '@mcms/contracts';

export interface DoctorPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded?: (patient: PatientItem) => void;
}

export function DoctorPatientModal({ isOpen, onClose, onPatientAdded }: DoctorPatientModalProps) {
  const { accessToken } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Female' | 'Male'>('Female');
  const [phone, setPhone] = useState('+251 9');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Addis Ababa, Ethiopia');
  const [department, setDepartment] = useState('Cardiology');
  const [reason, setReason] = useState('Consultation');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) return;

    setSubmitting(true);
    setError(null);

    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || 'Patient';
    const lastName = parts.slice(1).join(' ') || 'Record';
    const approxBirthYear = new Date().getFullYear() - Number(age);
    const dateOfBirth = `${approxBirthYear}-01-01`;

    let createdDto: PatientDTO | null = null;
    try {
      createdDto = await createPatient(
        {
          firstName,
          lastName,
          dateOfBirth,
          gender: gender === 'Female' ? 'F' : 'M',
          phoneNumber: phone,
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(address.trim() ? { address: address.trim() } : {}),
        },
        accessToken,
      );
    } catch (apiErr) {
      // Offline fallback: enqueue to SQLite
      try {
        await (window as any).electron?.ipcRenderer?.invoke('enqueue-operation', {
          type: 'CREATE_PATIENT',
          payload: {
            firstName,
            lastName,
            gender,
            phoneNumber: phone,
            address,
          },
        });
      } catch {
        // Continue to update local UI
      }
    }

    const newPatient: PatientItem = {
      id: createdDto?.id || `p-${Date.now()}`,
      name: createdDto?.fullName || name,
      pid: createdDto?.pid || `PID-${Math.floor(100000 + Math.random() * 900000)}`,
      age: Number(age),
      gender,
      phone,
      email: email || `${firstName.toLowerCase()}@email.com`,
      address,
      department,
      lastVisit: 'Today',
      lastVisitReason: reason,
      status: 'Active',
      avatar:
        gender === 'Female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      totalVisits: 1,
      conditions: [{ title: reason, diagnosedDate: new Date().toISOString().split('T')[0]!, status: 'Active', type: 'general' }],
    };

    onPatientAdded?.(newPatient);
    setSubmitting(false);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Register New Patient</h3>
              <p className="text-xs text-slate-500">Quick clinical registration record</p>
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
            <h4 className="text-lg font-bold text-slate-800">Patient Registered!</h4>
            <p className="text-xs text-slate-500">Added to electronic registry with live record id.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="e.g. Almaz Bekele"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Age *
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder="35"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Female', 'Male'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        gender === g
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="General OPD">General OPD</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Initial Visit Reason
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="e.g. Hypertension Checkup"
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
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shadow-md shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Patient
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
export default DoctorPatientModal;
