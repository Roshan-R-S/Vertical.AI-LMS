import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { STAGE_CONFIG, User, Activity, Task, LeadStage, Lead, UserTarget, TeamTarget, CustomFieldDefinition, AuditLogEntry } from '@/types';
import { MOCK_ACTIVITIES, MOCK_TASKS, INITIAL_CUSTOM_FIELDS, MOCK_USER_TARGETS, MOCK_TEAM_TARGETS } from '@/mockData';
import { cn, formatCurrency, formatDate, formatDateTime } from '@lib/utils';

import { LoginPage } from '@components/LoginPage';
import { Sidebar } from '@components/Sidebar';
import { Topbar } from '@components/Topbar';
import { Dashboard } from '@components/Dashboard';
import { LeadsPage } from '@components/LeadsPage';
import { LeadDetailPanel } from '@components/LeadDetailPanel';
import { TargetsPage, TargetManagementModal } from '@components/TargetsPage';
import { StageHistoryPage } from '@components/StageHistoryPage';
import { ClientsPage } from '@components/ClientsPage';
import { ReportsPage } from '@components/ReportsPage';
import { AddLeadModal } from '@components/AddLeadModal';
import { BulkUploadModal } from '@components/BulkUploadModal';
import { UserManagement } from '@components/UserManagement';
import { Settings as SettingsPage } from '@components/Settings';

import { useAuth } from '@contexts/AuthContext';
import { RegisterPage } from '@components/RegisterPage';
import { ForgotPassword } from '@components/ForgotPassword';
import { ResetPassword } from '@components/ResetPassword';

