import React from 'react';
import {
  X, Briefcase, Phone, Mail, ExternalLink, UserCircle, Bell, ArrowRight,
  CheckSquare, FileText, Paperclip, MessageSquare, Trash2, Download, Clock,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, LeadStage, Activity, Task, User } from '../types';
import { STAGE_CONFIG } from '../types';
import { MOCK_USERS } from '../mockData';
import { CustomFieldDefinition } from '../types';
import { cn, formatCurrency, formatDate, formatDateTime } from '../lib/utils';

interface LeadDetailPanelProps {
  selectedLead: Lead | null;
  onClose: () => void;
  currentUser: User;
  activities: Activity[];
  tasks: Task[];
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
  isFollowUpOverdue: (lead: Lead) => boolean;
  isTaskOverdue: (task: Task) => boolean;
}

export const LeadDetailPanel = ({
  selectedLead, onClose, currentUser, activities, tasks, customFields, isUploading,
  onAddNote, onAddTask, onToggleTask, onDeleteTask, onSetFollowUp,
  onUpdateStage, onDeleteLead, onReassign, onFileUpload,
  isFollowUpOverdue, isTaskOverdue
}: LeadDetailPanelProps) => {
  const [activeDetailTab, setActiveDetailTab] = React.useState<'ACTIVITY' | 'TASKS' | 'ATTACHMENTS' | 'HANDOFF' | 'HISTORY'>('ACTIVITY');
  const [activityFilter, setActivityFilter] = React.useState<Activity['type'] | 'ALL'>('ALL');

  if (!selectedLead) return null;

  return (
    <AnimatePresence>
      {selectedLead && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-30"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedLead.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("status-pill", STAGE_CONFIG[selectedLead.stage].color)}>
                      {STAGE_CONFIG[selectedLead.stage].label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {selectedLead.industry}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Contact info */}
              <div className="p-6 grid grid-cols-2 gap-6 border-b border-slate-100">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-slate-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedLead.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-slate-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedLead.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ExternalLink size={16} className="text-slate-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn</p>
                      <p className="text-sm font-semibold text-slate-900 truncate max-w-[150px]">
                        {selectedLead.linkedIn ? (
                          <a href={selectedLead.linkedIn.startsWith('http') ? selectedLead.linkedIn : `https://${selectedLead.linkedIn}`}
                            target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                            {selectedLead.linkedIn}
                          </a>
                        ) : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserCircle size={16} className="text-slate-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designation</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedLead.designation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company & Location */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Lead Location', val: selectedLead.location },
                    { label: 'Company Name', val: selectedLead.companyName },
                    { label: 'Product', val: selectedLead.product },
                    { label: 'Company Location', val: selectedLead.companyLocation },
                    { label: 'State / City', val: selectedLead.state || selectedLead.city ? `${selectedLead.state || ''}${selectedLead.state && selectedLead.city ? ', ' : ''}${selectedLead.city || ''}` : null },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-sm font-semibold text-slate-900">{val || 'Not set'}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company Website</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedLead.companyWebsite ? (
                        <a href={selectedLead.companyWebsite.startsWith('http') ? selectedLead.companyWebsite : `https://${selectedLead.companyWebsite}`}
                          target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                          {selectedLead.companyWebsite}
                        </a>
                      ) : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-2 gap-6">
                    {customFields.map(field => (
                      <div key={field.id}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{field.label}</p>
                        <p className="text-sm font-semibold text-slate-900">{selectedLead.customFields?.[field.id] || 'Not set'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reassign */}
              {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_ADMIN' || currentUser.role === 'TEAM_LEAD') && (
                <div className="p-6 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reassign Lead</p>
                  <div className="flex items-center gap-3">
                    <select
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      value={selectedLead.assignedToId}
                      onChange={(e) => onReassign(selectedLead.id, e.target.value)}
                    >
                      {MOCK_USERS.filter(u => {
                        if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_ADMIN') return true;
                        if (currentUser.role === 'TEAM_LEAD') return u.teamId === currentUser.teamId;
                        return false;
                      }).map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.role.replace('_', ' ')})</option>
                      ))}
                    </select>
                    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                      <img src={MOCK_USERS.find(u => u.id === selectedLead.assignedToId)?.avatar} alt="Assigned" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-up */}
              <div className="p-6 border-b border-slate-100 bg-brand-50/30">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Follow-up</p>
                  {selectedLead.nextFollowUp && (
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">Scheduled</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="datetime-local"
                    className={cn("flex-1 p-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                      isFollowUpOverdue(selectedLead) ? "border-red-300 text-red-600" : "border-slate-200")}
                    defaultValue={selectedLead.nextFollowUp ? new Date(selectedLead.nextFollowUp).toISOString().slice(0, 16) : ''}
                    onChange={(e) => onSetFollowUp(selectedLead.id, e.target.value)}
                  />
                  <button className={cn("p-2 bg-white border rounded-lg transition-colors",
                    isFollowUpOverdue(selectedLead) ? "border-red-300 text-red-600" : "border-slate-200 text-slate-400 hover:text-brand-600")}>
                    <Bell size={18} />
                  </button>
                </div>
                {isFollowUpOverdue(selectedLead) && (
                  <p className="text-[10px] font-bold text-red-500 mt-2 flex items-center gap-1 uppercase tracking-widest">
                    <Clock size={10} />Overdue
                  </p>
                )}
              </div>

              {/* Stage */}
              <div className="p-6 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lead Status</p>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  value={selectedLead.stage}
                  onChange={(e) => onUpdateStage(selectedLead.id, e.target.value as LeadStage)}
                >
                  {(Object.keys(STAGE_CONFIG) as LeadStage[]).map(stage => (
                    <option key={stage} value={stage}>{STAGE_CONFIG[stage].label}</option>
                  ))}
                </select>
              </div>

              {/* Activity Tabs */}
              <div className="p-6">
                <div className="flex items-center gap-6 border-b border-slate-100 mb-6">
                  {(['ACTIVITY', 'TASKS', 'ATTACHMENTS', 'HISTORY'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveDetailTab(tab)}
                      className={cn("pb-3 text-sm font-bold transition-all relative",
                        activeDetailTab === tab ? "text-brand-600" : "text-slate-400 hover:text-slate-600")}>
                      {tab === 'ACTIVITY' ? 'Activity History' : tab === 'TASKS' ? 'Create Tasks' : tab === 'ATTACHMENTS' ? 'Upload Files' : 'History'}
                      {activeDetailTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
                    </button>
                  ))}
                  {selectedLead.stage === 'PAYMENT_COMPLETED' && (
                    <button onClick={() => setActiveDetailTab('HANDOFF')}
                      className={cn("pb-3 text-sm font-bold transition-all relative flex items-center gap-1",
                        activeDetailTab === 'HANDOFF' ? "text-emerald-600" : "text-slate-400 hover:text-slate-600")}>
                      <ArrowRight size={14} />Handoff
                      {activeDetailTab === 'HANDOFF' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Activity */}
                  {activeDetailTab === 'ACTIVITY' && (
                    <>
                      <div className="relative mb-6">
                        <textarea id="note-input" placeholder="Log a call, add a note, or record an update..."
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none h-24" />
                        <div className="absolute bottom-3 right-3">
                          <button
                            onClick={() => {
                              const input = document.getElementById('note-input') as HTMLTextAreaElement;
                              onAddNote(selectedLead.id, input.value);
                              input.value = '';
                            }}
                            className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-all flex items-center gap-2">
                            <MessageSquare size={14} />Post
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                        {(['ALL', 'NOTE', 'TASK', 'ATTACHMENT', 'STAGE_CHANGE'] as const).map(f => (
                          <button key={f} onClick={() => setActivityFilter(f)}
                            className={cn("px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap",
                              activityFilter === f ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
                            {f === 'ALL' ? 'All' : f === 'STAGE_CHANGE' ? 'Status Changes' : f === 'NOTE' ? 'Notes' : f === 'TASK' ? 'Tasks' : 'Attachments'}
                          </button>
                        ))}
                      </div>
                      <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {activities.filter(a => a.leadId === selectedLead.id && (activityFilter === 'ALL' || a.type === activityFilter)).map(activity => (
                          <div key={activity.id} className="relative pl-10">
                            <div className={cn("absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white z-10",
                              activity.type === 'STAGE_CHANGE' ? "bg-blue-50 text-blue-600" :
                              activity.type === 'TASK' ? "bg-amber-50 text-amber-600" :
                              activity.type === 'ATTACHMENT' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                              {activity.type === 'STAGE_CHANGE' ? <ArrowRight size={14} /> :
                               activity.type === 'TASK' ? <CheckSquare size={14} /> :
                               activity.type === 'ATTACHMENT' ? <Paperclip size={14} /> : <FileText size={14} />}
                            </div>
                            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{MOCK_USERS.find(u => u.id === activity.createdBy)?.name}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 rounded">{activity.type.replace('_', ' ')}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">{formatDate(activity.createdAt)}</span>
                              </div>
                              <p className="text-sm text-slate-600">{activity.content}</p>
                              {activity.metadata?.fileName && (
                                <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-red-500 shadow-sm"><FileText size={14} /></div>
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-700">{activity.metadata.fileName}</p>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase">{activity.metadata.size}</p>
                                    </div>
                                  </div>
                                  <button className="p-1.5 text-slate-400 hover:text-brand-600"><Download size={14} /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Tasks */}
                  {activeDetailTab === 'TASKS' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Task Title</label>
                          <input id="task-title" placeholder="e.g., Send revised proposal..."
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Due Date &amp; Time</label>
                            <input id="task-date" type="datetime-local"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Reminder At</label>
                            <input id="task-reminder" type="datetime-local"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none" />
                          </div>
                          <div className="w-1/4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Priority</label>
                            <select id="task-priority"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const title = (document.getElementById('task-title') as HTMLInputElement).value;
                            const date = (document.getElementById('task-date') as HTMLInputElement).value;
                            const reminder = (document.getElementById('task-reminder') as HTMLInputElement).value;
                            const priority = (document.getElementById('task-priority') as HTMLSelectElement).value as any;
                            onAddTask(selectedLead.id, title, date || new Date().toISOString(), priority, reminder || undefined);
                            (document.getElementById('task-title') as HTMLInputElement).value = '';
                            (document.getElementById('task-date') as HTMLInputElement).value = '';
                            (document.getElementById('task-reminder') as HTMLInputElement).value = '';
                          }}
                          className="w-full py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-all">
                          Create Task
                        </button>
                      </div>
                      <div className="space-y-3 mt-6">
                        {tasks.filter(t => t.leadId === selectedLead.id).map(task => (
                          <div key={task.id} className={cn("p-4 border rounded-xl flex items-center justify-between group",
                            isTaskOverdue(task) ? "bg-red-50/50 border-red-100" : "bg-white border-slate-200")}>
                            <div className="flex items-center gap-3">
                              <button onClick={() => onToggleTask(task.id)}
                                className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                  task.status === 'COMPLETED' ? "bg-brand-600 border-brand-600" :
                                  isTaskOverdue(task) ? "border-red-300 bg-white" : "border-slate-200 group-hover:border-brand-400")}>
                                {task.status === 'COMPLETED' && <CheckSquare size={12} className="text-white" />}
                              </button>
                              <div>
                                <p className={cn("text-sm font-bold", task.status === 'COMPLETED' ? "text-slate-400 line-through" : isTaskOverdue(task) ? "text-red-900" : "text-slate-900")}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={cn("text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest", isTaskOverdue(task) ? "text-red-500" : "text-slate-400")}>
                                    <Clock size={10} />Due {formatDateTime(task.dueDate)}
                                  </span>
                                  {isTaskOverdue(task) && <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase bg-red-600 text-white animate-pulse">OVERDUE</span>}
                                </div>
                              </div>
                            </div>
                            <button onClick={() => onDeleteTask(task.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {activeDetailTab === 'ATTACHMENTS' && (
                    <div className="space-y-4">
                      <input type="file" id="file-upload" className="hidden"
                        accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx" onChange={onFileUpload} />
                      <div onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
                        className={cn("p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 transition-all group cursor-pointer",
                          isUploading && "opacity-50 cursor-not-allowed")}>
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-2" />
                            <p className="text-sm font-bold text-slate-900">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <Paperclip size={32} className="mb-2 group-hover:text-brand-600 transition-colors" />
                            <p className="text-sm font-bold text-slate-900">Click to upload or drag and drop</p>
                            <p className="text-xs">PDF, PPT, Excel, Docs up to 10MB</p>
                          </>
                        )}
                      </div>
                      {activities.filter(a => a.leadId === selectedLead.id && a.type === 'ATTACHMENT').map(activity => {
                        const fileName = activity.metadata?.fileName || 'Document.pdf';
                        const ext = fileName.split('.').pop()?.toLowerCase();
                        const iconColor = ['xls', 'xlsx', 'csv'].includes(ext || '') ? "bg-emerald-50 text-emerald-600" :
                          ['ppt', 'pptx'].includes(ext || '') ? "bg-orange-50 text-orange-600" :
                          ['doc', 'docx'].includes(ext || '') ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600";
                        const Icon = ['xls', 'xlsx', 'csv'].includes(ext || '') ? FileSpreadsheet : FileText;
                        return (
                          <div key={activity.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconColor)}><Icon size={20} /></div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{fileName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{activity.metadata?.size || '2.4 MB'} • Added {formatDate(activity.createdAt)}</p>
                              </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-brand-600"><Download size={18} /></button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* History */}
                  {activeDetailTab === 'HISTORY' && (
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
                        <div className="space-y-8">
                          {activities
                            .filter(a => a.leadId === selectedLead.id && a.type === 'STAGE_CHANGE')
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((activity, idx, arr) => (
                              <div key={activity.id} className="relative pl-10">
                                <div className={cn("absolute left-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10",
                                  idx === arr.length - 1 ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400")}>
                                  <Clock size={14} />
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                  <p className="text-sm font-bold text-slate-900 mb-1">{activity.content}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-medium text-slate-400">{formatDateTime(activity.createdAt)}</p>
                                    <span className="text-slate-300">•</span>
                                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">
                                      {MOCK_USERS.find(u => u.id === activity.createdBy)?.name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Handoff */}
                  {activeDetailTab === 'HANDOFF' && (
                    <div className="space-y-6">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4 text-emerald-700">
                          <CheckSquare size={20} />
                          <h4 className="text-sm font-bold uppercase tracking-widest">Split-Mapping Handoff</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Agent Count</label>
                              <input type="number" defaultValue="10" className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Talk Time (Hrs/Mo)</label>
                              <input type="number" defaultValue="500" className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                            </div>
                          </div>
                          <button className="w-full py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                            Complete Handoff to AM
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentUser.role !== 'BDE' && (
                  <button onClick={() => onDeleteLead(selectedLead.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
                <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                  <ExternalLink size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all">Close</button>
                <button className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-all">Save Changes</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
