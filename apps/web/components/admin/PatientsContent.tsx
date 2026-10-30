'use client';

import React, { useState } from 'react';

const recentPatients = [
    { name: 'Aster Mulu', id: 'PID-001024', phone: '+251 912 345 678', av: 'AM', c: '#2979FF' },
    { name: 'Abebe Assefa', id: 'PID-001023', phone: '+251 911 234 567', av: 'AA', c: '#00C853' },
    { name: 'Tigist Alemu', id: 'PID-001022', phone: '+251 913 456 789', av: 'TA', c: '#AA00FF' },
    { name: 'Getachew Tadesse', id: 'PID-001021', phone: '+251 912 876 543', av: 'GT', c: '#FF6D00' },
    { name: 'Lidya Kebede', id: 'PID-001020', phone: '+251 911 765 432', av: 'LK', c: '#F44336' },
];

export function PatientsContent() {
    const [formData, setFormData] = useState({
        fullName: '', phone: '', email: '', gender: '', dob: '', age: '',
        bloodGroup: '', maritalStatus: '', occupation: '', nationality: '',
        region: '', city: '', woreda: '', kebele: '', houseNo: '', notes: '',
        kinName: '', kinPhone: '', kinRelationship: '',
    });

    const update = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

    return (
        <div style={{ display: 'flex', gap: 16, height: '100%', minHeight: 'calc(100vh - 120px)' }}>
            {/* Main Form */}
            <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>👤</span>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Patient Registration</h1>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>Register a new patient and manage their basic information.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', fontSize: 11, color: '#374151' }}>
                            📅 Oct 19, 2026 <span style={{ color: '#9CA3AF', marginLeft: 4 }}>Monday</span>
                        </div>
                        <button style={secondaryBtn}>← Back to Patients</button>
                        <button style={primaryBtn}>💾 Save Patient</button>
                    </div>
                </div>

                {/* Patient Information */}
                <div style={section}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Patient Information</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field label="Full Name" required icon="👤"><input placeholder="Enter patient full name" value={formData.fullName} onChange={e => update('fullName', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Phone Number" required icon="📞"><input placeholder="+251 9XX XXX XXX" value={formData.phone} onChange={e => update('phone', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Email Address" icon="✉️"><input placeholder="Enter email address" value={formData.email} onChange={e => update('email', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Gender" required icon="👤">
                            <select value={formData.gender} onChange={e => update('gender', e.target.value)} style={selectStyle}>
                                <option value="">Select gender</option><option>Male</option><option>Female</option>
                            </select>
                        </Field>
                        <Field label="Date of Birth" required icon="📅"><input type="date" value={formData.dob} onChange={e => update('dob', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Age" icon="📅"><input placeholder="Auto calculated" value={formData.age} readOnly style={{ ...inputStyle, background: '#F3F4F6' }} /></Field>
                        <Field label="Blood Group" icon="🩸">
                            <select value={formData.bloodGroup} onChange={e => update('bloodGroup', e.target.value)} style={selectStyle}>
                                <option value="">Select blood group</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                            </select>
                        </Field>
                        <Field label="Marital Status" icon="💍">
                            <select value={formData.maritalStatus} onChange={e => update('maritalStatus', e.target.value)} style={selectStyle}>
                                <option value="">Select marital status</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                            </select>
                        </Field>
                        <Field label="Occupation" icon="💼"><input placeholder="Enter occupation" value={formData.occupation} onChange={e => update('occupation', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Nationality" icon="🌍">
                            <select value={formData.nationality} onChange={e => update('nationality', e.target.value)} style={selectStyle}>
                                <option value="">Select nationality</option><option>Ethiopian</option><option>Other</option>
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Address Information */}
                <div style={section}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📍</div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Address Information</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field label="Region" required icon="📍">
                            <select value={formData.region} onChange={e => update('region', e.target.value)} style={selectStyle}>
                                <option value="">Select region</option><option>Addis Ababa</option><option>Oromia</option><option>Amhara</option><option>Tigray</option><option>SNNPR</option>
                            </select>
                        </Field>
                        <Field label="City" icon="🏙️"><input placeholder="Enter city" value={formData.city} onChange={e => update('city', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Woreda" required icon="📍">
                            <select value={formData.woreda} onChange={e => update('woreda', e.target.value)} style={selectStyle}>
                                <option value="">Select woreda</option>
                            </select>
                        </Field>
                        <Field label="Kebele" icon="📍"><input placeholder="Enter kebele" value={formData.kebele} onChange={e => update('kebele', e.target.value)} style={inputStyle} /></Field>
                        <Field label="House Number / Address" icon="🏠"><input placeholder="Enter house number / address" value={formData.houseNo} onChange={e => update('houseNo', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Additional Notes" icon="📝"><textarea placeholder="Any additional information..." value={formData.notes} onChange={e => update('notes', e.target.value)} style={{ ...inputStyle, height: 60, resize: 'vertical' as 'vertical', paddingTop: 10 }} /></Field>
                    </div>
                </div>

                {/* Next of Kin */}
                <div style={section}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚨</div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Next of Kin / Emergency Contact</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <Field label="Name" icon="👤"><input placeholder="Enter contact name" value={formData.kinName} onChange={e => update('kinName', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Phone Number" icon="📞"><input placeholder="+251 9XX XXX XXX" value={formData.kinPhone} onChange={e => update('kinPhone', e.target.value)} style={inputStyle} /></Field>
                        <Field label="Relationship" icon="👥">
                            <select value={formData.kinRelationship} onChange={e => update('kinRelationship', e.target.value)} style={selectStyle}>
                                <option value="">Select relationship</option><option>Spouse</option><option>Parent</option><option>Sibling</option><option>Child</option><option>Other</option>
                            </select>
                        </Field>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Patient Photo */}
                <div style={panel}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 14, textAlign: 'center' }}>Patient Photo</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#F3F4F6', border: '2px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#9CA3AF' }}>👤</div>
                        <button style={{ ...primaryBtn, fontSize: 11, padding: '6px 14px' }}>📷 Upload Photo</button>
                        <span style={{ fontSize: 9, color: '#9CA3AF' }}>JPG, PNG (Max 2MB)</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={panel}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span>⚡</span><span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Quick Actions</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                        {[{ icon: '🪪', label: 'Scan ID' }, { icon: '📱', label: 'Scan QR' }, { icon: '📋', label: 'Copy Patient' }, { icon: '📥', label: 'Import' }].map((a, i) => (
                            <button key={i} style={{ padding: '10px 2px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 8, color: '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 20 }}>{a.icon}</span>{a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Patients */}
                <div style={{ ...panel, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Recent Patients</span>
                        <button style={{ fontSize: 10, color: '#2979FF', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                    </div>
                    {recentPatients.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < recentPatients.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{p.av}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{p.name}</div>
                                <div style={{ fontSize: 9, color: '#9CA3AF' }}>{p.id}</div>
                            </div>
                            <div style={{ fontSize: 9, color: '#6B7280', textAlign: 'right', flexShrink: 0 }}>{p.phone}</div>
                            <span style={{ fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>›</span>
                        </div>
                    ))}
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
                {React.Children.map(children, child => {
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
const secondaryBtn: React.CSSProperties = { background: '#fff', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { width: '100%', height: 38, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#fff', outline: 'none', paddingRight: 12, boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { width: '100%', height: 38, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', background: '#fff', outline: 'none', paddingRight: 10, boxSizing: 'border-box', cursor: 'pointer', appearance: 'none' as 'none' };
export default PatientsContent;
