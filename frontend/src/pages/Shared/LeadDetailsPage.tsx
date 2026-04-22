import React from 'react';
import {
  X, Briefcase, Phone, Mail, UserCircle, Bell, ArrowRight,
  CheckSquare, FileText, Paperclip, MessageSquare, Trash2, Download, Clock,
  FileSpreadsheet, ChevronLeft, TrendingUp, Calendar
} from 'lucide-react';
import { Lead, LeadStage, Activity, Task, User } from '@/types';
import { STAGE_CONFIG } from '@/types';
import { CustomFieldDefinition } from '@/types';
import { cn, formatCurrency, formatDate, formatDateTime } from '@lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LeadDetailsPageProps {
  selectedLead: Lead;
  onBack: () => void;
  currentUser: User;
  activities: Activity[];
  tasks: Task[];
  attachments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    createdAt: string;
    uploadedBy: { id: string; name: string };
  }>;
  customFields: CustomFieldDefinition[];
  isUploading: boolean;
  onAddNote: (leadId: string, content: string) => void;
  onAddTask: (leadId: string, title: string, dueDate: string, priority: 'LOW' | 'MEDIUM' | 'HIGH', reminderAt?: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSetFollowUp: (leadId: string, date: string) => void;
  onUpdateStage: (leadId: string, newStage: LeadStage) => void;
  onDeleteLead: (id: string) => void;
  onReassign: (leadId: string, userId: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAttachment: (id: string) => void;
  isFollowUpOverdue: (lead: Lead) => boolean;
  isTaskOverdue: (task: Task) => boolean;
  onUpdateLead: (leadId: string, data: Partial<Lead>) => void;
  users: User[];
  apiUrl: string;
}

export const LeadDetailsPage = ({
  selectedLead, onBack, currentUser, activities, tasks, attachments, customFields, isUploading,
  onAddNote, onAddTask, onToggleTask, onDeleteTask, onSetFollowUp,
  onUpdateStage, onDeleteLead, onReassign, onFileUpload, onDeleteAttachment,
  isFollowUpOverdue, isTaskOverdue, onUpdateLead, users, apiUrl
}: LeadDetailsPageProps) => {
  const [activeDetailTab, setActiveDetailTab] = React.useState<'ACTIVITY' | 'TASKS' | 'ATTACHMENTS' | 'HANDOFF'>('ACTIVITY');
  const [activityFilter, setActivityFilter] = React.useState<string>('ALL');

  const [localLead, setLocalLead] = React.useState<Partial<Lead>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (selectedLead) {
      setLocalLead({
        companyName: selectedLead.companyName || '',
        companyWebsite: selectedLead.companyWebsite || '',
        companyLocation: selectedLead.companyLocation || '',
        location: selectedLead.location || '',
        product: selectedLead.product || '',
        callType: selectedLead.callType || '',
        value: selectedLead.value || 0,
        remarks: selectedLead.remarks || '',
      });
    }
  }, [selectedLead?.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateLead(selectedLead.id, localLead);
      onBack(); // Navigate back to all leads
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedLead.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", STAGE_CONFIG[selectedLead.stage].color)}>
                  {STAGE_CONFIG[selectedLead.stage].label}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">• {selectedLead.industry}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {currentUser.role !== 'BDE' && (
            <button onClick={() => {
              if (window.confirm('Are you sure you want to delete this lead?')) {
                onDeleteLead(selectedLead.id);
                onBack();
              }
            }} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Phone size={16} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                </div>
                <p className="text-sm font-bold text-slate-900">{selectedLead.phone}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Mail size={16} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">{selectedLead.email || 'Not set'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><UserCircle size={16} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</p>
                </div>
                <p className="text-sm font-bold text-slate-900">{selectedLead.designation || 'Not set'}</p>
              </div>
            </div>

            {/* Editable Information Sections */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={16} className="text-brand-600" /> Lead Context
                </h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'Lead Location', key: 'location' },
                  { label: 'Company Name', key: 'companyName' },
                  { label: 'Product', key: 'product' },
                  { label: 'Call Type', key: 'callType' },
                  { label: 'Pipeline Value', key: 'value', type: 'number' },
                  { label: 'Company Location', key: 'companyLocation' },
                ].map(({ label, key, type }) => (
                  <div key={label} className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <input 
                      type={type || 'text'}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      value={(localLead as any)[key] || ''}
                      onChange={(e) => setLocalLead(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      placeholder={`Enter ${label}...`}
                    />
                  </div>
                ))}
                <div className="md:col-span-2 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Website</p>
                  <input 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    value={localLead.companyWebsite || ''}
                    onChange={(e) => setLocalLead(prev => ({ ...prev, companyWebsite: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Activity / Tabs Section */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-8 px-8 border-b border-slate-100 bg-white sticky top-0 z-10 overflow-x-auto no-scrollbar">
                {(['ACTIVITY', 'TASKS', 'ATTACHMENTS'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveDetailTab(tab)}
                    className={cn("py-6 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap",
                      activeDetailTab === tab ? "text-brand-600" : "text-slate-400 hover:text-slate-600")}>
                    {tab === 'ACTIVITY' ? 'Timeline' : tab === 'TASKS' ? 'Action Items' : 'Documents'}
                    {activeDetailTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-full" />}
                  </button>
                ))}
                {selectedLead.stage === 'PAYMENT_COMPLETED' && (
                  <button onClick={() => setActiveDetailTab('HANDOFF')}
                    className={cn("py-6 text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2",
                      activeDetailTab === 'HANDOFF' ? "text-emerald-600" : "text-slate-400 hover:text-slate-600")}>
                    <ArrowRight size={14} />Handoff
                    {activeDetailTab === 'HANDOFF' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />}
                  </button>
                )}
              </div>

              <div className="p-8">
                {activeDetailTab === 'ACTIVITY' && (
                  <div className="space-y-8">
                    <div className="relative">
                      <textarea id="note-input" placeholder="Add a note or update for this lead..."
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none h-32 transition-all shadow-inner" />
                      <div className="absolute bottom-4 right-4">
                        <button
                          onClick={() => {
                            const input = document.getElementById('note-input') as HTMLTextAreaElement;
                            if (input.value.trim()) {
                              onAddNote(selectedLead.id, input.value);
                              input.value = '';
                            }
                          }}
                          className="px-6 py-2.5 bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-brand-700 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20">
                          <MessageSquare size={14} />Post Update
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                      {(['ALL', 'NOTE', 'TASK', 'ATTACHMENT', 'STAGE_CHANGE'] as const).map(f => (
                        <button key={f} onClick={() => setActivityFilter(f)}
                          className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border",
                            activityFilter === f ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>
                          {f === 'ALL' ? 'Everything' : f === 'STAGE_CHANGE' ? 'Status' : f === 'NOTE' ? 'Notes' : f === 'TASK' ? 'Tasks' : 'Files'}
                        </button>
                      ))}
                    </div>

                    <div className="relative space-y-8 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {activities.filter(a => a.leadId === selectedLead.id && (
                        activityFilter === 'ALL' ||
                        (activityFilter === 'ATTACHMENT' && ((a.type as string) === 'ATTACHMENT' || (a.type as string) === 'ATTACHMENT_DELETED')) ||
                        (a.type as string) === activityFilter
                      )).map(activity => (
                        <div key={activity.id} className="relative pl-12 group">
                          <div className={cn("absolute left-1 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white z-10 transition-transform group-hover:scale-110",
                            (activity.type as string) === 'STAGE_CHANGE' ? "bg-blue-600 text-white" :
                            (activity.type as string) === 'TASK' ? "bg-amber-500 text-white" :
                            (activity.type as string) === 'ATTACHMENT' ? "bg-emerald-500 text-white" :
                            (activity.type as string) === 'ATTACHMENT_DELETED' ? "bg-rose-500 text-white" : "bg-slate-400 text-white")}>
                            {(activity.type as string) === 'STAGE_CHANGE' ? <ArrowRight size={14} /> :
                             (activity.type as string) === 'TASK' ? <CheckSquare size={14} /> :
                             (activity.type as string) === 'ATTACHMENT' ? <Paperclip size={14} /> :
                             (activity.type as string) === 'ATTACHMENT_DELETED' ? <Trash2 size={14} /> : <FileText size={14} />}
                          </div>
                          <div className="p-6 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-900">{users.find(u => u.id === activity.createdBy)?.name || 'System'}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">{activity.type.replace('_', ' ')}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(activity.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{activity.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'TASKS' && (
                  <div className="space-y-8">
                    <div className="p-8 bg-slate-50 rounded-lg border border-slate-200 space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Task Description</label>
                        <input id="task-title" placeholder="e.g., Follow up with decision maker..."
                          className="w-full p-4 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deadline</label>
                          <input id="task-date" type="datetime-local"
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </div>
                        <div className="md:col-span-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Alert Me At</label>
                          <input id="task-reminder" type="datetime-local"
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </div>
                        <div className="md:col-span-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Level</label>
                          <select id="task-priority"
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                            <option value="LOW">Low Priority</option>
                            <option value="MEDIUM">Medium Priority</option>
                            <option value="HIGH">High Priority</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const title = (document.getElementById('task-title') as HTMLInputElement).value;
                          const date = (document.getElementById('task-date') as HTMLInputElement).value;
                          const reminder = (document.getElementById('task-reminder') as HTMLInputElement).value;
                          const priority = (document.getElementById('task-priority') as HTMLSelectElement).value as any;
                          if (title) {
                            onAddTask(selectedLead.id, title, date || new Date().toISOString(), priority, reminder || undefined);
                            (document.getElementById('task-title') as HTMLInputElement).value = '';
                          }
                        }}
                        className="w-full py-4 bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]">
                        Create Task Entry
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {tasks.filter(t => t.leadId === selectedLead.id).map(task => (
                        <div key={task.id} className={cn("p-6 border rounded-lg flex items-center justify-between group transition-all",
                          isTaskOverdue(task) ? "bg-red-50/30 border-red-100" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md")}>
                          <div className="flex items-center gap-4">
                            <button onClick={() => onToggleTask(task.id)}
                              className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                task.status === 'COMPLETED' ? "bg-emerald-500 border-emerald-500" :
                                isTaskOverdue(task) ? "border-red-400 bg-white" : "border-slate-300 group-hover:border-brand-500")}>
                              {task.status === 'COMPLETED' && <CheckSquare size={14} className="text-white" />}
                            </button>
                            <div>
                              <p className={cn("text-sm font-black", task.status === 'COMPLETED' ? "text-slate-400 line-through" : isTaskOverdue(task) ? "text-red-900" : "text-slate-900")}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className={cn("text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest", isTaskOverdue(task) ? "text-red-500" : "text-slate-400")}>
                                  <Clock size={12} />Due {formatDateTime(task.dueDate)}
                                </span>
                                {isTaskOverdue(task) && <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase bg-red-600 text-white">OVERDUE</span>}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => onDeleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'ATTACHMENTS' && (
                  <div className="space-y-8">
                    <input type="file" id="file-upload" className="hidden"
                      accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx,.csv" onChange={onFileUpload} />
                    <div onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
                      className={cn("p-12 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:bg-brand-50/20 transition-all group cursor-pointer",
                        isUploading && "opacity-50 cursor-not-allowed")}>
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
                          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Processing Upload...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all">
                            <Paperclip size={32} />
                          </div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Drop files here or click to browse</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2">Support for PDF, Excel, Word &amp; PPT up to 10MB</p>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attachments.map(att => {
                        const ext = att.fileName.split('.').pop()?.toLowerCase();
                        const colorClass = ['xls', 'xlsx', 'csv'].includes(ext || '') ? "bg-emerald-50 text-emerald-600" :
                          ['ppt', 'pptx'].includes(ext || '') ? "bg-orange-50 text-orange-600" :
                          ['doc', 'docx'].includes(ext || '') ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600";
                        const Icon = ['xls', 'xlsx', 'csv'].includes(ext || '') ? FileSpreadsheet : FileText;
                        return (
                          <div key={att.id} className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm", colorClass)}><Icon size={24} /></div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 truncate">{att.fileName}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                                  {(att.fileSize / 1024).toFixed(1)} KB • {formatDate(att.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('lendkraft_token');
                                    if (!token) return;
                                    const response = await fetch(`${apiUrl}/attachments/${att.id}/download`, {
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (!response.ok) throw new Error('Download failed');
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a'); a.href = url; a.download = att.fileName;
                                    document.body.appendChild(a); a.click();
                                    window.URL.revokeObjectURL(url); document.body.removeChild(a);
                                  } catch (error) { console.error(error); }
                                }}
                                className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                              ><Download size={18} /></button>
                              <button onClick={() => onDeleteAttachment(att.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Status & Workflow */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Stage</p>
                <div className={cn("p-4 rounded-lg border flex items-center justify-between font-black text-sm", STAGE_CONFIG[selectedLead.stage].color.replace('bg-', 'bg-opacity-50 border-'))}>
                  {STAGE_CONFIG[selectedLead.stage].label}
                  <TrendingUp size={16} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Update Status</p>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none"
                  value={selectedLead.stage}
                  onChange={(e) => onUpdateStage(selectedLead.id, e.target.value as LeadStage)}
                >
                  {(Object.keys(STAGE_CONFIG) as LeadStage[]).map(stage => (
                    <option key={stage} value={stage}>{STAGE_CONFIG[stage].label}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Follow-up Schedule</p>
                <div className={cn("p-4 rounded-lg border transition-all", isFollowUpOverdue(selectedLead) ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100")}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded-lg", isFollowUpOverdue(selectedLead) ? "bg-red-100 text-red-600" : "bg-brand-100 text-brand-600")}>
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">Next Interaction</p>
                      {isFollowUpOverdue(selectedLead) && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Overdue Action</p>}
                    </div>
                  </div>
                  <input
                    type="datetime-local"
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 mb-3"
                    defaultValue={selectedLead.nextFollowUp ? new Date(selectedLead.nextFollowUp).toISOString().slice(0, 16) : ''}
                    onChange={(e) => onSetFollowUp(selectedLead.id, e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 font-medium text-center">System will notify the assignee via dashboard and email.</p>
                </div>
              </div>
            </div>

            {/* Assignment Card */}
            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Assigned Executive</p>
               <div className="flex items-center gap-4 mb-6">
                 <div className="relative">
                   <img 
                     src={users.find(u => u.id === selectedLead.assignedToId)?.avatar || ''} 
                     alt="Assigned" 
                     className="w-14 h-14 rounded-lg object-cover border-2 border-slate-100 shadow-sm" 
                   />
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                 </div>
                 <div>
                   <p className="text-sm font-black text-slate-900">{users.find(u => u.id === selectedLead.assignedToId)?.name || 'Unassigned'}</p>
                   <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-0.5">Account Executive</p>
                 </div>
               </div>

               {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD' || currentUser.role === 'TEAM_LEAD') && (
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reassign Lead</label>
                   <select
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                     value={selectedLead.assignedToId}
                     onChange={(e) => onReassign(selectedLead.id, e.target.value)}
                   >
                     {users.filter(u => {
                       if (currentUser.role === 'SUPER_ADMIN') return ['SALES_HEAD', 'TEAM_LEAD', 'BDE'].includes(u.role);
                       if (currentUser.role === 'SALES_HEAD') return ['TEAM_LEAD', 'BDE'].includes(u.role);
                       if (currentUser.role === 'TEAM_LEAD') return u.role === 'BDE' && u.teamId === currentUser.teamId;
                       return false;
                     }).map(user => (
                       <option key={user.id} value={user.id}>{user.name} ({user.role.replace('_', ' ')})</option>
                     ))}
                   </select>
                 </div>
               )}
            </div>

            {/* Value Indicator */}
            <div className="bg-slate-900 p-6 rounded-lg shadow-sm text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp size={20} className="text-brand-400" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Pipeline Value</span>
              </div>
              <p className="text-2xl font-bold mb-1">{formatCurrency(selectedLead.value)}</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">Estimated potential value based on current discussions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
