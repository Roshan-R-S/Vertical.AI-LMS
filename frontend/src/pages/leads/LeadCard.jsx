import React from 'react';
import { GripVertical } from 'lucide-react';

const LeadCard = ({ lead, onView, attributes, listeners, setNodeRef, transform, isDragging }) => {
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    cursor: "grab",
  };

  const handleClick = (e) => {
    // Prevent click if we were dragging
    if (
      transform &&
      (Math.abs(transform.x) > 5 || Math.abs(transform.y) > 5)
    )
      return;
    onView(lead);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold text-sm text-primary">
          {lead.companyName}
        </div>
        <GripVertical size={14} className="text-muted" />
      </div>
      
      <div className="text-xs text-muted mb-3">
        {lead.contactName}
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold">
          ₹{(lead.value / 1000).toFixed(0)}K
        </span>
        <span
          className="badge-neutral text-xxs font-bold px-1.5 py-0.5 rounded border"
          style={{
            color: lead.score >= 80 ? "#10b981" : "#f59e0b",
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          {lead.score}
        </span>
      </div>
      
      <div className="mt-2.5 pt-2.5 border-t border-subtle text-xs text-secondary flex justify-between">
        <span>By: {lead.assignedTo?.name || "Unassigned"}</span>
        <span className="opacity-70">{lead.source}</span>
      </div>
    </div>
  );
};

export default LeadCard;
