import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Heart,
  CheckCircle2,
  Calendar,
  XCircle,
} from 'lucide-react';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import {
  TODAY_SCHEDULE,
  UPCOMING_APPOINTMENTS_PAGE,
  AppointmentItem,
} from '../../components/doctor/doctorMockData';

export function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem>(TODAY_SCHEDULE[0]!);

  const kpisContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      <DoctorStatCard
        title="Total Appointments"
        value={8}
        icon={CalendarDays}
        color="blue"
        change={{ value: '+2', trend: 'up', label: 'vs. last week' }}
      />
      <DoctorStatCard
        title="Completed"
        value={5}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '+1', trend: 'up', label: 'vs. last week' }}
      />
      <DoctorStatCard
        title="Upcoming"
        value={2}
        icon={Clock}
        color="cyan"
        change={{ value: '+1', trend: 'up', label: 'vs. last week' }}
      />
      <DoctorStatCard
        title="Cancelled"
        value={1}
        icon={XCircle}
        color="orange"
        change={{ value: '0', trend: 'neutral', label: 'vs. last week' }}
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
          <CalendarDays size={16} color="#38bdf8" /> Appointment Details
        </span>
        <span
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'rgba(56,189,248,0.1)',
            color: '#38bdf8',
            fontWeight: 600,
          }}
        >
          {selectedAppointment.status}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={selectedAppointment.avatar}
          alt={selectedAppointment.patientName}
          style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #38bdf8' } as any}
        />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{selectedAppointment.patientName}</div>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>{selectedAppointment.patientId}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {selectedAppointment.age} yrs · {selectedAppointment.gender}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Time</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedAppointment.time}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Department</span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedAppointment.department}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Reason</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedAppointment.reason}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Doctor</span>
          <span style={{ color: '#e2e8f0' }}>{selectedAppointment.doctorName}</span>
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
        Start Consultation
      </button>
    </div>
  );

  const appointmentsList: AppointmentItem[] = activeTab === 'today' ? TODAY_SCHEDULE : UPCOMING_APPOINTMENTS_PAGE;

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
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid rgba(30,41,59,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('today')}
              style={{
                background: activeTab === 'today' ? '#0284c7' : 'none',
                color: activeTab === 'today' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Today ({TODAY_SCHEDULE.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              style={{
                background: activeTab === 'upcoming' ? '#0284c7' : 'none',
                color: activeTab === 'upcoming' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Upcoming ({UPCOMING_APPOINTMENTS_PAGE.length})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {appointmentsList.map((apt: AppointmentItem) => {
            const isSelected = selectedAppointment.id === apt.id;
            return (
              <div
                key={apt.id}
                onClick={() => setSelectedAppointment(apt)}
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
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, width: '120px' }}>
                    {apt.time}
                  </span>
                  <img
                    src={apt.avatar}
                    alt={apt.patientName}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectCover: 'cover' } as any}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: isSelected ? '#38bdf8' : '#f8fafc' }}>{apt.patientName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{apt.reason}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>{apt.department}</span>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background:
                        apt.status === 'Completed'
                          ? 'rgba(74,222,128,0.1)'
                          : apt.status === 'In Progress'
                          ? 'rgba(56,189,248,0.1)'
                          : 'rgba(251,191,36,0.1)',
                      color:
                        apt.status === 'Completed'
                          ? '#4ade80'
                          : apt.status === 'In Progress'
                          ? '#38bdf8'
                          : '#fbbf24',
                    }}
                  >
                    {apt.status}
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
