import React, { useState } from 'react';
import {
  User, Bell, Shield, Globe, CreditCard, Target, Users,
  Settings as SettingsIcon, Save, Lock, Mail, Phone,
  Plus, Trash2, List, Clock, Search, Filter, Database, X,
  Briefcase, UserCircle, Camera
} from 'lucide-react';
import { cn, formatDate, formatDateTime } from '@lib/utils';
import { User as UserType, AuditLogEntry } from '@/types';
import { requestPasswordReset } from '@lib/api';
import { AddTeamModal } from '@components/AddTeamModal';
import { Pagination } from '@components/Pagination';
import { PageSizeSelector } from '@components/PageSizeSelector';

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
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  // Form states for extra fields
  const [phone, setPhone] = useState(user.phone || '');
  const [profession, setProfession] = useState(user.profession || '');
  const [username, setUsername] = useState(user.username || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [notifyEmail, setNotifyEmail] = useState(user.notifyEmail ?? true);
  const [notifyPush, setNotifyPush] = useState(user.notifyPush ?? true);
  const [notifyTasks, setNotifyTasks] = useState(user.notifyTasks ?? true);
  const [notifyAssignments, setNotifyAssignments] = useState(user.notifyAssignments ?? true);

  React.useEffect(() => {
    if (activeSection === 'audit-log') {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
          const token = localStorage.getItem('lendkraft_token');
          const res = await fetch(`${import.meta.env.VITE_API_URL}/audit-logs?entityType=${auditFilter}&limit=${auditPageSize}&page=${auditPage}`, {
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
            if (json.meta) {
              setAuditTotalPages(json.meta.totalPages || 1);
            }
          }
        } catch (err) {
          console.error('Error fetching audit logs:', err);
        } finally {
          setLoadingLogs(false);
        }
      };
      fetchLogs();
    }
  }, [activeSection, auditFilter, auditPage, auditPageSize]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        const newAvatarUrl = json.data.avatarUrl;
        
        // Use the absolute API URL if it's a relative upload path
        const fullAvatarUrl = newAvatarUrl.startsWith('/uploads') 
          ? `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}${newAvatarUrl}` 
          : newAvatarUrl;
          
        setAvatar(fullAvatarUrl);
        await onUpdateUser(user.id, { avatar: fullAvatarUrl });
      } else {
        alert('Failed to upload avatar.');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
    }
  };

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
    { id: 'profile', label: 'Profile Settings', icon: User, roles: ['SUPER_ADMIN', 'SALES_HEAD', 'TEAM_LEAD', 'BDE', 'CHANNEL_PARTNER'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['SUPER_ADMIN', 'SALES_HEAD', 'TEAM_LEAD', 'BDE', 'CHANNEL_PARTNER'] },
    { id: 'audit-log', label: 'Audit Logs', icon: Clock, roles: ['SUPER_ADMIN', 'SALES_HEAD', 'TEAM_LEAD'] },
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
      return matchesSearch && matchesFilter;
    }
    
    return matchesSearch && matchesFilter;
  });

  
  const handleCreateTeam = async (teamName: string, leadId: string) => {
    try {
      await onUpdateUser(leadId, { 
        role: 'TEAM_LEAD',
        teamId: teamName 
      });
      alert(`Team '${teamName}' created successfully and lead assigned!`);
    } catch (err) {
      alert('Failed to create team.');
    }
  };

  const handleSave = async () => {
    if (emailError) return;
    
    const updateData: Partial<UserType> = {
      email: profileEmail,
      phone,
      profession,
      notifyEmail,
      notifyPush,
      notifyTasks,
      notifyAssignments,
      avatar
    };
    
    // Only super admins or the user themselves (if allowed by backend) should update usernames
    // For now we just include it if it changed
    if (username !== user.username) {
      updateData.username = username;
    }

    await onUpdateUser(user.id, updateData);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500">Manage your account and application preferences</p>
        </div>
        <button 
          onClick={handleSave}
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
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
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
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            {activeSection === 'profile' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer rounded-full">
                    <img 
                      src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt={user.name} 
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-slate-100"
                      crossOrigin="anonymous"
                    />
                    <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={24} />
                      <span className="text-[10px] font-bold mt-1">UPLOAD</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                    <p className="text-sm font-medium text-brand-600 mb-1">{user.role.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-500 font-mono">Team: {user.teamId || 'No Team Assigned'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" defaultValue={user.name} disabled className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm opacity-60 cursor-not-allowed" />
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
                          "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all",
                          emailError ? "border-red-300 text-red-600" : "border-slate-200"
                        )} 
                      />
                    </div>
                    {emailError && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest">{emailError}</p>}
                  </div>

                  {/* Channel Partner Specific Fields */}
                  {user.role === 'CHANNEL_PARTNER' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Username</label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profession</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            value={profession} 
                            onChange={(e) => setProfession(e.target.value)}
                            placeholder="e.g. Financial Consultant, Real Estate Agent"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>
                    </>
                  )}
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
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-900">System Audit Logs</h3>
                    <PageSizeSelector 
                      pageSize={auditPageSize} 
                      onChange={(size) => { setAuditPageSize(size); setAuditPage(1); }} 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search logs..."
                        value={auditSearch}
                        onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <select 
                      value={auditFilter}
                      onChange={(e) => { setAuditFilter(e.target.value as any); setAuditPage(1); }}
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
                </div>

                {/* Pagination Footer - Standardized */}
                {!loadingLogs && auditLogs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Pagination 
                      currentPage={auditPage}
                      totalPages={auditTotalPages}
                      onPageChange={setAuditPage}
                      totalEntries={auditLogs.length * auditTotalPages} // Approximate if real count not available, but auditLogs.length is current page
                      pageSize={auditPageSize}
                      label="logs"
                    />
                  </div>
                )}
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="p-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive daily summaries and important alerts via email.', state: notifyEmail, setter: setNotifyEmail },
                    { label: 'Push Notifications', desc: 'Get real-time updates on your desktop or mobile device.', state: notifyPush, setter: setNotifyPush },
                    { label: 'Task Reminders', desc: 'Notifications for upcoming and overdue tasks.', state: notifyTasks, setter: setNotifyTasks },
                    { label: 'Lead Assignments', desc: 'Alert when a new lead is assigned to you or your team.', state: notifyAssignments, setter: setNotifyAssignments }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={item.state} 
                          onChange={(e) => item.setter(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {activeSection === 'billing' && (
              <div className="p-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Subscription Plan</h3>
                <div className="p-6 bg-brand-600 rounded-lg text-white space-y-4 shadow-xl shadow-brand-100">
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
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
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
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
              <button onClick={() => setIsTeamModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {users.filter(u => u.teamId === user.teamId).map(teamMember => (
                <div key={teamMember.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
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

      <AddTeamModal 
        isOpen={isCreateTeamModalOpen} 
        onClose={() => setIsCreateTeamModalOpen(false)}
        users={users}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  );
};
