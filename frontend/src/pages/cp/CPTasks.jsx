import { useState } from 'react';
import { useApp } from '../../context/AppContextCore';
import { CheckCircle, Clock, AlertTriangle, User, Calendar, Plus, X } from 'lucide-react';
import Pagination from '../../components/Pagination';

function TaskModal({ onClose, onSave, currentUser, leads }) {
  const [form, setForm] = useState({ title: '', leadId: '', dueDate: new Date().toISOString().split('T')[0], status: 'pending' });
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp">
        <div className="modal-header">
          <h2 className="modal-title">Create Task</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="E.g., Follow up on proposal" autoFocus />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Linked Lead</label>
              <select className="form-select" value={form.leadId} onChange={e => setForm(p => ({ ...p, leadId: e.target.value }))}>
                <option value="">None</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.companyName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (!form.title) return alert('Title required'); onSave(form); onClose(); }}>
            <CheckCircle size={15} /> Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CPTasks() {
  const { currentUser, tasks, leads, addTask, updateTask } = useApp();
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const myLeads = leads.filter(l => l.assignedToId === currentUser.id);
  let myTasks = tasks.filter(t => t.assignedToId === currentUser.id);
  if (filterStatus !== 'All') myTasks = myTasks.filter(t => t.status === filterStatus);

  const completionRate = Math.round((myTasks.filter(t => t.status === 'completed').length / (myTasks.length || 1)) * 100);

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">MY TASKS</div>
          <h1 className="page-title">Task & Follow-up Management</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Task</button>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Pending', value: tasks.filter(t => t.assignedToId === currentUser.id && t.status === 'pending').length, icon: Clock, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Overdue', value: tasks.filter(t => t.assignedToId === currentUser.id && t.status === 'overdue').length, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
          { label: 'Completed', value: tasks.filter(t => t.assignedToId === currentUser.id && t.status === 'completed').length, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: User, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
        ].map((s, i) => (
          <div key={i} className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div className="card-icon-wrapper" style={{ background: s.bg, margin: 0 }}><s.icon size={16} color={s.color} /></div>
              <div className="card-title" style={{ fontSize: 13, margin: 0, color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 300 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <table className="table">
          <thead>
            <tr><th>Task</th><th>Lead</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {myTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(task => (
              <tr key={task.id}>
                <td style={{ fontWeight: 600 }}>{task.title}</td>
                <td style={{ color: 'var(--brand-primary-light)', fontSize: 13 }}>{leads.find(l => l.id === task.leadId)?.companyName || '—'}</td>
                <td style={{ color: task.status === 'overdue' ? '#ef4444' : 'var(--text-secondary)' }}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{task.dueDate}
                </td>
                <td><span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>{task.status.toUpperCase()}</span></td>
                <td>
                  <button className="btn btn-ghost btn-sm" disabled={task.status === 'completed'} onClick={() => updateTask(task.id, { status: 'completed' })} style={{ color: task.status === 'completed' ? 'var(--text-muted)' : '#10b981' }}>
                    {task.status === 'completed' ? 'Done' : 'Mark Complete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={myTasks.length} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} onPageSizeChange={s => { setPageSize(s); setCurrentPage(1); }} />
      </div>

      {showModal && <TaskModal onClose={() => setShowModal(false)} onSave={addTask} currentUser={currentUser} leads={myLeads} />}
    </div>
  );
}
