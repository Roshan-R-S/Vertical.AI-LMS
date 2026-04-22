import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Trash2, UserPlus, Mail, Phone, Calendar, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Building } from 'lucide-react';
import { cn, formatDate } from '@lib/utils';
import { Client } from '@/types';
import { EditClientModal } from '@components/EditClientModal';
import { Pagination } from '@components/Pagination';
import { PageSizeSelector } from '@components/PageSizeSelector';

type SortField = 'name' | 'company' | 'onboardingDate' | 'amcStatus';
type SortOrder = 'asc' | 'desc';

export const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [amcFilter, setAmcFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('lendkraft_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);



  const handleUpdateClient = async (id: string, clientData: any) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('lendkraft_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/clients/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        await fetchClients();
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error('Error updating client:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const token = localStorage.getItem('lendkraft_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchClients();
      }
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Filter & Search Logic
  const filteredClients = useMemo(() => {
    return clients
      .filter(client => {
        const matchesSearch = 
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAMC = amcFilter === 'ALL' || client.amcStatus === amcFilter;
        return matchesSearch && matchesAMC;
      })
      .sort((a, b) => {
        const valA = (a[sortField] || '').toString().toLowerCase();
        const valB = (b[sortField] || '').toString().toLowerCase();
        if (sortOrder === 'asc') return valA.localeCompare(valB);
        return valB.localeCompare(valA);
      });
  }, [clients, searchQuery, amcFilter, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
            {filteredClients.length} of {clients.length}
          </span>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <select
            value={amcFilter}
            onChange={(e) => { setAmcFilter(e.target.value as any); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All AMC Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="EXPIRED">Expired Only</option>
          </select>
        </div>

        <PageSizeSelector 
          pageSize={pageSize} 
          onChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</span>
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('company')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</span>
                    {sortField === 'company' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('onboardingDate')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Onboarding</span>
                    {sortField === 'onboardingDate' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('amcStatus')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AMC Status</span>
                    {sortField === 'amcStatus' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-widest">Loading Clients...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No clients found.</td>
                </tr>
              ) : (
                paginatedClients.map(client => (
                  <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{client.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Mail size={10} /> {client.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{client.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(client.onboardingDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "status-pill",
                        client.amcStatus === 'ACTIVE' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {client.amcStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingClient(client); setIsEditModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized Pagination Footer */}
        <div className="p-4 border-t border-slate-100">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalEntries={filteredClients.length}
            pageSize={pageSize}
            label="clients"
          />
        </div>
      </div>

      <EditClientModal 
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingClient(null); }}
        onSubmit={handleUpdateClient}
        client={editingClient}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
