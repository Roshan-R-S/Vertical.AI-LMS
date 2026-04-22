import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  UserPlus,
  Mail,
  Shield,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';
import { AddTeamModal } from '@components/AddTeamModal';
import { Pagination } from '@components/Pagination';
import { PageSizeSelector } from '@components/PageSizeSelector';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@lib/utils';
import { User, Role } from '@/types';
import { AddUserModal } from '@components/AddUserModal';
import { EditUserModal } from '@components/EditUserModal';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onUpdateUser: (id: string, data: Partial<User>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onAddUser: (data: any) => Promise<void>;
}

type SortField = 'name' | 'email' | 'role';
type SortOrder = 'asc' | 'desc';

export const UserManagement = ({ 
  users, 
  currentUser, 
  onUpdateUser, 
  onDeleteUser,
  onAddUser 
}: UserManagementProps) => {
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>(currentUser.role === 'TEAM_LEAD' ? 'teams' : 'users');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const matchesSearch = 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        const valA = (a[sortField] || '').toString().toLowerCase();
        const valB = (b[sortField] || '').toString().toLowerCase();
        if (sortOrder === 'asc') return valA.localeCompare(valB);
        return valB.localeCompare(valA);
      });
  }, [users, searchQuery, roleFilter, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
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

  const handleCreateTeam = async (teamName: string, leadId: string) => {
    try {
      await onUpdateUser(leadId, { 
        role: 'TEAM_LEAD',
        teamId: teamName 
      });
      alert(`Team '${teamName}' created successfully and lead assigned!`);
    } catch (err) {
      alert('Failed to create team.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User & Team Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage platform users, roles, and team hierarchy</p>
        </div>
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD') && (
          <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-widest",
                activeTab === 'users' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-widest",
                activeTab === 'teams' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Teams
            </button>
          </div>
        )}
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="flex justify-end">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all active:scale-95"
            >
              <UserPlus size={16} /> Add New User
            </button>
          </div>


      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as any); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="SALES_HEAD">Sales Head</option>
            <option value="TEAM_LEAD">Team Lead</option>
            <option value="BDE">BDE</option>
            <option value="CHANNEL_PARTNER">Channel Partner</option>
          </select>
        </div>

        <PageSizeSelector 
          pageSize={pageSize} 
          onChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Details</span>
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role & Permissions</span>
                    {sortField === 'role' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold shadow-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                            <Mail size={12} />
                            <span className="text-xs font-medium">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="text-brand-500" size={14} />
                        <span className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest",
                          user.role === 'SUPER_ADMIN' ? "bg-purple-50 text-purple-600 border border-purple-100" :
                          user.role === 'SALES_HEAD' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                          "bg-slate-100 text-slate-600 border border-slate-200"
                        )}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingUser(user); setIsEditModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteUser(user.id)}
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
            totalEntries={filteredUsers.length}
            pageSize={pageSize}
            label="users"
          />
        </div>
      </div>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Team Organization</h3>
            {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD') && (
              <button onClick={() => setIsCreateTeamModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
                <Plus size={14} />
                Create New Team
              </button>
            )}
          </div>

          {/* Team Hierarchy View */}
          <div className="grid grid-cols-1 gap-6">
            {users
              .filter(u => u.role === 'TEAM_LEAD')
              .filter(u => currentUser.role !== 'TEAM_LEAD' || u.id === currentUser.id)
              .map(teamLead => {
              const teamMembers = users.filter(u => u.teamId === teamLead.teamId && u.role === 'BDE');
              return (
                <div key={teamLead.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                        <Shield size={20} className="text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{teamLead.name}'s Team</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Lead ID: {teamLead.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD') && (
                      <button 
                        onClick={async () => {
                          const bdeToAssign = prompt("Enter BDE Email to assign to this team:");
                          if (bdeToAssign) {
                            const bde = users.find(u => u.email === bdeToAssign && u.role === 'BDE');
                            if (bde) {
                              await onUpdateUser(bde.id, { teamId: teamLead.teamId });
                            } else {
                              alert("BDE not found or user is not a BDE.");
                            }
                          }
                        }}
                        className="px-3 py-1 text-[10px] font-bold text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-all uppercase tracking-widest"
                      >
                        Assign BDE
                      </button>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {teamMembers.length === 0 ? (
                      <p className="col-span-full text-xs text-slate-400 italic py-4 text-center">No BDEs assigned to this team yet.</p>
                    ) : (
                      teamMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                          <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} alt={member.name} className="w-8 h-8 rounded-full border border-white shadow-sm" crossOrigin="anonymous" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{member.email}</p>
                          </div>
                          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD') && (
                            <button 
                              onClick={() => {
                                if(window.confirm(`Unassign ${member.name} from this team?`)) {
                                  onUpdateUser(member.id, { teamId: 'default-team' });
                                }
                              }}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

            {/* Unassigned BDEs */}
            <div className="bg-slate-50/50 rounded-lg border border-slate-200 border-dashed p-6 text-center">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Unassigned Sales Representatives</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {users.filter(u => u.role === 'BDE' && (!u.teamId || u.teamId === 'N/A' || u.teamId === 'default-team')).map(unassigned => (
                  <div key={unassigned.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                     <img src={unassigned.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${unassigned.id}`} alt={unassigned.name} className="w-6 h-6 rounded-full border border-slate-100" crossOrigin="anonymous" />
                     <span className="text-xs font-bold text-slate-700">{unassigned.name}</span>
                  </div>
                ))}
                {users.filter(u => u.role === 'BDE' && (!u.teamId || u.teamId === 'N/A' || u.teamId === 'default-team')).length === 0 && (
                  <p className="text-xs text-slate-400 italic">All representatives are assigned to teams.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddUser}
        currentUserRole={currentUser.role}
      />

      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditingUser(null); }}
        onSubmit={onUpdateUser}
        user={editingUser}
        currentUserRole={currentUser.role}
      />

      <AddTeamModal 
        isOpen={isCreateTeamModalOpen} 
        onClose={() => setIsCreateTeamModalOpen(false)}
        users={users}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  );
};
