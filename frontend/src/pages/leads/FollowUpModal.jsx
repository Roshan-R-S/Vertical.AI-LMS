import { useState } from 'react';
import { Calendar, CheckCircle, X } from 'lucide-react';

export default function FollowUpModal({ lead, onConfirm, onCancel }) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [followUpDateFrom, setFollowUpDateFrom] = useState(tomorrow);
  const [followUpDateTo, setFollowUpDateTo] = useState('');

  const handleConfirm = () => {
    if (!followUpDateFrom) return alert('Please select a follow-up date.');
    onConfirm({ followUpDateFrom, followUpDateTo });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal modal-sm animate-slideUp">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Schedule Follow-up</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Demo postponed for <b>{lead?.companyName}</b>. Set a follow-up date to reschedule.
            </p>
          </div>
          <button className="modal-close" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Follow-up From *</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: 32 }}
                  value={followUpDateFrom}
                  min={tomorrow}
                  onChange={e => setFollowUpDateFrom(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up To (optional)</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: 32 }}
                  value={followUpDateTo}
                  min={followUpDateFrom || tomorrow}
                  onChange={e => setFollowUpDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            A follow-up task will be automatically created and assigned to the lead owner.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            <CheckCircle size={14} /> Confirm & Move
          </button>
        </div>
      </div>
    </div>
  );
}
