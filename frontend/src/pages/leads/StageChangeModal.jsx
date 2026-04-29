import { CheckCircle, X } from 'lucide-react';
import { useState } from 'react';

const StageChangeModal = ({ lead, targetMilestone, dispositions, onConfirm, onCancel }) => {
  const milestoneDis = dispositions.filter(
    (d) => d.milestoneId === targetMilestone.id && d.isActive
  );
  const [selectedDisposition, setSelectedDisposition] = useState(milestoneDis[0]?.id || '');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal modal-sm animate-slideUp">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Moving to "{targetMilestone.name}"</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {lead.companyName}
            </p>
          </div>
          <button className="modal-close" onClick={onCancel}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Disposition *</label>
            {milestoneDis.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                No dispositions configured for this stage.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {milestoneDis.map((d) => (
                  <label
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1px solid ${selectedDisposition === d.id ? targetMilestone.color : 'var(--border-subtle)'}`,
                      background: selectedDisposition === d.id ? `${targetMilestone.color}10` : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="disposition"
                      value={d.id}
                      checked={selectedDisposition === d.id}
                      onChange={() => setSelectedDisposition(d.id)}
                      style={{ accentColor: targetMilestone.color }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                      {d.description && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{d.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={milestoneDis.length > 0 && !selectedDisposition}
            onClick={() => onConfirm(selectedDisposition || null)}
            style={{ background: targetMilestone.color, borderColor: targetMilestone.color }}
          >
            <CheckCircle size={15} /> Confirm Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageChangeModal;
