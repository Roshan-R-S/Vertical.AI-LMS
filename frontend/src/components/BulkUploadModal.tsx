import React from 'react';
import { X, Upload, FileSpreadsheet, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

export const BulkUploadModal = ({ isOpen, onClose, onUpload, onDownloadTemplate }: BulkUploadModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900">Bulk Lead Upload</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="relative p-6 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center space-y-4 hover:border-brand-300 transition-colors group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Upload Excel or CSV</p>
                <p className="text-xs text-slate-500 mt-1">Drag and drop or click to browse</p>
              </div>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={onUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-brand-600">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Lead Template</p>
                    <p className="text-[10px] text-slate-500">Required format for upload</p>
                  </div>
                </div>
                <button
                  onClick={onDownloadTemplate}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Columns</p>
              <div className="flex flex-wrap gap-2">
                {['Lead Name', 'Mobile Number', 'Industry', 'Designation', 'Product', 'State', 'City'].map(col => (
                  <span key={col} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
