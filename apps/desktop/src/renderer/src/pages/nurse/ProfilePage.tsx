import React, { useState, useEffect } from 'react';
import {
  User,
  Edit3,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Globe,
  Clock,
  CheckCircle2,
  Bell,
  Lock,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { NurseProfileInfo } from '../../components/nurse/nurseMockData';
import { useAuth } from '../../auth/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<NurseProfileInfo>({
    fullName: user?.displayName || 'Staff Nurse',
    dateOfBirth: 'Mar 15, 1996',
    gender: 'Female',
    nationality: 'Ethiopian',
    address: 'Addis Ababa, Ethiopia',
    emergencyContact: '+251 911 000 001',
    relationship: 'Family Member',
    languages: 'Amharic, English',
    role: user?.role || 'Staff Nurse',
    licenseNumber: 'ETH-RN-48921',
    qualification: 'B.Sc. in Nursing',
    yearsOfExperience: '5+ Years',
    specialization: 'Triage & Inpatient Care',
    department: user?.staffProfile?.department || 'General Nursing & Triage',
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.displayName || prev.fullName,
        role: user.role || prev.role,
        department: user.staffProfile?.department || prev.department,
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof NurseProfileInfo, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const email = user?.email || 'nurse@mcms.local';
  const phone = user?.staffProfile?.phoneNumber || '+251 911 000 000';
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.fullName)}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F4F7FC] overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <User size={18} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Nurse Profile & Duty</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage nursing credentials, contact details, and shift schedules</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isEditing
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
          }`}
        >
          {isEditing ? <CheckCircle2 size={13} /> : <Edit3 size={13} />}
          <span>{isEditing ? 'Save Profile' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Left Card: Avatar & Summary */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs space-y-3">
          <div className="text-center py-2">
            <div className="relative inline-block">
              <img
                src={avatar}
                alt={profile.fullName}
                className="w-20 h-20 rounded-full object-cover ring-3 ring-blue-100 shadow-md mx-auto"
              />
              <button
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 cursor-pointer"
                title="Change Photo"
              >
                <Camera size={12} />
              </button>
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-2">{profile.fullName}</h2>
            <p className="text-xs text-blue-600 font-semibold">{profile.role}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{profile.department}</p>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={13} className="text-gray-400 shrink-0" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={13} className="text-gray-400 shrink-0" />
              <span>{profile.address}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase size={13} className="text-gray-400 shrink-0" />
              <span>{profile.yearsOfExperience} Experience</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Credentials & Info */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Professional Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-gray-200 disabled:bg-gray-50 text-gray-800 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">License Number</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-gray-200 disabled:bg-gray-50 text-gray-800 font-medium font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">Assigned Ward</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-gray-200 disabled:bg-gray-50 text-gray-800 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">Primary Role</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-gray-200 disabled:bg-gray-50 text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Recent Station Activities */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Recent Duty Activity</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block text-xs">Shift Duty Active</span>
                  <span className="text-[11px] text-gray-500">Authenticated to Nurse Desktop Station</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono shrink-0">Now</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block text-xs">Outpatient Triage Synchronization</span>
                  <span className="text-[11px] text-gray-500">Biometrics and queue handoffs synchronized with central server</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono shrink-0">Sync Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProfilePage);
