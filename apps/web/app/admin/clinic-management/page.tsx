'use client';

import React, { useState } from 'react';
import {
  Building2,
  LayoutGrid,
  DoorOpen,
  Users,
  Settings,
  PlusCircle,
  MoreHorizontal,
  ChevronRight,
  Clock,
  Phone,
  Mail,
  MapPin,
  Edit3,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { PageHeader, AdminCard, TabBar } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';

// NOTE: The following data comes from static fixtures.
// Backend endpoints for clinic management (/api/v1/departments, /api/v1/rooms, etc.)
// are not yet implemented. Integrate when those endpoints are added.

const TABS = ['Overview', 'Departments', 'Rooms & Service Points', 'Staff Assignments', 'Clinic Settings'];

const departments = [
  { name: 'General Medicine', desc: 'General outpatient services', rooms: 4, staff: 8, status: 'Active', color: '#2979FF', icon: '🏥' },
  { name: 'Pediatrics', desc: 'Child healthcare services', rooms: 3, staff: 6, status: 'Active', color: '#00C853', icon: '👶' },
  { name: 'Gynecology & Obstetrics', desc: 'Women\'s health and maternity', rooms: 3, staff: 7, status: 'Active', color: '#AA00FF', icon: '💜' },
  { name: 'Laboratory', desc: 'Diagnostic laboratory services', rooms: 2, staff: 5, status: 'Active', color: '#FF6D00', icon: '🔬' },
  { name: 'Pharmacy', desc: 'Medicine dispensing', rooms: 2, staff: 4, status: 'Active', color: '#00BCD4', icon: '💊' },
  { name: 'Emergency', desc: 'Urgent and emergency care', rooms: 1, staff: 3, status: 'Active', color: '#F44336', icon: '🚨' },
];

const rooms = [
  { name: 'Consultation Room 1', dept: 'General Medicine', type: 'Consultation', status: 'Available' },
  { name: 'Consultation Room 2', dept: 'General Medicine', type: 'Consultation', status: 'Available' },
  { name: 'Consultation Room 3', dept: 'Pediatrics', type: 'Consultation', status: 'Available' },
  { name: 'Treatment Room 1', dept: 'Emergency', type: 'Treatment', status: 'In Use' },
  { name: 'Laboratory Room 1', dept: 'Laboratory', type: 'Laboratory', status: 'Available' },
  { name: 'Pharmacy Counter', dept: 'Pharmacy', type: 'Dispensing', status: 'Available' },
];

const servicePoints = [
  { name: 'Lab Collection Point', dept: 'Laboratory', type: 'Sample Collection', status: 'Active' },
  { name: 'Triage Station', dept: 'Emergency', type: 'Assessment', status: 'Active' },
  { name: 'Reception Desk A', dept: 'General Medicine', type: 'Registration', status: 'Active' },
];

const staffAssignments = [
  { name: 'Dr. Hana Mengesha', title: 'General Practitioner', role: 'Doctor', dept: 'General Medicine' },
  { name: 'Dr. Samuel Teklay', title: 'Pediatrician', role: 'Doctor', dept: 'Pediatrics' },
  { name: 'Dr. Bethel Alemu', title: 'OB/GYN', role: 'Doctor', dept: 'Gynecology & Obstetrics' },
  { name: 'Tech. Getachew Tadesse', title: 'Lab Technician', role: 'Lab Technician', dept: 'Laboratory' },
  { name: 'Nurse Selamawit Abebe', title: 'Registered Nurse', role: 'Nurse', dept: 'Emergency' },
];

const pieData = departments.map((d) => ({ name: d.name, value: 1, color: d.color }));
const recentActivity = [
  { icon: Building2, label: 'Department updated', sub: 'General Medicine', time: '2 hours ago', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: DoorOpen, label: 'Room added', sub: 'Consultation Room 3', time: '4 hours ago', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Users, label: 'Staff assigned', sub: 'Dr. Hana Mengesha → Pediatrics', time: '6 hours ago', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Settings, label: 'Service point updated', sub: 'Lab Collection', time: '8 hours ago', color: 'text-orange-500', bg: 'bg-orange-50' },
];

const quickActions = [
  { icon: PlusCircle, label: 'Add Department', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: DoorOpen, label: 'Add Room', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Settings, label: 'Add Service Point', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Users, label: 'Assign Staff', color: 'text-orange-500', bg: 'bg-orange-50' },
];

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ClinicManagementPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [roomView, setRoomView] = useState<'Rooms' | 'Service Points'>('Rooms');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        icon={<Building2 size={20} className="text-blue-500" />}
        title="Clinic Management"
        subtitle="Manage departments, rooms, service points, staff assignments and clinic settings."
        dateRange={dateStr}
        dateSubtitle={dayStr}
        systemStatus="online"
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard title="Total Departments" value={6} icon={Building2} iconBg="bg-blue-50" iconColor="text-blue-500" change="0%" changeDir="neutral" changeLabel="vs. last month" />
            <StatCard title="Total Rooms" value={18} icon={DoorOpen} iconBg="bg-purple-50" iconColor="text-purple-500" change="12%" changeDir="up" />
            <StatCard title="Service Points" value={24} icon={Settings} iconBg="bg-green-50" iconColor="text-green-500" change="9%" changeDir="up" />
            <StatCard title="Assigned Staff" value={42} icon={Users} iconBg="bg-orange-50" iconColor="text-orange-500" change="6%" changeDir="up" />
            <div className="bg-white rounded-2xl p-5 border border-[#E6EEFF] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-blue-500" />
                <p className="text-xs text-gray-500 font-medium">Operating Hours</p>
              </div>
              <p className="text-lg font-bold text-gray-900">8:00 AM – 5:00 PM</p>
              <p className="text-xs text-gray-500">Mon – Fri</p>
              <div className="mt-1">
                <StatusBadge variant="active" label="Open" showDot />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Departments Table */}
            <div className="xl:col-span-2">
              <AdminCard
                title="Departments"
                titleIcon={<Building2 size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] hover:underline font-medium">View All</button>}
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Name</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Description</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Rooms</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Staff</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((d) => (
                        <tr key={d.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: d.color + '20' }}>
                                {d.icon}
                              </div>
                              <span className="text-xs font-semibold text-gray-800">{d.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-500 max-w-[160px] truncate">{d.desc}</td>
                          <td className="px-3 py-3 text-xs text-gray-700 font-medium">{d.rooms}</td>
                          <td className="px-3 py-3 text-xs text-gray-700 font-medium">{d.staff}</td>
                          <td className="px-3 py-3">
                            <StatusBadge variant="active" label="Active" showDot />
                          </td>
                          <td className="px-3 py-3">
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                              <MoreHorizontal size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            </div>

            {/* Right: Clinic Overview + Quick Actions + Clinic Info + Recent Activity */}
            <div className="space-y-4">
              {/* Donut Chart */}
              <AdminCard title="Clinic Overview" titleIcon={<Building2 size={15} className="text-blue-500" />}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <PieChart width={160} height={140}>
                      <Pie data={pieData} cx={75} cy={65} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-lg font-bold text-gray-900">6</span>
                      <span className="text-[10px] text-gray-500">Departments</span>
                    </div>
                  </div>
                  <div className="w-full space-y-1.5 mt-1">
                    {departments.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                          <span className="text-gray-600 truncate max-w-[130px]">{d.name}</span>
                        </div>
                        <span className="text-gray-400">1 (17%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminCard>

              {/* Quick Actions */}
              <AdminCard title="Quick Actions" titleIcon={<Settings size={15} className="text-blue-500" />}>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(({ icon: Icon, label, bg, color }) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-2 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition group"
                    >
                      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon size={16} className={color} />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 leading-tight text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </AdminCard>

              {/* Clinic Information */}
              <AdminCard
                title="Clinic Information"
                titleIcon={<Building2 size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] hover:underline flex items-center gap-1"><Edit3 size={11} /> Edit</button>}
              >
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Clinic Name</p>
                    <p className="text-xs font-semibold text-gray-800">City Health Clinic</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 flex items-center gap-1"><MapPin size={10} /> Address</p>
                    <p className="text-xs text-gray-700">Bole Subcity, Addis Ababa, Ethiopia</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 flex items-center gap-1"><Phone size={10} /> Phone</p>
                    <p className="text-xs text-gray-700">+251 11 123 4567</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 flex items-center gap-1"><Mail size={10} /> Email</p>
                    <p className="text-xs text-gray-700">info@cityhealthclinic.com</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Operating Hours</p>
                    <p className="text-xs text-gray-700">8:00 AM – 5:00 PM (Mon – Fri)</p>
                  </div>
                </div>
              </AdminCard>

              {/* Recent Activity */}
              <AdminCard title="Recent Activity" titleIcon={<Settings size={15} className="text-blue-500" />} action={<button className="text-xs text-[#2979FF] hover:underline font-medium">View All</button>}>
                <div className="space-y-3">
                  {recentActivity.map(({ icon: Icon, label, sub, time, color, bg }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={13} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-500 truncate">{sub}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{time}</span>
                    </div>
                  ))}
                </div>
              </AdminCard>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Rooms & Service Points */}
            <AdminCard
              title="Rooms & Service Points"
              titleIcon={<DoorOpen size={15} className="text-blue-500" />}
              action={<button className="text-xs text-[#2979FF] hover:underline font-medium">View All</button>}
              noPadding
            >
              <div className="px-5 pt-4 pb-2">
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                  {['Rooms', 'Service Points'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setRoomView(v as any)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${roomView === v ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left font-medium text-gray-500 px-5 py-2">Name</th>
                      <th className="text-left font-medium text-gray-500 px-3 py-2">Department</th>
                      <th className="text-left font-medium text-gray-500 px-3 py-2">Type</th>
                      <th className="text-left font-medium text-gray-500 px-3 py-2">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(roomView === 'Rooms' ? rooms : servicePoints).map((r) => (
                      <tr key={r.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <DoorOpen size={13} className="text-gray-400" />
                            <span className="font-medium text-gray-800">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{r.dept}</td>
                        <td className="px-3 py-2.5 text-gray-500">{r.type}</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge
                            variant={r.status === 'Available' || r.status === 'Active' ? 'active' : 'warning'}
                            label={r.status}
                            showDot
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <button className="text-gray-300 hover:text-gray-500 transition">
                            <MoreHorizontal size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>

            {/* Staff Assignments */}
            <AdminCard
              title="Staff Assignments"
              titleIcon={<Users size={15} className="text-blue-500" />}
              action={<button className="text-xs text-[#2979FF] hover:underline font-medium">View All</button>}
            >
              <div className="space-y-3">
                {staffAssignments.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 py-1.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{s.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{s.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-medium">{s.role}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[100px]">{s.dept}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        </>
      )}

      {activeTab !== 'Overview' && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">{activeTab}</p>
            <p className="text-xs text-gray-400 mt-1">Detailed {activeTab.toLowerCase()} management coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
