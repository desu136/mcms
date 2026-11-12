import React from 'react';
import { X, Printer } from 'lucide-react';

export interface TicketPrintData {
  ticketNumber: string;
  patientName: string;
  patientPid: string;
  departmentName?: string | null | undefined;
  doctorName?: string | null | undefined;
  checkInTime?: string | null | undefined;
  priority?: string | null | undefined;
}

interface QueueTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketPrintData | null;
}

export default function QueueTicketModal({
  isOpen,
  onClose,
  ticket,
}: QueueTicketModalProps) {
  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Queue Ticket Slip</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ticket Body (Thermal Style) */}
        <div className="p-6 text-center" id="printable-queue-ticket">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3 font-black text-xl">
            MCMS
          </div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Front Desk Check-in</div>
          <div className="text-sm font-black text-slate-800 mt-0.5">Metropolitan Clinic</div>

          <div className="my-5 py-4 border-y-2 border-dashed border-slate-200 bg-slate-50/80 rounded-2xl">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Number</div>
            <div className="text-4xl font-black text-blue-600 tracking-tight my-1">{ticket.ticketNumber}</div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
              {ticket.priority || 'Normal'} Priority
            </div>
          </div>

          <div className="space-y-2 text-left text-xs bg-white p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Patient:</span>
              <span className="font-bold text-slate-800 text-right">{ticket.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Patient ID:</span>
              <span className="font-mono font-bold text-blue-600 text-right">{ticket.patientPid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Department:</span>
              <span className="font-semibold text-slate-700 text-right">{ticket.departmentName || 'General Clinic'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Provider:</span>
              <span className="font-semibold text-slate-700 text-right">{ticket.doctorName || 'General Duty'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Check-in:</span>
              <span className="font-semibold text-slate-600 text-right">
                {ticket.checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-4 italic">
            Please watch the waiting room display screens. You will be called by your ticket number.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 p-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Slip
          </button>
        </div>
      </div>
    </div>
  );
}

