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
} from 'lucide-react';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

interface CalibrationItem {
  id: string;
  instrument: string;
  lastCal: string;
  nextDue: string;
  status: 'Calibrated' | 'Due Soon' | 'Recalibrate';
  qcLot: string;
}

const INITIAL_CALIBRATIONS: CalibrationItem[] = [
  { id: 'cal-1', instrument: 'Mindray BC-5000 (Hematology)', lastCal: 'Oct 15, 2026', nextDue: 'Nov 15, 2026', status: 'Calibrated', qcLot: 'QC-HEM-902' },
  { id: 'cal-2', instrument: 'Roche Cobas c311 (Chemistry)', lastCal: 'Oct 18, 2026', nextDue: 'Oct 25, 2026', status: 'Due Soon', qcLot: 'QC-CHM-441' },
  { id: 'cal-3', instrument: 'BioMérieux Bact/ALERT (Blood Culture)', lastCal: 'Oct 01, 2026', nextDue: 'Nov 01, 2026', status: 'Calibrated', qcLot: 'QC-BAC-108' },
  { id: 'cal-4', instrument: 'Eppendorf 5810R Centrifuge (Tachometer Check)', lastCal: 'Sep 20, 2026', nextDue: 'Dec 20, 2026', status: 'Calibrated', qcLot: 'QC-CEN-012' },
];

export function SettingsPage() {
  const [calibrations, setCalibrations] = useState<CalibrationItem[]>(INITIAL_CALIBRATIONS);
  const [autoPrintBarcode, setAutoPrintBarcode] = useState(true);
  const [printerModel, setPrinterModel] = useState('Zebra ZD420 (Direct Thermal)');
  const [criticalSmsAlerts, setCriticalSmsAlerts] = useState(true);

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Laboratory Quality Control, Calibration & Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Instrument QA schedules, critical panic thresholds, barcode printers, and local SQLite cache.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Diagnostic self-test initiated for all connected serial analyzers.')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Analyzer Self-Test</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="QC Pass Rate" value="99.4%" color="emerald" />
      <LabStatCard title="Active Analyzers" value="4" color="blue" />
      <LabStatCard title="Calibration Status" value="3 Valid, 1 Due" color="cyan" />
      <LabStatCard title="Critical Panic Ranges" value="28 Configured" color="amber" />
      <LabStatCard title="Offline Cache Sync" value="100% Synced" color="emerald" />
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent}>
      <div className="space-y-3.5">
        {/* Instrument Calibration Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Automated Analyzer Calibration Schedule
              </h3>
            </div>
            <button
              onClick={() => alert('Logging 2-point calibration verification...')}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-800 cursor-pointer"
            >
              + Log Calibration Run
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">QC Lot #</th>
                  <th className="py-2.5 px-3">Last Calibration</th>
                  <th className="py-2.5 px-3">Next Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calibrations.map((cal) => (
                  <tr key={cal.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{cal.instrument}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-700">{cal.qcLot}</td>
                    <td className="py-2.5 px-3 text-slate-500">{cal.lastCal}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{cal.nextDue}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          cal.status === 'Calibrated'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {cal.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => alert(`Running calibration protocol for ${cal.instrument}...`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 text-cyan-700 font-bold text-[11px] transition cursor-pointer"
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

        {/* Configuration Cards: Critical Panic Thresholds & Printers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Critical Panic Ranges */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-black uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Panic Value Thresholds</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Hemoglobin (Hb)</div>
                  <div className="text-slate-400">Normal: 12.0 - 16.0 g/dL</div>
                </div>
                <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                  &lt; 7.0 or &gt; 20.0 g/dL
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Serum Potassium (K⁺)</div>
                  <div className="text-slate-400">Normal: 3.5 - 5.0 mmol/L</div>
                </div>
                <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                  &lt; 2.8 or &gt; 6.2 mmol/L
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Fasting Blood Glucose</div>
                  <div className="text-slate-400">Normal: 70 - 99 mg/dL</div>
                </div>
                <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                  &lt; 50 or &gt; 400 mg/dL
                </span>
              </div>
            </div>
          </div>

          {/* Hardware & Barcode Configuration */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-cyan-700 font-black uppercase tracking-wider text-[11px]">
              <Printer className="w-4 h-4" />
              <span>Barcode Printer & Hardware Setup</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Designated Barcode Label Printer
                </label>
                <select
                  value={printerModel}
                  onChange={(e) => setPrinterModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                >
                  <option value="Zebra ZD420 (Direct Thermal)">Zebra ZD420 (Direct Thermal 203dpi)</option>
                  <option value="Honeywell PC42t">Honeywell PC42t (Thermal Transfer)</option>
                  <option value="Brother TD-4410D">Brother TD-4410D Network</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPrintBarcode}
                    onChange={(e) => setAutoPrintBarcode(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Auto-print specimen barcode labels upon requisition</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criticalSmsAlerts}
                    onChange={(e) => setCriticalSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Immediate SMS & push broadcast on critical panic values</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LabPageShell>
  );
}

export default SettingsPage;
