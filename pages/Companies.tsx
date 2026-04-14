import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Company, Role } from '../types';
import { Card, Button, Input, Modal } from '../components/UI';
import { Building2, Mail, Phone, MapPin, Upload } from 'lucide-react';

export const Companies: React.FC = () => {
  const { currentUser, companies, addCompany } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({});

  if (!currentUser) return null;

  // Admin and Student can see all companies. HR can only see their own.
  const filteredCompanies = (currentUser.role === Role.ADMIN || currentUser.role === Role.STUDENT)
    ? companies 
    : companies.filter(c => c.id === currentUser.companyId);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name) return;
    addCompany({
        id: Math.random().toString(36).substr(2, 9),
        name: newCompany.name!,
        email: newCompany.email || '',
        address: newCompany.address || '',
        hrContact: newCompany.hrContact || '',
        hrName: newCompany.hrName || currentUser.name,
        logo: newCompany.logo || 'https://picsum.photos/200'
    } as Company);
    setShowModal(false);
    setNewCompany({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCompany(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentUser.role === Role.STUDENT ? 'Top Recruiters' : 'Company & HR Details'}
        </h2>
        {currentUser.role === Role.ADMIN && (
            <Button onClick={() => setShowModal(true)}>+ Add Company</Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredCompanies.map(c => (
            <Card key={c.id} className="no-copy">
                <div className="flex items-start gap-4">
                    <img src={c.logo} alt={c.name} className="w-20 h-20 rounded-lg object-cover border" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{c.name}</h3>
                        <div className="space-y-2 mt-3 text-sm text-gray-600 dark:text-gray-300">
                            {c.email && <div className="flex items-center gap-2"><Mail size={16}/> {c.email}</div>}
                            <div className="flex items-center gap-2">
                                <Phone size={16}/> 
                                {currentUser.role === Role.STUDENT ? 'Contact HR via App' : `${c.hrContact} (${c.hrName})`}
                            </div>
                            {c.address && <div className="flex items-center gap-2"><MapPin size={16}/> {c.address}</div>}
                            {c.website && <div className="flex items-center gap-2"><Building2 size={16}/> {c.website}</div>}
                        </div>
                    </div>
                </div>
            </Card>
        ))}
        {filteredCompanies.length === 0 && (
            <div className="col-span-2 text-center text-gray-500">No companies listed yet.</div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Client Company">
          <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors">
                    {newCompany.logo ? (
                      <img src={newCompany.logo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload size={24} className="mx-auto mb-1" />
                        <span className="text-xs">Upload Logo</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <Input label="Company Name" value={newCompany.name || ''} onChange={e => setNewCompany({...newCompany, name: e.target.value})} required />
              <Input label="Email" type="email" value={newCompany.email || ''} onChange={e => setNewCompany({...newCompany, email: e.target.value})} />
              <Input label="Address" value={newCompany.address || ''} onChange={e => setNewCompany({...newCompany, address: e.target.value})} />
              <Input label="HR Contact Name" value={newCompany.hrName || ''} onChange={e => setNewCompany({...newCompany, hrName: e.target.value})} />
              <Input label="HR Contact Phone" value={newCompany.hrContact || ''} onChange={e => setNewCompany({...newCompany, hrContact: e.target.value})} />
              <div className="flex justify-end pt-4">
                  <Button type="submit">Save Company</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};