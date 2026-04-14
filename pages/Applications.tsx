import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Role, ApplicationStatus, Interview } from '../types';
import { Card, Badge, Button, ProgressBar, Modal, Input } from '../components/UI';
import { Download, CheckCircle, XCircle, Clock, Calendar, FileSpreadsheet, Sparkles, Video, FileCheck } from 'lucide-react';

export const Applications: React.FC = () => {
  const { currentUser, applications, jobs, users, updateApplicationStatus, scheduleInterview } = useStore();
  const [interviewModal, setInterviewModal] = useState<{isOpen: boolean, appId: string, studentId: string}>({ isOpen: false, appId: '', studentId: '' });
  const [interviewDetails, setInterviewDetails] = useState({ date: '', time: '', link: '' });

  if (!currentUser) return null;

  const isStudent = currentUser.role === Role.STUDENT;

  // Filter Logic
  const myApps = isStudent
    ? applications.filter(a => a.studentId === currentUser.id)
    : applications.filter(a => {
        const job = jobs.find(j => j.id === a.jobId);
        return currentUser.role === Role.ADMIN || (job && job.postedBy === currentUser.id);
      });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.HIRED: return 'green';
      case ApplicationStatus.SHORTLISTED: return 'blue';
      case ApplicationStatus.INTERVIEW_SCHEDULED: return 'purple';
      case ApplicationStatus.REJECTED: return 'red';
      default: return 'yellow';
    }
  };

  const getStepIndex = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING: return 0;
      case ApplicationStatus.REVIEWING: return 1;
      case ApplicationStatus.SHORTLISTED: return 2;
      case ApplicationStatus.INTERVIEW_SCHEDULED: return 3;
      case ApplicationStatus.HIRED: return 4;
      case ApplicationStatus.REJECTED: return 1; // Stuck at review
      default: return 0;
    }
  };

  const atsSteps = ['Applied', 'Reviewing', 'Shortlisted', 'Interview', 'Hired'];

  const handleExportCSV = () => {
    const headers = ['Candidate', 'Job Title', 'Applied Date', 'Status', 'Match Score'];
    const rows = myApps.map(a => {
      const student = users.find(u => u.id === a.studentId)?.name || 'Unknown';
      const job = jobs.find(j => j.id === a.jobId)?.title || 'Unknown';
      return [student, job, new Date(a.appliedAt).toLocaleDateString(), a.status, a.matchScore || 0];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "applicants_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadOfferLetter = (studentName: string, jobTitle: string) => {
      const content = `
      OFFER LETTER
      --------------------------------------------------
      Date: ${new Date().toLocaleDateString()}
      
      Dear ${studentName},
      
      We are pleased to offer you the position of ${jobTitle} at our company.
      We were impressed by your skills and background.
      
      Start Date: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
      CTC: Confidential
      
      We look forward to having you on our team.
      
      Sincerely,
      HR Department
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Offer_Letter_${studentName.replace(/\s+/g, '_')}.txt`; // Simplified as TXT for mock
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!interviewDetails.date || !interviewDetails.time) return;

    scheduleInterview({
      id: Date.now().toString(),
      applicationId: interviewModal.appId,
      studentId: interviewModal.studentId,
      hrId: currentUser.id,
      date: interviewDetails.date,
      time: interviewDetails.time,
      meetLink: interviewDetails.link || 'https://meet.google.com/abc-defg-hij',
      status: 'SCHEDULED'
    } as Interview);

    setInterviewModal({ isOpen: false, appId: '', studentId: '' });
    setInterviewDetails({ date: '', time: '', link: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {isStudent ? 'Application Tracker' : 'Candidate Management'}
        </h2>
        {!isStudent && (
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export Report
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {myApps.map(app => {
          const job = jobs.find(j => j.id === app.jobId);
          const student = users.find(u => u.id === app.studentId);

          if (!job) return null;

          return (
            <Card key={app.id} className={`transition-all ${app.status === ApplicationStatus.REJECTED ? 'opacity-75 bg-gray-50' : ''}`}>
               {/* Top Row */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                     <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                     {!isStudent && student && (
                        <div className="flex items-center gap-2 mt-1">
                           <img src={student.avatar} className="w-8 h-8 rounded-full border" alt="" />
                           <div>
                              <span className="text-sm font-medium block">{student.name}</span>
                              <span className="text-xs text-gray-500">{student.department} • <span className="text-indigo-600 font-bold">{app.matchScore}% Match</span></span>
                           </div>
                        </div>
                     )}
                     <div className="text-xs text-gray-400 mt-2">Applied on {new Date(app.appliedAt).toLocaleDateString()}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                     <Badge color={getStatusColor(app.status)}>{app.status.replace('_', ' ')}</Badge>
                     {app.status === ApplicationStatus.INTERVIEW_SCHEDULED && (
                       <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                         <Video size={12}/> Check Interview Details
                       </span>
                     )}
                  </div>
               </div>

               {/* ATS Progress Bar */}
               {app.status !== ApplicationStatus.REJECTED && (
                 <ProgressBar steps={atsSteps} currentStep={getStepIndex(app.status)} />
               )}

               {/* Actions Row */}
               {!isStudent && app.status !== ApplicationStatus.REJECTED && (
                 <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t justify-end">
                    <Button variant="outline" className="p-2 text-sm" title="View Resume">
                      <Download size={14} /> Resume
                    </Button>
                    
                    {app.status === ApplicationStatus.PENDING && (
                      <Button 
                        variant="primary" 
                        className="bg-indigo-600 px-3 py-1 text-sm"
                        onClick={() => updateApplicationStatus(app.id, ApplicationStatus.REVIEWING)}
                      >
                         Start Review
                      </Button>
                    )}

                    {(app.status === ApplicationStatus.REVIEWING || app.status === ApplicationStatus.PENDING) && (
                       <>
                        <Button 
                          variant="primary" 
                          className="bg-blue-600 px-3 py-1 text-sm"
                          onClick={() => updateApplicationStatus(app.id, ApplicationStatus.SHORTLISTED)}
                        >
                           Shortlist
                        </Button>
                        <Button 
                          variant="danger" 
                          className="px-3 py-1 text-sm"
                          onClick={() => updateApplicationStatus(app.id, ApplicationStatus.REJECTED)}
                        >
                           Reject
                        </Button>
                       </>
                    )}

                    {app.status === ApplicationStatus.SHORTLISTED && (
                      <Button 
                        variant="primary" 
                        className="bg-purple-600 px-3 py-1 text-sm"
                        onClick={() => setInterviewModal({ isOpen: true, appId: app.id, studentId: app.studentId })}
                      >
                         <Calendar size={14} /> Schedule Interview
                      </Button>
                    )}

                    {app.status === ApplicationStatus.INTERVIEW_SCHEDULED && (
                      <Button 
                          variant="primary" 
                          className="bg-green-600 px-3 py-1 text-sm"
                          onClick={() => updateApplicationStatus(app.id, ApplicationStatus.HIRED)}
                        >
                           <Sparkles size={14}/> Hire Candidate
                        </Button>
                    )}
                    
                    {app.status === ApplicationStatus.HIRED && (
                        <Button 
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 px-3 py-1 text-sm"
                            onClick={() => student && handleDownloadOfferLetter(student.name, job.title)}
                        >
                            <FileCheck size={14} /> Generate Offer Letter
                        </Button>
                    )}
                 </div>
               )}
            </Card>
          );
        })}

        {myApps.length === 0 && (
           <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
             <Clock size={48} className="mx-auto mb-4 opacity-50" />
             <p>No applications found.</p>
           </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      <Modal 
        isOpen={interviewModal.isOpen} 
        onClose={() => setInterviewModal({isOpen: false, appId: '', studentId: ''})} 
        title="Schedule Interview"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
           <Input 
             type="date" 
             label="Date" 
             value={interviewDetails.date} 
             onChange={e => setInterviewDetails({...interviewDetails, date: e.target.value})} 
             required
           />
           <Input 
             type="time" 
             label="Time" 
             value={interviewDetails.time} 
             onChange={e => setInterviewDetails({...interviewDetails, time: e.target.value})} 
             required
           />
           <Input 
             type="url" 
             label="Meeting Link (Google Meet/Zoom)" 
             placeholder="https://..."
             value={interviewDetails.link} 
             onChange={e => setInterviewDetails({...interviewDetails, link: e.target.value})} 
           />
           <div className="flex justify-end pt-4">
             <Button type="submit">Confirm Schedule</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};