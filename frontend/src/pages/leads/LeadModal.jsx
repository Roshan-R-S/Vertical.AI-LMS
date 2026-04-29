import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { useApp } from '../../context/AppContextCore';

const LeadModal = ({ lead, onClose, onSave, milestones, dispositions, forcedAssignedToId }) => {
  const { currentUser, users, convertLead } = useApp();
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [convertText, setConvertText] = useState("");

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
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="contact@company.com"
        />
        <Input 
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+91 99001 12345"
        />
      </div>

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
