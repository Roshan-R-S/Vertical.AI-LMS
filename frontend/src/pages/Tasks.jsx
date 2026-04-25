import { useState } from 'react';
import { useApp } from '../context/AppContextCore';
import { CheckCircle, Clock, AlertTriangle, User, Calendar, Plus, X } from 'lucide-react';
import Pagination from '../components/Pagination';


function TaskModal({ onClose, onSave, currentUser, users, leads }) {

  const [form, setForm] = useState({
    title: '',
    leadId: '',
    dueDate: new Date().toISOString().split('T')[0],
    bde: currentUser?.role === 'BDE' ? currentUser.name : '',
    tl: currentUser?.role === 'Team Lead' ? currentUser.name : '',
    status: 'pending'
  });

  const availableLeads = leads || [];


  const availableBDEs = users.filter(u => 
    u.role === 'BDE' && (currentUser?.role !== 'Team Lead' || u.team === currentUser.team)
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp">
        <div className="modal-header">
          <h2 className="modal-title">Create Task</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Task Title / Follow-up Details *</label>
            <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="E.g., Call to discuss pricing" autoFocus />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Linked Lead / Deal</label>
              <select className="form-select" value={form.leadId} onChange={e => setForm(p => ({ ...p, leadId: e.target.value }))}>
                <option value="">None / Independent</option>
                {availableLeads.map(l => <option key={l.id} value={l.id}>{l.companyName}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          {currentUser?.role !== 'BDE' && (
            <div className="form-group">
              <label className="form-label">Assign To BDE</label>
              <select className="form-select" value={form.bde} onChange={e => setForm(p => ({ ...p, bde: e.target.value }))}>
                <option value="">Select BDE...</option>
                {/* TLs can also assign to themselves (Self-task) */}
                <option value={currentUser.name}>Self (Me)</option>
                {availableBDEs.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { 
            if (!form.title) return alert("Task title required");
            onSave(form); 
            onClose(); 
          }}>
            <CheckCircle size={15} /> Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { currentUser, users, tasks, leads, addTask, updateTask } = useApp();

  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  // Role-based filtering
  let filteredTasks = tasks;
  if (currentUser?.role === 'Team Lead') {
    filteredTasks = filteredTasks.filter(t => t.tl === currentUser.name);
  } else if (currentUser?.role === 'BDE') {
    filteredTasks = filteredTasks.filter(t => t.bde === currentUser.name);
  }

  // State filtering
  if (filterStatus !== 'All') {
    filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
  }

  const completionRate = Math.round((filteredTasks.filter(t => t.status === 'completed').length / (filteredTasks.length || 1)) * 100);

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-subtitle">EXECUTION TRACKING</div>
          <h1 className="page-title">Task & Follow-up Management</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Task
        </button>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="studio-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div className="card-icon-wrapper" style={{ background: 'rgba(99,102,241,0.15)', margin: 0 }}><Clock size={16} color="#6366f1" /></div>
            <div className="card-title" style={{ fontSize: 13, margin: 0, color: 'var(--text-secondary)' }}>Pending Tasks</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 300 }}>{filteredTasks.filter(t => t.status === 'pending').length}</div>
        </div>
        
        <div className="studio-card" style={{ padding: 20, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div className="card-icon-wrapper" style={{ background: 'rgba(239,68,68,0.15)', margin: 0 }}><AlertTriangle size={16} color="#ef4444" /></div>
            <div className="card-title" style={{ fontSize: 13, margin: 0, color: '#ef4444' }}>Overdue Follow-ups</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 300, color: '#ef4444' }}>{filteredTasks.filter(t => t.status === 'overdue').length}</div>
        </div>

        <div className="studio-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div className="card-icon-wrapper" style={{ background: 'rgba(16,185,129,0.15)', margin: 0 }}><CheckCircle size={16} color="#10b981" /></div>
            <div className="card-title" style={{ fontSize: 13, margin: 0, color: 'var(--text-secondary)' }}>Completed</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 300 }}>{filteredTasks.filter(t => t.status === 'completed').length}</div>
        </div>

        <div className="studio-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div className="card-icon-wrapper" style={{ background: 'rgba(6,182,212,0.15)', margin: 0 }}><User size={16} color="#06b6d4" /></div>
            <div className="card-title" style={{ fontSize: 13, margin: 0, color: 'var(--text-secondary)' }}>Completion Rate</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 300 }}>{completionRate}%</div>
        </div>
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
            <tr>
              <th>Task Details</th>
              <th>Lead / Deal</th>
              {currentUser?.role !== 'BDE' && <th>Assigned BDE</th>}
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(task => (

              <tr key={task.id}>
                <td style={{ fontWeight: 600 }}>{task.title}</td>
                <td style={{ color: 'var(--brand-primary-light)', fontSize: 13 }}>
                  {leads.find(l => l.id === task.leadId)?.companyName || task.leadId || '—'}
                </td>

                {currentUser?.role !== 'BDE' && (
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar avatar-sm" style={{ width: 20, height: 20, fontSize: 9 }}>{task.bde.split(' ').map(n=>n[0]).join('')}</div>
                      <span style={{ fontSize: 13 }}>{task.bde}</span>
                    </div>
                  </td>
                )}
                <td style={{ color: task.status === 'overdue' ? '#ef4444' : 'var(--text-secondary)' }}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {task.dueDate}
                </td>
                <td>
                  <span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                    {task.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    disabled={task.status === 'completed'}
                    onClick={() => updateTask(task.id, { status: 'completed' })}
                    style={{ color: task.status === 'completed' ? 'var(--text-muted)' : '#10b981' }}
                  >
                    {task.status === 'completed' ? 'Done' : 'Mark Complete'}
                  </button>
                </td>
            </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          total={filteredTasks.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      </div>

      
      {showModal && (
        <TaskModal 
          onClose={() => setShowModal(false)} 
          onSave={addTask}
          currentUser={currentUser}
          users={users}
          leads={leads}
        />

      )}
    </div>
  );
}
