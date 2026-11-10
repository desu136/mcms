import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Printer,
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Radio,
  HardDrive,
  FileText,
  Zap,
} from 'lucide-react';
import LabStatCard from '../../components/lab/LabStatCard';

interface CalibrationItem {
  id: string;
  instrument: string;
  lastCal: string;
  nextDue: string;
  status: 'Calibrated' | 'Due Soon' | 'Recalibrate';
  qcLot: string;
}

const INITIAL_CALIBRATIONS: CalibrationItem[] = [
  { id: 'cal-1', instrument: 'Mindray BC-5000 (Hematology Analyzer)', lastCal: 'Oct 15, 2026', nextDue: 'Nov 15, 2026', status: 'Calibrated', qcLot: 'QC-HEM-902' },
  { id: 'cal-2', instrument: 'Roche Cobas c311 (Clinical Chemistry)', lastCal: 'Oct 18, 2026', nextDue: 'Oct 25, 2026', status: 'Due Soon', qcLot: 'QC-CHM-441' },
  { id: 'cal-3', instrument: 'BioMérieux Bact/ALERT (Microbiology & Culture)', lastCal: 'Oct 01, 2026', nextDue: 'Nov 01, 2026', status: 'Calibrated', qcLot: 'QC-BAC-108' },
  { id: 'cal-4', instrument: 'Eppendorf 5810R Centrifuge (Tachometer Check)', lastCal: 'Sep 20, 2026', nextDue: 'Dec 20, 2026', status: 'Calibrated', qcLot: 'QC-CEN-012' },
];

export function SettingsPage() {
  const [calibrations, setCalibrations] = useState<CalibrationItem[]>(INITIAL_CALIBRATIONS);
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');
  const [autoPrintBarcode, setAutoPrintBarcode] = useState(true);
  const [printerModel, setPrinterModel] = useState('Zebra ZD420 (Direct Thermal - 203 DPI)');
  const [criticalSmsAlerts, setCriticalSmsAlerts] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4 bg-[#F4F7FB]">
      {/* 1. Page Header matching web styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle with Settings/Cpu Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <Sliders className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Laboratory QC, Calibration & Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Instrument QA schedules, critical panic thresholds, barcode printers, and offline SQLite cache.
            </p>
          </div>
        </div>

        {/* Date Selector & Self-Test Button */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">{calendarDate}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Tuesday</div>
            </div>
            <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setCalendarDate('Oct 18, 2026')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCalendarDate('Oct 20, 2026')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => showToast('Diagnostic self-test initiated for all connected serial analyzers.')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            <span>Analyzer Self-Test</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Stat Cards */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
        <LabStatCard title="QC Pass Rate" value="99.4%" color="emerald" change={{ change: '+0.2%', trend: 'up' }} />
        <LabStatCard title="Active Analyzers" value="4 Online" color="blue" />
        <LabStatCard title="Calibration Status" value="3 Valid, 1 Due" color="amber" />
        <LabStatCard title="Panic Thresholds" value="28 Configured" color="rose" />
        <LabStatCard title="SQLite Offline Sync" value="100% Synced" color="cyan" />
      </div>

      {/* 3. Instrument Calibration Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Automated Analyzer Calibration Schedule</h3>
              <p className="text-[11px] text-slate-400 font-medium">Regular quality assurance and standard curve validation</p>
            </div>
          </div>
          <button
            onClick={() => showToast('Logging 2-point calibration verification...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition border border-blue-200/80 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Calibration Run</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Instrument / Analyzer</th>
                <th className="py-3 px-4">QC Lot Number</th>
                <th className="py-3 px-4">Last Calibration</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {calibrations.map((cal) => (
                <tr key={cal.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{cal.instrument}</td>
                  <td className="py-3 px-4 font-mono text-blue-600 whitespace-nowrap">{cal.qcLot}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{cal.lastCal}</td>
                  <td className="py-3 px-4 text-slate-700 font-semibold whitespace-nowrap">{cal.nextDue}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cal.status === 'Calibrated'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                      }`}
                    >
                      {cal.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => showToast(`Running calibration protocol for ${cal.instrument}...`)}
                      className="px-3 py-1 rounded-lg bg-blue-50/80 hover:bg-blue-100 text-blue-600 font-bold text-[11px] border border-blue-200/60 transition cursor-pointer"
                    >
                      Recalibrate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Configuration Grid: Critical Panic Thresholds & LIS Hardware */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Critical Panic Thresholds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Panic Value Thresholds</span>
            </div>
            <button
              onClick={() => showToast('Opening threshold rules manager...')}
              className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Configure All
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">Hemoglobin (Hb)</div>
                <div className="text-[10px] text-slate-400">Normal: 12.0 - 16.0 g/dL</div>
              </div>
              <div className="text-right">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                  Panic: &lt; 7.0 or &gt; 20.0
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">Platelets (PLT)</div>
                <div className="text-[10px] text-slate-400">Normal: 150 - 450 ×10³/µL</div>
              </div>
              <div className="text-right">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                  Panic: &lt; 20 or &gt; 1,000
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">Random Blood Sugar (RBS)</div>
                <div className="text-[10px] text-slate-400">Normal: 70 - 140 mg/dL</div>
              </div>
              <div className="text-right">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                  Panic: &lt; 40 or &gt; 450
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">Potassium (K⁺)</div>
                <div className="text-[10px] text-slate-400">Normal: 3.5 - 5.1 mEq/L</div>
              </div>
              <div className="text-right">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                  Panic: &lt; 2.8 or &gt; 6.2
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
            <span className="text-slate-600 font-semibold text-[11px]">Instant SMS/Telegram Dispatch to Attending Physician</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={criticalSmsAlerts}
                onChange={(e) => {
                  setCriticalSmsAlerts(e.target.checked);
                  showToast(e.target.checked ? 'Panic auto-dispatch enabled' : 'Panic auto-dispatch disabled');
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Barcode & LIS Hardware Setup */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
            <Printer className="w-4 h-4 text-blue-600" />
            <span>LIS Barcode & Hardware Configuration</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Tube Label Printer</label>
              <select
                value={printerModel}
                onChange={(e) => setPrinterModel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Zebra ZD420 (Direct Thermal - 203 DPI)">Zebra ZD420 (Direct Thermal - 203 DPI)</option>
                <option value="Honeywell PC42t Plus">Honeywell PC42t Plus</option>
                <option value="TSC TE200 Barcode Printer">TSC TE200 Barcode Printer</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">Auto-Print on Sample Check-In</div>
                <div className="text-[10px] text-slate-400">Automatically print 2x tube labels upon sample registration</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPrintBarcode}
                  onChange={(e) => {
                    setAutoPrintBarcode(e.target.checked);
                    showToast(e.target.checked ? 'Auto-print enabled' : 'Auto-print disabled');
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-2.5">
              <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-700">
                <div className="font-bold text-slate-800">Local SQLite Offline Database</div>
                <div className="text-slate-500 mt-0.5 leading-relaxed">
                  Desktop client caches patient records and order queue locally in <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[10px]">appData/mcms_lab.sqlite</code> for seamless operation during clinic network interruptions.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => showToast('Printing test label...')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Print Test Label
              </button>
              <button
                onClick={() => showToast('Hardware settings saved successfully.')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer Row */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium">
        <div>MCMS | Laboratory Information System | Accurate Results. Better Care.</div>
        <div>Version 1.0.0</div>
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

export default SettingsPage;
