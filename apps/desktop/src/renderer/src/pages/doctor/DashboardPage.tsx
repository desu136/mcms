import React, { useState } from 'react';
import {
  Users,
  CalendarDays,
  Pill,
  FlaskConical,
  CheckCircle2,
  Clock,
  Zap,
  ArrowUpRight,
  Activity,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import {
  CURRENT_DOCTOR,
  INITIAL_PATIENTS,
  TODAY_SCHEDULE,
  PatientItem,
} from '../../components/doctor/doctorMockData';

export interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
}

export function DashboardPage({ onNavigateTab }: DashboardPageProps) {
  const [selectedPatient, setSelectedPatient] = useState<PatientItem>(INITIAL_PATIENTS[0]!);

  const kpisContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      <DoctorStatCard
        title="Today's Appointments"
        value={9}
        icon={Users}
        color="blue"
        change={{ value: '+2', trend: 'up', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Patients Seen Today"
        value={7}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '+3', trend: 'up', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Pending Prescriptions"
        value={4}
        icon={Pill}
        color="purple"
        change={{ value: '-2', trend: 'down', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Lab Results Pending"
        value={6}
        icon={FlaskConical}
        color="orange"
        change={{ value: '+1', trend: 'up', label: 'vs. yesterday' }}
      />
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Quick Actions Card */}
      <div
        style={{
          background: 'rgba(21,30,51,0.65)',
          border: '1px solid rgba(30,41,59,0.9)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: '#0284c7',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Zap size={15} color="#ffffff" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Quick Actions</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px' }}>
          {[
            { label: 'Appointments', icon: CalendarDays, tab: 'appointments' },
            { label: 'Patients', icon: Users, tab: 'patients' },
            { label: 'Prescriptions', icon: Pill, tab: 'prescriptions' },
            { label: 'Lab Results', icon: FlaskConical, tab: 'lab-results' },
          ].map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.label}
                onClick={() => onNavigateTab && onNavigateTab(act.tab)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 10px',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(30,41,59,0.8)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                }}
              >
                <Icon size={18} color="#38bdf8" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Consultation Card */}
      <div
        style={{
          background: 'rgba(21,30,51,0.65)',
          border: '1px solid rgba(30,41,59,0.9)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(30,41,59,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={15} color="#38bdf8" /> Active Consultation
          </div>
          <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 700 }}>● In Progress</span>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <img
              src={selectedPatient.avatar}
              alt={selectedPatient.name}
              style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #38bdf8' } as any}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#f8fafc' }}>{selectedPatient.name}</div>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>{selectedPatient.pid}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {selectedPatient.age} years · {selectedPatient.gender}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Department</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedPatient.department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Visit Type</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedPatient.lastVisitReason}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('patients')}
            style={{
              width: '100%',
              marginTop: '14px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#0b1329',
              border: 'none',
              borderRadius: '8px',
              padding: '9px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            View Full Patient Record
          </button>
        </div>
      </div>
    </>
  );

  return (
    <DoctorPageShell kpis={kpisContent} rightPanel={rightPanelContent} rightPanelWidth="340px">
      {/* Left Area Content: Today's Schedule Card */}
      <div
        style={{
          background: 'rgba(21,30,51,0.65)',
          border: '1px solid rgba(30,41,59,0.9)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(30,41,59,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#38bdf8" /> Today&apos;s Schedule
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('appointments')}
            style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            View All
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TODAY_SCHEDULE.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const match = INITIAL_PATIENTS.find((p) => p.name === item.patientName);
                if (match) setSelectedPatient(match);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: '1px solid rgba(30,41,59,0.7)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, width: '120px' }}>
                  {item.time}
                </span>
                <img
                  src={item.avatar}
                  alt={item.patientName}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', objectCover: 'cover' } as any}
                />
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.patientName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.reason}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#64748b', fontSize: '11px' }}>{item.department}</span>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background:
                      item.status === 'Completed'
                        ? 'rgba(74,222,128,0.1)'
                        : item.status === 'In Progress'
                        ? 'rgba(56,189,248,0.1)'
                        : 'rgba(251,191,36,0.1)',
                    color:
                      item.status === 'Completed'
                        ? '#4ade80'
                        : item.status === 'In Progress'
                        ? '#38bdf8'
                        : '#fbbf24',
                  }}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Patients Table */}
      <div
        style={{
          background: 'rgba(21,30,51,0.65)',
          border: '1px solid rgba(30,41,59,0.9)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(30,41,59,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#38bdf8" /> Recent Clinical Patients
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('patients')}
            style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            All Patients
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {INITIAL_PATIENTS.slice(0, 4).map((p) => (
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={p.avatar}
                  alt={p.name}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', objectCover: 'cover' } as any}
                />
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{p.pid} · {p.age} yrs</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>{p.lastVisit}</div>
                <div style={{ color: '#38bdf8', fontSize: '10px' }}>{p.lastVisitReason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DoctorPageShell>
  );
}
