import React from 'react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../mockData';
import { UserPlus, MoreVertical, Shield, Mail, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const UserManagement = ({ users, setUsers }: UserManagementProps) => {
  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">Manage your team roles and permissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all">
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-slate-200" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-brand-500" />
                    <span className="text-xs font-semibold text-slate-700">{user.role.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-slate-600">{user.teamId || 'N/A'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Active</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
