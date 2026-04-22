import React, { useState } from 'react';
import { X, Users, Shield, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '@/types';

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  onCreateTeam: (teamName: string, leadId: string) => Promise<void>;
}

export const AddTeamModal = ({ isOpen, onClose, users, onCreateTeam }: AddTeamModalProps) => {
  const [teamName, setTeamName] = useState('');
  const [leadId, setLeadId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !leadId) return;

    setIsSubmitting(true);
    try {
      await onCreateTeam(teamName, leadId);
      onClose();
      setTeamName('');
      setLeadId('');
    } catch (err) {
      console.error('Failed to create team:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <Users size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Create New Team</h2>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Team Name</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Sales Warriors, North Division"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Team Lead</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    required
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="">Select a user to promote...</option>
                    {users.filter(u => u.role === 'BDE' || u.role === 'TEAM_LEAD').map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                  * Selected user will be promoted to TEAM_LEAD role.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
