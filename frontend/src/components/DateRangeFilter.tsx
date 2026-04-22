
import React from 'react';
import { Calendar, X } from 'lucide-react';
import { cn } from '@lib/utils';

export type DateFilterType = 'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'CUSTOM';

interface DateRangeFilterProps {
  value: DateFilterType;
  onChange: (value: DateFilterType) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  className?: string;
}

export const DateRangeFilter = ({
  value,
  onChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  className
}: DateRangeFilterProps) => {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg", className)}>
      <Calendar size={14} className="text-slate-400" />
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value as DateFilterType)}
        className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer"
      >
        <option value="ALL">All Time</option>
        <option value="TODAY">Today</option>
        <option value="YESTERDAY">Yesterday</option>
        <option value="LAST_7_DAYS">Last 7 Days</option>
        <option value="CUSTOM">Custom Range</option>
      </select>
      
      {value === 'CUSTOM' && (
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none" 
          />
          <span className="text-slate-300 text-xs">-</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none" 
          />
        </div>
      )}
      
      {value !== 'ALL' && (
        <button 
          onClick={() => {
            onChange('ALL');
            onStartDateChange('');
            onEndDateChange('');
          }}
          className="p-0.5 hover:bg-slate-200 rounded text-slate-400 ml-1 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};
