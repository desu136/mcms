'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  Upload,
  Camera,
  Trash2,
  Eye,
  Check,
  X,
  Plus,
  Settings,
  Bell,
  Lock,
  Sun,
  TestTube2,
  FlaskConical,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  UserCheck,
  Globe,
  Save,
} from 'lucide-react';
import {
  LAB_USER_PROFILE,
  PROFILE_STATS,
  USER_DOCUMENTS,
  RECENT_ACTIVITIES,
  LabUserProfile,
} from '../../../components/lab/profileMockData';

type TabKey = 'personal' | 'professional' | 'working-hours' | 'notifications' | 'security';

export default function LabProfileSettingsPage() {
  const [profile, setProfile] = useState<LabUserProfile>(LAB_USER_PROFILE);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');
  const [skills, setSkills] = useState<string[]>(LAB_USER_PROFILE.skills);
  const [newSkillText, setNewSkillText] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    showToast(`Removed ${skillToRemove} from skills.`);
  };

  const handleAddSkill = () => {
    if (newSkillText.trim() && !skills.includes(newSkillText.trim())) {
      setSkills((prev) => [...prev, newSkillText.trim()]);
      setNewSkillText('');
      setIsAddingSkill(false);
      showToast('Skill added successfully.');
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4 bg-[#F4F7FB]">
      {/* 1. Page Header matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle with UserCheck/Settings Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <UserCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Profile & Professional Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage your personal information, professional details, and system preferences.
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs self-start md:self-auto">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 leading-none">{calendarDate}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Tuesday</div>
          </div>
          <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-slate-200">
            <button
              onClick={() => setCalendarDate('Oct 18, 2026')}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCalendarDate('Oct 20, 2026')}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three-Column Main Body matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ================= COLUMN 1: LEFT PROFILE & DOCUMENTS (3.2 cols) ================= */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4">
          {/* Card 1: Profile Photo */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col items-center text-center">
            <div className="w-full flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Profile Photo</span>
            </div>

            <div className="relative mt-4">
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20"
              />
              <button
                onClick={() => showToast('Update profile photo')}
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => showToast('Upload photo dialog')}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>

            <span className="text-[10px] text-slate-400 font-medium mt-1.5">
              JPG, PNG (Max 2MB)
            </span>
          </div>

          {/* Card 2: Quick Information */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Quick Information</span>
            </div>

            <div className="pt-3.5 space-y-3 text-xs">
              {/* Full Name */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Full Name</div>
                  <div className="font-bold text-slate-800">{profile.fullName}</div>
                </div>
              </div>

              {/* Job Title */}
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Job Title</div>
                  <div className="font-bold text-slate-800">{profile.jobTitle}</div>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Department</div>
                  <div className="font-bold text-slate-800">{profile.department}</div>
                </div>
              </div>

              {/* Employee ID */}
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Employee ID</div>
                  <div className="font-bold text-slate-800">{profile.employeeId}</div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-slate-400 font-medium">Email</div>
                  <div className="font-bold text-slate-800 text-[11px] truncate">
                    {profile.email}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Phone</div>
                  <div className="font-bold text-slate-800">{profile.phone}</div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Status</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mt-0.5">
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Documents */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Documents</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Manage your professional documents.
              </p>
            </div>

            <div className="pt-3 space-y-2.5">
              {USER_DOCUMENTS.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-[11px] truncate">{doc.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">
                        Uploaded - {doc.uploadDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => showToast(`Viewing ${doc.name}...`)}
                      className="px-2 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-[10px] transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => showToast(`Deleted ${doc.name}`)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: CENTER SETTINGS FORMS (5.8 cols) ================= */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-4">
          {/* Top Settings Tabs matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-4 pt-2 flex items-center gap-4 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('personal')}
              className={`pb-3 font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'personal'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal Information</span>
            </button>

            <button
              onClick={() => setActiveTab('professional')}
              className={`pb-3 font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'professional'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Professional Details</span>
            </button>

            <button
              onClick={() => setActiveTab('working-hours')}
              className={`pb-3 font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'working-hours'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Working Hours</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3 font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
          </div>

          {/* Form 1: Personal Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm">Personal Information</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Update your basic personal information.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Personal information updated successfully.');
              }}
              className="pt-4 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.fullName}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      defaultValue={profile.dob}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    defaultValue={profile.gender}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      defaultValue={profile.phone}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      defaultValue={profile.email}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      defaultValue={profile.address}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Emergency Contact
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      defaultValue={profile.emergencyContact.phone}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 invisible">
                    Relationship
                  </label>
                  <select
                    defaultValue={profile.emergencyContact.relationship}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons matching screenshot */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-[0.98]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Changes canceled.')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Professional Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <span>Professional Details</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Your qualifications and work-related information.
              </p>
            </div>

            <div className="pt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Education Level
                  </label>
                  <select
                    defaultValue={profile.educationLevel}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="BSc in Medical Laboratory Science">
                      BSc in Medical Laboratory Science
                    </option>
                    <option value="MSc in Clinical Pathology">MSc in Clinical Pathology</option>
                    <option value="Diploma in Laboratory Technology">
                      Diploma in Laboratory Technology
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Specialization
                  </label>
                  <select
                    defaultValue={profile.specialization}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Clinical Laboratory">Clinical Laboratory</option>
                    <option value="Hematology & Blood Banking">Hematology & Blood Banking</option>
                    <option value="Microbiology & Virology">Microbiology & Virology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    License / Certification No.
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.licenseNo}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    License Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      defaultValue={profile.licenseExpiry}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Skills / Expertise Tag Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Skills / Expertise
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-blue-900 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {isAddingSkill ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newSkillText}
                        onChange={(e) => setNewSkillText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                        placeholder="Skill name..."
                        className="px-2.5 py-1 text-xs rounded-full border border-blue-300 focus:outline-none w-28"
                        autoFocus
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-2 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingSkill(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Skill</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form 3: Preferences Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Preferences</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Customize your system preferences.
              </p>
            </div>

            <div className="pt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Default Department
                  </label>
                  <select
                    defaultValue="Laboratory"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Language</label>
                  <select
                    defaultValue="English"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Amharic">Amharic</option>
                  </select>
                </div>
              </div>

              <div className="max-w-xs">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Theme</label>
                <div className="relative">
                  <Sun className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    defaultValue="Light"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                    <option value="System">System Default</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: RIGHT SUMMARY & STATS (3.2 cols) ================= */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4">
          {/* Card 1: Professional Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              <span>Professional Summary</span>
            </div>

            <div className="pt-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-bold text-slate-800">{profile.department}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Job Title</span>
                <span className="font-semibold text-slate-700">{profile.jobTitle}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Employee ID</span>
                <span className="font-bold text-slate-800">{profile.employeeId}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Join Date</span>
                <span className="font-semibold text-slate-700">{profile.joinDate}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Experience</span>
                <span className="font-semibold text-slate-700">{profile.experience}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Statistics (2x2 Grid) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Quick Statistics</span>
            </div>

            <div className="pt-3.5 grid grid-cols-2 gap-2.5">
              {/* Tests Processed */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <FlaskConical className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-slate-500">Tests Processed</span>
                </div>
                <div className="text-lg font-black text-slate-800 mt-1">
                  {PROFILE_STATS.testsProcessed.value}
                </div>
                <div className="text-[9px] font-bold text-emerald-600 mt-0.5">
                  {PROFILE_STATS.testsProcessed.trend}
                </div>
              </div>

              {/* Samples Handled */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <TestTube2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-slate-500">Samples Handled</span>
                </div>
                <div className="text-lg font-black text-slate-800 mt-1">
                  {PROFILE_STATS.samplesHandled.value}
                </div>
                <div className="text-[9px] font-bold text-emerald-600 mt-0.5">
                  {PROFILE_STATS.samplesHandled.trend}
                </div>
              </div>

              {/* Accuracy Rate */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-slate-500">Accuracy Rate</span>
                </div>
                <div className="text-lg font-black text-slate-800 mt-1">
                  {PROFILE_STATS.accuracyRate.value}
                </div>
                <div className="text-[9px] font-bold text-emerald-600 mt-0.5">
                  {PROFILE_STATS.accuracyRate.trend}
                </div>
              </div>

              {/* Avg. Turnaround Time */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-slate-500">Avg. Turnaround Time</span>
                </div>
                <div className="text-lg font-black text-slate-800 mt-1">
                  {PROFILE_STATS.avgTurnaroundTime.value}
                </div>
                <div className="text-[9px] font-bold text-emerald-600 mt-0.5">
                  {PROFILE_STATS.avgTurnaroundTime.trend}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Recent Activity</span>
              </div>
              <button
                onClick={() => showToast('Opening activity audit log...')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="pt-3.5 space-y-3">
              {RECENT_ACTIVITIES.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    {act.iconType === 'user' && <User className="w-3.5 h-3.5" />}
                    {act.iconType === 'sample' && <TestTube2 className="w-3.5 h-3.5" />}
                    {act.iconType === 'login' && <ShieldCheck className="w-3.5 h-3.5" />}
                    {act.iconType === 'view' && <Eye className="w-3.5 h-3.5" />}
                    {act.iconType === 'inventory' && <Layers className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-800 text-[11px] leading-tight truncate">
                      {act.action}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

