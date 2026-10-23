import React from 'react';
import { FileText, Shield, Activity, Calendar } from 'lucide-react';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import { INITIAL_PATIENTS } from '../../components/doctor/doctorMockData';

export function MedicalRecordsPage() {
  const patient = INITIAL_PATIENTS[0]!;

  const kpisContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      <DoctorStatCard title="Total Records" value="48" icon={FileText} color="blue" />
      <DoctorStatCard title="Active Diagnoses" value="4" icon={Activity} color="emerald" />
      <DoctorStatCard title="Recent Consultations" value="12" icon={Calendar} color="purple" />
      <DoctorStatCard title="Allergies Documented" value="1" icon={Shield} color="orange" />
    </div>
  );

  return (
    <DoctorPageShell kpis={kpisContent}>
      <div
        style={{
          background: 'rgba(21,30,51,0.65)',
          border: '1px solid rgba(30,41,59,0.9)',
          borderRadius: '14px',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="#38bdf8" /> Clinical Medical History
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { date: 'Oct 18, 2026', type: 'Follow-up', desc: 'Hypertension - controlled. Continue current medication regimen.' },
            { date: 'Oct 12, 2026', type: 'Consultation', desc: 'Common cold symptoms reported. Recommended rest and hydration.' },
            { date: 'Oct 05, 2026', type: 'Lab Visit', desc: 'Complete Blood Count within normal diagnostic parameters.' },
            { date: 'Sep 28, 2026', type: 'Follow-up', desc: 'Post-angiogram follow-up. Patient reports stable cardiac condition.' },
          ].map((rec, i) => (
            <div
              key={i}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{rec.desc}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{rec.type} · Dr. Fitsum Alemu</div>
              </div>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>{rec.date}</span>
            </div>
          ))}
        </div>
      </div>
    </DoctorPageShell>
  );
}
