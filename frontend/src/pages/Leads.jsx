import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    Calendar,
    Edit2,
    Eye,
    Plus,
    Search,
    Trash2,
    Upload
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Pagination from "../components/Pagination";
import { useApp } from "../context/AppContextCore";

// UI Components
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";

// Page Sub-components
import FollowUpModal from "./leads/FollowUpModal";
import ImportModal from "./leads/ImportModal";
import InteractionModal from "./leads/InteractionModal";
import KanbanColumn from "./leads/KanbanColumn";
import LeadCard from "./leads/LeadCard";
import LeadModal from "./leads/LeadModal";

const MILESTONE_COLORS = {
  New: "#6366f1",
  "First Call": "#06b6d4",
  "Demo Scheduled": "#8b5cf6",
  "Demo Completed": "#f59e0b",
  "Demo Postponed": "#f97316",
  "Proposal Shared": "#3b82f6",
  "PS & Dropped": "#94a3b8",
  Negotiation: "#ec4899",
  "Deal Closed": "#10b981",
  "Not Interested": "#ef4444",
};

export default function Leads() {
  const [searchParams] = useSearchParams();
  const {
    leads,
    milestones,
    dispositions,
    interactions,
    addLead,
    bulkAddLeads,
    updateLead,
    deleteLead,
    addInteraction,
    convertLead,
    currentUser,
  } = useApp();

  const [search, setSearch] = useState("");
  const [filterMilestone, setFilterMilestone] = useState(
    searchParams.get("milestone") || "All",
  );
  const [filterSource, setFilterSource] = useState("All");
  const [filterDisposition, setFilterDisposition] = useState("All");
  const [filterBde, setFilterBde] = useState(
    currentUser?.role === "BDE" ? currentUser.name : "All",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [dateRange, setDateRange] = useState("All");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [viewMode, setViewMode] = useState("table"); // table | kanban
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filterType, setFilterType] = useState(
    searchParams.get("filter") || "All",
  );
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [pendingStageChange, setPendingStageChange] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id;
    const newMilestoneId = over.id;
    const lead = leads.find((l) => l.id === leadId);
    const milestone = milestones.find((m) => m.id === newMilestoneId);

    if (lead && lead.milestoneId !== newMilestoneId) {
      const isDealClosed = milestone.name === "Deal Closed";
      const isDemoPostponed = milestone.name === "Demo Postponed";
      
      if (isDealClosed) {
        if (window.confirm(`Move "${lead.companyName}" to Deal Closed and convert to Client?`)) {
          try {
            await updateLead(leadId, { milestoneId: newMilestoneId });
            await convertLead(leadId);
          } catch {
            // Error alert handled by context
          }
          return;
        }
      }

      // For Demo Postponed, show follow-up date picker
      if (isDemoPostponed) {
        setPendingStageChange({ leadId, newMilestoneId });
        setShowFollowUpModal(true);
        return;
      }

      if (
        window.confirm(
          `Move "${lead.companyName}" to stage: ${milestone.name}?`,
        )
      ) {
        try {
          await updateLead(leadId, { milestoneId: newMilestoneId });
        } catch {
          // Error alert handled by context
        }
      }
    }
  };

  const handleFollowUpConfirm = async (followUpDates) => {
    if (!pendingStageChange) return;

    try {
      const lead = leads.find((l) => l.id === pendingStageChange.leadId);
      await updateLead(pendingStageChange.leadId, {
        milestoneId: pendingStageChange.newMilestoneId,
        ...followUpDates,
      });
      setShowFollowUpModal(false);
      setPendingStageChange(null);
    } catch (error) {
      // Error alert handled by context
      setShowFollowUpModal(false);
      setPendingStageChange(null);
    }
  };

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.companyName.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName.toLowerCase().includes(search.toLowerCase());
    const matchMilestone =
      filterMilestone === "All" || l.milestone === filterMilestone;
    const matchSource = filterSource === "All" || l.source === filterSource;
    const matchDisposition = filterDisposition === "All" || l.disposition === filterDisposition;
    const matchBde = filterBde === "All" || l.assignedBDE === filterBde;

    let matchDate = true;
    if (dateRange !== "All") {
      const leadDate = l.createdAt;
      const today = new Date().toISOString().split("T")[0];
      if (dateRange === "Today") matchDate = leadDate === today;
      else if (dateRange === "Custom" && customDates.start && customDates.end) {
        matchDate =
          leadDate >= customDates.start && leadDate <= customDates.end;
      }
    }

    if (filterType === "Untouched") {
      const hasInteractions = interactions.some((i) => i.leadId === l.id);
      if (hasInteractions) return false;
    }

    return (
      matchSearch && matchMilestone && matchSource && matchDisposition && matchBde && matchDate
    );
  });

  const sources = [
    "All",
    ...new Set(leads.map((l) => l.source).filter(Boolean)),
  ];
  const bdes = [
    "All",
    ...new Set(leads.map((l) => l.assignedBDE).filter(Boolean)),
  ];
  const allDispositions = [
    "All",
    ...new Set(leads.map((l) => l.disposition).filter(Boolean)),
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">
            {leads.length} total leads •{" "}
            {leads.filter((l) => l.status === "active").length} active
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="secondary" size="sm" onClick={() => setShowImportModal(true)} icon={<Upload size={14} />}>
            Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} icon={<Plus size={15} />}>
            Add Lead
          </Button>
        </div>
      </div>

      {/* Milestone quick stats */}
      <div className="milestones-container thin-scrollbar mb-6">
        <div
          onClick={() => setFilterMilestone("All")}
          className={`milestone-card ${filterMilestone === "All" ? "active" : ""}`}
        >
          <div className="text-lg font-bold text-[#1f2937] mb-0.5">{leads.length}</div>
          <div className="text-xxs text-[#64748b] font-medium">All Leads</div>
        </div>
        {milestones.map((m) => {
          const count = leads.filter((l) => l.milestoneId === m.id).length;
          const isActive = filterMilestone === m.name;
          return (
            <div
              key={m.id}
              onClick={() => setFilterMilestone(isActive ? "All" : m.name)}
              className={`milestone-card ${isActive ? "active" : ""}`}
              style={{
                backgroundColor: isActive ? `${m.color}08` : undefined,
                borderColor: isActive ? m.color : undefined,
                boxShadow: isActive ? `0 4px 12px ${m.color}15` : undefined
              }}
            >
              <div className="text-lg font-bold mb-0.5" style={{ color: m.color }}>
                {count}
              </div>
              <div className="text-xxs text-[#64748b] font-medium">{m.name}</div>
            </div>
          );
        })}
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="search-wrapper">
            <Search className="search-icon" size={15} />
            <input
              className="search-input"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select 
            wrapperClassName="mb-0"
            className="w-auto py-2 h-9 text-xs"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            options={sources.map(s => ({ label: `Source: ${s}`, value: s }))}
          />

          <Select 
            wrapperClassName="mb-0"
            className="w-auto py-2 h-9 text-xs"
            value={filterDisposition}
            onChange={(e) => setFilterDisposition(e.target.value)}
            options={allDispositions.map(d => ({ label: `Result: ${d}`, value: d }))}
          />

          <Select 
            wrapperClassName="mb-0"
            className="w-auto py-2 h-9 text-xs"
            value={filterBde}
            onChange={(e) => setFilterBde(e.target.value)}
            options={bdes.map(b => ({ label: `BDE: ${b}`, value: b }))}
          />

          <Select 
            wrapperClassName="mb-0"
            className={`w-auto py-2 h-9 text-xs ${filterType === "Untouched" ? "border-[#f59e0b]" : ""}`}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { label: "All Status", value: "All" },
              { label: "Untouched Leads", value: "Untouched" }
            ]}
          />

          <div className="flex rounded-lg bg-surface border border-default overflow-hidden h-9">
            <div className="px-2.5 border-r border-default flex items-center bg-card">
              <Calendar size={13} className="text-muted" />
            </div>
            <select
              className="form-select border-none bg-transparent outline-none px-2.5 text-xs h-full"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="All">All Time</option>
              {["Today", "This Week", "This Month", "Custom"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {dateRange === "Custom" && (
            <div className="flex gap-1.5 items-center bg-card px-2.5 py-0.5 rounded-lg border border-default h-9">
              <input
                type="date"
                className="form-input w-[120px] h-7 text-[11px] p-1"
                value={customDates.start}
                onChange={(e) => setCustomDates((p) => ({ ...p, start: e.target.value }))}
              />
              <span className="text-[10px] text-muted">-</span>
              <input
                type="date"
                className="form-input w-[120px] h-7 text-[11px] p-1"
                value={customDates.end}
                onChange={(e) => setCustomDates((p) => ({ ...p, end: e.target.value }))}
              />
            </div>
          )}

          <div className="ml-auto flex gap-1.5">
            {["table", "kanban"].map((m) => (
              <Button
                key={m}
                variant={viewMode === m ? "primary" : "secondary"}
                size="sm"
                onClick={() => setViewMode(m)}
                className="capitalize"
              >
                {m}
              </Button>
            ))}
          </div>
        </div>

        {viewMode === "table" ? (
          <table className="table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Disposition</th>
                <th>BDE</th>
                <th>Value</th>
                <th>Score</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((lead) => (
                  <tr key={lead.id} className="hover-row">
                    <td>
                      <div className="font-semibold text-sm">{lead.companyName}</div>
                      <div className="text-xs text-muted">Created on {lead.createdAt}</div>
                    </td>
                    <td>
                      <div className="text-sm">{lead.contactName}</div>
                      <div className="text-xs text-muted">{lead.email}</div>
                    </td>
                    <td>
                      <Badge>{lead.source}</Badge>
                    </td>
                    <td>
                      <Badge 
                        variant="primary"
                        style={{ 
                          background: `${MILESTONE_COLORS[lead.milestone]}20`,
                          color: MILESTONE_COLORS[lead.milestone],
                          borderColor: `${MILESTONE_COLORS[lead.milestone]}40`
                        }}
                      >
                        {lead.milestone}
                      </Badge>
                    </td>
                    <td>
                      <div className="text-sm text-secondary font-medium">
                        {lead.disposition || "Not Contacted"}
                      </div>
                    </td>
                    <td className="text-sm">{lead.assignedBDE || "Unassigned"}</td>
                    <td className="font-bold text-sm">₹{(lead.value / 1000).toFixed(0)}K</td>
                    <td>
                      <span
                        className={`font-bold text-sm ${
                          lead.score >= 80 ? "text-[#10b981]" : 
                          lead.score >= 60 ? "text-[#f59e0b]" : "text-[#ef4444]"
                        }`}
                      >
                        {lead.score}
                      </span>
                    </td>
                    <td>
                      <Badge variant={
                        lead.priority === "High" ? "danger" : 
                        lead.priority === "Medium" ? "warning" : "neutral"
                      }>
                        {lead.priority}
                      </Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" iconOnly title="View" onClick={() => setViewLead(lead)} icon={<Eye size={14} />} />
                        <Button variant="ghost" size="sm" iconOnly title="Edit" onClick={() => setEditLead(lead)} icon={<Edit2 size={14} />} />
                        <Button 
                          variant="ghost" size="sm" iconOnly title="Delete" 
                          className="text-brand-danger"
                          onClick={() => window.confirm(`Are you sure you want to delete lead "${lead.companyName}"?`) && deleteLead(lead.id)}
                          icon={<Trash2 size={14} />} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="p-4">
              <div className="kanban-board thin-scrollbar">
                  {milestones
                    .filter((m) => m.name !== "Not Interested")
                    .map((m) => {
                    const stageLeads = filtered.filter((l) => l.milestoneId === m.id);
                    return (
                      <KanbanColumnWrapper
                        key={m.id}
                        milestone={m}
                        count={stageLeads.length}
                      >
                        {stageLeads.map((lead) => (
                          <KanbanCardWrapper 
                            key={lead.id} 
                            lead={lead} 
                            onView={setViewLead} 
                          />
                        ))}
                      </KanbanColumnWrapper>
                    );
                  })}
              </div>
            </div>
          </DndContext>
        )}

        {viewMode === "table" && (
          <Pagination
            total={filtered.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {showAddModal && (
        <LeadModal
          onClose={() => setShowAddModal(false)}
          onSave={addLead}
          milestones={milestones}
          dispositions={dispositions}
          forcedAssignedToId={currentUser?.role === 'BDE' ? currentUser.id : undefined}
        />
      )}
      {editLead && (
        <LeadModal
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSave={(d) => updateLead(editLead.id, d)}
          milestones={milestones}
          dispositions={dispositions}
          forcedAssignedToId={currentUser?.role === 'BDE' ? currentUser.id : undefined}
        />
      )}
      {viewLead && (
        <InteractionModal
          lead={viewLead}
          interactions={interactions}
          onClose={() => setViewLead(null)}
          onAdd={addInteraction}
        />
      )}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={async (data) => {
            const result = await bulkAddLeads(data);
            if (result) {
              alert(
                `Import complete. Created: ${result.createdCount ?? result.count ?? 0}, Skipped duplicates/invalid: ${result.skippedCount ?? 0}`,
              );
            }
            setShowImportModal(false);
          }}
        />
      )}
      {showFollowUpModal && pendingStageChange && (
        <FollowUpModal
          lead={leads.find((l) => l.id === pendingStageChange.leadId)}
          onConfirm={handleFollowUpConfirm}
          onCancel={() => {
            setShowFollowUpModal(false);
            setPendingStageChange(null);
          }}
        />
      )}
    </div>
  );
}

// Internal wrappers for DND since useDraggable/useDroppable must be inside DndContext
import { useDraggable, useDroppable } from "@dnd-kit/core";

function KanbanCardWrapper({ lead, onView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <LeadCard 
      lead={lead} 
      onView={onView} 
      attributes={attributes} 
      listeners={listeners} 
      setNodeRef={setNodeRef} 
      transform={transform} 
      isDragging={isDragging} 
    />
  );
}

// We also need to wrap DroppableColumn if it's used inside DndContext
function KanbanColumnWrapper({ milestone, children, count }) {
  const { setNodeRef, isOver } = useDroppable({
    id: milestone.id,
  });

  return (
    <KanbanColumn 
      milestone={milestone} 
      children={children} 
      count={count} 
      isOver={isOver} 
      setNodeRef={setNodeRef} 
    />
  );
}
