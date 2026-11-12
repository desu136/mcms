import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { updatePatient } from '../../api';
import type { PatientDTO } from '@mcms/contracts';

interface EditPatientModalProps {
  isOpen: boolean;
  patient: any;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

export default function EditPatientModal({
  isOpen,
  patient,
  onClose,
  onSuccess,
}: EditPatientModalProps) {
  const { accessToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    bloodType: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRel: '',
  });

  useEffect(() => {
    if (!isOpen || !patient) return;
    const names = (patient.fullName || patient.name || '').split(' ');
    setFormData({
      firstName: patient.firstName || names[0] || '',
      lastName: patient.lastName || names.slice(1).join(' ') || '',
      gender: (patient.gender || 'MALE').toUpperCase().startsWith('F') ? 'FEMALE' : 'MALE',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      phoneNumber: patient.phoneNumber || patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      city: patient.city || '',
      bloodType: patient.bloodType || patient.bloodGroup || '',
      emergencyContactName: patient.emergencyContactName || patient.emergencyName || '',
      emergencyContactPhone: patient.emergencyContactPhone || patient.emergencyPhone || '',
      emergencyContactRel: patient.emergencyContactRel || '',
    });
    setError(null);
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      firstName: formData.firstName.trim() || undefined,
      lastName: formData.lastName.trim() || undefined,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      bloodType: formData.bloodType.trim() || undefined,
      emergencyContactName: formData.emergencyContactName.trim() || undefined,
      emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
      emergencyContactRel: formData.emergencyContactRel.trim() || undefined,
    };

    try {
      if (patient.id && accessToken) {
        const updated = await updatePatient(patient.id, payload, accessToken);
        onSuccess(updated);
      } else {
        onSuccess({ ...patient, ...payload, name: `${formData.firstName} ${formData.lastName}`.trim() });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-800">Edit Patient Details</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              PID: {patient.pid} • {patient.fullName || patient.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Gender & DOB */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+251 9..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="patient@example.com"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* City, Address & Blood Type */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Addis Ababa"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address / Woreda</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Bole, Woreda 03"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Type</label>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData((prev) => ({ ...prev, bloodType: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Emergency Contact</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
                  placeholder="Full name"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyContactRel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactRel: e.target.value }))}
                  placeholder="Spouse / Parent"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  placeholder="+251 9..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

