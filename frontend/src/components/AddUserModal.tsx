import { Role } from '@/types';
import { Image, Mail, Shield, User, UserPlus, Users, X } from 'lucide-react';
import React, { useState } from 'react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  currentUserRole: string;
}

export const AddUserModal = ({ isOpen, onClose, onSubmit, currentUserRole }: AddUserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'BDE' as Role,
    teamId: '',
    username: '',
    avatarFile: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('role', formData.role);
    if (formData.teamId) data.append('teamId', formData.teamId);
    if (formData.username) data.append('username', formData.username);
    if (formData.avatarFile) data.append('avatar', formData.avatarFile);

    try {
      await onSubmit(data);
      onClose();
      setFormData({ name: '', email: '', role: 'BDE', teamId: '', username: '', avatarFile: null });
    } catch (err) {
      console.error('Failed to add user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: Role[] = currentUserRole === 'SUPER_ADMIN' 
    ? ['SUPER_ADMIN', 'SALES_HEAD', 'TEAM_LEAD', 'BDE', 'CHANNEL_PARTNER']
    : ['TEAM_LEAD', 'BDE', 'CHANNEL_PARTNER'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-200"
      />
      <div
        className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-100 rounded text-slate-500">
              <UserPlus size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Provision User</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@vertical.ai"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none appearance-none"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Identifier</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  placeholder="Optional"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-[10px] font-bold text-white bg-slate-900 uppercase tracking-widest rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Provisioning...' : 'Provision User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
