import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Calendar, Mic, Brain, CheckCircle, TrendingUp, Star, ClipboardList } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { formatCurrency } from '../../utils/formatCurrency';

const MILESTONE_COLORS = {
  New: "#6366f1",
  Contacted: "#06b6d4",
  Qualified: "#8b5cf6",
  Demo: "#f59e0b",
  Proposal: "#3b82f6",
  Negotiation: "#ec4899",
  Won: "#10b981",
  Lost: "#ef4444",
};

const InteractionModal = ({ lead, interactions, onClose, onAdd }) => {
  const [tab, setTab] = useState("logs");
  const [form, setForm] = useState({
    type: "call",
    direction: "outbound",
    summary: "",
    by: "",
  });
  
  const leadInteractions = interactions.filter((i) => i.leadId === lead.id);

  const typeIcons = {
    call: Phone,
    email: Mail,
    whatsapp: MessageSquare,
    meeting: Calendar,
  };

  const header = (
    <div>
      <h2 className="modal-title">{lead.companyName}</h2>
      <p className="text-xs text-muted mt-0.5">
        {lead.contactName} • {lead.phone}
      </p>
    </div>
  );

  const stats = [
    { l: "Stage", v: lead.milestone, c: MILESTONE_COLORS[lead.milestone], icon: <Star size={11} /> },
    { l: "Source", v: lead.source, c: "#06b6d4", icon: <TrendingUp size={11} /> },
    { l: "Score", v: lead.score, c: lead.score >= 80 ? "#10b981" : "#f59e0b", icon: <Brain size={11} /> },
    { l: "Value", v: formatCurrency(lead.value), c: "#6366f1", icon: <CheckCircle size={11} /> },
    { l: "Priority", v: lead.priority, c: lead.priority === "High" ? "#ef4444" : "#f59e0b", icon: <Phone size={11} /> },
    { l: "Result", v: lead.disposition || "None", c: "#10b981", icon: <MessageSquare size={11} /> },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={header}
      size="lg"
    >
      {/* Lead stats grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px', 
          marginBottom: '24px' 
        }}
      >
        {stats.map((s, i) => (
          <div 
            key={i} 
            className="bg-card rounded-lg p-2 border border-default shadow-sm"
            style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <div className="flex items-center gap-1 text-[9px] text-muted uppercase tracking-tight font-bold">
              <span style={{ color: s.c }}>{s.icon}</span>
              {s.l}
            </div>
            <div className="text-[11px] font-bold" style={{ color: s.c }}>
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div className="tabs mb-4">
        {["logs", "add log", "ai insights"].map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
            style={{ textTransform: "capitalize" }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "logs" && (
        <div className="timeline">
          {leadInteractions.length === 0 ? (
            <div className="empty-state py-10 text-center">
              <div className="flex justify-center mb-2">
                <ClipboardList size={48} style={{ opacity: 0.2, color: 'var(--text-muted)' }} />
              </div>
              <div className="text-muted">No interactions yet</div>
            </div>
          ) : (
            leadInteractions.map((int, i) => {
              const Icon = typeIcons[int.type] || Phone;
              return (
                <div key={i} className="timeline-item">
                  <div
                    className="timeline-icon"
                    style={{ borderColor: MILESTONE_COLORS["Contacted"] }}
                  >
                    <Icon size={14} color={MILESTONE_COLORS["Contacted"]} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">
                      {int.type.charAt(0).toUpperCase() + int.type.slice(1)}{" "}
                      • {int.direction || ""}
                    </div>
                    <div className="timeline-meta">
                      {int.createdAt ? new Date(int.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : int.date || '—'} • {int.performedBy?.name || int.by}{" "}
                      {int.duration && `• ${int.duration}`}
                    </div>
                    <div className="timeline-body">{int.summary}</div>
                    {int.transcript && (
                      <div className="mt-2 flex gap-2">
                        <Badge variant="primary" icon={<Mic size={10} />}>Transcript</Badge>
                        <Badge variant="info" icon={<Brain size={10} />}>AI Summary</Badge>
                        <Badge variant={int.sentiment === "positive" ? "success" : "neutral"}>
                          {int.sentiment}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "add log" && (
        <div>
          <div className="form-grid">
            <Select 
              label="Type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              options={["call", "email", "whatsapp", "meeting"]}
            />
            <Select 
              label="Direction"
              value={form.direction}
              onChange={(e) => setForm((p) => ({ ...p, direction: e.target.value }))}
              options={["outbound", "inbound"]}
            />
          </div>
          <Input 
            label="By"
            value={form.by}
            onChange={(e) => setForm((p) => ({ ...p, by: e.target.value }))}
            placeholder="Your name"
          />
          <div className="form-group">
            <label className="form-label">Summary / Notes</label>
            <textarea
              className="form-textarea"
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              placeholder="What happened in this interaction?"
            />
          </div>
          <Button 
            fullWidth
            onClick={() => {
              onAdd({ ...form, leadId: lead.id });
              setTab("logs");
            }}
            icon={<CheckCircle size={15} />}
          >
            Log Interaction
          </Button>
        </div>
      )}
      {tab === "ai insights" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            {
              icon: Brain,
              label: "Lead Score Analysis",
              value: `Score: ${lead.score}/100 — ${lead.score >= 80 ? "High intent buyer. Recommend expedite proposal." : "Medium intent. Needs nurturing with value props."}`,
              color: "#6366f1",
            },
            {
              icon: TrendingUp,
              label: "Conversion Probability",
              value: `${lead.probability}% probability to close. Expected by ${lead.expectedClose || "N/A"}.`,
              color: "#10b981",
            },
            {
              icon: MessageSquare,
              label: "Sentiment Trend",
              value: "Recent interactions show positive sentiment. Lead is engaged and responsive.",
              color: "#06b6d4",
            },
            {
              icon: Star,
              label: "AI Recommendation",
              value: "Schedule a follow-up call within 2 days. Share case study from EdTech vertical.",
              color: "#f59e0b",
            },
          ].map((insight, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-surface)",
                borderRadius: 12,
                padding: 16,
                border: "1px solid var(--border-subtle)",
                display: "flex",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${insight.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <insight.icon size={16} color={insight.color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  {insight.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {insight.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default InteractionModal;
