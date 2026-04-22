import React from 'react';
import {
  X, Briefcase, Phone, Mail, UserCircle, Bell, ArrowRight,
  CheckSquare, FileText, Paperclip, MessageSquare, Trash2, Download, Clock,
  FileSpreadsheet
} from 'lucide-react';
import { Lead, LeadStage, Activity, Task, User } from '@/types';
import { STAGE_CONFIG } from '@/types';
import { CustomFieldDefinition } from '@/types';
import { cn, formatCurrency, formatDate, formatDateTime } from '@lib/utils';

interface LeadDetailPanelProps {
  selectedLead: Lead | null;
  onClose: () => void;
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

export const LeadDetailPanel = ({
  selectedLead, onClose, currentUser, activities, tasks, attachments, customFields, isUploading,
  onAddNote, onAddTask, onToggleTask, onDeleteTask, onSetFollowUp,
  onUpdateStage, onDeleteLead, onReassign, onFileUpload, onDeleteAttachment,
  isFollowUpOverdue, isTaskOverdue, onUpdateLead, users, apiUrl
}: LeadDetailPanelProps) => {
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
        remarks: selectedLead.remarks || '',
      });
    }
  }, [selectedLead?.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateLead(selectedLead.id, localLead);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedLead) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 z-30 transition-opacity animate-in fade-in duration-200"
      />
      <div
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-xl z-40 flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{selectedLead.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("status-pill", STAGE_CONFIG[selectedLead.stage].color)}>
                  {STAGE_CONFIG[selectedLead.stage].label}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• {selectedLead.industry}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact info */}
          <div className="p-5 grid grid-cols-2 gap-5 border-b border-slate-50 bg-slate-50/20">
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <Phone size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                  <p className="text-xs font-bold text-slate-900">{selectedLead.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                  <p className="text-xs font-bold text-slate-900">{selectedLead.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <UserCircle size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn</p>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {selectedLead.linkedIn ? (
                      <a href={selectedLead.linkedIn.startsWith('http') ? selectedLead.linkedIn : `https://${selectedLead.linkedIn}`}
                        target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                        {selectedLead.linkedIn}
                      </a>
                    ) : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <UserCircle size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Designation</p>
                  <p className="text-xs font-bold text-slate-900">{selectedLead.designation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company & Location */}
          <div className="p-5 border-b border-slate-50 bg-white">
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: 'Lead Location', key: 'location' },
                { label: 'Company Name', key: 'companyName' },
                { label: 'Product', key: 'product' },
                { label: 'Call Type', key: 'callType' },
                { label: 'Company Location', key: 'companyLocation' },
              ].map(({ label, key }) => (
                <div key={label}>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
                  <input 
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                    value={(localLead as any)[key] || ''}
                    onChange={(e) => setLocalLead(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${label}...`}
                  />
                </div>
              ))}
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Company Website</p>
                <input 
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  value={localLead.companyWebsite || ''}
                  onChange={(e) => setLocalLead(prev => ({ ...prev, companyWebsite: e.target.value }))}
                  placeholder="Enter website..."
                />
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="p-5 border-b border-slate-50 bg-slate-50/10">
              <div className="grid grid-cols-2 gap-5">
                {customFields.map(field => (
                  <div key={field.id}>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{field.label}</p>
                    <p className="text-xs font-bold text-slate-900">{selectedLead.customFields?.[field.id] || 'Not set'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reassign */}
          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD' || currentUser.role === 'TEAM_LEAD') && (
            <div className="p-5 border-b border-slate-50">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ownership</p>
              <div className="flex items-center gap-3">
                <select
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
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
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                  <img src={users.find(u => u.id === selectedLead.assignedToId)?.avatar || ''} alt="Assigned" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* Follow-up */}
          <div className="p-5 border-b border-slate-50 bg-brand-50/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Follow-up Schedule</p>
              {selectedLead.nextFollowUp && (
                <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">Scheduled</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                className={cn("flex-1 p-2 bg-white border rounded-lg text-xs focus:outline-none",
                  isFollowUpOverdue(selectedLead) ? "border-red-200 text-red-600" : "border-slate-200")}
                defaultValue={selectedLead.nextFollowUp ? new Date(selectedLead.nextFollowUp).toISOString().slice(0, 16) : ''}
                onChange={(e) => onSetFollowUp(selectedLead.id, e.target.value)}
              />
              <button className={cn("p-2 bg-white border rounded-lg transition-colors",
                isFollowUpOverdue(selectedLead) ? "border-red-200 text-red-600" : "border-slate-200 text-slate-400 hover:text-brand-600")}>
                <Bell size={16} />
              </button>
            </div>
          </div>

          {/* Activity Tabs */}
          <div className="p-5">
            <div className="flex items-center gap-5 border-b border-slate-100 mb-5">
              {(['ACTIVITY', 'TASKS', 'ATTACHMENTS'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveDetailTab(tab)}
                  className={cn("pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative",
                    activeDetailTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600")}>
                  {tab === 'ACTIVITY' ? 'Activity' : tab === 'TASKS' ? 'Tasks' : 'Files'}
                  {activeDetailTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
                </button>
              ))}
              {selectedLead.stage === 'PAYMENT_COMPLETED' && (
                <button key="handoff" onClick={() => setActiveDetailTab('HANDOFF')}
                  className={cn("pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative flex items-center gap-1",
                    activeDetailTab === 'HANDOFF' ? "text-emerald-600" : "text-slate-400 hover:text-slate-600")}>
                  Handoff
                  {activeDetailTab === 'HANDOFF' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {activeDetailTab === 'ACTIVITY' && (
                <>
                  <div className="relative mb-6">
                    <textarea id="note-input" placeholder="Add an internal note or record an update..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50 resize-none h-20" />
                    <div className="absolute bottom-2 right-2">
                      <button
                        onClick={() => {
                          const input = document.getElementById('note-input') as HTMLTextAreaElement;
                          if (!input.value.trim()) return;
                          onAddNote(selectedLead.id, input.value);
                          input.value = '';
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-slate-800 transition-colors flex items-center gap-2">
                        Post
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
                    {(['ALL', 'NOTE', 'TASK', 'ATTACHMENT', 'STAGE_CHANGE'] as const).map(f => (
                      <button key={f} onClick={() => setActivityFilter(f)}
                        className={cn("px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded border transition-colors",
                          activityFilter === f ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}>
                        {f === 'ALL' ? 'All' : f === 'STAGE_CHANGE' ? 'Status' : f === 'NOTE' ? 'Notes' : f === 'TASK' ? 'Tasks' : 'Files'}
                      </button>
                    ))}
                  </div>
                  <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                    {activities.filter(a => a.leadId === selectedLead.id && (
                      activityFilter === 'ALL' ||
                      (activityFilter === 'ATTACHMENT' && ((a.type as string) === 'ATTACHMENT' || (a.type as string) === 'ATTACHMENT_DELETED')) ||
                      (a.type as string) === activityFilter
                    )).map(activity => (
                      <div key={activity.id} className="relative pl-10">
                        <div className={cn("absolute left-0 w-8 h-8 rounded-full border border-white flex items-center justify-center bg-slate-100 text-slate-400 z-10")}>
                          {(activity.type as string) === 'STAGE_CHANGE' ? <ArrowRight size={12} /> :
                           (activity.type as string) === 'TASK' ? <CheckSquare size={12} /> :
                           (activity.type as string) === 'ATTACHMENT' ? <Paperclip size={12} /> :
                           (activity.type as string) === 'ATTACHMENT_DELETED' ? <Trash2 size={12} /> : <MessageSquare size={12} />}
                        </div>
                        <div className="p-3 bg-white border border-slate-100 rounded-lg">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-900">{users.find(u => u.id === activity.createdBy)?.name || 'System'}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-50 px-1 rounded">{activity.type.replace('_', ' ')}</span>
                            </div>
                            <span className="text-[9px] text-slate-400">{formatDate(activity.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{activity.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Tasks */}
              {activeDetailTab === 'TASKS' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <input id="task-title" placeholder="What needs to be done?"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none" />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Due</label>
                        <input id="task-date" type="datetime-local" className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs" />
                      </div>
                      <div className="w-1/3">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Priority</label>
                        <select id="task-priority" className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs">
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
                        const priority = (document.getElementById('task-priority') as HTMLSelectElement).value as any;
                        if (!title) return;
                        onAddTask(selectedLead.id, title, date || new Date().toISOString(), priority);
                        (document.getElementById('task-title') as HTMLInputElement).value = '';
                      }}
                      className="w-full py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-slate-800 transition-colors">
                      Add Task
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter(t => t.leadId === selectedLead.id).map(task => (
                      <div key={task.id} className="p-3 bg-white border border-slate-100 rounded-lg flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <button onClick={() => onToggleTask(task.id)}
                            className={cn("w-4 h-4 rounded border flex items-center justify-center",
                              task.status === 'COMPLETED' ? "bg-brand-600 border-brand-600 text-white" : "border-slate-300 bg-white")}>
                            {task.status === 'COMPLETED' && <CheckSquare size={10} />}
                          </button>
                          <div>
                            <p className={cn("text-xs font-bold", task.status === 'COMPLETED' ? "text-slate-300 line-through" : "text-slate-900")}>{task.title}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5 uppercase font-bold">{formatDateTime(task.dueDate)}</p>
                          </div>
                        </div>
                        <button onClick={() => onDeleteTask(task.id)} className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {activeDetailTab === 'ATTACHMENTS' && (
                <div className="space-y-4">
                  <input type="file" id="file-upload" className="hidden" onChange={onFileUpload} />
                  <div onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
                    className="p-10 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer transition-all">
                    {isUploading ? <div className="w-6 h-6 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin" /> : <Paperclip size={24} />}
                    <p className="text-xs font-bold text-slate-600 mt-2">Upload Files</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {attachments.map(att => (
                      <div key={att.id} className="p-3 bg-white border border-slate-100 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-slate-400" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{att.fileName}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">{new Date(att.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => {}} className="p-1.5 text-slate-400 hover:text-slate-900"><Download size={14} /></button>
                          <button onClick={() => onDeleteAttachment(att.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentUser.role !== 'BDE' && (
              <button onClick={() => onDeleteLead(selectedLead.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Discard</button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Processing...' : 'Sync Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
