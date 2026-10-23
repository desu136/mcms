import React from 'react';
import { Pill, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';

export function PrescriptionsPage() {
  const kpisContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      <DoctorStatCard title="Active Prescriptions" value="36" icon={Pill} color="blue" />
      <DoctorStatCard title="Fulfilled (30d)" value="128" icon={CheckCircle2} color="emerald" />
      <DoctorStatCard title="Pending Pharmacy" value="4" icon={Clock} color="purple" />
      <DoctorStatCard title="Refills Requested" value="2" icon={AlertTriangle} color="orange" />
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
          <Pill size={16} color="#38bdf8" /> Outpatient Prescriptions
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { drug: 'Amlodipine 5mg', patient: 'Aster Mulu', instructions: 'Take 1 tablet daily in the morning', status: 'Active' },
            { drug: 'Metformin 500mg', patient: 'Aster Mulu', instructions: 'Take 1 tablet twice daily with meals', status: 'Active' },
            { drug: 'Atorvastatin 20mg', patient: 'Samuel Girma', instructions: 'Take 1 tablet at bedtime', status: 'Active' },
            { drug: 'Lisinopril 10mg', patient: 'Lidya Kebede', instructions: 'Take 1 tablet daily', status: 'Fulfilled' },
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
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.drug}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Patient: {item.patient} · {item.instructions}
                </div>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: item.status === 'Active' ? 'rgba(74,222,128,0.1)' : 'rgba(100,116,139,0.1)',
                  color: item.status === 'Active' ? '#4ade80' : '#94a3b8',
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
