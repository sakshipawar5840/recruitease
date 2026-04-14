import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Button, Input, Card } from '../components/UI';
import { Download, Printer, Phone, Mail, MapPin, Briefcase, GraduationCap, Code } from 'lucide-react';

export const ResumeBuilder: React.FC = () => {
  const { currentUser } = useStore();
  const [resumeData, setResumeData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    summary: 'A passionate individual looking to leverage skills in a professional environment.',
    education: currentUser?.department ? `${currentUser.department} - ${currentUser.yearOfPassing || '2025'}` : '',
    experience: '',
    skills: currentUser?.skills?.join(', ') || ''
  });

  if (!currentUser) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
       {/* Editor Section - Hidden when printing */}
       <div className="w-full lg:w-1/3 space-y-4 print:hidden">
          <Card>
            <h2 className="text-xl font-bold mb-4">Resume Details</h2>
            <div className="space-y-4">
               <Input label="Full Name" value={resumeData.name} onChange={e => setResumeData({...resumeData, name: e.target.value})} />
               <Input label="Email" value={resumeData.email} onChange={e => setResumeData({...resumeData, email: e.target.value})} />
               <Input label="Phone" value={resumeData.phone} onChange={e => setResumeData({...resumeData, phone: e.target.value})} />
               <Input label="Location" value={resumeData.location} onChange={e => setResumeData({...resumeData, location: e.target.value})} />
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Summary</label>
                 <textarea 
                   className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-gray-600 focus:outline-none"
                   rows={3}
                   value={resumeData.summary}
                   onChange={e => setResumeData({...resumeData, summary: e.target.value})}
                 ></textarea>
               </div>

               <Input label="Education" value={resumeData.education} onChange={e => setResumeData({...resumeData, education: e.target.value})} />
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience / Projects</label>
                 <textarea 
                   className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-gray-600 focus:outline-none"
                   rows={3}
                   value={resumeData.experience}
                   onChange={e => setResumeData({...resumeData, experience: e.target.value})}
                   placeholder="Internships, Projects..."
                 ></textarea>
               </div>
               
               <Input label="Skills (comma separated)" value={resumeData.skills} onChange={e => setResumeData({...resumeData, skills: e.target.value})} />

               <Button onClick={handlePrint} className="w-full gap-2">
                  <Printer size={18} /> Print / Save as PDF
               </Button>
            </div>
          </Card>
       </div>

       {/* Preview Section */}
       <div className="w-full lg:w-2/3">
          <div className="bg-white text-gray-900 p-8 shadow-lg min-h-[800px] print:shadow-none print:w-full print:absolute print:top-0 print:left-0 print:m-0" id="resume-preview">
             <div className="border-b-2 border-gray-800 pb-6 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-wider">{resumeData.name}</h1>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    {resumeData.email && <span className="flex items-center gap-1"><Mail size={14}/> {resumeData.email}</span>}
                    {resumeData.phone && <span className="flex items-center gap-1"><Phone size={14}/> {resumeData.phone}</span>}
                    {resumeData.location && <span className="flex items-center gap-1"><MapPin size={14}/> {resumeData.location}</span>}
                </div>
             </div>

             <div className="space-y-6">
                <section>
                   <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-700">Summary</h3>
                   <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
                </section>

                <section>
                   <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-700 flex items-center gap-2">
                     <GraduationCap size={18}/> Education
                   </h3>
                   <div className="mb-2">
                      <p className="font-semibold">{resumeData.education}</p>
                   </div>
                </section>

                <section>
                   <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-700 flex items-center gap-2">
                     <Briefcase size={18}/> Experience & Projects
                   </h3>
                   <p className="whitespace-pre-line text-gray-700">{resumeData.experience || 'No experience added yet.'}</p>
                </section>

                <section>
                   <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-700 flex items-center gap-2">
                     <Code size={18}/> Skills
                   </h3>
                   <div className="flex flex-wrap gap-2">
                      {resumeData.skills.split(',').map((skill, i) => (
                         skill.trim() && <span key={i} className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-800 font-medium">{skill.trim()}</span>
                      ))}
                   </div>
                </section>
             </div>
          </div>
       </div>
    </div>
  );
};