export default function App() {
  const { user: currentUser, token, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot_password' | 'reset_password'>(
    window.location.pathname === '/reset-password' ? 'reset_password' : 'login'
  );

  // Set active tab based on role
  React.useEffect(() => {
    if (currentUser) {
      setActiveTab(currentUser.role === 'BDE' ? 'leads' : 'dashboard');
    }
  }, [currentUser]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(INITIAL_CUSTOM_FIELDS);
  const [userTargets, setUserTargets] = useState<UserTarget[]>(MOCK_USER_TARGETS);
  const [teamTargets, setTeamTargets] = useState<TeamTarget[]>(MOCK_TEAM_TARGETS);

  // UI state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isNewLeadDropdownOpen, setIsNewLeadDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'ALL' | 'OVERDUE'>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [subStatusFilter, setSubStatusFilter] = useState('ALL');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadStats, setLeadStats] = useState<{ 
    totalValue: number; 
    meetingsCount: number; 
    overdueCount: number;
    industries: string[];
    sources: string[];
  }>({
    totalValue: 0,
    meetingsCount: 0,
    overdueCount: 0,
    industries: [],
    sources: []
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchLeads = React.useCallback(async () => {
    if (!currentUser) return;
    setLeadsLoading(true);
    const token = localStorage.getItem('lendkraft_token');
    try {
      const query = new URLSearchParams();
      if (stageFilter !== 'ALL') query.append('stage', stageFilter);
      if (searchQuery) query.append('search', searchQuery);
      if (industryFilter !== 'ALL') query.append('industry', industryFilter);
      if (sourceFilter !== 'ALL') query.append('source', sourceFilter);
      if (assigneeFilter !== 'ALL') query.append('assignedToId', assigneeFilter);
      
      query.append('page', currentPage.toString());
      query.append('limit', pageSize.toString());

      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Backend wraps response as: { statusCode, data: { data: [...], meta: {...} }, message }
        const rawLeads = data.data?.data || [];
        const mapped: Lead[] = rawLeads.map((l: any) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email || '',
          designation: l.designation || '',
          industry: l.industry || '',
          source: l.source || '',
          value: l.value ?? 0,
          stage: l.stage as LeadStage,
          remarks: l.remarks || '',
          linkedIn: l.linkedIn || '',
          location: l.location || '',
          companyName: l.companyName || '',
          companyWebsite: l.companyWebsite || '',
          product: l.product || '',
          state: l.state || '',
          city: l.city || '',
          assignedToId: l.assignedToId,
          subStatus: l.subStatus,
          teamId: l.teamId,
          nextFollowUp: l.nextFollowUp || undefined,
          lastFollowUp: l.lastFollowUp || undefined,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        }));
        setLeads(mapped);
        
        // Ensure we use the GLOBAL total from stats for the KPI
        if (data.data?.meta?.stats) {
          const stats = data.data.meta.stats;
          setLeadStats(stats);
          setTotalLeads(stats.totalLeads); // <--- This ensures the KPI uses the non-filtered count
        } else {
          setTotalLeads(data.data?.meta?.total || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLeadsLoading(false);
    }
  }, [currentUser, stageFilter, searchQuery, industryFilter, sourceFilter, assigneeFilter, currentPage, pageSize]);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [stageFilter, searchQuery, industryFilter, sourceFilter, assigneeFilter]);

  // Fetch all users for name-mapping and assignment
  React.useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem('lendkraft_token');
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const json = await res.json();
        const apiUsers = json.data || [];
        if (apiUsers.length > 0) {
          setUsers(apiUsers);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const [isUploading, setIsUploading] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetMonth] = useState('2024-03');
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: 'REMINDER' | 'INFO' }[]>([]);
  const [notifiedTaskIds, setNotifiedTaskIds] = useState<Set<string>>(new Set());
  const [notifiedOverdueLeadIds, setNotifiedOverdueLeadIds] = useState<Set<string>>(new Set());

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
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [notifiedOverdueLeadIds, users]);

  // --- Helpers ---
  const isTaskOverdue = (task: Task) => task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();
  const isFollowUpOverdue = (lead: Lead) => {
    if (!lead.nextFollowUp) return false;
    if (['PAYMENT_COMPLETED', 'HANDED_OVER', 'NOT_INTERESTED', 'DND', 'LOST'].includes(lead.stage)) return false;
    return new Date(lead.nextFollowUp) < new Date();
  };

  const filteredLeads = leads.filter(lead => {
    if (!currentUser) return false;

    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) || (lead.industry || '').toLowerCase().includes(searchQuery.toLowerCase());
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
  const handleAddNote = async (leadId: string, content: string) => {
    if (!content.trim()) return;
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: 'NOTE', content }),
      });
      if (res.ok) {
        const json = await res.json();
        const newActivity = json.data;
        setActivities(prev => [newActivity, ...prev]);
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleSetFollowUp = async (leadId: string, date: string) => {
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nextFollowUp: new Date(date).toISOString() }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, nextFollowUp: date } : l));
        if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, nextFollowUp: date } : null);
      }
    } catch (err) {
      console.error('Error setting follow-up:', err);
    }
  };

  // Fetch activities, tasks, and attachments for selected lead
  React.useEffect(() => {
    if (selectedLead) {
      const fetchData = async () => {
        const token = localStorage.getItem('lendkraft_token');
        try {
          const [actRes, taskRes, attRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/leads/${selectedLead.id}/activities`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${import.meta.env.VITE_API_URL}/tasks?leadId=${selectedLead.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${import.meta.env.VITE_API_URL}/leads/${selectedLead.id}/attachments`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          if (actRes.ok) {
            const json = await actRes.json();
            setActivities(json.data || []);
          }
          if (taskRes.ok) {
            const json = await taskRes.json();
            setTasks(json.data || []);
          }
          if (attRes.ok) {
            const json = await attRes.json();
            setAttachments(json.data || []);
          }
        } catch (err) {
          console.error('Error fetching lead data:', err);
        }
      };
      fetchData();
    } else {
      setTasks([]);
      setActivities([]);
      setAttachments([]);
    }
  }, [selectedLead?.id]);

  // Fetch global activities for Stage History page
  React.useEffect(() => {
    if (activeTab === 'stage-history') {
      const fetchGlobalActivities = async () => {
        const token = localStorage.getItem('lendkraft_token');
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/activities?type=STAGE_CHANGE,LEAD_CREATED&limit=200`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            setActivities(json.data || []);
          }
        } catch (err) {
          console.error('Error fetching global activities:', err);
        }
      };
      fetchGlobalActivities();
    }
  }, [activeTab]);

  const handleAddTask = async (leadId: string, title: string, dueDate: string, priority: 'LOW' | 'MEDIUM' | 'HIGH', reminderAt?: string) => {
    if (!title.trim()) return;
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          leadId, 
          title, 
          dueDate: new Date(dueDate).toISOString(), 
          priority,
          reminderAt: reminderAt ? new Date(reminderAt).toISOString() : undefined
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setTasks(prev => [json.data, ...prev]);
        
        // Refresh activities to show the task creation
        const actRes = await fetch(`${import.meta.env.VITE_API_URL}/leads/${leadId}/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (actRes.ok) {
          const actJson = await actRes.json();
          setActivities(actJson.data || []);
        }
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        
        // Refresh activities if completed
        if (newStatus === 'COMPLETED') {
          const actRes = await fetch(`${import.meta.env.VITE_API_URL}/leads/${task.leadId}/activities`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (actRes.ok) {
            const actJson = await actRes.json();
            setActivities(actJson.data || []);
          }
        }
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleUpdateLead = async (leadId: string, data: Partial<Lead>) => {
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l));
        if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (err) {
      console.error('Error updating lead:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLead) return;
    const token = localStorage.getItem('lendkraft_token');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/${selectedLead.id}/attachments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        setAttachments(prev => [json.data, ...prev]);
        // Re-fetch activities so the ATTACHMENT entry appears in Activity History
        const actRes = await fetch(`${import.meta.env.VITE_API_URL}/leads/${selectedLead.id}/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (actRes.ok) {
          const actJson = await actRes.json();
          setActivities(actJson.data || []);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Upload failed:', err.message || res.statusText);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        // Re-fetch activities so the ATTACHMENT_DELETED entry appears in Activity History
        if (selectedLead) {
          const actRes = await fetch(`${import.meta.env.VITE_API_URL}/leads/${selectedLead.id}/activities`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (actRes.ok) {
            const actJson = await actRes.json();
            setActivities(actJson.data || []);
          }
        }
      }
    } catch (err) {
      console.error('Error deleting attachment:', err);
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

  const handleReassign = async (leadId: string, newUserId: string) => {
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assignedToId: newUserId }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedToId: newUserId, updatedAt: new Date().toISOString() } : l));
        if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, assignedToId: newUserId } : null);
      }
    } catch (err) {
      console.error('Error reassigning lead:', err);
    }
  };

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email address'); return; }
    setEmailError(null);
    const leadCustomFields: Record<string, any> = {};
    customFields.forEach(field => { const value = formData.get(`cf_${field.id}`); if (value) leadCustomFields[field.id] = value; });
    
    const leadData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || undefined,
      designation: formData.get('designation') as string || undefined,
      industry: formData.get('industry') as string || undefined,
      source: formData.get('source') as string || undefined,
      linkedIn: formData.get('linkedIn') as string || undefined,
      location: formData.get('location') as string || undefined,
      companyName: formData.get('companyName') as string || undefined,
      companyLocation: formData.get('companyLocation') as string || undefined,
      companyWebsite: formData.get('companyWebsite') as string || undefined,
      product: formData.get('product') as string || undefined,
      state: formData.get('state') as string || undefined,
      city: formData.get('city') as string || undefined,
      assignedToId: formData.get('assignedToId') as string || currentUser?.id,
      teamId: currentUser?.teamId || 'default-team',
    };

    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(leadData),
      });
      if (res.ok) {
        const json = await res.json();
        const newLead = json.data;
        setLeads(prev => [newLead, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Error adding lead:', err);
    }
  };

  const handleUpdateStage = async (leadId: string, newStage: LeadStage) => {
    const lead = leads.find(l => l.id === leadId); if (!lead) return;
    const oldStage = lead.stage;
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, updatedAt: new Date().toISOString() } : l));
        if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, stage: newStage } : null);
        
        // Refresh activities to show the automatic stage change activity from backend
        const actRes = await fetch(`${import.meta.env.VITE_API_URL}/leads/${leadId}/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (actRes.ok) {
          const actJson = await actRes.json();
          setActivities(actJson.data || []);
        }
      }
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    const lead = leads.find(l => l.id === id);
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
        setSelectedLead(null);
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const downloadTemplate = () => {
    const csvContent = ['Lead Name', 'Mobile Number', 'Industry', 'Designation', 'Product', 'State', 'City'].join(',') + '\n';
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.setAttribute('download', 'lead_template.csv'); link.style.visibility = 'hidden';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const processBulkLeads = async (data: any[]) => {
    setLeadsLoading(true);
    const token = localStorage.getItem('lendkraft_token');
    
    const mappedLeads = data.map((row) => {
      // Support 'Exe' column (like in the seed script)
      const assignedBdeName = row['Exe'] || row['exe'] || row['BDE Name'] || row['Assigned BDE'] || row['Assigned To'] || '';
      const normalized = String(assignedBdeName).trim().toLowerCase();
      const matchedUser = users.find(u => 
        u.name.toLowerCase() === normalized ||
        u.name.toLowerCase().includes(normalized) ||
        normalized.includes(u.name.toLowerCase())
      );

      return {
        name: row['Lead Name'] || row['name'] || 'Unknown',
        phone: String(row['Mobile Number'] || row['phone'] || ''),
        email: row['Email'] || row['email'] || '',
        designation: row['Designation'] || row['designation'] || '',
        industry: row['Industry'] || row['industry'] || '',
        product: row['Product'] || row['product'] || '',
        state: row['State'] || row['state'] || '',
        city: row['City'] || row['city'] || '',
        source: 'Bulk Upload',
        value: 0,
        stage: 'YET_TO_CALL',
        assignedToId: matchedUser?.id || currentUser?.id,
        teamId: matchedUser?.teamId || currentUser?.teamId || 'DEFAULT_TEAM',
      };
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leads/bulk`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(mappedLeads),
      });

      if (!res.ok) throw new Error('Failed to bulk upload leads');

      setIsBulkModalOpen(false);
      setNotifications(prev => [{ id: Date.now().toString(), title: 'Bulk Upload Success', message: `Successfully uploaded ${mappedLeads.length} leads.`, type: 'INFO' }, ...prev]);
      
      // Trigger a refetch of leads
      const getLeadsRes = await fetch(`${import.meta.env.VITE_API_URL}/leads?limit=500`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (getLeadsRes.ok) {
        const json = await getLeadsRes.json();
        const mapped: Lead[] = (json.data?.data || []).map((l: any) => ({
          id: l.id, name: l.name, phone: l.phone, email: l.email || '',
          designation: l.designation || '', industry: l.industry || '',
          source: l.source || '', value: l.value ?? 0, stage: l.stage as LeadStage,
          remarks: l.remarks || '', assignedToId: l.assignedToId, teamId: l.teamId,
          createdAt: l.createdAt, updatedAt: l.updatedAt
        }));
        setLeads(mapped);
      }
    } catch (err) {
      console.error('Error during bulk upload:', err);
      setNotifications(prev => [{ id: Date.now().toString(), title: 'Upload Failed', message: 'Failed to process bulk upload. Please try again.', type: 'REMINDER' }, ...prev]);
    } finally {
      setLeadsLoading(false);
    }
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
  };

  const handleUpdateUserTarget = (target: UserTarget) => {
    setUserTargets(prev => prev.find(t => t.id === target.id) ? prev.map(t => t.id === target.id ? target : t) : [...prev, target]);
  };

  const handleUpdateUser = async (id: string, data: Partial<User>) => {
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('lendkraft_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center gap-6 text-slate-400">
      <div className="w-12 h-12 border-4 border-white/10 border-t-brand-500 rounded-full animate-spin" />
      <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Authenticating Session...</p>
    </div>
  );

  if (!currentUser) {
    if (authView === 'reset_password') {
      const token = new URLSearchParams(window.location.search).get('token') || '';
      return <ResetPassword token={token} onBackToLogin={() => {
        window.history.pushState({}, '', '/');
        setAuthView('login');
      }} />;
    }
    if (authView === 'forgot_password') {
      return <ForgotPassword onBackToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} onForgotPassword={() => setAuthView('forgot_password')} />;
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
          {activeTab === 'dashboard' && <Dashboard token={token} />}

          {activeTab === 'leads' && (
            <LeadsPage
              leads={leads} currentUser={currentUser}
              stageFilter={stageFilter} setStageFilter={setStageFilter}
              dateRangeFilter={dateRangeFilter} setDateRangeFilter={setDateRangeFilter}
              startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
              industryFilter={industryFilter} setIndustryFilter={setIndustryFilter}
              sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
              assigneeFilter={assigneeFilter} setAssigneeFilter={setAssigneeFilter}
              
              isMoreFiltersOpen={isMoreFiltersOpen} setIsMoreFiltersOpen={setIsMoreFiltersOpen}
              users={users} onSelectLead={setSelectedLead} onExport={handleExport}
              isFollowUpOverdue={isFollowUpOverdue}
              pageSize={pageSize} setPageSize={setPageSize}
              currentPage={currentPage} setCurrentPage={setCurrentPage}
              totalLeads={totalLeads}
              leadStats={leadStats}
            />
          )}

          {activeTab === 'targets' && (
            <TargetsPage
              leads={leads} users={users} teamTargets={teamTargets} userTargets={userTargets}
              currentUser={currentUser} onOpenTargetModal={() => setIsTargetModalOpen(true)}
            />
          )}

          {activeTab === 'stage-history' && <StageHistoryPage users={users} />}
          {activeTab === 'clients' && <ClientsPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'users' && (
            <UserManagement 
              users={users} 
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsPage 
              user={currentUser} 
              users={users} 
              onUpdateUser={handleUpdateUser}
            />
          )}
        </div>

        {/* Lead Detail Panel */}
        <LeadDetailPanel
          selectedLead={selectedLead} onClose={() => setSelectedLead(null)}
          currentUser={currentUser} activities={activities} tasks={tasks}
          attachments={attachments}
          customFields={customFields} isUploading={isUploading}
          onAddNote={handleAddNote} onAddTask={handleAddTask}
          onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask}
          onSetFollowUp={handleSetFollowUp} onUpdateStage={handleUpdateStage}
          onDeleteLead={handleDeleteLead} onReassign={handleReassign}
          onFileUpload={handleFileUpload} onDeleteAttachment={handleDeleteAttachment}
          isFollowUpOverdue={isFollowUpOverdue}
          isTaskOverdue={isTaskOverdue} onUpdateLead={handleUpdateLead}
          users={users}
          apiUrl={import.meta.env.VITE_API_URL}
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
            leadStats={leadStats}
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
