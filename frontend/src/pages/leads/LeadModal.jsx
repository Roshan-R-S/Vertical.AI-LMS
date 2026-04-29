import { CheckCircle, Search } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { useApp } from '../../context/AppContextCore';
import { api } from '../../utils/api';

const LeadModal = ({ lead, onClose, onSave, milestones, dispositions, forcedAssignedToId }) => {
  const { currentUser, users, convertLead } = useApp();
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [convertText, setConvertText] = useState("");
  const [duplicateCheck, setDuplicateCheck] = useState({ status: 'idle', message: '' });

  const bdeUsers = users.filter((u) => u.role === "BDE");

  const [form, setForm] = useState(
    lead
      ? { 
          ...lead,
          assignedToId: lead.assignedBDEId || lead.assignedToId,
          notes: lead.notes ?? '',
          email: lead.email ?? '',
          industry: lead.industry ?? '',
          source: lead.source ?? 'Website',
        }
      : {
          companyName: "", contactName: "", email: "", phone: "",
          source: "Website",
          assignedToId: forcedAssignedToId || "",
          milestone: "New", disposition: "Not Contacted",
          value: "", priority: "Medium", notes: "", tags: [],
        }
  );

        const canCheckLead = Boolean(form.phone.trim() || form.email.trim());

  const milestoneDis = dispositions.filter((d) => {
    const m = milestones.find((m) => m.name === form.milestone);
    return d.milestoneId === m?.id && d.isActive;
  });

  const handleCheckDuplicate = async () => {
    if (!canCheckLead) {
      setDuplicateCheck({ status: 'error', message: 'Enter a phone number or email address first.' });
      return;
    }

    setDuplicateCheck({ status: 'checking', message: 'Checking for an existing lead...' });

    try {
      const result = await api.post('/leads/check-duplicate', {
        phone: form.phone,
        email: form.email,
      });

      setDuplicateCheck(
        result.exists
          ? { status: 'exists', message: 'Lead already exists. It cannot be created again.' }
          : { status: 'available', message: 'No matching lead found. You can create this lead.' },
      );
    } catch (error) {
      setDuplicateCheck({
        status: 'error',
        message: error.message || 'Unable to check lead right now.',
      });
    }
  };

  const footer = (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      {!lead && (
        <Button
          variant="secondary"
          onClick={handleCheckDuplicate}
          disabled={!canCheckLead || duplicateCheck.status === 'checking'}
          icon={<Search size={15} />}
        >
          {duplicateCheck.status === 'checking' ? 'Checking...' : 'Check Lead Exists'}
        </Button>
      )}
      <Button 
        disabled={!lead && duplicateCheck.status !== 'available'}
        onClick={() => {
          if (!forcedAssignedToId && !form.assignedToId) return alert("Please assign a BDE");
          onSave(form);
          onClose();
        }}
        icon={<CheckCircle size={15} />}
      >
        {lead ? "Update Lead" : "Create Lead"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={lead ? "Edit Lead" : "Add New Lead"}
      size="lg"
      footer={footer}
    >
      <div className="form-grid-3">
        <Input 
          label="Company Name *"
          value={form.companyName}
          onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
          placeholder="TechNova Solutions"
        />
        <Input 
          label="Contact Person *"
          value={form.contactName}
          onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
          placeholder="Suresh Reddy"
        />
        <div className="form-group mb-0">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label mb-0">Lead Source</label>
            {currentUser?.role === "Super Admin" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xxs text-accent-blue border-none p-0 h-auto"
                onClick={() => setIsCustomSource(!isCustomSource)}
              >
                {isCustomSource ? "← Select" : "+ Add New"}
              </Button>
            )}
          </div>
          {isCustomSource ? (
            <input
              className="form-input"
              value={form.source}
              onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
              placeholder="Enter source name"
              autoFocus
            />
          ) : (
            <Select
              wrapperClassName="mb-0"
              value={form.source}
              onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
              options={["Website", "LinkedIn", "Google Ads", "Referral", "Cold Call", "Partner", "API"]}
            />
          )}
        </div>
      </div>

      <div className="form-grid">
        <Input 
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm((p) => ({ ...p, email: e.target.value }));
            if (!lead) setDuplicateCheck({ status: 'idle', message: '' });
          }}
          placeholder="contact@company.com"
        />
        <Input 
          label="Phone"
          value={form.phone}
          onChange={(e) => {
            setForm((p) => ({ ...p, phone: e.target.value }));
            if (!lead) setDuplicateCheck({ status: 'idle', message: '' });
          }}
          placeholder="+91 99001 12345"
        />
      </div>

      {!lead && duplicateCheck.status !== 'idle' && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{
            background:
              duplicateCheck.status === 'exists'
                ? 'rgba(239,68,68,0.08)'
                : duplicateCheck.status === 'available'
                  ? 'rgba(16,185,129,0.08)'
                  : duplicateCheck.status === 'error'
                    ? 'rgba(245,158,11,0.08)'
                    : 'rgba(59,130,246,0.08)',
            color:
              duplicateCheck.status === 'exists'
                ? '#dc2626'
                : duplicateCheck.status === 'available'
                  ? '#059669'
                  : duplicateCheck.status === 'error'
                    ? '#d97706'
                    : '#2563eb',
          }}
        >
          {duplicateCheck.message}
        </div>
      )}

      <div className="form-grid-3">
        <Select 
          label="Milestone"
          value={form.milestone}
          onChange={(e) => setForm((p) => ({ ...p, milestone: e.target.value }))}
          options={milestones.map(m => ({ label: m.name, value: m.name }))}
        />
        <Select 
          label="Disposition"
          value={form.disposition}
          onChange={(e) => setForm((p) => ({ ...p, disposition: e.target.value }))}
          options={milestoneDis.map(d => ({ label: d.name, value: d.name }))}
        />
        <Select 
          label="Priority"
          value={form.priority}
          onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
          options={["High", "Medium", "Low"]}
        />
      </div>

      <div className="form-grid">
        <Input 
          label="Deal Value (₹)"
          type="number"
          value={form.value}
          onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
          placeholder="150000"
        />
        {!forcedAssignedToId && (
          <Select 
            label="Assign BDE *"
            value={form.assignedToId}
            onChange={(e) => setForm((p) => ({ ...p, assignedToId: e.target.value }))}
            options={bdeUsers.map(u => ({ label: u.name, value: u.id }))}
            placeholder="Select BDE"
            required
          />
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea
          className="form-textarea"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Add notes about this lead..."
        />
      </div>

      {lead && form.milestone === "Deal Closed" && lead.status !== "won" && (
        <div className="mt-6 p-5 bg-[rgba(16,185,129,0.05)] rounded-xl border border-[rgba(16,185,129,0.2)]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="m-0 text-[#10b981] text-sm">Ready to finalize?</h4>
              <p className="m-1 text-xs text-muted">
                Converting will create a permanent Client profile and move this lead to 'Won'.
              </p>
            </div>
            {!showConvertConfirm ? (
              <Button onClick={() => setShowConvertConfirm(true)}>
                Convert to Client
              </Button>
            ) : (
              <div className="flex gap-2.5">
                <input
                  className="form-input w-[120px] h-9 uppercase text-xs"
                  placeholder="TYPE CONVERT"
                  value={convertText}
                  onChange={(e) => setConvertText(e.target.value)}
                />
                <Button 
                  className="h-9"
                  disabled={convertText.toUpperCase() !== "CONVERT"}
                  onClick={async () => {
                    try {
                      await convertLead(lead.id);
                      alert("Lead successfully converted to Client!");
                      onClose();
                    } catch { /* handled in context */ }
                  }}
                >
                  Confirm
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-9"
                  onClick={() => {
                    setShowConvertConfirm(false);
                    setConvertText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LeadModal;
