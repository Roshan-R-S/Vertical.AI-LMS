import React from 'react';
import { X, UserPlus, Mail, Phone, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export const AddClientModal = ({
  isOpen, onClose, onSubmit, isSubmitting
}: AddClientModalProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      amcStatus: 'ACTIVE'
    };
    onSubmit(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Add New Client</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Full Name</label>
                <input 
                  name="name" 
                  required 
                  placeholder="e.g. John Doe"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-2">
                   <Building size={12} /> Company Name
                </label>
                <input 
                  name="company" 
                  required 
                  placeholder="e.g. TechCorp Solutions"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="john@example.com"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-2">
                    <Phone size={12} /> Phone Number
                  </label>
                  <input 
                    name="phone" 
                    required 
                    placeholder="+91 98765 43210"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" 
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-brand-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : 'Add Client'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
