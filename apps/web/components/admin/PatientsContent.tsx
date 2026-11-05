'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiRequest } from '../../lib/api/client';
import type { PatientDTO } from '@mcms/contracts';

const COLORS = ['#2979FF', '#00C853', '#AA00FF', '#FF6D00', '#F44336'];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'PT';
  }
  return (name.slice(0, 2) || 'PT').toUpperCase();
}

export function PatientsContent() {
  const { accessToken } = useAuth();
  const [recentPatients, setRecentPatients] = useState<PatientDTO[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: 'MALE',
    dob: '',
    bloodGroup: '',
    maritalStatus: '',
    occupation: '',
    nationality: 'Ethiopian',
    region: 'Addis Ababa',
    city: '',
    woreda: '',
    kebele: '',
    houseNo: '',
    notes: '',
    kinName: '',
    kinPhone: '',
    kinRelationship: '',
  });

  const update = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  const loadRecentPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await apiRequest<{ data: PatientDTO[] } | PatientDTO[]>('patients?limit=6', {
        token: accessToken,
      });
      const list = Array.isArray(res) ? res : res?.data || [];
      setRecentPatients(list);
    } catch (err) {
      console.error('Failed to load recent patients:', err);
      setRecentPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    void loadRecentPatients();
  }, [accessToken]);

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage({ text: 'First name and last name are required.', type: 'error' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await apiRequest('patients', {
        token: accessToken,
        method: 'POST',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          gender: formData.gender,
          dateOfBirth: formData.dob || undefined,
          bloodType: formData.bloodGroup || undefined,
          maritalStatus: formData.maritalStatus || undefined,
          occupation: formData.occupation.trim() || undefined,
          nationality: formData.nationality.trim() || undefined,
          addressLine1: [formData.houseNo, formData.kebele, formData.woreda, formData.city].filter(Boolean).join(', ') || undefined,
          city: formData.city.trim() || undefined,
          state: formData.region.trim() || undefined,
          emergencyContactName: formData.kinName.trim() || undefined,
          emergencyContactPhone: formData.kinPhone.trim() || undefined,
          emergencyContactRelation: formData.kinRelationship.trim() || undefined,
        }),
      });

      setMessage({ text: 'Patient registered successfully!', type: 'success' });
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        gender: 'MALE',
        dob: '',
        bloodGroup: '',
        maritalStatus: '',
        occupation: '',
        nationality: 'Ethiopian',
        region: 'Addis Ababa',
        city: '',
        woreda: '',
        kebele: '',
        houseNo: '',
        notes: '',
        kinName: '',
        kinPhone: '',
        kinRelationship: '',
      });
      void loadRecentPatients();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to register patient', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const weekdayFormatted = today.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* Main Form */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>👤</span>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Patient Registration</h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
              Register a new patient and persist their clinical file to the database.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', fontSize: 11, color: '#374151' }}>
              📅 {dateFormatted} <span style={{ color: '#9CA3AF', marginLeft: 4 }}>{weekdayFormatted}</span>
            </div>
            <button onClick={handleSave} disabled={saving} style={primaryBtn}>
              {saving ? 'Saving...' : '💾 Save Patient'}
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: message.type === 'success' ? '#065F46' : '#B91C1C',
              border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Patient Information */}
        <div style={section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              👤
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Patient Information</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="First Name" required icon="👤">
              <input placeholder="Enter patient first name" value={formData.firstName} onChange={(e) => update('firstName', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Last Name" required icon="👤">
              <input placeholder="Enter patient last name" value={formData.lastName} onChange={(e) => update('lastName', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Phone Number" icon="📞">
              <input placeholder="+251 9XX XXX XXX" value={formData.phone} onChange={(e) => update('phone', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Email Address" icon="✉️">
              <input placeholder="Enter email address" value={formData.email} onChange={(e) => update('email', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Gender" required icon="👤">
              <select value={formData.gender} onChange={(e) => update('gender', e.target.value)} style={selectStyle}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Date of Birth" icon="📅">
              <input type="date" value={formData.dob} onChange={(e) => update('dob', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Blood Group" icon="🩸">
              <select value={formData.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)} style={selectStyle}>
                <option value="">Select blood group</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
              </select>
            </Field>
            <Field label="Marital Status" icon="💍">
              <select value={formData.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)} style={selectStyle}>
                <option value="">Select marital status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </Field>
            <Field label="Occupation" icon="💼">
              <input placeholder="Enter occupation" value={formData.occupation} onChange={(e) => update('occupation', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Nationality" icon="🌍">
              <input placeholder="Nationality" value={formData.nationality} onChange={(e) => update('nationality', e.target.value)} style={inputStyle} />
            </Field>
          </div>
        </div>

        {/* Address Information */}
        <div style={section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              📍
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Address Information</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Region" icon="📍">
              <input placeholder="Region / State" value={formData.region} onChange={(e) => update('region', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="City" icon="🏙️">
              <input placeholder="Enter city" value={formData.city} onChange={(e) => update('city', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Woreda / Subcity" icon="📍">
              <input placeholder="Enter woreda" value={formData.woreda} onChange={(e) => update('woreda', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Kebele" icon="📍">
              <input placeholder="Enter kebele" value={formData.kebele} onChange={(e) => update('kebele', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="House Number / Address" icon="🏠">
              <input placeholder="Enter house number / address" value={formData.houseNo} onChange={(e) => update('houseNo', e.target.value)} style={inputStyle} />
            </Field>
          </div>
        </div>

        {/* Next of Kin */}
        <div style={section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              🚨
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Emergency Contact</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Field label="Contact Name" icon="👤">
              <input placeholder="Enter contact name" value={formData.kinName} onChange={(e) => update('kinName', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Phone Number" icon="📞">
              <input placeholder="+251 9XX XXX XXX" value={formData.kinPhone} onChange={(e) => update('kinPhone', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Relationship" icon="👥">
              <input placeholder="e.g. Spouse, Parent" value={formData.kinRelationship} onChange={(e) => update('kinRelationship', e.target.value)} style={inputStyle} />
            </Field>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Recent Patients */}
        <div style={{ ...panel, flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Recent Patients</span>
            <span style={{ fontSize: 10, color: '#2979FF', fontWeight: 600 }}>{recentPatients.length}</span>
          </div>
          {loadingPatients ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 11 }}>
              Loading patients...
            </div>
          ) : recentPatients.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 11 }}>
              No patients registered in the database yet.
            </div>
          ) : (
            recentPatients.map((p, i) => {
              const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
              const initials = getInitials(name);
              const color = COLORS[i % COLORS.length];
              return (
                <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < recentPatients.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 9, color: '#9CA3AF' }}>PID: {p.pid || 'N/A'}</div>
                  </div>
                  <div style={{ fontSize: 9, color: '#6B7280', textAlign: 'right', flexShrink: 0 }}>
                    {p.phoneNumber || ''}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, icon, children }: { label: string; required?: boolean; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF', pointerEvents: 'none' }}>{icon}</span>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const existing = (child.props as any).style || {};
            return React.cloneElement(child as React.ReactElement<any>, { style: { ...existing, paddingLeft: 32 } });
          }
          return child;
        })}
      </div>
    </div>
  );
}

const section: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' };
const panel: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const primaryBtn: React.CSSProperties = { background: '#2979FF', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { width: '100%', height: 38, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#fff', outline: 'none', paddingRight: 12, boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { width: '100%', height: 38, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#fff', outline: 'none', paddingRight: 10, boxSizing: 'border-box', cursor: 'pointer' };
