import React, { useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContextCore';
import { formatIndianNumber, parseIndianNumber } from '../../utils/formatNumber';

const LeadModal = ({ lead, onClose, onSave, milestones, dispositions, forcedAssignedToId }) => {
  const { currentUser, users, convertLead, checkDuplicate, sources, addSource } = useApp();
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [convertText, setConvertText] = useState("");
  const [dupWarning, setDupWarning] = useState(null);
  const [newSourceName, setNewSourceName] = useState('');

  const bdeUsers = users.filter((u) => u.role === "BDE");

  const [form, setForm] = useState(
    lead
      ? { ...lead, assignedToId: lead.assignedBDEId || lead.assignedToId }
      : {
          companyName: "", contactName: "", email: "", phone: "",
          source: "Website",
          assignedToId: forcedAssignedToId || "",
          milestone: "New", disposition: "Not Contacted",
          value: "", priority: "Medium", notes: "", tags: [],
        }
  );

  const handleDupCheck = async (phone, email) => {
    if (!phone && !email) return;
    const res = await checkDuplicate(phone, email, lead?.id);
    if (res?.duplicate) {
      setDupWarning(res.lead);
    } else {
      setDupWarning(null);
    }
  };

  const milestoneDis = dispositions.filter((d) => {
    const m = milestones.find((m) => m.name === form.milestone);
    return d.milestoneId === m?.id && d.isActive;
  });

  const footer = (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button 
        onClick={() => {
          if (!form.companyName?.trim()) return alert('Company name is required');
          if (!form.contactName?.trim()) return alert('Contact name is required');
          if (!form.phone?.trim()) return alert('Phone number is required');
          if (!forcedAssignedToId && !form.assignedToId) return alert("Please assign a BDE");
          const milestoneObj = milestones.find(m => m.name === form.milestone);
          const dispositionObj = dispositions.find(d => d.name === form.disposition && d.milestoneId === milestoneObj?.id);
          onSave({
            ...form,
            value: form.value ? Number(form.value) : 0,
            milestoneId: milestoneObj?.id || form.milestoneId,
            dispositionId: dispositionObj?.id || form.dispositionId,
          });
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
            {currentUser?.role === "SUPER_ADMIN" && (
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
            <div className="flex gap-2">
              <input
                className="form-input"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="Enter source name"
                autoFocus
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  if (!newSourceName.trim()) return;
                  try {
                    const res = await addSource(newSourceName.trim());
                    setForm((p) => ({ ...p, source: res.name }));
                    setNewSourceName('');
                    setIsCustomSource(false);
                  } catch {}
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <Select
              wrapperClassName="mb-0"
              value={form.source}
              onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
              options={sources.map(s => s.name)}
            />
          )}
        </div>
      </div>

      <div className="form-grid">
        <Input 
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          onBlur={(e) => handleDupCheck(form.phone, e.target.value)}
          placeholder="contact@company.com"
        />
        <Input 
          label="Phone *"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          onBlur={(e) => handleDupCheck(e.target.value, form.email)}
          placeholder="+91 99001 12345"
        />
      </div>

      {dupWarning && (
        <div className="flex items-start gap-3 p-3 rounded-lg mb-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <AlertTriangle size={16} color="#f59e0b" className="mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#f59e0b]">Duplicate detected — </span>
            <span className="text-secondary">
              <b>{dupWarning.companyName}</b> ({dupWarning.contactName}) already exists, assigned to <b>{dupWarning.assignedBDE || 'Unassigned'}</b> in stage <b>{dupWarning.milestone}</b>.
            </span>
          </div>
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
          value={formatIndianNumber(form.value)}
          onChange={(e) => setForm((p) => ({ ...p, value: parseIndianNumber(e.target.value) }))}
          placeholder="1,50,000"
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
