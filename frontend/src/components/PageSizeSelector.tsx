import React from 'react';

interface PageSizeSelectorProps {
  pageSize: number;
  onChange: (size: number) => void;
  options?: number[];
  className?: string;
}

export const PageSizeSelector = ({ 
  pageSize, 
  onChange, 
  options = [5, 10, 25, 50, 100],
  className = ""
}: PageSizeSelectorProps) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Show</span>
      <select 
        value={pageSize} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
      >
        {options.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Entries</span>
    </div>
  );
};
