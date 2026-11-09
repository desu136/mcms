import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronRight,
  Eye,
  X,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import {
  EXACT_SCREENSHOT_ORDERS,
  LabTestOrderItem,
} from '../../components/lab/labMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export function TestsPage() {
  const [orders, setOrders] = useState<LabTestOrderItem[]>(EXACT_SCREENSHOT_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<LabTestOrderItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newDepartment, setNewDepartment] = useState<'Hematology' | 'Biochemistry' | 'Microbiology' | 'Immunology'>('Hematology');
  const [newPriority, setNewPriority] = useState<'Normal' | 'High' | 'Medium'>('Normal');

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ord.status.toUpperCase() === statusFilter;
    const matchesDept = departmentFilter === 'ALL' || ord.department.toUpperCase() === departmentFilter.toUpperCase();
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName || !newPatientName) return;

    const newOrd: LabTestOrderItem = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      patientName: newPatientName,
      patientId: `PID-${Math.floor(1000 + Math.random() * 9000)}`,
      patientRoom: 'Outpatient Clinic',
      patientAge: 32,
      patientGender: 'Female',
      patientPhone: '+251 911 000 111',
      patientEmail: 'patient@example.com',
      patientCity: 'Addis Ababa',
      patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      testName: newTestName,
      testCode: newTestName.slice(0, 3).toUpperCase(),
      sampleId: `SMP-${Date.now().toString().slice(-4)}`,
      department: newDepartment,
      priority: newPriority,
      status: 'Pending',
      orderedAt: 'Just now',
      expectedResult: 'In 2 hours',
      stages: [
        { name: 'Ordered', status: 'completed', time: 'Just now' },
        { name: 'Sample Collection', status: 'pending' },
        { name: 'Analyzer Run', status: 'pending' },
        { name: 'Pathologist Verification', status: 'pending' },
      ],
    };

    setOrders([newOrd, ...orders]);
    setNewTestName('');
    setNewPatientName('');
    setCreateModalOpen(false);
  };

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Laboratory Test Orders
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Manage clinical test requisitions, track real-time analytical phases, and review reports.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Test Requisition</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="Total Orders" value={orders.length} change={{ change: '+5 today', trend: 'up' }} color="blue" />
      <LabStatCard title="Pending Sample" value={orders.filter((o) => o.status === 'Pending').length} color="amber" />
      <LabStatCard title="In Analyzer" value={orders.filter((o) => o.status === 'Processing').length} color="cyan" />
      <LabStatCard title="Completed" value={orders.filter((o) => o.status === 'Completed').length} color="emerald" />
      <LabStatCard title="Abnormal / Stat" value={orders.filter((o) => o.status === 'Abnormal').length} color="rose" />
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent}>
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by order ID, test name, patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Hematology">Hematology</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Immunology">Immunology</option>
          </select>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 font-bold text-[11px]">
            {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'ABNORMAL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Test Code & Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Sample ID</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Ordered</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">
                    {ord.orderId}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{ord.patientName}</div>
                    <div className="text-[10px] text-slate-400">{ord.patientId}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{ord.testName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{ord.testCode}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{ord.department}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{ord.sampleId}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        ord.priority === 'High'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ord.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : ord.status === 'Processing'
                          ? 'bg-blue-50 text-blue-700'
                          : ord.status === 'Abnormal'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{ord.orderedAt}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Printing barcode label for ${ord.sampleId}`)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-cyan-600 transition cursor-pointer"
                        title="Print Barcode"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">{selectedOrder.testName}</h3>
                  <div className="text-[11px] font-mono text-cyan-600">{selectedOrder.orderId}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Patient</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedOrder.patientName}</div>
                  <div className="text-[11px] text-slate-500">{selectedOrder.patientId} • {selectedOrder.patientRoom}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Department</div>
                  <div className="font-semibold text-slate-800">{selectedOrder.department}</div>
                  <div className="text-[11px] text-slate-500">Sample ID: {selectedOrder.sampleId}</div>
                </div>
              </div>

              {/* Clinical Workflow Stages */}
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Clinical Analytical Progress
                </div>
                <div className="space-y-2">
                  {selectedOrder.stages.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-white"
                    >
                      <div className="flex items-center gap-2">
                        {st.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : st.status === 'in_progress' ? (
                          <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                        <span className={`font-semibold ${st.status === 'completed' ? 'text-slate-800' : 'text-slate-500'}`}>
                          {st.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{st.time || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Test Requisition Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <form
            onSubmit={handleCreateOrder}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-slate-800">Create Test Requisition</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bethlehem Yohannes"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Test Name</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC)"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Immunology">Immunology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">STAT / High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition cursor-pointer shadow-xs"
              >
                Submit Requisition
              </button>
            </div>
          </form>
        </div>
      )}
    </LabPageShell>
  );
}

export default TestsPage;
