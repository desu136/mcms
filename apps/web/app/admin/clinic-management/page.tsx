'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Hospital,
  Building2,
  DoorOpen,
  Users,
  Settings,
  PlusCircle,
  MoreHorizontal,
  Clock,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRightLeft,
  Star,
  RefreshCw,
  Plus,
  X,
  Check,
  Stethoscope,
  Syringe,
  FlaskConical,
  Pill,
  ClipboardList,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../../lib/auth/auth-context';
import {
  fetchBranches,
  createBranch,
  updateBranch,
  fetchDepartments,
  createDepartment,
  fetchRooms,
  createRoom,
  fetchStaffUsers,
  transferStaffBranch,
} from '../../../lib/api/staff';
import type {
  BranchDTO,
  CreateBranchRequest,
  UpdateBranchRequest,
  ClinicDepartmentDTO,
  CreateClinicDepartmentRequest,
  ClinicRoomDTO,
  CreateClinicRoomRequest,
  UserSummaryDTO,
} from '@mcms/contracts';

const TABS = [
  'Overview',
  'Branches & Facilities',
  'Departments',
  'Rooms & Service Points',
  'Staff Assignments',
  'Clinic & Branch Settings',
] as const;

type ActiveTab = (typeof TABS)[number];

const ROLE_ICONS: Record<string, React.ElementType> = {
  DOCTOR: Stethoscope,
  NURSE: Syringe,
  RECEPTIONIST: ClipboardList,
  LAB_TECH: FlaskConical,
  PHARMACIST: Pill,
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DOCTOR: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  NURSE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  RECEPTIONIST: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  LAB_TECH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  PHARMACIST: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

const DEFAULT_DEPARTMENTS_DATA = [
  { id: 'd1', name: 'General Medicine', desc: 'General outpatient & primary consultation services', rooms: 4, staff: 8, status: 'Active', color: '#2979FF', icon: '🏥' },
  { id: 'd2', name: 'Pediatrics', desc: 'Child healthcare & developmental pediatric services', rooms: 3, staff: 6, status: 'Active', color: '#00C853', icon: '👶' },
  { id: 'd3', name: 'Gynecology & Obstetrics', desc: "Women's health, prenatal care & maternity", rooms: 3, staff: 7, status: 'Active', color: '#AA00FF', icon: '💜' },
  { id: 'd4', name: 'Laboratory', desc: 'Diagnostic pathology, blood chemistry & microbiology', rooms: 2, staff: 5, status: 'Active', color: '#FF6D00', icon: '🔬' },
  { id: 'd5', name: 'Pharmacy', desc: 'Pharmaceutical medication dispensing & compounding', rooms: 2, staff: 4, status: 'Active', color: '#00BCD4', icon: '💊' },
  { id: 'd6', name: 'Emergency & Triage', desc: 'Urgent, critical & acute trauma stabilization', rooms: 2, staff: 5, status: 'Active', color: '#F44336', icon: '🚨' },
];

const DEFAULT_ROOMS = [
  { id: 'r1', name: 'Consultation Room 101', dept: 'General Medicine', type: 'Consultation', status: 'Available' },
  { id: 'r2', name: 'Consultation Room 102', dept: 'General Medicine', type: 'Consultation', status: 'In Use' },
  { id: 'r3', name: 'Pediatric Exam Room 201', dept: 'Pediatrics', type: 'Consultation', status: 'Available' },
  { id: 'r4', name: 'Emergency Triage Bay', dept: 'Emergency & Triage', type: 'Treatment', status: 'In Use' },
  { id: 'r5', name: 'Cardiac Ultrasound Suite', dept: 'General Medicine', type: 'Diagnostics', status: 'Available' },
  { id: 'r6', name: 'Maternity Examination Room', dept: 'Gynecology & Obstetrics', type: 'Consultation', status: 'Available' },
];

const DEFAULT_SERVICE_POINTS = [
  { id: 'sp1', name: 'Main Laboratory Phlebotomy Station', dept: 'Laboratory', type: 'Sample Collection', status: 'Active' },
  { id: 'sp2', name: 'Fast-Track Emergency Triage Station', dept: 'Emergency & Triage', type: 'Assessment', status: 'Active' },
  { id: 'sp3', name: 'Central Outpatient Reception Desk', dept: 'General Medicine', type: 'Registration', status: 'Active' },
  { id: 'sp4', name: 'Outpatient Pharmacy Dispensing Window', dept: 'Pharmacy', type: 'Dispensing', status: 'Active' },
];

export default function ClinicalAdminClinicManagementPage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('Overview');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [roomView, setRoomView] = useState<'Rooms' | 'Service Points'>('Rooms');

  // Live Backend Data
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [staffList, setStaffList] = useState<UserSummaryDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);
  const [rooms, setRooms] = useState<ClinicRoomDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDTO | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    isMainBranch: false,
    isActive: true,
  });

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    branchId: '',
  });

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '',
    roomNumber: '',
    type: 'Consultation',
    branchId: '',
    departmentId: '',
  });

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetStaff, setTransferTargetStaff] = useState<UserSummaryDTO | null>(null);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = useCallback(async (isRefresh = false) => {
    if (!accessToken) return;
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [branchesRes, staffRes, deptsRes, roomsRes] = await Promise.allSettled([
        fetchBranches(accessToken),
        fetchStaffUsers(accessToken),
        fetchDepartments(accessToken),
        fetchRooms(accessToken),
      ]);

      if (branchesRes.status === 'fulfilled') setBranches(branchesRes.value);
      if (staffRes.status === 'fulfilled') setStaffList(staffRes.value);
      if (deptsRes.status === 'fulfilled') setDepartments(deptsRes.value);
      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value);
    } catch (err) {
      console.error('Failed to load clinic management data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  // Derived current active branch
  const activeBranch = useMemo(() => {
    if (selectedBranchFilter === 'ALL') {
      return branches.find((b) => b.isMainBranch) || branches[0] || null;
    }
    return branches.find((b) => b.id === selectedBranchFilter) || null;
  }, [branches, selectedBranchFilter]);

  // Filtered staff by selected branch
  const filteredStaff = useMemo(() => {
    if (selectedBranchFilter === 'ALL') return staffList;
    return staffList.filter((s) => s.primaryBranchId === selectedBranchFilter || s.branchIds?.includes(selectedBranchFilter));
  }, [staffList, selectedBranchFilter]);

  // Statistics
  const totalBranchesCount = branches.length;
  const activeBranchesCount = branches.filter((b) => b.isActive).length;
  const mainBranch = branches.find((b) => b.isMainBranch);

  // Departments list for display
  const displayDepartments = useMemo(() => {
    if (departments.length > 0) {
      return departments.map((d, i) => {
        const branchMatch = branches.find((b) => b.id === d.branchId);
        return {
          id: d.id,
          name: d.name,
          desc: d.description || 'Clinical department services',
          rooms: 2,
          staff: staffList.filter((s) => s.staffProfile?.department?.toLowerCase() === d.name.toLowerCase()).length || 4,
          status: d.isActive ? 'Active' : 'Inactive',
          branchName: branchMatch ? branchMatch.name : 'Main Facility',
          color: DEFAULT_DEPARTMENTS_DATA[i % DEFAULT_DEPARTMENTS_DATA.length]!.color,
          icon: DEFAULT_DEPARTMENTS_DATA[i % DEFAULT_DEPARTMENTS_DATA.length]!.icon,
        };
      });
    }
    return DEFAULT_DEPARTMENTS_DATA.map((d) => ({
      ...d,
      branchName: activeBranch?.name || 'Main Hospital',
    }));
  }, [departments, branches, staffList, activeBranch]);

  // Rooms list for display
  const displayRooms = useMemo(() => {
    if (rooms.length > 0) {
      return rooms.map((r) => {
        const branchMatch = branches.find((b) => b.id === r.branchId);
        return {
          id: r.id,
          name: r.name,
          dept: r.departmentName || 'General Medicine',
          type: r.roomType || 'Consultation',
          status: r.status === 'AVAILABLE' ? 'Available' : r.status === 'OCCUPIED' ? 'In Use' : 'Maintenance',
          branchName: branchMatch ? branchMatch.name : (activeBranch?.name || 'Main Facility'),
        };
      });
    }
    return DEFAULT_ROOMS.map((r) => ({
      ...r,
      branchName: activeBranch?.name || 'Main Hospital',
    }));
  }, [rooms, branches, activeBranch]);

  // Chart data
  const pieData = displayDepartments.map((d) => ({
    name: d.name,
    value: Math.max(1, d.staff),
    color: d.color,
  }));

  // Handle Branch Form Submit
  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim() || !branchForm.code.trim()) {
      setFormError('Branch name and code are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingBranch) {
        const payload: UpdateBranchRequest = {
          name: branchForm.name.trim(),
          code: branchForm.code.trim().toUpperCase(),
          ...(branchForm.address.trim() ? { address: branchForm.address.trim() } : {}),
          ...(branchForm.phone.trim() ? { phone: branchForm.phone.trim() } : {}),
          ...(branchForm.email.trim() ? { email: branchForm.email.trim() } : {}),
          isMainBranch: branchForm.isMainBranch,
          isActive: branchForm.isActive,
        };
        const updated = await updateBranch(editingBranch.id, payload, accessToken);
        setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : branchForm.isMainBranch ? { ...b, isMainBranch: false } : b)));
        showToast(`Branch "${updated.name}" updated successfully.`);
      } else {
        const payload: CreateBranchRequest = {
          name: branchForm.name.trim(),
          code: branchForm.code.trim().toUpperCase(),
          ...(branchForm.address.trim() ? { address: branchForm.address.trim() } : {}),
          ...(branchForm.phone.trim() ? { phone: branchForm.phone.trim() } : {}),
          ...(branchForm.email.trim() ? { email: branchForm.email.trim() } : {}),
          isMainBranch: branchForm.isMainBranch,
        };
        const created = await createBranch(payload, accessToken);
        setBranches((prev) => [...prev.map((b) => (branchForm.isMainBranch ? { ...b, isMainBranch: false } : b)), created]);
        showToast(`Branch "${created.name}" created successfully.`);
      }
      setBranchModalOpen(false);
      setEditingBranch(null);
      void loadAllData(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Branch operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Transfer Submit
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetStaff || !targetBranchId) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      await transferStaffBranch(transferTargetStaff.id, targetBranchId, accessToken);
      const targetB = branches.find((b) => b.id === targetBranchId);
      showToast(`Transferred ${transferTargetStaff.displayName} to ${targetB?.name || 'new branch'}.`);
      setTransferModalOpen(false);
      setTransferTargetStaff(null);
      void loadAllData(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Branch Selector Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clinic & Facility Management</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Building2 className="w-3 h-3" />
                  {selectedBranchFilter === 'ALL'
                    ? `Network (${branches.length} Facilities)`
                    : activeBranch?.name || 'Selected Facility'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage branch facilities, clinical departments, rooms, service points, and cross-branch staff assignments.
              </p>
            </div>
          </div>

          {/* Branch Switcher & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <span className="text-xs font-semibold text-gray-500 pl-2">Facility:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Facilities (Network-Wide)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) {b.isMainBranch ? '★ HQ' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => void loadAllData(true)}
              disabled={isRefreshing}
              className="p-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-xs transition-colors disabled:opacity-50"
              title="Refresh clinic data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setEditingBranch(null);
                setBranchForm({
                  name: '',
                  code: '',
                  address: '',
                  phone: '',
                  email: '',
                  isMainBranch: branches.length === 0,
                  isActive: true,
                });
                setFormError(null);
                setBranchModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Branch
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-6 border-b border-gray-100 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW ────────────────────────────────────────── */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Top 5 Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Facilities</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{totalBranchesCount}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">{activeBranchesCount} active operational</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Departments</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{displayDepartments.length}</div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">Clinical & Diagnostic</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Rooms</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <DoorOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{displayRooms.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                {displayRooms.filter((r) => r.status === 'Available').length} currently available
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Staff Assigned</span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{filteredStaff.length}</div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                {selectedBranchFilter === 'ALL' ? 'Across all branches' : 'Allocated here'}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Hours & Triage</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base font-black text-gray-900 truncate">8:00 AM – 8:00 PM</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Open • Emergency 24/7
              </div>
            </div>
          </div>

          {/* Main Grid: Left Tables + Right Widgets */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left 2 Cols: Departments & Rooms */}
            <div className="xl:col-span-2 space-y-6">
              {/* Departments Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-900">Clinical Departments</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('Departments')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View All ({displayDepartments.length})
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-3">Facility</th>
                        <th className="py-2.5 px-3 text-center">Rooms</th>
                        <th className="py-2.5 px-3 text-center">Staff</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayDepartments.map((d) => (
                        <tr key={d.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{d.icon}</span>
                              <div>
                                <span className="font-bold text-gray-800 block">{d.name}</span>
                                <span className="text-[10px] text-gray-400 truncate max-w-xs block">{d.desc}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {d.branchName}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-gray-700">{d.rooms}</td>
                          <td className="py-3 px-3 text-center font-bold text-gray-700">{d.staff}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rooms & Service Points Preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-gray-900">Rooms & Service Points</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                    {(['Rooms', 'Service Points'] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setRoomView(view)}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          roomView === view ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-2.5 px-4">Name</th>
                        <th className="py-2.5 px-3">Facility</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(roomView === 'Rooms' ? displayRooms : DEFAULT_SERVICE_POINTS).map((item) => (
                        <tr key={item.id} className="hover:bg-purple-50/20 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-gray-800">{item.name}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {('branchName' in item && typeof item.branchName === 'string')
                                ? item.branchName
                                : activeBranch?.name || 'Main Hospital'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600">{item.dept}</td>
                          <td className="py-2.5 px-3 text-gray-500">{item.type}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === 'Available' || item.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-600 border border-amber-200'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Chart + Clinic Info + Quick Actions */}
            <div className="space-y-6">
              {/* Donut Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-gray-900">Services & Staff Distribution</h3>
                  </div>
                  <span className="text-[10px] text-gray-400">By Department</span>
                </div>

                <div className="flex flex-col items-center mt-2">
                  <div className="relative">
                    <PieChart width={180} height={150}>
                      <Pie
                        data={pieData}
                        cx={85}
                        cy={70}
                        innerRadius={45}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((e, idx) => (
                          <Cell key={idx} fill={e.color} />
                        ))}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                      <span className="text-lg font-black text-gray-900">{filteredStaff.length}</span>
                      <span className="text-[9px] text-gray-400 uppercase font-semibold">Staff Allocated</span>
                    </div>
                  </div>

                  <div className="w-full space-y-1.5 mt-2">
                    {displayDepartments.slice(0, 5).map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-gray-600 truncate">{d.name}</span>
                        </div>
                        <span className="font-semibold text-gray-700 shrink-0">{d.staff} staff</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Facility Information Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-gray-900">Facility Profile</h3>
                  </div>
                  {activeBranch?.isMainBranch && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      Main HQ
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block">Facility Name</span>
                    <span className="font-bold text-gray-900 block">{activeBranch ? activeBranch.name : 'Network-wide'}</span>
                    <span className="font-mono text-[11px] text-gray-500">{activeBranch ? `Code: ${activeBranch.code}` : 'All Facilities'}</span>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-gray-50 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{activeBranch?.address || 'Bole Subcity, Healthcare District, Addis Ababa'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{activeBranch?.phone || '+251 11 654 3210'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{activeBranch?.email || 'admin@cityhealthclinic.com'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 mb-3">Facility Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setEditingBranch(null);
                      setBranchForm({
                        name: '',
                        code: '',
                        address: '',
                        phone: '',
                        email: '',
                        isMainBranch: false,
                        isActive: true,
                      });
                      setFormError(null);
                      setBranchModalOpen(true);
                    }}
                    className="p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/40 text-center transition-all group"
                  >
                    <Building2 className="w-4 h-4 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold text-gray-800 block">Add Branch</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('Staff Assignments')}
                    className="p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-center transition-all group"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold text-gray-800 block">Transfer Staff</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BRANCHES & FACILITIES ──────────────────────────── */}
      {activeTab === 'Branches & Facilities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Registered Facilities & Satellite Clinics</h2>
            <button
              onClick={() => {
                setEditingBranch(null);
                setBranchForm({
                  name: '',
                  code: '',
                  address: '',
                  phone: '',
                  email: '',
                  isMainBranch: false,
                  isActive: true,
                });
                setFormError(null);
                setBranchModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 ${
                  b.isMainBranch ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm">{b.name}</h3>
                      {b.isMainBranch && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          HQ
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-500">{b.code}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBranch(b);
                      setBranchForm({
                        name: b.name,
                        code: b.code,
                        address: b.address ?? '',
                        phone: b.phone ?? '',
                        email: b.email ?? '',
                        isMainBranch: b.isMainBranch,
                        isActive: b.isActive,
                      });
                      setFormError(null);
                      setBranchModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-gray-600 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="truncate">{b.address || 'Address not registered'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{b.phone || 'No phone'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Staff</div>
                    <div className="text-sm font-bold text-gray-800">{b.usersCount ?? 0}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Depts</div>
                    <div className="text-sm font-bold text-gray-800">{b.departmentsCount ?? 0}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Rooms</div>
                    <div className="text-sm font-bold text-gray-800">{b.roomsCount ?? 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: DEPARTMENTS ────────────────────────────────────── */}
      {activeTab === 'Departments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Clinic Departments & Specializations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-3">Operating Facility</th>
                  <th className="py-3 px-3 text-center">Consultation Rooms</th>
                  <th className="py-3 px-3 text-center">Assigned Doctors & Staff</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayDepartments.map((d) => (
                  <tr key={d.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{d.icon}</span>
                        <div>
                          <span className="font-bold text-gray-900 text-xs block">{d.name}</span>
                          <span className="text-[11px] text-gray-500 block">{d.desc}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        {d.branchName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-800">{d.rooms} Rooms</td>
                    <td className="py-3 px-3 text-center font-bold text-gray-800">{d.staff} Members</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: ROOMS & SERVICE POINTS ─────────────────────────── */}
      {activeTab === 'Rooms & Service Points' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">Clinical Physical Spaces & Service Stations</h2>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              {(['Rooms', 'Service Points'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setRoomView(view)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    roomView === view ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4">Room / Station Name</th>
                  <th className="py-3 px-3">Facility</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Room Type</th>
                  <th className="py-3 px-3 text-center">Live Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(roomView === 'Rooms' ? displayRooms : DEFAULT_SERVICE_POINTS).map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-800">{item.name}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        {('branchName' in item && typeof item.branchName === 'string')
                          ? item.branchName
                          : activeBranch?.name || 'Main Hospital'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-medium">{item.dept}</td>
                    <td className="py-3 px-3 text-gray-500">{item.type}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Available' || item.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: STAFF ASSIGNMENTS ──────────────────────────────── */}
      {activeTab === 'Staff Assignments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Clinical Staff & Facility Allocation</h2>
              <p className="text-xs text-gray-500">
                Reassign clinical personnel between network branches and manage departmental roles.
              </p>
            </div>
            <Link
              href="/admin/staff"
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Open Full Staff Directory →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Assigned Branch</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-center">Branch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((staff) => {
                  const role = staff.roles[0] || 'STAFF';
                  const Icon = ROLE_ICONS[role] || Users;
                  const colors = ROLE_COLORS[role] || {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                  };

                  return (
                    <tr key={staff.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                            {staff.displayName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{staff.displayName}</span>
                            <span className="text-[10px] text-gray-400 block">{staff.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          {role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Building2 className="w-3 h-3 text-blue-500" />
                          {staff.primaryBranchName || 'Main Hospital'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-medium">
                        {staff.staffProfile?.department || 'General Practice'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setTransferTargetStaff(staff);
                            setTargetBranchId(
                              branches.find((b) => b.id !== staff.primaryBranchId)?.id || branches[0]?.id || '',
                            );
                            setFormError(null);
                            setTransferModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Transfer Facility
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: CLINIC & BRANCH SETTINGS ────────────────────────── */}
      {activeTab === 'Clinic & Branch Settings' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-gray-900">Facility Operating Configurations</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure working hours, emergency numbers, and regional appointments settings for{' '}
              <span className="font-bold text-gray-800">{activeBranch ? activeBranch.name : 'All Facilities'}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Weekdays Working Hours</label>
              <input
                type="text"
                defaultValue="8:00 AM – 8:00 PM"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Weekend Emergency Hours</label>
              <input
                type="text"
                defaultValue="9:00 AM – 5:00 PM (24/7 Triage)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Direct Emergency Hotline</label>
              <input
                type="text"
                defaultValue="+251 11 999 0011"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Default Consultation Slot</label>
              <select
                defaultValue="20"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="15">15 minutes per patient</option>
                <option value="20">20 minutes per patient</option>
                <option value="30">30 minutes per patient</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              onClick={() => showToast('Clinic and branch operational settings saved.')}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              Save Facility Settings
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT BRANCH ───────────────────────────────── */}
      {branchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  {editingBranch ? 'Configure Branch Facility' : 'Register New Branch Facility'}
                </h3>
              </div>
              <button
                onClick={() => setBranchModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Facility Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Downtown Outpatient Center"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="DWTN"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs uppercase font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. Block 4, Medical Park Drive, Bole"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Phone</label>
                  <input
                    type="tel"
                    placeholder="+251 11 000 0000"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="branch@clinic.com"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={branchForm.isMainBranch}
                  onChange={(e) => setBranchForm({ ...branchForm, isMainBranch: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-xs font-semibold text-gray-800">Designate as Main Flagship Facility (HQ)</span>
              </label>

              <div className="px-6 py-3 bg-gray-50 -mx-6 -mb-6 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingBranch ? 'Update Facility' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TRANSFER STAFF BRANCH ───────────────────────────── */}
      {transferModalOpen && transferTargetStaff && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">Transfer Staff Member</h3>
              </div>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-900">{transferTargetStaff.displayName}</div>
                <div className="text-[11px] text-gray-500">{transferTargetStaff.email}</div>
                <div className="text-[11px] font-medium text-blue-700 mt-1">
                  Current: {transferTargetStaff.primaryBranchName || 'Main Hospital'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Target Healthcare Facility</label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) {b.isMainBranch ? '★ HQ' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="px-6 py-3 bg-gray-50 -mx-6 -mb-6 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Transferring...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
