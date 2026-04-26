import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { AppContext } from "./AppContextCore";

export default function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [dispositions, setDispositions] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem("lms_token"),
  );
  const [processing, setProcessing] = useState(false);
  const [theme, setTheme] = useState("light");

  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const fetchInitialData = async () => {
    try {
      const [l, c, u, m, d, t, i, n, s] = await Promise.all([
        api.get("/leads"),
        api.get("/clients"),
        api.get("/users"),
        api.get("/milestones"),
        api.get("/dispositions"),
        api.get("/tasks"),
        api.get("/invoices"),
        api.get("/notifications"),
        api.get("/settings"),
      ]);

      setLeads(l);
      setClients(c);
      setUsers(u);
      setMilestones(m);
      setDispositions(d);
      setTasks(t);
      setInvoices(i);
      setNotifications(n);
      setSettings(s || {});
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("lms_token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setCurrentUser(res.user);
          fetchInitialData();
        })
        .catch(() => {
          localStorage.removeItem("lms_token");
          setLoading(false);
        });
    }
  }, []);

  const formatError = (err) => {
    if (err.data && err.data.errors) {
      return `${err.message}: ${err.data.errors.map((e) => e.message).join(", ")}`;
    }
    return err.message;
  };

  const login = async (role) => {
    try {
      const result = await api.post("/auth/demo-login", { role });
      localStorage.setItem("lms_token", result.token);
      setCurrentUser(result.user);
      await fetchInitialData();
    } catch (err) {
      alert(formatError(err));
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("lms_token");
    setCurrentUser(null);
  };

  // Lead actions
  const addLead = async (lead) => {
    try {
      const res = await api.post("/leads", {
        ...lead,
        assignedToId: lead.assignedToId || currentUser.id,
        milestoneId: lead.milestoneId || milestones[0]?.id,
        dispositionId: lead.dispositionId || dispositions[0]?.id,
      });
      setLeads((prev) => [res, ...prev]);
    } catch (err) {
      alert(formatError(err));
    }
  };

  const bulkAddLeads = async (leads) => {
    setProcessing(true);
    try {
      await api.post("/leads/bulk", leads);
      await fetchInitialData();
    } catch (err) {
      alert("Bulk import failed: " + formatError(err));
    } finally {
      setProcessing(false);
    }
  };

  const updateLead = async (id, updates) => {
    try {
      const res = await api.patch(`/leads/${id}`, updates);
      setLeads((prev) => prev.map((l) => (l.id === id ? res : l)));
    } catch (err) {
      alert(formatError(err));
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(formatError(err));
    }
  };

  // Client actions
  const addClient = async (client) => {
    try {
      const res = await api.post("/clients", client);
      setClients((prev) => [res, ...prev]);
    } catch (err) {
      alert(formatError(err));
    }
  };

  const updateClient = async (id, updates) => {
    try {
      const res = await api.patch(`/clients/${id}`, updates);
      setClients((prev) => prev.map((c) => (c.id === id ? res : c)));
    } catch (err) {
      alert(formatError(err));
    }
  };

  // User actions (Super Admin only)
  const addUser = async (user) => {
    try {
      const res = await api.post("/users", user);
      setUsers((prev) => [res, ...prev]);
    } catch (err) {
      alert(formatError(err));
    }
  };

  const updateUser = async (id, updates) => {
    try {
      const res = await api.patch(`/users/${id}`, updates);
      setUsers((prev) => prev.map((u) => (u.id === id ? res : u)));
    } catch (err) {
      alert(formatError(err));
    }
  };

  const toggleUserStatus = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    try {
      const res = await api.patch(`/users/${id}/status`);
      setUsers((prev) => prev.map((u) => (u.id === id ? res : u)));
    } catch (err) {
      alert(formatError(err));
    }
  };

  // Tasks
  const addTask = async (task) => {
    try {
      const res = await api.post("/tasks", {
        ...task,
        createdById: currentUser.id,
      });
      setTasks((prev) => [res, ...prev]);
    } catch (err) {
      alert(formatError(err));
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await api.patch(`/tasks/${id}`, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? res : t)));
    } catch (err) {
      alert(formatError(err));
    }
  };

  // Interactions
  const addInteraction = async (interaction) => {
    try {
      const res = await api.post(`/leads/${interaction.leadId}/interactions`, {
        ...interaction,
        performedById: currentUser.id,
      });
      setInteractions((prev) => [res, ...prev]);
    } catch (err) {
      alert(formatError(err));
    }
  };

  const convertLead = async (id) => {
    setProcessing(true);
    try {
      const res = await api.post(`/leads/${id}/convert`);
      const client = res.client;
      // Update local state
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "won" } : l)),
      );
      setClients((prev) => [client, ...prev]);
      // Update history references in local state
      setInteractions((prev) =>
        prev.map((i) => (i.leadId === id ? { ...i, clientId: client.id } : i)),
      );
      setTasks((prev) =>
        prev.map((t) => (t.leadId === id ? { ...t, clientId: client.id } : t)),
      );

      return client;
    } catch (err) {
      alert(formatError(err));
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  // Invoices
  const addInvoice = async (invoice) => {
    try {
      const res = await api.post("/invoices", invoice);
      await fetchInitialData();
      return res;
    } catch (err) {
      alert(formatError(err));
      throw err;
    }
  };

  const uploadInvoiceFile = async (invoiceId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/invoices/${invoiceId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchInitialData();
    } catch (err) {
      alert("Failed to upload invoice file: " + formatError(err));
      throw err;
    }
  };

  const markInvoicePaid = async (id, amount) => {
    try {
      await api.patch(`/invoices/${id}/mark-paid`, { paidAmount: amount });
      await fetchInitialData();
    } catch (err) {
      alert(formatError(err));
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("Mark notification read error:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all notifications read error:", err);
    }
  };

  const fetchDashboard = async (period = "this-month", bdeId = "All") => {
    try {
      const bdeQuery = bdeId !== "All" ? `&bdeId=${bdeId}` : "";
      return await api.get(`/analytics/dashboard?period=${period}${bdeQuery}`);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      return null;
    }
  };

  const updateSettings = async (updates) => {
    try {
      const res = await api.patch("/settings", updates);
      setSettings(res);
    } catch (err) {
      alert(formatError(err));
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        leads,
        clients,
        users,
        milestones,
        dispositions,
        interactions,
        invoices,
        notifications,
        tasks,
        addLead,
        bulkAddLeads,
        updateLead,
        deleteLead,
        convertLead,
        addClient,
        updateClient,
        addUser,
        updateUser,
        toggleUserStatus,
        addTask,
        updateTask,
        addInteraction,
        addInvoice,
        uploadInvoiceFile,
        markInvoicePaid,
        fetchDashboard,
        markNotificationRead,
        markAllNotificationsRead,
        settings,
        updateSettings,
        login,
        logout,
        loading,
        processing,
        formatError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
