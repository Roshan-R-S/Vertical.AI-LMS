import React, { useState } from 'react';
import { 
  User, Bell, Shield, Globe, CreditCard, Target, Users, 
  Settings as SettingsIcon, Save, Lock, Mail, Phone, 
  Plus, Trash2, List, Clock, Search, Filter, Database, X
} from 'lucide-react';
import { cn, formatDate, formatDateTime } from '@lib/utils';
import { User as UserType, CustomFieldDefinition, AuditLogEntry } from '@/types';
import { requestPasswordReset } from '@lib/api';

interface SettingsProps {
  user: UserType;
  users: UserType[];
  onUpdateUser: (id: string, data: Partial<UserType>) => Promise<void>;
}

export const Settings = ({ user, users, onUpdateUser }: SettingsProps) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<AuditLogEntry['entityType'] | 'ALL'>('ALL');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  React.useEffect(() => {
    if (activeSection === 'audit-log') {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
          const token = localStorage.getItem('lendkraft_token');
          const res = await fetch(`${import.meta.env.VITE_API_URL}/audit-logs?entityType=${auditFilter}&limit=100`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const json = await res.json();
            const mappedLogs = (json.data || []).map((log: any) => ({
              ...log,
              userName: log.user?.name || 'Unknown',
              timestamp: log.createdAt
            }));
            setAuditLogs(mappedLogs);
          }
        } catch (err) {
          console.error('Error fetching audit logs:', err);
        } finally {
          setLoadingLogs(false);
        }
      };
      fetchLogs();
    }
  }, [activeSection, auditFilter]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProfileEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User, roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'TEAM_LEAD', 'BDE'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'TEAM_LEAD', 'BDE'] },
    { id: 'audit-log', label: 'Audit Logs', icon: Clock, roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'TEAM_LEAD'] },
    { id: 'team', label: 'Team Settings', icon: Users, roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'TEAM_LEAD'] },
    { id: 'billing', label: 'Billing & Subscription', icon: CreditCard, roles: ['SUPER_ADMIN'] },
    { id: 'system', label: 'System Configuration', icon: Globe, roles: ['SUPER_ADMIN'] },
  ].filter(section => section.roles.includes(user.role));

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(auditSearch.toLowerCase()) || 
                          log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.details.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesFilter = auditFilter === 'ALL' || log.entityType === auditFilter;
    
    // Role-based filtering for audit logs
    if (user.role === 'TEAM_LEAD') {
      // Team leads can only see logs of their team members (mocked here as seeing all for demo)
      return matchesSearch && matchesFilter;
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500">Manage your account and application preferences</p>
        </div>
        <button 
          onClick={() => {
            if (emailError) return;
            // The backend update user call will now handle the audit logging
          }}
          disabled={!!emailError}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all",
            emailError 
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
              : "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200"
          )}
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                activeSection === section.id
                  ? "bg-brand-50 text-brand-600 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            {activeSection === 'profile' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl border-4 border-slate-50 shadow-sm" />
                    <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-500 hover:text-brand-600 transition-colors">
                      <SettingsIcon size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.role.replace('_', ' ')} • {user.teamId || 'No Team'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" defaultValue={user.name} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        value={profileEmail} 
                        onChange={handleEmailChange}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all",
                          emailError ? "border-red-300 text-red-600" : "border-slate-200"
                        )} 
                      />
                    </div>
                    {emailError && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest">{emailError}</p>}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Security</h4>
                  <button 
                    onClick={async () => {
                      try {
                        await requestPasswordReset(user.email);
                        alert('Password reset link has been sent to your email.');
                      } catch (err: any) {
                        alert(err.message || 'Failed to send password reset link');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                  >
                    <Lock size={14} />
                    Reset Password
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'audit-log' && (
              <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-900">System Audit Logs</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search logs..."
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <select 
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value as any)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    >
                      <option value="ALL">All Entities</option>
                      <option value="LEAD">Leads</option>
                      <option value="USER">Users</option>
                      <option value="SETTING">Settings</option>
                      <option value="TASK">Tasks</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                        <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                        <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loadingLogs ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400">
                            <Clock size={20} className="animate-spin mx-auto mb-2" />
                            <span className="text-sm font-medium">Loading audit logs...</span>
                          </td>
                        </tr>
                      ) : filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 text-xs text-slate-500 font-mono whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px] font-bold">
                                {log.userName.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-900 whitespace-nowrap">{log.userName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 min-w-[200px]">
                            <div className="bg-slate-50 p-2 rounded border border-slate-100 break-all leading-relaxed">
                              {log.details}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm text-slate-500">No logs found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="p-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive daily summaries and important alerts via email.' },
                    { label: 'Push Notifications', desc: 'Get real-time updates on your desktop or mobile device.' },
                    { label: 'Task Reminders', desc: 'Notifications for upcoming and overdue tasks.' },
                    { label: 'Lead Assignments', desc: 'Alert when a new lead is assigned to you or your team.' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'team' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Team Organization</h3>
                  {(user.role === 'SUPER_ADMIN' || user.role === 'SALES_ADMIN') && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-all">
                      <Plus size={14} />
                      Create New Team
                    </button>
                  )}
                </div>

                {/* Team Hierarchy View */}
                <div className="space-y-6">
                  {users.filter(u => u.role === 'TEAM_LEAD').map(teamLead => {
                    const teamMembers = users.filter(u => u.teamId === teamLead.teamId && u.role === 'BDE');
                    return (
                      <div key={teamLead.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center">
                              <Shield size={20} className="text-brand-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{teamLead.name}'s Team</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Lead: {teamLead.email}</p>
                            </div>
                          </div>
                          {(user.role === 'SUPER_ADMIN' || user.role === 'SALES_ADMIN') && (
                            <button 
                              onClick={async () => {
                                const bdeToAssign = prompt("Enter BDE Email to assign to this team:");
                                if (bdeToAssign) {
                                  const bde = users.find(u => u.email === bdeToAssign && u.role === 'BDE');
                                  if (bde) {
                                    await onUpdateUser(bde.id, { teamId: teamLead.teamId });
                                  } else {
                                    alert("BDE not found or user is not a BDE.");
                                  }
                                }
                              }}
                              className="px-3 py-1 text-[10px] font-bold text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-all uppercase tracking-widest"
                            >
                              Assign BDE
                            </button>
                          )}
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {teamMembers.length === 0 ? (
                            <p className="col-span-full text-xs text-slate-400 italic py-2 text-center">No BDEs assigned to this team yet.</p>
                          ) : (
                            teamMembers.map(member => (
                              <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <img src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} alt={member.name} className="w-8 h-8 rounded-full border border-slate-200" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                                  <p className="text-[9px] text-slate-500 truncate">{member.email}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    if(window.confirm(`Unassign ${member.name} from this team?`)) {
                                      onUpdateUser(member.id, { teamId: 'default-team' });
                                    }
                                  }}
                                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Unassigned BDEs */}
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed p-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Unassigned BDEs</h4>
                    <div className="flex flex-wrap gap-3">
                      {users.filter(u => u.role === 'BDE' && (!u.teamId || u.teamId === 'N/A' || u.teamId === 'default-team')).map(unassigned => (
                        <div key={unassigned.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                           <img src={unassigned.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(unassigned.name)}`} alt={unassigned.name} className="w-6 h-6 rounded-full border border-slate-200" />
                           <span className="text-xs font-bold text-slate-700">{unassigned.name}</span>
                        </div>
                      ))}
                      {users.filter(u => u.role === 'BDE' && (!u.teamId || u.teamId === 'N/A' || u.teamId === 'default-team')).length === 0 && (
                        <p className="text-xs text-slate-400 italic">All BDEs are successfully assigned to teams.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Lead Distribution Strategy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-700 mb-2">Primary Method</p>
                       <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium">
                        <option>Manual Team Lead Assignment</option>
                        <option>Round Robin Distribution</option>
                        <option>Performance Based (AI Optimized)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="p-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Subscription Plan</h3>
                <div className="p-6 bg-brand-600 rounded-2xl text-white space-y-4 shadow-xl shadow-brand-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Current Plan</p>
                      <h4 className="text-2xl font-bold">Enterprise Pro</h4>
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Active</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <p className="text-sm opacity-80">Next billing date: April 24, 2026</p>
                    <button className="px-4 py-2 bg-white text-brand-600 text-xs font-bold rounded-lg">Manage Plan</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'system' && (
              <div className="p-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">System Configuration</h3>
                <p className="text-sm text-slate-500">Manage global system settings and integrations.</p>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">API Integrations</p>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-sm font-medium">WhatsApp API</span>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">Connected</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-sm font-medium">Email Server (SMTP)</span>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">Connected</span>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsTeamModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
              <button onClick={() => setIsTeamModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {users.filter(u => u.teamId === user.teamId).map(teamMember => (
                <div key={teamMember.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <img src={teamMember.avatar} alt={teamMember.name} className="w-10 h-10 rounded-full border border-slate-200" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{teamMember.name}</p>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{teamMember.role.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
