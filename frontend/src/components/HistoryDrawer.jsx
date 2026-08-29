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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Inspection Scan Repository</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search scan ID, category, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Scan List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400 mb-2" />
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
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-sky-400">
                      #{item.scan_id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        isPass
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isPartial
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize">{item.category} • {item.container_type}</span>
                    <span className="font-mono font-semibold text-white">Score: {item.compliance_score}%</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>{item.timestamp?.slice(0, 16).replace('T', ' ')}</span>
                    <span className="text-sky-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
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
