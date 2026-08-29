import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Scale, Loader2, Check } from 'lucide-react';
import { reportApi } from '../services/api';

export default function ExportPanel({ scanResult }) {
  const [downloading, setDownloading] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!scanResult) return null;

  const handleExport = async (type, filename) => {
    try {
      setDownloading(type);
      setSuccess(null);

      const response = await reportApi.exportReport({
        scan_id: scanResult.scan_id,
        export_type: type,
        scan_data: scanResult,
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(type);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate export file. Please check server status.');
    } finally {
      setDownloading(null);
    }
  };

  const scanId = scanResult.scan_id || 'SCAN';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white flex items-center space-x-2">
          <Download className="w-5 h-5 text-sky-400" />
          <span>Statutory Reports & Legal Notice Export</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate tamper-evident, cryptographically sealed inspection dossiers and statutory notices in multiple formats.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* PDF Dossier */}
        <button
          onClick={() => handleExport('pdf', `MetroVerity_Audit_${scanId}.pdf`)}
          disabled={downloading !== null}
          className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-left transition flex flex-col justify-between space-y-2 group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <FileText className="w-5 h-5 text-sky-400" />
            {downloading === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            ) : success === 'pdf' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : null}
          </div>
          <div>
            <div className="text-xs font-bold text-white">Full PDF Dossier</div>
            <div className="text-[10px] text-slate-400">Official ReportLab PDF</div>
          </div>
        </button>

        {/* 7th Schedule Form A */}
        <button
          onClick={() => handleExport('seventh_schedule_form_a', `Seventh_Schedule_Form_A_${scanId}.pdf`)}
          disabled={downloading !== null}
          className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-left transition flex flex-col justify-between space-y-2 group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <Scale className="w-5 h-5 text-purple-400" />
            {downloading === 'seventh_schedule_form_a' ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            ) : success === 'seventh_schedule_form_a' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : null}
          </div>
          <div>
            <div className="text-xs font-bold text-white">7th Sched. Form A</div>
            <div className="text-[10px] text-slate-400">Notice under Rule 27/28</div>
          </div>
        </button>

        {/* Word DOCX */}
        <button
          onClick={() => handleExport('docx', `MetroVerity_Report_${scanId}.docx`)}
          disabled={downloading !== null}
          className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-left transition flex flex-col justify-between space-y-2 group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <FileText className="w-5 h-5 text-blue-400" />
            {downloading === 'docx' ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : success === 'docx' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : null}
          </div>
          <div>
            <div className="text-xs font-bold text-white">Editable DOCX</div>
            <div className="text-[10px] text-slate-400">Microsoft Word document</div>
          </div>
        </button>

        {/* Raw CSV */}
        <button
          onClick={() => handleExport('csv', `MetroVerity_Data_${scanId}.csv`)}
          disabled={downloading !== null}
          className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-left transition flex flex-col justify-between space-y-2 group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            {downloading === 'csv' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : success === 'csv' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : null}
          </div>
          <div>
            <div className="text-xs font-bold text-white">Raw CSV Audit</div>
            <div className="text-[10px] text-slate-400">Spreadsheet table export</div>
          </div>
        </button>
      </div>
    </div>
  );
}
