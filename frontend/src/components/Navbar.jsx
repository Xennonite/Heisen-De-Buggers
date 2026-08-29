import React from 'react';
import { ShieldCheck, Scale, History, FileText, Activity } from 'lucide-react';

export default function Navbar({ onOpenHistory, onOpenMpeModal }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">MetroVerity</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                LMPC Rules 2011
              </span>
            </div>
            <p className="text-xs text-slate-400">Metrological Computer Vision & Statutory Enforcement</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMpeModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Physical MPE Test</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>Inspection Log</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Rule Engine Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
