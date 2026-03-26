import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { STAGE_CONFIG, User, Activity, Task, LeadStage, Lead, UserTarget, TeamTarget, CustomFieldDefinition, AuditLogEntry } from './types';
import { MOCK_LEADS, MOCK_USERS, MOCK_ACTIVITIES, MOCK_TASKS, INITIAL_CUSTOM_FIELDS, INITIAL_AUDIT_LOGS, MOCK_USER_TARGETS, MOCK_TEAM_TARGETS } from './mockData';
import { cn, formatCurrency, formatDate, formatDateTime } from './lib/utils';

import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { LeadsPage } from './components/LeadsPage';
import { LeadDetailPanel } from './components/LeadDetailPanel';
import { TargetsPage, TargetManagementModal } from './components/TargetsPage';
import { StageHistoryPage } from './components/StageHistoryPage';
import { ClientsPage } from './components/ClientsPage';
import { ReportsPage } from './components/ReportsPage';
import { AddLeadModal } from './components/AddLeadModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { UserManagement } from './components/UserManagement';
import { Settings as SettingsPage } from './components/Settings';

import { useAuth } from './contexts/AuthContext';
import { RegisterPage } from './components/RegisterPage';

export default function App() {
  const { user: currentUser, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Set active tab based on role
  React.useEffect(() => {
    if (currentUser) {
      setActiveTab(currentUser.role === 'BDE' ? 'leads' : 'dashboard');
    }
  }, [currentUser]);

  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(INITIAL_CUSTOM_FIELDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [userTargets, setUserTargets] = useState<UserTarget[]>(MOCK_USER_TARGETS);
  const [teamTargets, setTeamTargets] = useState<TeamTarget[]>(MOCK_TEAM_TARGETS);

  // UI state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isNewLeadDropdownOpen, setIsNewLeadDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'ALL'>('DEFAULT');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetMonth] = useState('2024-03');
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: 'REMINDER' | 'INFO' }[]>([]);
  const [notifiedTaskIds, setNotifiedTaskIds] = useState<Set<string>>(new Set());
  const [notifiedOverdueLeadIds, setNotifiedOverdueLeadIds] = useState<Set<string>>(new Set());

  const addAuditLog = React.useCallback((action: string, entityType: AuditLogEntry['entityType'], entityId?: string, details = '') => {
    setAuditLogs(prev => [{
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser?.id || 'system', userName: currentUser?.name || 'System',
      action, entityType, entityId, details, timestamp: new Date().toISOString()
    }, ...prev]);
  }, [currentUser]);

  // Refs for intervals
  const tasksRef = useRef(tasks); tasksRef.current = tasks;
  const leadsRef = useRef(leads); leadsRef.current = leads;

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasksRef.current.forEach(task => {
        if (task.status === 'PENDING' && task.reminderAt && !notifiedTaskIds.has(task.id) && new Date(task.reminderAt) <= now) {
          const lead = leadsRef.current.find(l => l.id === task.leadId);
          setNotifications(prev => [{ id: `n-${Date.now()}-${task.id}`, title: 'Task Reminder', message: `${task.title}${lead ? ` for ${lead.name}` : ''}`, type: 'REMINDER' }, ...prev]);
          setNotifiedTaskIds(prev => { const next = new Set(prev); next.add(task.id); return next; });
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [notifiedTaskIds]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      leadsRef.current.filter(lead =>
        lead.nextFollowUp && lead.stage !== 'DEFAULT' &&
        !['PAYMENT_COMPLETED', 'HANDED_OVER', 'NOT_INTERESTED', 'DND', 'LOST'].includes(lead.stage) &&
        new Date(lead.nextFollowUp) <= now && !notifiedOverdueLeadIds.has(lead.id)
      ).forEach(lead => {
        const assignee = users.find(u => u.id === lead.assignedToId);
        setNotifications(prev => [{ id: `n-overdue-${Date.now()}-${lead.id}`, title: 'Lead Overdue', message: `Lead ${lead.name} (Assigned to: ${assignee?.name || 'Unassigned'}) is overdue.`, type: 'REMINDER' }, ...prev]);
        setNotifiedOverdueLeadIds(prev => { const next = new Set(prev); next.add(lead.id); return next; });
        addAuditLog('LEAD_OVERDUE', 'LEAD', lead.id, `Lead ${lead.name} is overdue for follow-up.`);
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [notifiedOverdueLeadIds, addAuditLog, users]);

  // --- Helpers ---
  const isTaskOverdue = (task: Task) => task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();
  const isFollowUpOverdue = (lead: Lead) => {
    if (!lead.nextFollowUp) return false;
    if (['PAYMENT_COMPLETED', 'HANDED_OVER', 'NOT_INTERESTED', 'DND', 'LOST'].includes(lead.stage)) return false;
    return new Date(lead.nextFollowUp) < new Date();
  };

  const filteredLeads = leads.filter(lead => {
    if (!currentUser) return false;
    let hasAccess = false;
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_ADMIN') hasAccess = true;
    else if (currentUser.role === 'TEAM_LEAD') hasAccess = lead.teamId === currentUser.teamId;
    else if (currentUser.role === 'BDE') hasAccess = lead.assignedToId === currentUser.id;
    if (!hasAccess) return false;

    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) || lead.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || (stageFilter === 'DEFAULT' ? isFollowUpOverdue(lead) : lead.stage === stageFilter);
    const matchesIndustry = industryFilter === 'ALL' || lead.industry === industryFilter;
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
    const matchesAssignee = assigneeFilter === 'ALL' || lead.assignedToId === assigneeFilter;
    let matchesDate = true;
    const leadDate = new Date(lead.createdAt);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (dateRangeFilter === 'TODAY') matchesDate = leadDate >= today;
    else if (dateRangeFilter === 'YESTERDAY') {
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      matchesDate = leadDate >= yesterday && leadDate < today;
    } else if (dateRangeFilter === 'CUSTOM') {
      matchesDate = (!startDate || leadDate >= new Date(startDate)) && (!endDate || leadDate <= new Date(endDate + 'T23:59:59'));
    }
    return matchesSearch && matchesStage && matchesDate && matchesIndustry && matchesSource && matchesAssignee;
  });

  // --- Handlers ---
  const handleAddNote = (leadId: string, content: string) => {
    if (!content.trim()) return;
    setActivities(prev => [{ id: `a${Date.now()}`, leadId, type: 'NOTE', content, createdBy: currentUser!.id, createdAt: new Date().toISOString() }, ...prev]);
    addAuditLog('ADD_NOTE', 'LEAD', leadId, `Added note: ${content.substring(0, 50)}...`);
  };

  const handleAddTask = (leadId: string, title: string, dueDate: string, priority: 'LOW' | 'MEDIUM' | 'HIGH', reminderAt?: string) => {
    if (!title.trim()) return;
    const newTask: Task = { id: `t${Date.now()}`, leadId, title, dueDate, reminderAt, status: 'PENDING', priority };
    setTasks(prev => [newTask, ...prev]);
    setActivities(prev => [{ id: `a${Date.now() + 1}`, leadId, type: 'TASK', content: `New task created: ${title}${reminderAt ? ` (Reminder set for ${formatDateTime(reminderAt)})` : ''}`, createdBy: currentUser!.id, createdAt: new Date().toISOString() }, ...prev]);
    addAuditLog('ADD_TASK', 'TASK', newTask.id, `Created task: ${title}`);
  };

  const handleToggleTask = (taskId: string) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } as Task : t));
  const handleDeleteTask = (taskId: string) => setTasks(prev => prev.filter(t => t.id !== taskId));

  const handleSetFollowUp = (leadId: string, date: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, nextFollowUp: date } : l));
    if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, nextFollowUp: date } : null);
    setActivities(prev => [{ id: `a${Date.now()}`, leadId, type: 'NOTE', content: `Follow-up scheduled for ${formatDate(date)}`, createdBy: currentUser!.id, createdAt: new Date().toISOString() }, ...prev]);
    addAuditLog('SET_FOLLOWUP', 'LEAD', leadId, `Scheduled follow-up for ${formatDate(date)}`);
  };

  const handleAddAttachment = (leadId: string, fileName: string, size = '1.2 MB') => {
    setActivities(prev => [{ id: `a${Date.now()}`, leadId, type: 'ATTACHMENT', content: `Attached file: ${fileName}`, createdBy: currentUser!.id, createdAt: new Date().toISOString(), metadata: { fileName, size } }, ...prev]);
    addAuditLog('ADD_ATTACHMENT', 'LEAD', leadId, `Attached file: ${fileName}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedLead) {
      setIsUploading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      handleAddAttachment(selectedLead.id, file.name, (file.size / (1024 * 1024)).toFixed(1) + ' MB');
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Phone', 'Industry', 'Status', 'Value', 'Remarks', 'Created At'];
    const csvRows = [headers.join(','), ...filteredLeads.map(lead => [
      `"${lead.name}"`, `"${lead.phone}"`, `"${lead.industry}"`,
      `"${STAGE_CONFIG[lead.stage].label}"`, lead.value,
      `"${(lead.remarks || '').replace(/"/g, '""')}"`, lead.createdAt
    ].join(','))];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.setAttribute('hidden', ''); a.setAttribute('href', url);
    a.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleReassign = (leadId: string, newUserId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedToId: newUserId, updatedAt: new Date().toISOString() } : l));
    if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, assignedToId: newUserId } : null);
    const newUser = MOCK_USERS.find(u => u.id === newUserId);
    setActivities(prev => [{ id: `a${Date.now()}`, leadId, type: 'STAGE_CHANGE', content: `Lead reassigned to ${newUser?.name}`, createdBy: currentUser!.id, createdAt: new Date().toISOString() }, ...prev]);
    addAuditLog('REASSIGN_LEAD', 'LEAD', leadId, `Reassigned to ${newUser?.name}`);
  };

  const handleAddLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email address'); return; }
    setEmailError(null);
    const leadCustomFields: Record<string, any> = {};
    customFields.forEach(field => { const value = formData.get(`cf_${field.id}`); if (value) leadCustomFields[field.id] = value; });
    const newLead: Lead = {
      id: `l${leads.length + 1}`, name: formData.get('name') as string, phone: formData.get('phone') as string,
      email: formData.get('email') as string, designation: formData.get('designation') as string,
      industry: formData.get('industry') as string, source: formData.get('source') as string,
      value: 0, stage: 'YET_TO_CALL',
      linkedIn: formData.get('linkedIn') as string, location: formData.get('location') as string,
      companyName: formData.get('companyName') as string, companyLocation: formData.get('companyLocation') as string,
      companyWebsite: formData.get('companyWebsite') as string, product: formData.get('product') as string,
      state: formData.get('state') as string, city: formData.get('city') as string,
      assignedToId: formData.get('assignedToId') as string || currentUser?.id || 'u1',
      teamId: currentUser?.teamId || 't1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      customFields: leadCustomFields
    };
    setLeads(prev => [newLead, ...prev]);
    setActivities(prev => [{ id: `a${Date.now()}`, leadId: newLead.id, type: 'STAGE_CHANGE', content: `Initial stage: ${STAGE_CONFIG[newLead.stage].label}`, createdBy: currentUser!.id, createdAt: new Date().toISOString() }, ...prev]);
    addAuditLog('CREATE_LEAD', 'LEAD', newLead.id, `Created lead: ${newLead.name}`);
    setIsAddModalOpen(false);
  };

  const handleUpdateStage = (leadId: string, newStage: LeadStage) => {
    const lead = leads.find(l => l.id === leadId); if (!lead) return;
    const oldStage = lead.stage;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, updatedAt: new Date().toISOString() } : l));
    if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, stage: newStage } : null);
    setActivities(prev => [{ id: `a${Date.now()}`, leadId, type: 'STAGE_CHANGE', content: `Status changed from ${STAGE_CONFIG[oldStage].label} to ${STAGE_CONFIG[newStage].label}`, createdBy: currentUser!.id, createdAt: new Date().toISOString() }, ...prev]);
    addAuditLog('UPDATE_STAGE', 'LEAD', leadId, `Status changed from ${oldStage} to ${newStage}`);
  };

  const handleDeleteLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelectedLead(null);
    addAuditLog('DELETE_LEAD', 'LEAD', id, `Deleted lead: ${lead?.name}`);
  };

  const downloadTemplate = () => {
    const csvContent = ['Lead Name', 'Mobile Number', 'Industry', 'Designation', 'Product', 'State', 'City'].join(',') + '\n';
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.setAttribute('download', 'lead_template.csv'); link.style.visibility = 'hidden';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const processBulkLeads = (data: any[]) => {
    const newLeads: Lead[] = data.map((row, index) => ({
      id: `l${leads.length + index + 1}`, name: row['Lead Name'] || row['name'] || 'Unknown',
      phone: String(row['Mobile Number'] || row['phone'] || ''), email: row['Email'] || row['email'] || '',
      designation: row['Designation'] || row['designation'] || '', industry: row['Industry'] || row['industry'] || '',
      product: row['Product'] || row['product'] || '', state: row['State'] || row['state'] || '',
      city: row['City'] || row['city'] || '', source: 'Bulk Upload', value: 0, stage: 'YET_TO_CALL',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      assignedToId: currentUser?.id || 'u1', teamId: currentUser?.teamId || 't1',
    }));
    setLeads(prev => [...newLeads, ...prev]);
    addAuditLog('BULK_CREATE_LEAD', 'LEAD', 'multiple', `Bulk uploaded ${newLeads.length} leads`);
    setIsBulkModalOpen(false);
    setNotifications(prev => [{ id: Date.now().toString(), title: 'Bulk Upload Success', message: `Successfully uploaded ${newLeads.length} leads.`, type: 'INFO' }, ...prev]);
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result; if (!data) return;
      if (file.name.endsWith('.csv')) {
        Papa.parse(data as string, { header: true, skipEmptyLines: true, complete: (results) => processBulkLeads(results.data) });
      } else {
        const workbook = XLSX.read(data, { type: 'binary' });
        processBulkLeads(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
      }
    };
    file.name.endsWith('.csv') ? reader.readAsText(file) : reader.readAsBinaryString(file);
  };

  const handleUpdateTeamTarget = (target: TeamTarget) => {
    setTeamTargets(prev => prev.find(t => t.id === target.id) ? prev.map(t => t.id === target.id ? target : t) : [...prev, target]);
    addAuditLog('UPDATE_TEAM_TARGET', 'SETTING', target.id, `Updated team target for ${target.month}`);
  };

  const handleUpdateUserTarget = (target: UserTarget) => {
    setUserTargets(prev => prev.find(t => t.id === target.id) ? prev.map(t => t.id === target.id ? target : t) : [...prev, target]);
    addAuditLog('UPDATE_USER_TARGET', 'SETTING', target.id, `Updated user target for ${target.userId} in ${target.month}`);
  };

  if (authLoading) return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center gap-6 text-slate-400">
      <div className="w-12 h-12 border-4 border-white/10 border-t-brand-500 rounded-full animate-spin" />
      <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Authenticating Session...</p>
    </div>
  );

  if (!currentUser) {
    return authView === 'login' 
      ? <LoginPage onSwitchToRegister={() => setAuthView('register')} /> 
      : <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden" />
        )}
      </AnimatePresence>

      <Sidebar
        currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        onLogout={logout}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        <Topbar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          notifications={notifications} setNotifications={setNotifications}
          isNewLeadDropdownOpen={isNewLeadDropdownOpen} setIsNewLeadDropdownOpen={setIsNewLeadDropdownOpen}
          setIsAddModalOpen={setIsAddModalOpen} setIsBulkModalOpen={setIsBulkModalOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen} currentUser={currentUser}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard leads={leads} />}

          {activeTab === 'leads' && (
            <LeadsPage
              leads={leads} filteredLeads={filteredLeads} currentUser={currentUser}
              stageFilter={stageFilter} setStageFilter={setStageFilter}
              dateRangeFilter={dateRangeFilter} setDateRangeFilter={setDateRangeFilter}
              startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
              industryFilter={industryFilter} setIndustryFilter={setIndustryFilter}
              sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
              assigneeFilter={assigneeFilter} setAssigneeFilter={setAssigneeFilter}
              isMoreFiltersOpen={isMoreFiltersOpen} setIsMoreFiltersOpen={setIsMoreFiltersOpen}
              users={users} onSelectLead={setSelectedLead} onExport={handleExport}
              isFollowUpOverdue={isFollowUpOverdue}
            />
          )}

          {activeTab === 'targets' && (
            <TargetsPage
              leads={leads} users={users} teamTargets={teamTargets} userTargets={userTargets}
              currentUser={currentUser} onOpenTargetModal={() => setIsTargetModalOpen(true)}
            />
          )}

          {activeTab === 'stage-history' && <StageHistoryPage leads={leads} activities={activities} />}
          {activeTab === 'clients' && <ClientsPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'users' && <UserManagement users={users} setUsers={setUsers} />}
          {activeTab === 'settings' && (
            <SettingsPage user={currentUser} users={users} auditLogs={auditLogs} addAuditLog={addAuditLog} />
          )}
        </div>

        {/* Lead Detail Panel */}
        <LeadDetailPanel
          selectedLead={selectedLead} onClose={() => setSelectedLead(null)}
          currentUser={currentUser} activities={activities} tasks={tasks}
          customFields={customFields} isUploading={isUploading}
          onAddNote={handleAddNote} onAddTask={handleAddTask}
          onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask}
          onSetFollowUp={handleSetFollowUp} onUpdateStage={handleUpdateStage}
          onDeleteLead={handleDeleteLead} onReassign={handleReassign}
          onFileUpload={handleFileUpload} isFollowUpOverdue={isFollowUpOverdue}
          isTaskOverdue={isTaskOverdue}
        />

        {/* Modals */}
        <BulkUploadModal
          isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)}
          onUpload={handleBulkUpload} onDownloadTemplate={downloadTemplate}
        />

        <AnimatePresence>
          <AddLeadModal
            isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddLead} users={users} customFields={customFields}
            currentUser={currentUser} emailError={emailError} setEmailError={setEmailError}
          />
          <TargetManagementModal
            isOpen={isTargetModalOpen} onClose={() => setIsTargetModalOpen(false)}
            users={users} teamTargets={teamTargets} userTargets={userTargets}
            targetMonth={targetMonth} onUpdateTeamTarget={handleUpdateTeamTarget}
            onUpdateUserTarget={handleUpdateUserTarget}
          />
        </AnimatePresence>
      </main>
    </div>
  );
}
