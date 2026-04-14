import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Role, Job } from '../types';
import { Card, Button, Input, Modal, Badge, Select, Checkbox } from '../components/UI';
import { MapPin, Briefcase, DollarSign, Search, Wand2, Trash2, Flame, Edit } from 'lucide-react';
import { generateJobDescription } from '../services/geminiService';

export const Jobs: React.FC = () => {
  const { currentUser, jobs, companies, addJob, deleteJob, applyForJob, applications } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Create Job State
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: [],
    isUrgent: false
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  if (!currentUser) return null;

  const isStudent = currentUser.role === Role.STUDENT;
  
  // Filtering
  const filteredJobs = jobs.filter(job => {
    const company = companies.find(c => c.id === job.companyId);
    const matchesText = job.title.toLowerCase().includes(filter.toLowerCase()) || 
                        company?.name.toLowerCase().includes(filter.toLowerCase());
    const matchesLoc = locationFilter ? job.location.toLowerCase().includes(locationFilter.toLowerCase()) : true;
    return matchesText && matchesLoc;
  });

  const handleGenerateDescription = async () => {
    if (!newJob.title) return alert("Please enter a job title first.");
    setIsGenerating(true);
    const companyName = companies.find(c => c.id === currentUser.companyId)?.name || "Our Company";
    const skillsToUse = skillsInput || "General Requirements";
    const desc = await generateJobDescription(newJob.title!, skillsToUse, companyName);
    setNewJob({ ...newJob, description: desc });
    setIsGenerating(false);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description) return;
    
    addJob({
      id: Math.random().toString(36).substr(2, 9),
      companyId: currentUser.companyId || 'c1',
      title: newJob.title,
      description: newJob.description,
      location: newJob.location || 'Remote',
      type: newJob.type || 'Full-time',
      requirements: skillsInput ? skillsInput.split(',').map(s => s.trim()) : newJob.description?.split('\n').filter(l => l.startsWith('-')) || [],
      postedBy: currentUser.id,
      postedAt: new Date().toISOString(),
      isUrgent: newJob.isUrgent
    } as Job);
    setShowCreateModal(false);
    setNewJob({ title: '', description: '', location: '', type: 'Full-time', isUrgent: false });
    setSkillsInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{isStudent ? 'Find Your Dream Job' : 'Job Openings'}</h2>
          <p className="text-gray-500">{isStudent ? 'Explore opportunities from top companies' : 'Manage your posted jobs'}</p>
        </div>
        {!isStudent && (
          <Button onClick={() => setShowCreateModal(true)}>+ Post New Job</Button>
        )}
      </div>

      {/* Filters */}
      <Card className="flex flex-col md:flex-row gap-4" noPadding>
        <div className="p-4 flex-1 flex gap-4">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-3 text-gray-400" size={18} />
             <input 
                type="text" 
                placeholder="Search jobs or companies..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={filter}
                onChange={e => setFilter(e.target.value)}
             />
           </div>
           <select 
              className="border rounded-lg px-4 py-2 bg-white"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            >
             <option value="">All Locations</option>
             <option value="Bangalore">Bangalore</option>
             <option value="Remote">Remote</option>
             <option value="Mumbai">Mumbai</option>
           </select>
        </div>
      </Card>

      {/* Job List */}
      <div className="grid gap-6">
        {filteredJobs.map(job => {
          const company = companies.find(c => c.id === job.companyId);
          const hasApplied = applications.some(a => a.jobId === job.id && a.studentId === currentUser.id);
          const isMyJob = job.postedBy === currentUser.id;

          return (
            <Card key={job.id} className={`hover:shadow-md transition-shadow relative overflow-hidden ${job.isUrgent ? 'border-orange-200 dark:border-orange-900/50' : ''}`}>
              {/* Urgent Background Effect */}
              {job.isUrgent && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100 to-transparent dark:from-orange-900/20 pointer-events-none rounded-bl-full -mr-4 -mt-4"></div>
              )}

              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border">
                  {company?.logo ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" /> : <Briefcase className="text-gray-400" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                          {job.isUrgent && (
                            <span className="flex items-center gap-1 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                                <Flame size={12} fill="currentColor" /> Urgent
                            </span>
                          )}
                      </div>
                      <p className="text-indigo-600 font-medium no-copy">{company?.name}</p>
                    </div>
                    {isStudent && (
                      hasApplied 
                      ? <Badge color="green">Applied</Badge> 
                      : <Button onClick={() => applyForJob(job.id, currentUser.id)} variant="primary" className="py-1 px-3 text-sm">Apply Now</Button>
                    )}
                    {!isStudent && (currentUser.role === Role.ADMIN || isMyJob) && (
                      <button onClick={() => deleteJob(job.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 my-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={16} /> {job.type}</span>
                    <span className="flex items-center gap-1"><DollarSign size={16} /> Competitive</span>
                  </div>

                  {/* Privacy protection for description if needed, though usually public */}
                  <div className="text-gray-600 text-sm line-clamp-2 md:line-clamp-none whitespace-pre-line">
                    {job.description}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-gray-400">No jobs found matching your criteria.</div>
        )}
      </div>

      {/* Create Job Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Post New Job">
        <form onSubmit={handleCreateJob} className="space-y-4">
          <Input 
            label="Job Title" 
            value={newJob.title} 
            onChange={e => setNewJob({...newJob, title: e.target.value})} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
             <Input 
                label="Location" 
                value={newJob.location} 
                onChange={e => setNewJob({...newJob, location: e.target.value})} 
             />
             <Select 
                label="Type"
                value={newJob.type}
                onChange={e => setNewJob({...newJob, type: e.target.value})}
             >
               <option>Full-time</option>
               <option>Part-time</option>
               <option>Internship</option>
             </Select>
          </div>

          <Input
            label="Key Skills (e.g. React, Node.js)"
            placeholder="Required skills for AI generation..."
            value={skillsInput}
            onChange={e => setSkillsInput(e.target.value)}
          />

          <div className="py-2">
            <Checkbox 
                label="Mark as Urgent Hiring"
                checked={newJob.isUrgent}
                onChange={(e) => setNewJob({...newJob, isUrgent: (e.target as HTMLInputElement).checked})}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => descriptionRef.current?.focus()}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Edit size={12} /> Edit Manually
                  </button>
                  <button 
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <Wand2 size={12} /> {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
                  </button>
              </div>
            </div>
            <textarea 
              ref={descriptionRef}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-64 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              value={newJob.description}
              onChange={e => setNewJob({...newJob, description: e.target.value})}
              placeholder="Enter job description or generate with AI..."
              required
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit">Post Job</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};