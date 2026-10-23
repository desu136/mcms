import React from 'react';
import { FlaskConical, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';

export function LabResultsPage() {
  const kpisContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      <DoctorStatCard title="Total Lab Tests" value="128" icon={FlaskConical} color="blue" />
      <DoctorStatCard title="Completed" value="102" icon={CheckCircle2} color="emerald" />
      <DoctorStatCard title="Pending" value="18" icon={Clock} color="purple" />
      <DoctorStatCard title="Abnormal Results" value="8" icon={AlertTriangle} color="orange" />
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
          <FlaskConical size={16} color="#38bdf8" /> Laboratory Orders & Results
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { test: 'Complete Blood Count (CBC)', patient: 'Aster Mulu', date: 'Oct 18, 2026', status: 'Completed', isAbnormal: false },
            { test: 'Lipid Profile', patient: 'Samuel Girma', date: 'Oct 17, 2026', status: 'Completed', isAbnormal: false },
            { test: 'Vitamin D (25-OH)', patient: 'Sofiya Mohamed', date: 'Oct 13, 2026', status: 'Abnormal', isAbnormal: true },
            { test: 'Renal Function Test (RFT)', patient: 'Yonas Gebre', date: 'Oct 12, 2026', status: 'Abnormal', isAbnormal: true },
          ].map((item, i) => (
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
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.test}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Patient: {item.patient} · Ordered: {item.date}
                </div>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: item.isAbnormal ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)',
                  color: item.isAbnormal ? '#f87171' : '#4ade80',
                  border: `1px solid ${item.isAbnormal ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'}`,
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DoctorPageShell>
  );
}
