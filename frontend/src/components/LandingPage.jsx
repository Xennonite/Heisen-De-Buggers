import React from 'react';
import { SignIn } from '@clerk/clerk-react';


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
            <div className="flex justify-center">
              {isDev ? (
                <button 
                  onClick={onDevLogin}
                  className="w-full bg-lakeBlue hover:bg-brand-600 text-white rounded-xl font-mono py-3.5 mt-2 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Enter dev portal
                </button>
              ) : (
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      cardBox: "!shadow-none !border-none !bg-transparent !w-full !min-w-0 !max-w-none !overflow-visible",
                      card: "!bg-transparent !shadow-none !w-full !min-w-0 !max-w-none !p-0 !border-none !overflow-visible",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      main: "!w-full !overflow-visible flex flex-col gap-3",
                      socialButtonsBlockButton: "!border !border-ash/60 !bg-white !text-offBlack !font-mono !rounded-xl hover:!bg-periwinkle !transition !py-3",
                      socialButtonsBlockButtonText: "!font-mono !font-medium",
                      dividerText: "!font-mono !text-smoke !my-4",
                      formFieldLabelRow: "!w-full !px-1",
                      formFieldLabel: "!font-mono !text-graphite !text-[12px] !mb-1",
                      formFieldInputBox: "!rounded-xl !border-0 !shadow-none !bg-transparent !overflow-visible",
                      formFieldInput: "!w-full !box-border !border !border-ash/60 !bg-white/50 !rounded-xl !px-4 !py-3 !font-mono !text-offBlack focus:!ring-4 focus:!ring-lakeBlue/10 focus:!border-lakeBlue focus:!bg-white !transition-all !shadow-sm",
                      formFieldInputShowPasswordButton: "!mr-3",
                      formButtonPrimary: "!w-full !bg-lakeBlue hover:!bg-brand-600 !text-white !rounded-xl !font-mono !py-3.5 !mt-2 !transition-all !shadow-md hover:!shadow-lg hover:-translate-y-0.5",
                      footer: "hidden",
                      formFieldRow: "!w-full !overflow-visible",
                      badge: "!hidden",
                      formFieldAction: "!hidden",
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
