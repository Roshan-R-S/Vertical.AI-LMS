import React from 'react';
import { cn } from '@lib/utils';

export const StatCard = ({ label, value, icon: Icon, color, trend }: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
}) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className={cn("p-1.5 rounded-md", color)}>
        <Icon size={18} className="text-white" />
      </div>
      {trend && (
        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100">
          {trend}
        </span>
      )}
    </div>
    <div className="text-xl font-bold text-slate-900 mb-0.5">{value}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);
