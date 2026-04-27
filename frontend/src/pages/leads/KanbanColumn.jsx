import React from 'react';

const KanbanColumn = ({ milestone, children, count, isOver, setNodeRef }) => {
  const columnStyle = {
    background: isOver ? "rgba(255,255,255,0.05)" : "var(--bg-surface)",
    borderRadius: 16,
    padding: 16,
    minWidth: 300,
    flex: "0 0 auto",
    border: `1px solid ${isOver ? milestone.color : "var(--border-subtle)"}`,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "is-over" : ""}`}
      style={columnStyle}
    >
      <div className="flex justify-between items-center mb-5">
        <span
          className="flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider"
          style={{ color: milestone.color }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: milestone.color,
              boxShadow: `0 0 10px ${milestone.color}`,
            }}
          />
          {milestone.name}
        </span>
        <span className="text-[11px] bg-surface-hover px-2 py-0.5 rounded-full text-muted font-semibold">
          {count}
        </span>
      </div>
      <div className="kanban-column-content thin-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
