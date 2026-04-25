import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { AppContext } from './AppContextCore';


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
  const [loading, setLoading] = useState(() => !!localStorage.getItem('lms_token'));
  const [theme, setTheme] = useState('light');


  const [notifications] = useState([
    { id: 1, text: 'FinEdge Capital — proposal follow-up due', type: 'warning', time: '2h ago' },
    { id: 2, text: 'SwiftLogix deal moved to Negotiation', type: 'success', time: '3h ago' },
    { id: 3, text: 'Invoice INV-2026-003 overdue', type: 'danger', time: '5h ago' },
  ]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const fetchInitialData = async () => {
    try {
      const [l, c, u, m, d, t, i] = await Promise.all([

        api.get('/leads'),
        api.get('/clients'),
        api.get('/users'),
        api.get('/milestones'),
        api.get('/dispositions'),
        api.get('/tasks'),
        api.get('/invoices'),
      ]);

      setLeads(l);
      setClients(c);
      setUsers(u);
      setMilestones(m);
      setDispositions(d);
      setTasks(t);
      setInvoices(i);

    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setCurrentUser(res.user);
          fetchInitialData();
        })
        .catch(() => {
          localStorage.removeItem('lms_token');
          setLoading(false);
        });
    }
  }, []);


  const login = async (role) => {
    try {
      const result = await api.post('/auth/demo-login', { role });
      localStorage.setItem('lms_token', result.token);
      setCurrentUser(result.user);
      await fetchInitialData();
    } catch (err) {
      alert(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    setCurrentUser(null);
  };

  // Lead actions
  const addLead = async (lead) => {
    try {
      const res = await api.post('/leads', {
        ...lead,
        assignedToId: lead.assignedToId || currentUser.id,
        milestoneId: lead.milestoneId || milestones[0]?.id,
        dispositionId: lead.dispositionId || dispositions[0]?.id,
      });
      setLeads(prev => [res, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateLead = async (id, updates) => {
    try {
      const res = await api.patch(`/leads/${id}`, updates);
      setLeads(prev => prev.map(l => l.id === id ? res : l));
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Client actions
  const addClient = async (client) => {
    try {
      const res = await api.post('/clients', client);
      setClients(prev => [res, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateClient = async (id, updates) => {
    try {
      const res = await api.patch(`/clients/${id}`, updates);
      setClients(prev => prev.map(c => c.id === id ? res : c));
    } catch (err) {
      alert(err.message);
    }
  };

  // User actions (Super Admin only)
  const addUser = async (user) => {
    try {
      const res = await api.post('/users', user);
      setUsers(prev => [res, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateUser = async (id, updates) => {
    try {
      const res = await api.patch(`/users/${id}`, updates);
      setUsers(prev => prev.map(u => u.id === id ? res : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleUserStatus = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    try {
      const res = await api.patch(`/users/${id}`, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: res.isActive ? 'active' : 'inactive' } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  // Tasks
  const addTask = async (task) => {
    try {
      const res = await api.post('/tasks', {
        ...task,
        createdById: currentUser.id
      });
      setTasks(prev => [res, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await api.patch(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(t => t.id === id ? res : t));
    } catch (err) {
      alert(err.message);
    }
  };

  // Interactions
  const addInteraction = async (interaction) => {
    try {
      const res = await api.post(`/leads/${interaction.leadId}/interactions`, {
        ...interaction,
        performedById: currentUser.id
      });
      setInteractions(prev => [res, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };

  const convertLead = async (id) => {
    try {
      const res = await api.post(`/leads/${id}/convert`);
      // Update local state
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'won' } : l));
      setClients(prev => [res.client, ...prev]);
      return res.client;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  // Invoices
  const addInvoice = async (invoice) => {
    try {
      const res = await api.post('/invoices', invoice);
      await fetchInitialData();
      return res;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const uploadInvoiceFile = async (invoiceId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/invoices/${invoiceId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchInitialData();
    } catch (err) {
      alert("Failed to upload invoice file: " + err.message);
      throw err;
    }
  };


  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      currentUser, leads, clients, users, milestones, dispositions, interactions, invoices, notifications, tasks,
      addLead, updateLead, deleteLead, convertLead,
      addClient, updateClient,
      addUser, updateUser, toggleUserStatus,
      addTask, updateTask,
      addInteraction,
      addInvoice, uploadInvoiceFile,
      login, logout, loading,

    }}>
      {children}
    </AppContext.Provider>
  );
}

