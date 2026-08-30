import React, { useState, useEffect } from 'react';
import { X, History, Search, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { auditApi } from '../services/api';

export default function HistoryDrawer({ isOpen, onClose, onSelectScan }) {
 const [history, setHistory] = useState([]);
 const [loading, setLoading] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');

 useEffect(() => {
 if (isOpen) {
 fetchHistory();
 }
 }, [isOpen]);

 const fetchHistory = async () => {
 try {
 setLoading(true);
 const res = await auditApi.getHistory(30);
 setHistory(res || []);
 } catch (err) {
 console.error('History fetch error:', err);
 } finally {
 setLoading(false);
 }
 };

 const filteredHistory = history.filter(
 (h) =>
 h.scan_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 h.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 h.status?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 overflow-hidden bg-shell-900/70 backdrop-blur-sm flex justify-end">
 <div className="w-full max-w-md bg-white shadow-card border-2 border-gray-200 border-l border-gray-200 h-full shadow-2xl flex flex-col">
 {/* Header */}
 <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
 <div className="flex items-center space-x-2">
 <History className="w-5 h-5 text-brand-500" />
 <h3 className="text-sm font-bold text-gray-900">Inspection Scan Repository</h3>
 </div>
 <button
 onClick={onClose}
 className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white shadow-card border border-gray-200 transition"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Search */}
 <div className="p-4 border-b border-gray-200">
 <div className="relative">
 <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
 <input
 type="text"
 placeholder="Search scan ID, category, or status..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full bg-white shadow-inner border border-brand-500/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
 />
 </div>
 </div>

 {/* Scan List */}
 <div className="p-4 overflow-y-auto flex-1 space-y-3">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-xs">
 <Loader2 className="w-6 h-6 animate-spin text-brand-500 mb-2" />
 <span>Loading inspection logs...</span>
 </div>
 ) : filteredHistory.length === 0 ? (
 <div className="text-center py-12 text-slate-500 text-xs">
 No previous inspection scans found.
 </div>
 ) : (
 filteredHistory.map((item) => {
 const isPass = item.status === 'COMPLIANT';
 const isPartial = item.status === 'PARTIALLY_COMPLIANT';

 return (
 <div
 key={item.id || item.scan_id}
 onClick={() => {
 if (item.data) {
 onSelectScan(item.data);
 onClose();
 }
 }}
 className="p-3.5 rounded-xl bg-white border border-gray-200 hover:border-brand-500/50 cursor-pointer transition space-y-2 group"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-mono font-bold text-gray-800 group-hover:text-brand-500">
 #{item.scan_id}
 </span>
 <span
 className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
 isPass
 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
 : isPartial
 ? 'bg-amber-500/20 text-amber-400'
 : 'bg-rose-500/20 text-rose-400'
 }`}
 >
 {item.status}
 </span>
 </div>

 <div className="flex items-center justify-between text-[11px] text-gray-500">
 <span className="capitalize">{item.category} • {item.container_type}</span>
 <span className="font-mono font-semibold text-gray-900">Score: {item.compliance_score}%</span>
 </div>

 <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-gray-200">
 <span>{item.timestamp?.slice(0, 16).replace('T', ' ')}</span>
 <span className="text-brand-500 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
 <span>View</span>
 <ArrowRight className="w-3 h-3" />
 </span>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 </div>
 );
}
