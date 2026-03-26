import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { CustomFieldDefinition } from '../types';
import { cn } from '../lib/utils';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  users: User[];
  customFields: CustomFieldDefinition[];
  currentUser: User;
  emailError: string | null;
  setEmailError: (err: string | null) => void;
}

export const AddLeadModal = ({
  isOpen, onClose, onSubmit, users, customFields, currentUser, emailError, setEmailError
}: AddLeadModalProps) => (
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
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900">Create New Lead</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Lead Name *', name: 'name', required: true, placeholder: 'Company or Individual Name' },
                { label: 'Phone Number *', name: 'phone', required: true, placeholder: '+91 XXXXX XXXXX' },
                { label: 'Designation', name: 'designation', placeholder: 'e.g. CTO, Manager' },
                { label: 'LinkedIn Profile', name: 'linkedIn', placeholder: 'linkedin.com/in/username' },
                { label: 'Lead Location', name: 'location', placeholder: 'e.g. Mumbai, India' },
                { label: 'Company Name', name: 'companyName', placeholder: 'e.g. TechCorp Solutions' },
                { label: 'Company Location', name: 'companyLocation', placeholder: 'e.g. Bangalore, India' },
                { label: 'Product', name: 'product', placeholder: 'Product name' },
                { label: 'State', name: 'state', placeholder: 'e.g. Maharashtra' },
                { label: 'City', name: 'city', placeholder: 'e.g. Mumbai' },
              ].map(field => (
                <div key={field.name} className="col-span-2 sm:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                  <input name={field.name} required={field.required} placeholder={field.placeholder}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
              ))}

              {/* Email */}
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email ID</label>
                <input
                  name="email" type="email" placeholder="contact@example.com"
                  className={cn("w-full p-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                    emailError ? "border-red-300 text-red-600" : "border-slate-200")}
                  onChange={() => setEmailError(null)}
                />
                {emailError && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest">{emailError}</p>}
              </div>

              {/* Company Website */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Website</label>
                <input name="companyWebsite" placeholder="https://www.example.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>

              {/* Industry */}
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry</label>
                <select name="industry" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                  {['Information Technology', 'Banking & Finance', 'Education', 'Logistics', 'Renewable Energy', 'Manufacturing'].map(i => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Source</label>
                <select name="source" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                  {['LinkedIn', 'Website', 'Referral', 'Cold Call', 'Email Campaign'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Assigned To */}
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned To (BDE)</label>
                <select name="assignedToId" defaultValue={currentUser?.role === 'BDE' ? currentUser.id : ''}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                  <option value="">Select BDE</option>
                  {users.filter(u => u.role === 'BDE').map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              {/* Custom Fields */}
              {customFields.map(field => (
                <div key={field.id} className="col-span-2 sm:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'SELECT' ? (
                    <select name={`cf_${field.id}`} required={field.required}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                      <option value="">Select {field.label}</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input name={`cf_${field.id}`}
                      type={field.type === 'NUMBER' ? 'number' : field.type === 'DATE' ? 'date' : 'text'}
                      required={field.required} placeholder={`Enter ${field.label}`}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all">Cancel</button>
              <button type="submit" className="px-8 py-3 bg-brand-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all active:scale-95">
                Create Lead
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
