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
 <div className="bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
 <div>
 <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
 <Download className="w-5 h-5 text-brand-500" />
 <span>Statutory Reports & Legal Notice Export</span>
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Generate tamper-evident, cryptographically sealed inspection dossiers and statutory notices in multiple formats.
 </p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {/* PDF Dossier */}
 <button
 onClick={() => handleExport('pdf', `MetroVerity_Audit_${scanId}.pdf`)}
 disabled={downloading !== null}
 className="p-3.5 rounded-xl border border-brand-500/50 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 text-left transition flex flex-col justify-between space-y-2 group disabled:opacity-50"
 >
 <div className="flex items-center justify-between">
 <FileText className="w-5 h-5 text-brand-500" />
 {downloading === 'pdf' ? (
 <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
 ) : success === 'pdf' ? (
 <Check className="w-4 h-4 text-emerald-600" />
 ) : null}
 </div>
 <div>
 <div className="text-xs font-bold text-gray-900">Full PDF Dossier</div>
 <div className="text-[10px] text-gray-500">Official ReportLab PDF</div>
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
 <Check className="w-4 h-4 text-emerald-600" />
 ) : null}
 </div>
 <div>
 <div className="text-xs font-bold text-gray-900">7th Sched. Form A</div>
 <div className="text-[10px] text-gray-500">Notice under Rule 27/28</div>
 </div>
 </button>

 {/* Word DOCX */}
 <button
 onClick={() => handleExport('docx', `MetroVerity_Report_${scanId}.docx`)}
 disabled={downloading !== null}
 className="p-3.5 rounded-xl border border-brand-500/50 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 text-left transition flex flex-col justify-between space-y-2 group disabled:opacity-50"
 >
 <div className="flex items-center justify-between">
 <FileText className="w-5 h-5 text-brand-500" />
 {downloading === 'docx' ? (
 <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
 ) : success === 'docx' ? (
 <Check className="w-4 h-4 text-emerald-600" />
 ) : null}
 </div>
 <div>
 <div className="text-xs font-bold text-gray-900">Editable DOCX</div>
 <div className="text-[10px] text-gray-500">Microsoft Word document</div>
 </div>
 </button>

 {/* Raw CSV */}
 <button
 onClick={() => handleExport('csv', `MetroVerity_Data_${scanId}.csv`)}
 disabled={downloading !== null}
 className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-left transition flex flex-col justify-between space-y-2 group disabled:opacity-50"
 >
 <div className="flex items-center justify-between">
 <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
 {downloading === 'csv' ? (
 <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
 ) : success === 'csv' ? (
 <Check className="w-4 h-4 text-emerald-600" />
 ) : null}
 </div>
 <div>
 <div className="text-xs font-bold text-gray-900">Raw CSV Audit</div>
 <div className="text-[10px] text-gray-500">Spreadsheet table export</div>
 </div>
 </button>
 </div>
 </div>
 );
}
