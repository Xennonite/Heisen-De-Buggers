import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function LandingPage({ onDevLogin, isDev }) {
  return (
    <div className="relative min-h-screen bg-parchment flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="bg-wash"></div>
        {/* We use an img tag with the float animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-multiply">
          <img 
            src="/bg-motif.jpg" 
            alt="Government Motif" 
            className="object-cover w-full h-full animate-float max-w-5xl mx-auto rounded-[80px]"
            style={{ animationDuration: '8s' }}
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        
        {/* Left Side: Editorial Typography */}
        <div className="flex-1 text-offBlack">
          <h2 className="text-sm tracking-[0.2em] font-mono uppercase text-smoke mb-6">
            Government of India
          </h2>
          <h1 className="font-serif text-6xl md:text-8xl leading-[0.9] tracking-tight mb-8">
            MetroVerity
          </h1>
          <p className="font-mono text-lg md:text-xl text-graphite max-w-md leading-relaxed">
            Statutory Enforcement Platform for The Legal Metrology Act, 2011.
          </p>
        </div>

        {/* Right Side: Authentication */}
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-3xl p-10 rounded-[40px] border border-white shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
            <h3 className="font-serif text-3xl mb-8 text-center text-offBlack">Officer Portal</h3>
            <div className="flex justify-center">
              {isDev ? (
                <button 
                  onClick={onDevLogin}
                  className="w-full bg-lakeBlue hover:bg-brand-600 text-white rounded-pill font-mono uppercase tracking-widest py-4 mt-2 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Enter Dev Portal
                </button>
              ) : (
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      cardBox: "!shadow-none !border-none !bg-transparent",
                      card: "!bg-transparent !shadow-none !w-full !p-0 !border-none",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      main: "!gap-4 !w-full",
                      socialButtonsBlockButton: "!border !border-ash/60 !bg-white !text-offBlack !font-mono !rounded-pill hover:!bg-periwinkle !transition !py-3.5",
                      socialButtonsBlockButtonText: "!font-mono !font-medium",
                      dividerText: "!font-mono !text-smoke !my-6",
                      formFieldLabelRow: "!w-full !px-1",
                      formFieldLabel: "!font-mono !text-graphite !uppercase !tracking-widest !text-[11px] !mb-2",
                      formFieldInput: "!w-full !box-border !border !border-ash/60 !bg-white/50 !rounded-pill !px-5 !py-3.5 !font-mono !text-offBlack focus:!ring-4 focus:!ring-lakeBlue/10 focus:!border-lakeBlue focus:!bg-white !transition-all !shadow-sm",
                      formFieldInputShowPasswordButton: "!mr-3",
                      formButtonPrimary: "!w-full !bg-lakeBlue hover:!bg-brand-600 !text-white !rounded-pill !font-mono !uppercase !tracking-widest !py-4 !mt-6 !transition-all !shadow-md hover:!shadow-lg hover:-translate-y-0.5",
                      footer: "hidden",
                      formFieldRow: "!mb-5 !w-full",
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
