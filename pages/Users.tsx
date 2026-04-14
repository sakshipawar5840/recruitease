import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Role, UserStatus } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { Shield, ShieldAlert, CheckCircle, Ban, Search, ChevronDown } from 'lucide-react';

export const UsersList: React.FC = () => {
  const { currentUser, users, updateUser } = useStore();
  const [filter, setFilter] = useState('');

  if (!currentUser || currentUser.role !== Role.ADMIN) return null;

  // Filter and Sort (Newest first)
  const filteredUsers = users
    .filter(u => 
      (u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())) &&
      u.id !== currentUser.id // Hide self
    )
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const toggleStatus = (userId: string, currentStatus: UserStatus) => {
     const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
     updateUser(userId, { status: newStatus });
  };

  const approveUser = (userId: string) => {
      updateUser(userId, { status: UserStatus.ACTIVE });
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
      updateUser(userId, { role: newRole });
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
          <div className="relative w-64">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search users..." 
               className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
               value={filter}
               onChange={e => setFilter(e.target.value)}
             />
          </div>
       </div>

       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm">
                  <tr>
                     <th className="p-4">User</th>
                     <th className="p-4">Info</th>
                     <th className="p-4">Role</th>
                     <th className="p-4">Status</th>
                     <th className="p-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredUsers.map(user => (
                     <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border dark:border-gray-600" />
                              <div>
                                 <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                 <p className="text-[10px] text-gray-400 mt-0.5">
                                   Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                 </p>
                              </div>
                           </div>
                        </td>
                        <td className="p-4">
                            {user.role === Role.STUDENT && user.department && (
                                <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800">
                                    {user.department}
                                </span>
                            )}
                            {user.role === Role.HR && user.companyName && (
                                <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded border border-purple-100 dark:border-purple-800">
                                    {user.companyName}
                                </span>
                            )}
                            {user.role === Role.ADMIN && (
                                <span className="text-xs text-gray-400">System Admin</span>
                            )}
                        </td>
                        <td className="p-4">
                           <div className="relative inline-block group">
                             <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                className={`appearance-none pl-3 pr-8 py-1.5 rounded text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 outline-none transition-all
                                   ${user.role === Role.HR ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 
                                     user.role === Role.ADMIN ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 
                                     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}
                             >
                                <option value={Role.STUDENT}>STUDENT</option>
                                <option value={Role.HR}>HR</option>
                                <option value={Role.ADMIN}>ADMIN</option>
                             </select>
                             <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDown size={14} className={`opacity-70 ${
                                   user.role === Role.HR ? 'text-purple-700 dark:text-purple-300' : 
                                   user.role === Role.ADMIN ? 'text-red-700 dark:text-red-300' : 
                                   'text-blue-700 dark:text-blue-300'
                                }`} />
                             </div>
                           </div>
                        </td>
                        <td className="p-4">
                           {user.status === UserStatus.PENDING ? (
                               <Badge color="yellow">Pending</Badge>
                           ) : user.status === UserStatus.SUSPENDED ? (
                               <Badge color="red">Suspended</Badge>
                           ) : (
                               <Badge color="green">Active</Badge>
                           )}
                        </td>
                        <td className="p-4 text-right">
                           <div className="flex justify-end gap-2">
                              {user.status === UserStatus.PENDING && (
                                  <button 
                                    onClick={() => approveUser(user.id)}
                                    className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                                    title="Approve User"
                                  >
                                     <CheckCircle size={18} />
                                  </button>
                              )}
                              <button 
                                 onClick={() => toggleStatus(user.id, user.status)}
                                 className={`p-1.5 rounded transition-colors ${
                                     user.status === UserStatus.SUSPENDED 
                                     ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30' 
                                     : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                                 }`}
                                 title={user.status === UserStatus.SUSPENDED ? "Unblock User" : "Block User"}
                              >
                                 {user.status === UserStatus.SUSPENDED ? <Shield size={18} /> : <Ban size={18} />}
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
             <div className="p-8 text-center text-gray-500">No users found.</div>
          )}
       </div>
    </div>
  );
};