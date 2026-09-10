import React, { useState, useEffect } from 'react';
import { X, Scale, CheckCircle2, XCircle, AlertTriangle, Download, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { physicalTestApi, reportApi } from '../services/api';

export default function SeventhScheduleModal({ isOpen, onClose, currentScan }) {
 const [declaredQty, setDeclaredQty] = useState(100);
 const [unit, setUnit] = useState('g');
 const [tareWeight, setTareWeight] = useState(0);
 const [lotSize, setLotSize] = useState(3000);
 const [sampleSize, setSampleSize] = useState(32);
 const [sampleWeights, setSampleWeights] = useState([]);
 const [bulkInput, setBulkInput] = useState('');
 const [mpeResult, setMpeResult] = useState(null);
 const [isCalculating, setIsCalculating] = useState(false);
 const [isExporting, setIsExporting] = useState(false);

 // Initialize 32 sample weights default
 useEffect(() => {
 if (isOpen) {
 if (currentScan?.net_quantity?.declared_value) {
 setDeclaredQty(currentScan.net_quantity.declared_value);
 setUnit(currentScan.net_quantity.unit || 'g');
 }
 generateSamplePreset('empty');
 }
 }, [isOpen, currentScan]);

 const generateSamplePreset = (type = 'empty') => {
 const q = declaredQty || 100;
 const count = lotSize < 4000 ? 32 : 80;
 let weights = [];

 if (type === 'empty') {
   weights = [];
 } else if (type === 'passing') {
 // Small random variations around Q with mean >= Q
 weights = Array.from({ length: count }, (_, i) => {
 const delta = (Math.sin(i * 1.5) * 1.5) + (i % 2 === 0 ? 0.8 : -0.2);
 return parseFloat((q + delta).toFixed(2));
 });
 } else {
 // Under-weight defective batch violating Zero-Tolerance / MPE
 weights = Array.from({ length: count }, (_, i) => {
 if (i === 3 || i === 7 || i === 15) {
 // Significant deficiency exceeding 2x MPE
 return parseFloat((q - (q * 0.18)).toFixed(2));
 }
 return parseFloat((q - 1.2).toFixed(2));
 });
 }

 setSampleWeights(weights);
 setSampleSize(count);
 setBulkInput(weights.join(', '));
 if (weights.length > 0) calculateMpe(weights, q, unit, tareWeight);
 else setMpeResult(null);
 };

 const calculateMpe = async (weights, q, u, tare) => {
 try {
 setIsCalculating(true);
 const res = await physicalTestApi.checkMpe({
 declared_quantity: parseFloat(q),
 unit: u,
 sample_weights: weights.map((w) => parseFloat(w) || 0),
 tare_weight: parseFloat(tare) || 0,
 lot_size: lotSize,
 });
 setMpeResult(res);
 } catch (err) {
 console.error('MPE check error:', err);
 } finally {
 setIsCalculating(false);
 }
 };

 const handleWeightChange = (index, value) => {
 const updated = [...sampleWeights];
 updated[index] = parseFloat(value) || 0;
 setSampleWeights(updated);
 if (updated.length === sampleSize) {
     calculateMpe(updated, declaredQty, unit, tareWeight);
 }
 };

 const handleBulkInputChange = (e) => {
    const val = e.target.value;
    setBulkInput(val);
    
    // Parse commas or newlines
    const parsed = val.split(/[,\n]+/)
      .map(s => s.trim())
      .filter(s => s !== '')
      .map(s => parseFloat(s))
      .filter(n => !isNaN(n));
      
    setSampleWeights(parsed);
    if (parsed.length === sampleSize) {
        calculateMpe(parsed, declaredQty, unit, tareWeight);
    } else {
        setMpeResult(null);
    }
 };

 const handleLotSizeChange = (e) => {
    const newLotSize = parseInt(e.target.value) || 0;
    setLotSize(newLotSize);
    
    const requiredSize = newLotSize < 4000 ? 32 : 80;
    setSampleSize(requiredSize);
    
    // If the currently parsed weights match the required size, run calculation
    if (sampleWeights.length === requiredSize) {
        calculateMpe(sampleWeights, declaredQty, unit, tareWeight);
    }
 };

 const handleExportFormA = async () => {
 try {
 setIsExporting(true);
 const res = await reportApi.exportReport({
 scan_id: currentScan?.scan_id || 'MPE-TEST',
 export_type: 'seventh_schedule_form_a',
 scan_data: currentScan || {
 scan_id: 'MPE-VERIFICATION',
 timestamp: new Date().toISOString(),
 compliance_score: mpeResult?.overall_mpe_compliant ? 95 : 40,
 status: mpeResult?.overall_mpe_compliant ? 'COMPLIANT' : 'NON_COMPLIANT',
 estimated_compounding_fine_inr: mpeResult?.compounding_fee_section_36_2 || 0,
 pdp_area_cm2: 240,
 required_font_height_mm: 2.5,
 violations: mpeResult?.overall_mpe_compliant
 ? []
 : [
 {
 rule: 'First Schedule & Rule 19(6)',
 severity: 'CRITICAL',
 description: mpeResult?.summary_verdict,
 compounding_section: 'Section 36(2)',
 estimated_fine_inr: 50000,
 },
 ],
 },
 });

 const blob = new Blob([res.data]);
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `Seventh_Schedule_Form_A_${currentScan?.scan_id || 'Notice'}.pdf`;
 document.body.appendChild(a);
 a.click();
 window.URL.revokeObjectURL(url);
 document.body.removeChild(a);
 } catch (err) {
 console.error('Export Form A error:', err);
 alert('Failed to generate Seventh Schedule Form A.');
 } finally {
 setIsExporting(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shell-900/80 backdrop-blur-sm">
 <div className="bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
 {/* Modal Header */}
 <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
 <div className="flex items-center space-x-3">
 <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
 <Scale className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900">Physical Sampling & Maximum Permissible Error (MPE) Engine</h3>
 <p className="text-xs text-gray-500">
 Rule 19(6) Statistical Batch Verification • First Schedule & Fifth Schedule Analysis
 </p>
 </div>
 </div>

 <button
 onClick={onClose}
 className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white shadow-card border border-gray-200 transition"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Modal Body */}
 <div className="p-6 overflow-y-auto space-y-6 flex-1">
 {/* Top Controls */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200">
 <div>
 <label className="text-[11px] text-gray-500 block mb-1">Declared Nominal Qty ($Q$)</label>
 <div className="flex space-x-1">
 <input
 type="number"
 value={declaredQty}
 onChange={(e) => {
 setDeclaredQty(parseFloat(e.target.value) || 0);
 generateSamplePreset('empty');
 }}
 className="w-full bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-900"
 />
 <select
 value={unit}
 onChange={(e) => setUnit(e.target.value)}
 className="bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900"
 >
 <option value="g">g</option>
 <option value="ml">ml</option>
 <option value="kg">kg</option>
 <option value="L">L</option>
 </select>
 </div>
 </div>

 <div>
 <label className="text-[11px] text-gray-500 block mb-1">Tare Weight ({unit})</label>
 <input
 type="number"
 value={tareWeight}
 onChange={(e) => {
 setTareWeight(parseFloat(e.target.value) || 0);
 calculateMpe(sampleWeights, declaredQty, unit, parseFloat(e.target.value) || 0);
 }}
 className="w-full bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-900"
 />
 </div>

 <div>
 <label className="text-[11px] text-gray-500 block mb-1">Batch / Lot Size (N)</label>
 <input
 type="number"
 value={lotSize}
 onChange={handleLotSizeChange}
 className="w-full bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-900"
 />
 <span className="text-[10px] text-gray-400 mt-1 block">Required Sample Size (n): <strong className="text-brand-500">{sampleSize}</strong></span>
 </div>

 <div className="flex flex-col justify-end space-y-1">
 <span className="text-[10px] text-gray-500 block">Preset Test Runs:</span>
 <div className="flex space-x-1.5">
 <button
 onClick={() => generateSamplePreset('passing')}
 className="flex-1 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[11px] font-medium hover:bg-emerald-500/10"
 >
 Passing Run
 </button>
 <button
 onClick={() => generateSamplePreset('failing')}
 className="flex-1 py-1 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-medium hover:bg-rose-500/30"
 >
 Failing Run
 </button>
 </div>
 </div>
 </div>

 {/* Statistical Verdict Cards */}
 {mpeResult && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {/* Statistical Mean Check */}
 <div
 className={`p-3.5 rounded-xl border ${
 mpeResult.mean_compliant
 ? 'bg-emerald-500/10 border-emerald-500/30'
 : 'bg-rose-950/20 border-rose-500/30'
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] font-semibold uppercase text-gray-700">1. Sample Mean (x̄)</span>
 {mpeResult.mean_compliant ? (
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 ) : (
 <XCircle className="w-4 h-4 text-rose-400" />
 )}
 </div>
 <div className="text-xl font-bold font-mono text-gray-900">
 {mpeResult.sample_mean} {unit}
 </div>
 <div className="text-[10px] text-gray-500 mt-0.5">
 Requirement: Mean $\ge$ Declared ({declaredQty} {unit})
 </div>
 </div>

 {/* Defective Count vs Fifth Schedule */}
 <div
 className={`p-3.5 rounded-xl border ${
 mpeResult.defective_count_compliant
 ? 'bg-emerald-500/10 border-emerald-500/30'
 : 'bg-rose-950/20 border-rose-500/30'
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] font-semibold uppercase text-gray-700">2. Defective Units</span>
 {mpeResult.defective_count_compliant ? (
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 ) : (
 <XCircle className="w-4 h-4 text-rose-400" />
 )}
 </div>
 <div className="text-xl font-bold font-mono text-gray-900">
 {mpeResult.defective_units_count} / {mpeResult.max_allowed_defective_units}
 </div>
 <div className="text-[10px] text-gray-500 mt-0.5">
 Allowed MPE Limit: $\le$ {mpeResult.allowed_mpe_value} {unit}
 </div>
 </div>

 {/* Zero-Tolerance Check */}
 <div
 className={`p-3.5 rounded-xl border ${
 mpeResult.zero_tolerance_compliant
 ? 'bg-emerald-500/10 border-emerald-500/30'
 : 'bg-rose-950/20 border-rose-500/30'
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] font-semibold uppercase text-gray-700">3. Zero-Tolerance</span>
 {mpeResult.zero_tolerance_compliant ? (
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 ) : (
 <XCircle className="w-4 h-4 text-rose-400" />
 )}
 </div>
 <div className="text-xl font-bold font-mono text-gray-900">
 {mpeResult.zero_tolerance_violations_count} Violations
 </div>
 <div className="text-[10px] text-gray-500 mt-0.5">
 Max allowed single deficiency: $\le 2\times$ MPE ({mpeResult.zero_tolerance_limit} {unit})
 </div>
 </div>
 </div>
 )}

 {/* Bulk Data Entry */}
 <div className="bg-white p-3 rounded-xl border border-gray-200 mb-4">
   <div className="flex justify-between items-center mb-1.5">
     <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Bulk Weight Entry (Paste from Excel)</label>
     <span className={`text-[10px] px-2 py-0.5 rounded-full ${sampleWeights.length === sampleSize ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
       Count: {sampleWeights.length} / {sampleSize}
     </span>
   </div>
   <textarea
     value={bulkInput}
     onChange={handleBulkInputChange}
     placeholder={`Paste ${sampleSize} comma or newline separated weights here...`}
     className="w-full h-16 bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] font-mono text-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
   />
 </div>

 {/* Interactive Weight Grid */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
 Unit Measurements Table ({sampleWeights.length} Samples)
 </span>
 <span className="text-[11px] text-gray-500">Click any value to edit weights live</span>
 </div>

 <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 bg-white rounded-xl border border-gray-200">
 {sampleWeights.map((w, idx) => {
 const sampleInfo = mpeResult?.samples?.[idx];
 const isDefective = sampleInfo?.is_defective;
 const isZeroTol = sampleInfo?.is_zero_tolerance_violation;

 let cellColor = 'bg-white shadow-card border-2 border-gray-200 border-gray-200 text-gray-800';
 if (isZeroTol) {
 cellColor = 'bg-rose-950/60 border-rose-500 text-rose-300';
 } else if (isDefective) {
 cellColor = 'bg-amber-950/60 border-amber-500 text-amber-300';
 }

 return (
 <div key={idx} className={`p-1.5 rounded-lg border text-center ${cellColor}`}>
 <span className="text-[9px] text-slate-500 block font-mono">#{idx + 1}</span>
 <input
 type="number"
 step="0.1"
 value={w}
 onChange={(e) => handleWeightChange(idx, e.target.value)}
 className="w-full bg-transparent text-center text-xs font-mono font-bold focus:outline-none focus:text-gray-900"
 />
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Modal Footer */}
 <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
 <div>
 {mpeResult && (
 <span
 className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${
 mpeResult.overall_mpe_compliant
 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 border-emerald-500/30'
 : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
 }`}
 >
 {mpeResult.overall_mpe_compliant
 ? 'BATCH PASSED STATUTORY MPE AUDIT'
 : 'BATCH FAILED: SECTION 36(2) PENALTY APPLICABLE'}
 </span>
 )}
 </div>

 <div className="flex items-center space-x-3">
 <button
 onClick={handleExportFormA}
 disabled={isExporting}
 className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-gray-900 flex items-center space-x-2 shadow-lg shadow-purple-500/20 transition disabled:opacity-50"
 >
 {isExporting ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <Download className="w-4 h-4" />
 )}
 <span>Generate 7th Sched. Form A Notice (PDF)</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
