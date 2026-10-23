import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Activity,
  Heart,
  Shield,
  UserCheck,
} from 'lucide-react';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import {
  INITIAL_PATIENTS,
  PatientItem,
} from '../../components/doctor/doctorMockData';

export function PatientsPage() {
  const [patients, setPatients] = useState<PatientItem[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientItem>(INITIAL_PATIENTS[0]!);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.pid.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  const kpisContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      <DoctorStatCard
        title="Total Patients"
        value={248}
        icon={Users}
        color="blue"
        change={{ value: '12%', trend: 'up', label: 'vs. last month' }}
      />
      <DoctorStatCard
        title="Active Patients"
        value={232}
        icon={UserCheck}
        color="emerald"
        change={{ value: '10%', trend: 'up', label: 'vs. last month' }}
      />
      <DoctorStatCard
        title="New Patients"
        value={18}
        icon={Users}
        color="purple"
        change={{ value: '5%', trend: 'up', label: 'vs. last month' }}
      />
      <DoctorStatCard
        title="Inactive Patients"
        value={16}
        icon={Shield}
        color="orange"
        change={{ value: '3%', trend: 'down', label: 'vs. last month' }}
      />
    </div>
  );

  const rightPanelContent = (
    <div
      style={{
        background: 'rgba(21,30,51,0.65)',
        border: '1px solid rgba(30,41,59,0.9)',
        borderRadius: '14px',
        overflow: 'hidden',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,41,59,0.8)', paddingBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={16} color="#38bdf8" /> Patient Overview
        </span>
        <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 700 }}>● Active</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={selectedPatient.avatar}
          alt={selectedPatient.name}
          style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #38bdf8' } as any}
        />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{selectedPatient.name}</div>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>{selectedPatient.pid}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {selectedPatient.age} yrs · {selectedPatient.gender}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Phone size={13} color="#64748b" /> {selectedPatient.phone}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={13} color="#64748b" /> {selectedPatient.email}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={13} color="#64748b" /> {selectedPatient.address}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Total Visits</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{selectedPatient.totalVisits}</div>
        </div>
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Department</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', marginTop: '4px' }}>{selectedPatient.department}</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
          Diagnostic Conditions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {selectedPatient.conditions.map((c, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '6px',
                background: 'rgba(15,23,42,0.4)',
                border: '1px solid #1e293b',
                fontSize: '11px',
              }}
            >
              <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{c.title}</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: c.status === 'Active' ? '#4ade80' : '#38bdf8' }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        style={{
          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
          color: '#0b1329',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          marginTop: '6px',
        }}
      >
        View Full Clinical Record
      </button>
    </div>
  );

  return (
    <DoctorPageShell kpis={kpisContent} rightPanel={rightPanelContent} rightPanelWidth="340px">
      <div
        style={{
          background: 'rgba(21,30,51,0.65)',
          border: '1px solid rgba(30,41,59,0.9)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        {/* Table Filter Bar */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid rgba(30,41,59,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '6px 12px',
              minWidth: '240px',
            }}
          >
            <Search size={13} color="#64748b" />
            <input
              type="text"
              placeholder="Filter by name, PID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                fontSize: '11px',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Patients Table */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((p) => {
            const isSelected = selectedPatient.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderBottom: '1px solid rgba(30,41,59,0.7)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(56,189,248,0.06)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={p.avatar}
                    alt={p.name}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectCover: 'cover' } as any}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: isSelected ? '#38bdf8' : '#f8fafc' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{p.pid} · {p.age} yrs · {p.gender}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 500 }}>{p.lastVisit}</div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>{p.lastVisitReason}</div>
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: p.status === 'Active' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                      color: p.status === 'Active' ? '#4ade80' : '#ef4444',
                    }}
                  >
                    ● {p.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DoctorPageShell>
  );
}
