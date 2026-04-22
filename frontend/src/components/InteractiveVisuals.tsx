import React from 'react';

export const InteractiveVisuals = () => {
  return (
    <div className="flex-1 hidden lg:flex items-center justify-center p-12 bg-white relative overflow-hidden">
      <div className="z-20 relative max-w-lg">
        <div className="text-slate-900 text-xl font-bold mb-10 border-l-4 border-brand-600 pl-4">Vertical</div>
        <h1 className="text-5xl font-black leading-[1.1] tracking-tighter mb-6 text-slate-900 uppercase">
          Precision.<br/>Performance.<br/>Protocol.
        </h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">
          Advanced Lead Lifecycle Management
        </p>
      </div>

      {/* Structured Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.04]" 
        style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />
    </div>
  );
};
