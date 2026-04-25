import {
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Search,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContextCore";

export default function WorkQueue() {
  const { currentUser, leads, tasks, updateTask } = useApp();
  const [activeTab, setActiveTab] = useState("today");

  // Filter tasks and leads for the BDE
  const bdeTasks = tasks.filter((t) => t.assignedToId === currentUser.id);
  const bdeLeads = leads.filter((l) => l.assignedToId === currentUser.id);

  const [loading, setLoading] = useState(true);

  const { fetchDashboard } = useApp();

  useEffect(() => {
    fetchDashboard("today").then(() => {
      setLoading(false);
    });
  }, [fetchDashboard]);

  // Grouping logic for "Execution Focused" view
  const today = new Date().toISOString().split("T")[0];

  const todayFollowUps = bdeTasks.filter(
    (t) => t.dueDate === today && t.status !== "completed",
  );
  const overdueFollowUps = bdeTasks.filter(
    (t) => t.dueDate < today && t.status !== "completed",
  );
  const upcomingFollowUps = bdeTasks.filter(
    (t) => t.dueDate > today && t.status !== "completed",
  );

  // Callbacks could be a specific disposition or tag
  const callbackQueue = bdeLeads.filter(
    (l) => l.disposition === "Callback Requested",
  );

  const priorityLeads = bdeLeads.filter(
    (l) => l.priority === "High" && l.status === "active",
  );

  const tabs = [
    {
      id: "today",
      label: "Today's Work",
      count: todayFollowUps.length + callbackQueue.length,
    },
    {
      id: "overdue",
      label: "Overdue",
      count: overdueFollowUps.length,
      color: "#ef4444",
    },
    { id: "upcoming", label: "Upcoming", count: upcomingFollowUps.length },
    { id: "priority", label: "Priority", count: priorityLeads.length },
  ];

  const renderTaskCard = (item, type) => {
    // Find the lead object if item is a task
    const lead = leads.find((l) => l.id === item.leadId) || item;

    return (
      <div
        key={item.id}
        className="studio-card animate-fadeIn"
        style={{
          padding: "16px 20px",
          marginBottom: 12,
          borderLeft: `4px solid ${item.priority === "High" ? "#ef4444" : "#6366f1"}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {lead.companyName || item.title}
              </span>
              {item.priority === "High" && (
                <span
                  className="badge badge-danger"
                  style={{ fontSize: 10, padding: "2px 6px" }}
                >
                  HIGH PRIORITY
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={12} /> {lead.contactName}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={12} /> Last: {lead.createdAt}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MessageSquare size={12} /> {lead.disposition}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: "6px", color: "#10b981" }}
              title="Mark Complete"
              onClick={() => updateTask(item.id, { status: "completed" })}
            >
              <CheckCircle size={18} />
            </button>
            <button
              className="btn btn-primary btn-sm"
              style={{ background: "#10b981", borderColor: "#10b981" }}
            >
              <Phone size={14} /> Call Now
            </button>
            <button className="btn btn-ghost btn-sm" style={{ padding: "6px" }}>
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {item.notes && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              background: "var(--bg-surface)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--text-secondary)",
              border: "1px dashed var(--border-subtle)",
            }}
          >
            <b>Latest Note:</b> {item.notes || "No recent notes provided."}
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <div className="animate-pulse" style={{ color: "var(--text-muted)" }}>
          Loading Work Queue...
        </div>
      </div>
    );

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">MY DAILY EXECUTION</div>
          <h1 className="page-title">Work Queue</h1>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="search-wrapper" style={{ width: 300 }}>
            <Search className="search-icon" size={16} />
            <input
              className="search-input"
              placeholder="Search work queue..."
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid var(--brand-primary)"
                  : "2px solid transparent",
              color:
                activeTab === tab.id
                  ? "var(--brand-primary)"
                  : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: 11,
                background:
                  activeTab === tab.id
                    ? "var(--brand-primary)"
                    : "var(--bg-surface)",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                padding: "2px 8px",
                borderRadius: 10,
                border:
                  activeTab === tab.id
                    ? "none"
                    : "1px solid var(--border-subtle)",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div
        className="form-grid"
        style={{
          gridTemplateColumns: "1.5fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Main List */}
        <div>
          {activeTab === "today" && (
            <>
              {todayFollowUps.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      marginBottom: 16,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Today's Follow-ups
                  </h3>
                  {todayFollowUps.map((t) => renderTaskCard(t, "task"))}
                </div>
              )}

              {callbackQueue.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#06b6d4",
                      marginBottom: 16,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Callbacks Queue
                  </h3>
                  {callbackQueue.map((l) => renderTaskCard(l, "lead"))}
                </div>
              )}

              {todayFollowUps.length === 0 && callbackQueue.length === 0 && (
                <div
                  className="studio-card"
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <CheckCircle
                    size={48}
                    style={{ marginBottom: 16, opacity: 0.2 }}
                  />
                  <p>
                    All clear for today! No pending follow-ups or callbacks.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "overdue" && (
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ef4444",
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Overdue Execution
              </h3>
              {overdueFollowUps.length > 0 ? (
                overdueFollowUps.map((t) => renderTaskCard(t, "task"))
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  Great job! No overdue tasks.
                </p>
              )}
            </div>
          )}

          {activeTab === "upcoming" && (
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Upcoming Priorities
              </h3>
              {upcomingFollowUps.map((t) => renderTaskCard(t, "task"))}
            </div>
          )}

          {activeTab === "priority" && (
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#8b5cf6",
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                High Value Leads
              </h3>
              {priorityLeads.map((l) => renderTaskCard(l, "lead"))}
            </div>
          )}
        </div>

        {/* Sidebar Mini-Dashboard for Work Queue */}
        <div style={{ position: "sticky", top: 24 }}>
          <div
            className="studio-card"
            style={{
              padding: 24,
              marginBottom: 24,
              background:
                "linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.05) 100%)",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              Queue Statistics
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: "var(--bg-surface)",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  Completed Today
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}
                >
                  {
                    bdeTasks.filter(
                      (t) =>
                        t.status === "completed" &&
                        t.updatedAt?.startsWith(today),
                    ).length
                  }
                </div>
              </div>
              <div
                style={{
                  background: "var(--bg-surface)",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  Total Leads
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: 700, color: "#6366f1" }}
                >
                  {bdeLeads.length}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  Daily Task Progress
                </span>
                <span style={{ fontWeight: 600 }}>
                  {bdeTasks.filter((t) => t.status === "completed").length}/
                  {bdeTasks.length} Done
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--bg-surface)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(bdeTasks.filter((t) => t.status === "completed").length / (bdeTasks.length || 1)) * 100}%`,
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    borderRadius: 4,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="studio-card" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                AI Suggested Next
              </h3>
            </div>
            <div
              style={{
                background: "var(--bg-surface)",
                padding: 16,
                borderRadius: 12,
                border: "1px solid #f59e0b40",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                {priorityLeads[0]?.companyName || "Next Lead"}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                High intent score. Lead is in{" "}
                <b>{priorityLeads[0]?.milestone || "Active"}</b> stage. Best
                time to call: <b>Now</b>.
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: "100%", marginTop: 12 }}
              >
                Quick Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
