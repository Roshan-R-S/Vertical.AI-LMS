import React, { useRef } from 'react';

export const InteractiveVisuals = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !contentRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    contentRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (contentRef.current) {
      contentRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 hidden lg:flex items-center justify-center p-12 bg-slate-50 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={contentRef} className="parallax-content z-20 relative max-w-lg">
        <div className="text-brand-600 text-2xl font-bold mb-8 transform translate-z-10">Vertical</div>
        <h1 className="text-6xl font-bold leading-tight tracking-tight mb-6 text-slate-900 transform translate-z-20">
          The intelligent<br/>workspace<br/>for visionaries.
        </h1>
        <p className="text-slate-500 text-lg transform translate-z-10">
          Precision. Depth. Clarity.
        </p>
      </div>

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-600/30 rounded-full blur-[100px] floating-shape" />
        <div className="absolute bottom-[0%] right-[-10%] w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[100px] floating-shape" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-sky-500/20 rounded-full blur-[100px] floating-shape" style={{ animationDelay: '-10s' }} />
      </div>
    </div>
  );
};
