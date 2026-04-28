import { AlertCircle, Calendar } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const FollowUpModal = ({ lead, onConfirm, onCancel }) => {
  const [followUpDateFrom, setFollowUpDateFrom] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [followUpDateTo, setFollowUpDateTo] = useState('');

  const handleConfirm = () => {
    if (!followUpDateFrom) {
      alert('Please select a follow-up date');
      return;
    }

    onConfirm({
      followUpDateFrom,
      followUpDateTo: followUpDateTo || null,
    });
  };

  const footer = (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Schedule Follow-up
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Schedule Demo Follow-up"
      size="md"
      footer={footer}
    >
      <div className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Demo Postponed</p>
            <p className="text-xs text-amber-700 mt-1">
              Set a follow-up date to reschedule the demo with <strong>{lead?.companyName}</strong>. 
              A task will be automatically created for you.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="form-label">
              Follow-up From Date *
            </label>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted" />
              <input
                type="date"
                className="form-input"
                value={followUpDateFrom}
                onChange={(e) => setFollowUpDateFrom(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="text-xs text-muted mt-1">
              Date when you plan to follow up
            </p>
          </div>

          <div>
            <label className="form-label">
              Follow-up To Date (Optional)
            </label>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted" />
              <input
                type="date"
                className="form-input"
                value={followUpDateTo}
                onChange={(e) => setFollowUpDateTo(e.target.value)}
                min={followUpDateFrom}
              />
            </div>
            <p className="text-xs text-muted mt-1">
              End date for follow-up window (creates a date range)
            </p>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800">
            <strong>What happens next:</strong> A task will be created and assigned to you 
            with this follow-up date. Once the demo is completed, you can move the lead to 
            <strong> Demo Completed</strong> or reschedule another follow-up.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default FollowUpModal;
