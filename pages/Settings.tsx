import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Button, Input } from '../components/UI';
import { User, Shield } from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentUser, updateUser } = useStore();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: currentUser?.password || ''
  });
  const [success, setSuccess] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, formData);
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-600 dark:text-indigo-400">
            <Shield size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Account Settings</h2>
            <p className="text-gray-500 dark:text-gray-400">Update your profile and security preferences</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="flex items-center gap-4 mb-6">
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border-2 border-indigo-100"
              />
              <div>
                 <h3 className="font-semibold text-gray-800 dark:text-white">{currentUser.name}</h3>
                 <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                    {currentUser.role}
                 </span>
              </div>
           </div>

           <div className="grid gap-4">
              <Input 
                label="Full Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                icon={<User size={18} />}
              />
              <Input 
                label="Email Address" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <Input 
                label="Password" 
                type="text" // Visible for demo ease as per request
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
           </div>

           {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm text-center font-medium">
                  {success}
              </div>
           )}

           <div className="flex justify-end pt-2">
              <Button type="submit">Save Changes</Button>
           </div>
        </form>
      </Card>
    </div>
  );
};