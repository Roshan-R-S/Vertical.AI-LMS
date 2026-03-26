import React from 'react';
import { useState } from 'react';
import { Target, CheckCircle, Trophy, Star, TrendingUp, Users, Settings, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, User, UserTarget, TeamTarget } from '../types';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

// ---- TargetManagementModal ----
interface TargetManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  teamTargets: TeamTarget[];
  userTargets: UserTarget[];
  targetMonth: string;
  onUpdateTeamTarget: (target: TeamTarget) => void;
  onUpdateUserTarget: (target: UserTarget) => void;
}

export const TargetManagementModal = ({
  isOpen, onClose, users, teamTargets, userTargets, targetMonth,
  onUpdateTeamTarget, onUpdateUserTarget
}: TargetManagementModalProps) => {
  const [activeTab, setActiveTab] = useState<'TEAM' | 'INDIVIDUAL'>('TEAM');
  const teamTarget = teamTargets.find(t => t.month === targetMonth) ||
    { id: `tt-${Date.now()}`, teamId: 't1', targetValue: 0, targetLeads: 0, month: targetMonth };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Manage Sales Targets</h3>
                <p className="text-xs text-slate-500 font-medium">Set and allocate targets for {targetMonth}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="flex p-2 bg-slate-100/50 m-6 rounded-xl">
              <button
                onClick={() => setActiveTab('TEAM')}
                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  activeTab === 'TEAM' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >Team Target</button>
              <button
                onClick={() => setActiveTab('INDIVIDUAL')}
                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  activeTab === 'INDIVIDUAL' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >Individual Allocation</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {activeTab === 'TEAM' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Revenue (₹)</label>
                      <input
                        type="number"
                        defaultValue={teamTarget.targetValue}
                        onBlur={(e) => onUpdateTeamTarget({ ...teamTarget, targetValue: Number(e.target.value) })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Leads (Count)</label>
                      <input
                        type="number"
                        defaultValue={teamTarget.targetLeads}
                        onBlur={(e) => onUpdateTeamTarget({ ...teamTarget, targetLeads: Number(e.target.value) })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg text-brand-600 shadow-sm"><Target size={18} /></div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-900">Allocation Summary</h4>
                        <p className="text-xs text-brand-700 mt-1">
                          Total individual targets allocated: {formatCurrency(userTargets.filter(t => t.month === targetMonth).reduce((acc, t) => acc + t.targetValue, 0))}
                        </p>
                        <div className="mt-2 w-full h-1.5 bg-brand-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600"
                            style={{ width: `${Math.min((userTargets.filter(t => t.month === targetMonth).reduce((acc, t) => acc + t.targetValue, 0) / (teamTarget.targetValue || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.filter(u => u.role === 'BDE').map(user => {
                    const userTarget = userTargets.find(t => t.userId === user.id && t.month === targetMonth) ||
                      { id: `ut-${Date.now()}-${user.id}`, userId: user.id, targetValue: 0, targetLeads: 0, month: targetMonth };
                    return (
                      <div key={user.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} className="w-10 h-10 rounded-full border border-white shadow-sm" />
                          <div>
                            <div className="text-sm font-bold text-slate-900">{user.name}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">BDE</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase">Value (₹)</label>
                            <input
                              type="number"
                              defaultValue={userTarget.targetValue}
                              onBlur={(e) => onUpdateUserTarget({ ...userTarget, targetValue: Number(e.target.value) })}
                              className="w-28 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase">Leads</label>
                            <input
                              type="number"
                              defaultValue={userTarget.targetLeads}
                              onBlur={(e) => onUpdateUserTarget({ ...userTarget, targetLeads: Number(e.target.value) })}
                              className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Done</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ---- TargetsPage ----
interface TargetsPageProps {
  leads: Lead[];
  users: User[];
  teamTargets: TeamTarget[];
  userTargets: UserTarget[];
  currentUser: User;
  onOpenTargetModal: () => void;
}

export const TargetsPage = ({ leads, users, teamTargets, userTargets, currentUser, onOpenTargetModal }: TargetsPageProps) => {
  const closedLeadsValue = leads.filter(l => l.stage === 'PAYMENT_COMPLETED').reduce((acc, l) => acc + l.value, 0);
  const teamTargetValue = teamTargets.filter(t => t.month === '2024-03').reduce((acc, t) => acc + t.targetValue, 0);
  const canManage = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_ADMIN' || currentUser.role === 'TEAM_LEAD';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Sales Targets &amp; Performance</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Month: March 2024</div>
          {canManage && (
            <button onClick={onOpenTargetModal} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
              <Settings size={14} />Manage Targets
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Team Target Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><Target size={20} /></div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Target</span>
              {canManage && <button onClick={onOpenTargetModal} className="text-[8px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-widest mt-1">Edit</button>}
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(teamTargetValue)}</div>
          <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${Math.min((closedLeadsValue / (teamTargetValue || 1)) * 100, 100)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs font-medium">
            <span className="text-slate-500">Achievement: {formatCurrency(closedLeadsValue)}</span>
            <span className="text-brand-600">{((closedLeadsValue / (teamTargetValue || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Closed Leads */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed Leads</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{leads.filter(l => l.stage === 'PAYMENT_COMPLETED').length}</div>
          <div className="mt-1 text-xs text-slate-500">Target: {teamTargets.filter(t => t.month === '2024-03').reduce((acc, t) => acc + t.targetLeads, 0)} leads</div>
        </div>

        {/* Top Performer by Value */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Trophy size={20} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Performer (Value)</span>
          </div>
          {(() => {
            const stats = users.filter(u => u.role === 'BDE').map(user => ({
              user, totalValue: leads.filter(l => l.assignedToId === user.id && l.stage === 'PAYMENT_COMPLETED').reduce((acc, l) => acc + l.value, 0)
            }));
            const top = [...stats].sort((a, b) => b.totalValue - a.totalValue)[0];
            return (
              <div className="flex items-center gap-3">
                <img src={top?.user.avatar} className="w-10 h-10 rounded-full border-2 border-purple-100" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{top?.user.name}</div>
                  <div className="text-xs text-slate-500">{formatCurrency(top?.totalValue || 0)}</div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sales Volume Leader */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Star size={20} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Volume Leader</span>
          </div>
          {(() => {
            const stats = users.filter(u => u.role === 'BDE').map(user => ({
              user, count: leads.filter(l => l.assignedToId === user.id && l.stage === 'PAYMENT_COMPLETED').length
            }));
            const top = [...stats].sort((a, b) => b.count - a.count)[0];
            return (
              <div className="flex items-center gap-3">
                <img src={top?.user.avatar} className="w-10 h-10 rounded-full border-2 border-blue-100" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{top?.user.name}</div>
                  <div className="text-xs text-slate-500">{top?.count || 0} Leads Closed</div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Insights + Individual BDE Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />Consistency Insights
          </h3>
          {(() => {
            const stats = users.filter(u => u.role === 'BDE').map(user => {
              const totalValue = leads.filter(l => l.assignedToId === user.id && l.stage === 'PAYMENT_COMPLETED').reduce((acc, l) => acc + l.value, 0);
              const target = userTargets.find(t => t.userId === user.id && t.month === '2024-03');
              const achievementPercent = target ? (totalValue / target.targetValue) * 100 : 0;
              return { user, totalValue, achievementPercent };
            });
            const best = [...stats].sort((a, b) => b.achievementPercent - a.achievementPercent)[0];
            const worst = [...stats].sort((a, b) => a.achievementPercent - b.achievementPercent)[0];
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-emerald-600"><Star size={16} /></div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900">Consistent Performer</div>
                      <div className="text-[10px] text-emerald-700">{best?.user.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-900">{best?.achievementPercent.toFixed(1)}%</div>
                    <div className="text-[10px] text-emerald-700">Target Achievement</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-red-600"><AlertCircle size={16} /></div>
                    <div>
                      <div className="text-xs font-bold text-red-900">Consistent Non-Performer</div>
                      <div className="text-[10px] text-red-700">{worst?.user.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-900">{worst?.achievementPercent.toFixed(1)}%</div>
                    <div className="text-[10px] text-red-700">Target Achievement</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-brand-500" />Individual BDE Targets
            </h3>
            {canManage && (
              <button onClick={onOpenTargetModal} className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-widest">
                Edit All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {users.filter(u => u.role === 'BDE').map(user => {
              const totalValue = leads.filter(l => l.assignedToId === user.id && l.stage === 'PAYMENT_COMPLETED').reduce((acc, l) => acc + l.value, 0);
              const target = userTargets.find(t => t.userId === user.id && t.month === '2024-03');
              const achievementPercent = target ? (totalValue / target.targetValue) * 100 : 0;
              return (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-500">Target: {formatCurrency(target?.targetValue || 0)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{formatCurrency(totalValue)}</div>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", achievementPercent >= 100 ? "bg-emerald-500" : achievementPercent >= 50 ? "bg-brand-500" : "bg-orange-500")}
                        style={{ width: `${Math.min(achievementPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
