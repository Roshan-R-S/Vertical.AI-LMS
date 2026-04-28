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
    () => !!sessionStorage.getItem("lms_token"),
  );
  const [processing, setProcessing] = useState(false);
  const [theme, setTheme] = useState("light");

  const [notifications, setNotifications] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [settings, setSettings] = useState({});
  const [teams, setTeams] = useState([]);
  const [targets, setTargets] = useState([]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const fetchInitialData = async () => {
    const fetchSafe = async (path, fallback = []) => {
      try {
        const res = await api.get(path);
        return res || fallback;
      } catch (err) {
        console.error(`Fetch error for ${path}:`, err);
        return fallback;
      }
    };

    const [l, c, u, m, d, t, i, n, s, a, int, tm, tg] = await Promise.all([
      fetchSafe("/leads"),
      fetchSafe("/clients"),
      fetchSafe("/users"),
      fetchSafe("/milestones"),
      fetchSafe("/dispositions"),
      fetchSafe("/tasks"),
      fetchSafe("/invoices"),
      fetchSafe("/notifications"),
      fetchSafe("/settings", {}),
      fetchSafe("/attachments"),
      fetchSafe("/interactions"),
      fetchSafe("/teams"),
      fetchSafe("/targets"),
    ]);

    setLeads(l);
    setClients(c);
    setUsers(u);
    setMilestones(m);
    setDispositions(d);
    setTasks(t);
    setInvoices(i);
    setNotifications(n);
    setSettings(s);
    setAttachments(a);
    setInteractions(int);
    setTeams(tm);
    setTargets(tg);
    setLoading(false);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("lms_token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setCurrentUser(res.user);
          fetchInitialData();
        })
        .catch(() => {
          sessionStorage.removeItem("lms_token");
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

  const login = async (email, password) => {
    const result = await api.post("/auth/login", { email, password });
    // store token in sessionStorage to avoid persisting sensitive tokens in long-term storage
    sessionStorage.setItem("lms_token", result.token);
    setCurrentUser(result.user);
    await fetchInitialData();
  };

  const loginWithToken = async (token, user) => {
    sessionStorage.setItem("lms_token", token);
    setCurrentUser(user);
    await fetchInitialData();
  };

  const logout = () => {
    sessionStorage.removeItem("lms_token");
    setCurrentUser(null);
  };

  // Lead actions
  const addLead = async (lead) => {
    try {
      const res = await api.post("/leads", {
        ...lead,
        value: lead.value !== '' ? Number(lead.value) : 0,
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
      const res = await api.patch(`/leads/${id}`, {
        ...updates,
        ...(updates.value !== undefined && { value: Number(updates.value) }),
      });
      setLeads((prev) => prev.map((l) => (l.id === id ? res : l)));
      // Refresh notifications in case a milestone change triggered new ones
      api.get('/notifications').then(n => setNotifications(n)).catch(() => {});
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

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? Their leads and tasks will be reassigned to you.')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
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
      await api.upload(`/invoices/${invoiceId}/attachments`, formData);
      await fetchInitialData();
    } catch (err) {
      alert("Failed to upload invoice file: " + formatError(err));
      throw err;
    }
  };

  const uploadAttachment = async (type, id, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.upload(`/${type}/${id}/attachments`, formData);
      await fetchInitialData();
    } catch (err) {
      alert(`Failed to upload ${type} file: ` + formatError(err));
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

  const fetchDashboard = async (filters = {}, legacyBdeId = "All") => {
    try {
      const normalizedFilters =
        typeof filters === "string"
          ? { period: filters, bdeId: legacyBdeId }
          : filters;
      const params = new URLSearchParams();
      Object.entries(normalizedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "All") {
          params.set(key, value);
        }
      });
      const query = params.toString();
      return await api.get(`/analytics/dashboard${query ? `?${query}` : ""}`);
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

  // Disposition actions
  const addDisposition = async (disposition) => {
    try {
      const res = await api.post("/dispositions", disposition);
      setDispositions((prev) => [...prev, res]);
    } catch (err) {
      alert(formatError(err));
    }
  };

  const updateDisposition = async (id, updates) => {
    try {
      const res = await api.patch(`/dispositions/${id}`, updates);
      setDispositions((prev) => prev.map((d) => (d.id === id ? res : d)));
    } catch (err) {
      alert(formatError(err));
    }
  };

  const toggleDisposition = async (id) => {
    try {
      const res = await api.patch(`/dispositions/${id}/toggle`);
      setDispositions((prev) => prev.map((d) => (d.id === id ? res : d)));
    } catch (err) {
      alert(formatError(err));
    }
  };

  const deleteDisposition = async (id) => {
    try {
      await api.delete(`/dispositions/${id}`);
      setDispositions((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(formatError(err));
    }
  };

  // Milestone actions
  const addMilestone = async (milestone) => {
    try {
      const res = await api.post("/milestones", milestone);
      setMilestones((prev) => [...prev, res]);
    } catch (err) {
      alert(formatError(err));
    }
  };

  const updateMilestone = async (id, updates) => {
    try {
      const res = await api.patch(`/milestones/${id}`, updates);
      setMilestones((prev) => prev.map((m) => (m.id === id ? res : m)));
    } catch (err) {
      alert(formatError(err));
    }
  };

  const deleteMilestone = async (id) => {
    if (!window.confirm('Delete this milestone? This will fail if any leads are assigned to it.')) return;
    try {
      await api.delete(`/milestones/${id}`);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(formatError(err));
    }
  };

  // Attachment delete
  const deleteAttachment = async (id) => {
    try {
      await api.delete(`/attachments/${id}`);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(formatError(err));
    }
  };

  // Team actions
  const addTeam = async (name) => {
    try {
      const res = await api.post("/teams", { name });
      setTeams((prev) => [...prev, res]);
      return res;
    } catch (err) {
      alert(formatError(err));
      throw err;
    }
  };

  const setTarget = async (userId, month, year, amount) => {
    try {
      const res = await api.post("/targets", { userId, month, year, amount });
      setTargets((prev) => {
        const exists = prev.findIndex(t => t.userId === userId && t.month === month && t.year === year);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = res;
          return updated;
        }
        return [res, ...prev];
      });
      return res;
    } catch (err) {
      alert(formatError(err));
      throw err;
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
        attachments,
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
        deleteUser,
        addTask,
        updateTask,
        addInteraction,
        addInvoice,
        uploadInvoiceFile,
        uploadAttachment,
        markInvoicePaid,
        fetchDashboard,
        markNotificationRead,
        markAllNotificationsRead,
        settings,
        updateSettings,
        addDisposition,
        updateDisposition,
        toggleDisposition,
        deleteDisposition,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        deleteAttachment,
        teams,
        addTeam,
        targets,
        setTarget,
        login,
        loginWithToken,
        logout,
        loading,
        processing,
        formatError,
        downloadUrl: (id) => `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/attachments/${id}/download`,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
