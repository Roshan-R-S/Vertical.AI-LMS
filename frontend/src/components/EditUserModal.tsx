import React, { useState, useEffect } from 'react';
import { X, Edit2, Mail, Shield, User, Users, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role, User as UserType } from '@/types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<UserType>) => Promise<void>;
  user: UserType | null;
  currentUserRole: string;
}

export const EditUserModal = ({ isOpen, onClose, onSubmit, user, currentUserRole }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'BDE' as Role,
    teamId: '',
    avatarFile: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'BDE',
        teamId: user.teamId || '',
        avatarFile: null
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    let submitData: any = { ...formData };
    if (formData.avatarFile) {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('role', formData.role);
      if (formData.teamId) data.append('teamId', formData.teamId);
      data.append('avatar', formData.avatarFile);
      submitData = data;
    } else {
      delete submitData.avatarFile;
    }

    try {
      await onSubmit(user.id, submitData);
      onClose();
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: Role[] = currentUserRole === 'SUPER_ADMIN' 
    ? ['SUPER_ADMIN', 'SALES_HEAD', 'TEAM_LEAD', 'BDE', 'CHANNEL_PARTNER']
    : ['TEAM_LEAD', 'BDE', 'CHANNEL_PARTNER'];

  return (
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
            className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-lg text-brand-600">
                  <Edit2 size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Edit User Details</h2>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Image</label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, avatarFile: e.target.files?.[0] || null })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none"
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team ID/Name</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={formData.teamId}
                      onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                      placeholder="Optional"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-bold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-200 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
