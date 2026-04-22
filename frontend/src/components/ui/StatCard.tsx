import React from 'react';
import { cn } from '@lib/utils';

export const StatCard = ({ label, value, icon: Icon, color, trend }: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
}) => (
  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon size={20} className="text-white" />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
  </div>
);
