import React from 'react';
import { Box, Layers, Globe, ArrowRight } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';

export default function ModeSelection({ onSelectMode }) {
  const modes = [
    {
      id: 'single',
      title: 'Single SKU Scan',
      description: 'Run spatial and statutory validation on a single physical product package.',
      icon: Box,
      color: 'bg-periwinkle',
      border: 'border-ash'
    },
    {
      id: 'bulk',
      title: 'Bulk MPE Test',
      description: 'First Schedule statistical sampling for warehouse lot inspections.',
      icon: Layers,
      color: 'bg-parchment',
      border: 'border-ash'
    },
    {
      id: 'web',
      title: 'E-Commerce Crawler',
      description: 'Verify digital compliance against Rule 6(10) on e-commerce portals.',
      icon: Globe,
      color: 'bg-parchment',
      border: 'border-ash'
    }
  ];

  return (
    <div className="relative min-h-screen bg-parchment flex items-center justify-center p-6 overflow-hidden">
      
      {/* Background Gradient & Interactive Golden Particles */}
      <div className="absolute inset-0 z-0">
        <div className="bg-wash-warm opacity-70"></div>
      </div>
      <InteractiveBackground density={120} speed={0.4} glowColor="#ecda98" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <img src="/logo.jpg" alt="MetroVerity Logo" className="w-20 h-20 rounded-full border border-ash/60 shadow-md object-cover mb-6" />
          <h1 className="font-serif text-5xl text-offBlack mb-4 drop-shadow-sm">MetroVerity</h1>
          <p className="font-mono text-graphite text-lg">Select an operational mode to begin statutory enforcement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`group relative text-left p-10 rounded-card border ${mode.border} ${mode.color} transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
              >
                {/* Reveal gradient wash on hover */}
                <div className="bg-wash-cool"></div>
                
                <div className="w-12 h-12 rounded-full border border-ash flex items-center justify-center bg-white mb-8">
                  <Icon className="w-5 h-5 text-offBlack" />
                </div>
                
                <h3 className="font-serif text-2xl text-offBlack mb-4">{mode.title}</h3>
                <p className="font-mono text-sm text-graphite mb-10 leading-relaxed">
                  {mode.description}
                </p>

                <div className="flex items-center text-sm font-mono uppercase tracking-wider text-offBlack">
                  Launch <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
