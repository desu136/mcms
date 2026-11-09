import React, { useState } from 'react';
import {
  User,
  Shield,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  FlaskConical,
  Edit,
  Save,
} from 'lucide-react';
import {
  LAB_USER_PROFILE,
  LabUserProfile,
} from '../../components/lab/profileMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export function ProfilePage() {
  const [profile, setProfile] = useState<LabUserProfile>(LAB_USER_PROFILE);
  const [isEditing, setIsEditing] = useState(false);

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Technologist Profile & Professional Credentials
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Authorized personnel profile, bench certifications, and state licensing status.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
          <span>{isEditing ? 'Save Changes' : 'Edit Information'}</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="Total Tests Certified" value="3,420" change={{ change: '+124 this mo', trend: 'up' }} color="blue" />
      <LabStatCard title="Quality Score" value="99.8%" color="emerald" />
      <LabStatCard title="Analytical TAT Rate" value="98.2%" color="cyan" />
      <LabStatCard title="Primary Bench" value="Hematology" color="amber" />
      <LabStatCard title="License Status" value="Active (2028)" color="emerald" />
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: Profile Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs text-xs space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-cyan-500/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">{profile.fullName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700">
                  {profile.status}
                </span>
              </div>
              <div className="text-cyan-700 font-bold text-xs">{profile.jobTitle}</div>
              <div className="text-slate-400 text-[11px] font-mono">{profile.employeeId}</div>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-100 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Department</span>
              <span className="font-bold text-slate-800">{profile.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Specialization</span>
              <span className="font-bold text-slate-800">{profile.specialization}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Degree</span>
              <span className="font-bold text-slate-800">{profile.educationLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">License Number</span>
              <span className="font-mono font-bold text-cyan-700">{profile.licenseNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">License Valid Until</span>
              <span className="font-bold text-emerald-600">{profile.licenseExpiry}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.address}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Bench Certifications & Shift (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Bench Competencies Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-xs">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Certified Analytical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-800 font-bold text-xs"
                >
                  ✓ {skill}
                </span>
              ))}
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 font-bold text-xs">
                ✓ Phlebotomy & Venipuncture
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-800 font-bold text-xs">
                ✓ Molecular Diagnostics (PCR)
              </span>
            </div>
          </div>

          {/* Instrument Certifications */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-xs">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Certified Automated Analyzers
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Mindray BC-5000 5-Part Diff Hematology', cert: 'Operator & Level 2 Maintenance', date: 'Certified Aug 2024' },
                { name: 'Roche Cobas c311 Chemistry Analyzer', cert: 'Full Analytical Operation', date: 'Certified Nov 2024' },
                { name: 'BioMérieux Bact/ALERT 3D System', cert: 'Blood Culture Specialist', date: 'Certified Feb 2025' },
              ].map((inst) => (
                <div key={inst.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{inst.name}</div>
                    <div className="text-[10px] text-cyan-700 font-semibold">{inst.cert}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{inst.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LabPageShell>
  );
}

export default ProfilePage;
