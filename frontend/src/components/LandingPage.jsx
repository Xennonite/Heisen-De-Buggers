import React from 'react';



export default function LandingPage({ onDevLogin, isDev }) {
  return (
    <div className="relative min-h-screen bg-slate-200 flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-slate-200"></div>
      

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[380px] mx-auto px-6 flex flex-col items-center justify-center">
        
        {/* Top Centered Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/logo.jpg" alt="MetroVerity Seal" className="w-16 h-16 rounded-full border border-ash/20 shadow-[0_8px_24px_rgba(0,0,0,0.06)] object-cover mb-4" />
          <h1 className="font-serif text-3xl md:text-4xl text-offBlack mb-2 tracking-tight">
            MetroVerity
          </h1>
          <p className="font-mono text-[10px] text-smoke uppercase tracking-widest">
            Enforcement Portal
          </p>
        </div>

        {/* Authentication */}
        <div className="w-full">
          <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-[32px] border border-ash/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <h3 className="font-mono text-lg font-semibold mb-4 text-center text-offBlack tracking-tight">User Login</h3>
            <div className="flex flex-col gap-3 justify-center">
                <button 
                  onClick={() => onDevLogin('LMPC_OFFICER')}
                  className="w-full bg-lakeBlue hover:bg-brand-600 text-white rounded-xl font-mono py-3.5 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Login as LMPC Officer
                </button>
                <button 
                  onClick={() => onDevLogin('MANUFACTURER')}
                  className="w-full border border-lakeBlue text-lakeBlue hover:bg-lakeBlue/5 rounded-xl font-mono py-3.5 transition"
                >
                  Login as Manufacturer
                </button>
                <button 
                  onClick={() => onDevLogin('ADMIN')}
                  className="w-full border border-lakeBlue text-lakeBlue hover:bg-lakeBlue/5 rounded-xl font-mono py-3.5 transition"
                >
                  Login as Admin
                </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
