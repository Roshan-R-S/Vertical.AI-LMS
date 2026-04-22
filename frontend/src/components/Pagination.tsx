import React from 'react';
import { cn } from '@lib/utils';
import { ChevronDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalEntries: number;
  pageSize: number;
  label?: string; // e.g., "leads", "entries", "logs"
}

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalEntries, 
  pageSize,
  label = "entries"
}: PaginationProps) => {
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="flex items-center gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{totalEntries === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, totalEntries)}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalEntries)}</span> of <span className="font-bold text-slate-900">{totalEntries}</span> {label}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronDown className="rotate-90 text-slate-600" size={16} />
        </button>
        
        <div className="flex items-center gap-1">
          {[...Array(endPage - startPage + 1)].map((_, i) => {
            const pageNum = startPage + i;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn("w-8 h-8 text-xs font-bold rounded-lg transition-all",
                  currentPage === pageNum 
                    ? "bg-brand-600 text-white shadow-md shadow-brand-100" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200")}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button 
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronDown className="-rotate-90 text-slate-600" size={16} />
        </button>
      </div>
    </div>
  );
};
