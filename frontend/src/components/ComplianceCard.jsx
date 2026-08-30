import React from 'react';
import { Award, AlertTriangle, ShieldCheck, ShieldAlert, IndianRupee, FileWarning } from 'lucide-react';

export default function ComplianceCard({ scanResult }) {
 if (!scanResult) return null;

 const {
 compliance_score = 0,
 status = 'UNKNOWN',
 estimated_compounding_fine_inr = 0,
 violations = [],
 scan_id = 'MV-2026',
 timestamp = '',
 } = scanResult;

 const getScoreColor = (s) => {
 if (s >= 90) return 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10';
 if (s >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
 return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
 };

 const getStatusBadge = (st) => {
 switch (st) {
 case 'COMPLIANT':
 return (
 <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 border border-emerald-500/30">
 <ShieldCheck className="w-3.5 h-3.5" />
 <span>STATUTORILY COMPLIANT</span>
 </span>
 );
 case 'PARTIALLY_COMPLIANT':
 return (
 <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
 <AlertTriangle className="w-3.5 h-3.5" />
 <span>PARTIALLY COMPLIANT</span>
 </span>
 );
 default:
 return (
 <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
 <ShieldAlert className="w-3.5 h-3.5" />
 <span>NON-COMPLIANT</span>
 </span>
 );
 }
 };

 return (
 <div className="bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-2xl p-6 shadow-xl space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <span className="text-[11px] font-mono text-slate-500 block">INSPECTION DOSSIER #{scan_id}</span>
 <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
 <Award className="w-5 h-5 text-brand-500" />
 <span>Quantitative Scoring & Compounding Fine</span>
 </h2>
 </div>
 {getStatusBadge(status)}
 </div>

 {/* Top Metrics Row */}
 <div className="grid grid-cols-2 gap-4">
 {/* Compliance Score Gauge */}
 <div className={`p-4 rounded-xl border flex items-center space-x-4 ${getScoreColor(compliance_score)}`}>
 <div className="text-4xl font-black font-mono tracking-tight">{compliance_score}%</div>
 <div>
 <span className="text-xs font-semibold block uppercase tracking-wider">Statutory Score</span>
 <span className="text-[11px] opacity-80">
 {compliance_score >= 90 ? 'Full Metrology Compliance' : 'Statutory Deductions Applied'}
 </span>
 </div>
 </div>

 {/* Compounding Fee Box */}
 <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center space-x-4">
 <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
 <IndianRupee className="w-6 h-6" />
 </div>
 <div>
 <span className="text-xs font-semibold text-amber-400 block uppercase tracking-wider">
 Rule 32A Compounding Fine
 </span>
 <span className="text-xl font-bold font-mono text-gray-900">
 ₹ {estimated_compounding_fine_inr.toLocaleString('en-IN')}
 </span>
 </div>
 </div>
 </div>

 {/* Violations Breakdown List */}
 <div>
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
 <FileWarning className="w-4 h-4 text-rose-400" />
 <span>Detected Statutory Violations ({violations.length})</span>
 </h3>
 {violations.length === 0 && (
 <span className="text-xs text-emerald-600 font-medium">Zero Violations Found</span>
 )}
 </div>

 {violations.length > 0 ? (
 <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
 {violations.map((v, i) => (
 <div
 key={i}
 className="p-3 rounded-xl bg-white border border-gray-200 flex items-start justify-between space-x-3"
 >
 <div className="space-y-0.5">
 <div className="flex items-center space-x-2">
 <span className="text-xs font-bold text-gray-800">{v.rule}</span>
 <span
 className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
 v.severity === 'CRITICAL' || v.severity === 'HIGH'
 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
 : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
 }`}
 >
 {v.severity}
 </span>
 </div>
 <p className="text-xs text-gray-500">{v.description}</p>
 </div>

 <div className="text-right whitespace-nowrap">
 <span className="text-xs font-mono font-semibold text-amber-400">
 ₹ {v.estimated_fine_inr?.toLocaleString('en-IN')}
 </span>
 <span className="text-[10px] text-slate-500 block">{v.compounding_section}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="p-4 rounded-xl bg-white border border-gray-200/80 text-center text-xs text-gray-500">
 No legal non-compliances observed under the Legal Metrology (Packaged Commodities) Rules, 2011.
 </div>
 )}
 </div>
 </div>
 );
}
