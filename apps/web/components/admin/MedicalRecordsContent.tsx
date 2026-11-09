'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiRequest } from '../../lib/api/client';
import type { PatientDTO } from '@mcms/contracts';

export function MedicalRecordsContent() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Medical Records');
  const tabs = ['Overview', 'Medical Records', 'Diagnoses', 'Prescriptions', 'Lab Results'];

  useEffect(() => {
    let mounted = true;
    async function searchPatients() {
      if (!search.trim()) {
        setPatients([]);
        return;
      }
      setLoading(true);
      try {
        const res = await apiRequest<{ data: PatientDTO[] } | PatientDTO[]>(
          `patients?search=${encodeURIComponent(search.trim())}&limit=5`,
          { token: accessToken },
        );
        const list = Array.isArray(res) ? res : res?.data || [];
        if (mounted) {
          setPatients(list);
          if (list.length > 0 && !selectedPatient && list[0]) {
            setSelectedPatient(list[0]);
          }
        }
      } catch (err) {
        console.error('Failed to search patients:', err);
        if (mounted) setPatients([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const timer = setTimeout(searchPatients, 300);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [search, accessToken]);

  const patientName = selectedPatient
    ? selectedPatient.fullName || `${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`.trim()
    : null;

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%' }}>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>📋</span>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Medical Records</h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
              View and manage clinical histories and records from the database.
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, phone, or PID to load medical file..."
              style={{ width: '100%', height: 38, paddingLeft: 30, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Selected Patient Banner or Empty State */}
        {selectedPatient ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#2979FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                {patientName?.slice(0, 2).toUpperCase() || 'PT'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{patientName}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>Active File</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
                  PID: {selectedPatient.pid || 'N/A'} · {selectedPatient.phoneNumber || 'No phone'} · {selectedPatient.gender || 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #F1F5F9' }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: activeTab === t ? 600 : 400,
                color: activeTab === t ? '#2979FF' : '#6B7280',
                borderBottom: activeTab === t ? '2px solid #2979FF' : '2px solid transparent',
                marginBottom: -2,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Records Table area */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 48, textAlign: 'center', margin: 'auto' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
              {selectedPatient ? `No clinical ${activeTab.toLowerCase()} recorded for ${patientName}` : 'Search for a patient to open their medical records'}
            </div>
            <p style={{ fontSize: 12, color: '#6B7280', maxWidth: 360, margin: '6px auto 0' }}>
              {selectedPatient
                ? 'Clinical consult notes, prescriptions, and lab orders will appear here once saved by doctors.'
                : 'Type a patient name or PID in the search box above to inspect their clinical encounters.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
