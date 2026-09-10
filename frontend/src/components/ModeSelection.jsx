import React from 'react';
import { Box, Layers, Globe, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-parchment flex items-center justify-center p-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl text-offBlack mb-4">Inspection Portal</h1>
          <p className="font-mono text-graphite text-lg">Select an operational mode to begin statutory enforcement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`group relative text-left p-10 rounded-card border ${mode.border} ${mode.color} transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                
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
