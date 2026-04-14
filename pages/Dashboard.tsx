import React from 'react';
import { useStore } from '../context/StoreContext';
import { Role, ApplicationStatus } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  Users, Briefcase, FileCheck, TrendingUp, DollarSign, Award, 
  Building2, UserCheck, Clock, FileText, ArrowRight, Download, Eye, Briefcase as JobIcon
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, users, jobs, applications, companies, applyForJob } = useStore();

  if (!currentUser) return null;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <Card className="flex items-center gap-4 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: color.replace('bg-', '').replace('text-', '') }}>
      <div className={`p-3 rounded-full ${color} text-white shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
        {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
      </div>
    </Card>
  );

  const downloadReport = () => {
    window.print();
  };

  // --- ADMIN DASHBOARD ---
  const AdminDashboard = () => {
    // Stats Calculation
    const totalStudents = users.filter(u => u.role === Role.STUDENT).length;
    const totalHR = users.filter(u => u.role === Role.HR).length;
    const totalCompanies = companies.length;
    const activeJobs = jobs.length;
    const totalApps = applications.length;
    const placedStudents = applications.filter(a => a.status === ApplicationStatus.HIRED).length;

    // Chart Data Preparation
    
    // 1. Monthly Job Posting (Mock Trend + Actual)
    const monthlyJobData = [
      { name: 'Jan', jobs: 4 },
      { name: 'Feb', jobs: 7 },
      { name: 'Mar', jobs: 5 },
      { name: 'Apr', jobs: 12 },
      { name: 'May', jobs: 8 },
      { name: 'Jun', jobs: jobs.length + 5 }, // Include current stats
    ];

    // 2. Company-wise Hiring
    const companyHiringData = companies.map(c => {
        const jobIds = jobs.filter(j => j.companyId === c.id).map(j => j.id);
        const hired = applications.filter(a => jobIds.includes(a.jobId) && a.status === ApplicationStatus.HIRED).length;
        return { name: c.name.split(' ')[0], hired }; // Short name
    }).filter(d => d.hired >= 0); // Keep all for demo even if 0

    // 3. Application Status Distribution
    const statusData = [
       { name: 'Pending', value: applications.filter(a => a.status === ApplicationStatus.PENDING).length },
       { name: 'Shortlisted', value: applications.filter(a => a.status === ApplicationStatus.SHORTLISTED).length },
       { name: 'Interview', value: applications.filter(a => a.status === ApplicationStatus.INTERVIEW_SCHEDULED).length },
       { name: 'Hired', value: applications.filter(a => a.status === ApplicationStatus.HIRED).length },
       { name: 'Rejected', value: applications.filter(a => a.status === ApplicationStatus.REJECTED).length },
    ].filter(d => d.value > 0);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h2>
               <p className="text-sm text-gray-500 dark:text-gray-400">System overview and analytics</p>
            </div>
            <Button variant="outline" onClick={downloadReport} className="hidden md:flex">
                <Download size={16} /> Download Report
            </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard title="Students" value={totalStudents} icon={Users} color="bg-indigo-500" />
            <StatCard title="HR / Recruiters" value={totalHR} icon={UserCheck} color="bg-purple-500" />
            <StatCard title="Companies" value={totalCompanies} icon={Building2} color="bg-blue-500" />
            <StatCard title="Active Jobs" value={activeJobs} icon={Briefcase} color="bg-orange-500" />
            <StatCard title="Applications" value={totalApps} icon={FileText} color="bg-teal-500" />
            <StatCard title="Placed" value={placedStudents} icon={Award} color="bg-green-500" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Monthly Job Postings</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyJobData}>
                            <defs>
                                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="jobs" stroke="#6366f1" fillOpacity={1} fill="url(#colorJobs)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Application Status</h3>
                <div className="h-72 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Card className="lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Company-wise Hiring</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={companyHiringData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" fontSize={12} />
                            <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="hired" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </Card>

             <Card>
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Activities</h3>
                 <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                     <div className="flex items-start gap-3 pb-3 border-b dark:border-gray-700">
                         <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full text-green-600">
                             <UserCheck size={16} />
                         </div>
                         <div>
                             <p className="text-sm font-medium text-gray-800 dark:text-white">New HR Registered</p>
                             <p className="text-xs text-gray-500">TechCorp Solutions joined.</p>
                             <span className="text-[10px] text-gray-400">2 mins ago</span>
                         </div>
                     </div>
                     <div className="flex items-start gap-3 pb-3 border-b dark:border-gray-700">
                         <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-600">
                             <Briefcase size={16} />
                         </div>
                         <div>
                             <p className="text-sm font-medium text-gray-800 dark:text-white">New Job Posted</p>
                             <p className="text-xs text-gray-500">Junior Java Developer at Infosys</p>
                             <span className="text-[10px] text-gray-400">1 hour ago</span>
                         </div>
                     </div>
                     <div className="flex items-start gap-3">
                         <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full text-purple-600">
                             <FileText size={16} />
                         </div>
                         <div>
                             <p className="text-sm font-medium text-gray-800 dark:text-white">Application Received</p>
                             <p className="text-xs text-gray-500">John Doe applied for React Dev</p>
                             <span className="text-[10px] text-gray-400">3 hours ago</span>
                         </div>
                     </div>
                 </div>
             </Card>
        </div>
      </div>
    );
  };

  // --- HR DASHBOARD ---
  const HRDashboard = () => {
      const myJobs = jobs.filter(j => j.postedBy === currentUser.id);
      const myJobIds = myJobs.map(j => j.id);
      const myApps = applications.filter(a => myJobIds.includes(a.jobId));
      
      const shortlistedCount = myApps.filter(a => [ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW_SCHEDULED].includes(a.status)).length;
      const hiredCount = myApps.filter(a => a.status === ApplicationStatus.HIRED).length;

      // Job vs Applicants Data
      const jobVsApplicantData = myJobs.map(j => ({
          name: j.title.length > 15 ? j.title.substring(0, 15) + '...' : j.title,
          applicants: myApps.filter(a => a.jobId === j.id).length
      }));

      // Status Distribution
      const statusData = [
        { name: 'Pending', value: myApps.filter(a => a.status === ApplicationStatus.PENDING).length },
        { name: 'Reviewing', value: myApps.filter(a => a.status === ApplicationStatus.REVIEWING).length },
        { name: 'Shortlisted', value: shortlistedCount },
        { name: 'Hired', value: hiredCount },
      ].filter(d => d.value > 0);

      const recentApplicants = myApps
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5);

      return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white">HR Dashboard</h2>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Manage your recruitment pipeline</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Jobs Posted" value={myJobs.length} icon={Briefcase} color="bg-indigo-500" />
                <StatCard title="Total Applicants" value={myApps.length} icon={Users} color="bg-blue-500" />
                <StatCard title="Shortlisted" value={shortlistedCount} icon={UserCheck} color="bg-orange-500" />
                <StatCard title="Hired" value={hiredCount} icon={FileCheck} color="bg-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts */}
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Applicants per Job</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={jobVsApplicantData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tick={{fontSize: 10}} />
                                <YAxis fontSize={12} allowDecimals={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', color: '#333'}} />
                                <Bar dataKey="applicants" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Pipeline Status</h3>
                     <div className="h-72 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Applicants Table */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Applicants</h3>
                    <Button variant="outline" className="text-xs py-1">View All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="p-3">Candidate</th>
                                <th className="p-3">Job Applied</th>
                                <th className="p-3">Applied Date</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recentApplicants.map(app => {
                                const candidate = users.find(u => u.id === app.studentId);
                                const job = jobs.find(j => j.id === app.jobId);
                                return (
                                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <td className="p-3 font-medium text-gray-800 dark:text-white">
                                            {candidate?.name || 'Unknown'}
                                            <div className="text-xs text-gray-500 font-normal">{candidate?.email}</div>
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{job?.title || 'Unknown'}</td>
                                        <td className="p-3 text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <Badge color={
                                                app.status === ApplicationStatus.HIRED ? 'green' : 
                                                app.status === ApplicationStatus.REJECTED ? 'red' : 
                                                app.status === ApplicationStatus.SHORTLISTED ? 'blue' : 'yellow'
                                            }>
                                                {app.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                )
                            })}
                            {recentApplicants.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500">No recent applications.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
      );
  };

  // --- STUDENT DASHBOARD ---
  const StudentDashboard = () => {
      const myApps = applications.filter(a => a.studentId === currentUser.id);
      const jobsAvailable = jobs.length;
      const appliedCount = myApps.length;
      const shortlistedCount = myApps.filter(a => [ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW_SCHEDULED].includes(a.status)).length;
      const interviewCount = myApps.filter(a => a.status === ApplicationStatus.INTERVIEW_SCHEDULED).length;
      const selectedCount = myApps.filter(a => a.status === ApplicationStatus.HIRED).length;

      // Status Graph Data (Funnel)
      const funnelData = [
          { name: 'Applied', value: appliedCount, fill: '#8884d8' },
          { name: 'Shortlisted', value: shortlistedCount, fill: '#83a6ed' },
          { name: 'Interview', value: interviewCount, fill: '#8dd1e1' },
          { name: 'Selected', value: selectedCount, fill: '#82ca9d' },
      ];

      // Recommended Jobs based on Skills
      const appliedJobIds = myApps.map(a => a.jobId);
      const userSkills = currentUser.skills?.map(s => s.toLowerCase()) || [];

      const recommendedJobs = jobs
        .filter(j => !appliedJobIds.includes(j.id))
        .map(job => {
            const jobSkills = job.requirements?.map(r => r.toLowerCase()) || [];
            const matchCount = jobSkills.filter(s => userSkills.some(us => us.includes(s) || s.includes(us))).length;
            return { ...job, matchCount };
        })
        .sort((a, b) => b.matchCount - a.matchCount || new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
        .slice(0, 5);

      return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Student Dashboard</h2>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Track your career progress</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Jobs Available" value={jobsAvailable} icon={Briefcase} color="bg-indigo-500" />
                <StatCard title="Applied" value={appliedCount} icon={FileText} color="bg-blue-500" />
                <StatCard title="Shortlisted" value={shortlistedCount} icon={TrendingUp} color="bg-purple-500" />
                <StatCard title="Selected" value={selectedCount} icon={Award} color="bg-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Application Progress Graph (Funnel) */}
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Application Funnel</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                                <Tooltip />
                                <Funnel
                                    dataKey="value"
                                    data={funnelData}
                                    isAnimationActive
                                >
                                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Profile Completeness Mock */}
                <Card className="flex flex-col justify-center items-center text-center p-8">
                    <div className="relative w-32 h-32 mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-700"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin-slow" style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'}}></div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">85%</span>
                            <span className="text-xs text-gray-400">Complete</span>
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white">Profile Strength</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-4">Add more skills to increase your chances.</p>
                    <Button variant="outline" className="w-full">Update Profile</Button>
                </Card>
            </div>

            {/* Recommended Jobs List */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recommended Jobs for You</h3>
                <div className="space-y-4">
                    {recommendedJobs.map(job => (
                        <div key={job.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                    <JobIcon size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-800 dark:text-white">{job.title}</h4>
                                        {job.matchCount > 0 && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                {job.matchCount} Skill Match{job.matchCount !== 1 ? 'es' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.location} • {job.type}</p>
                                </div>
                            </div>
                            <Button onClick={() => applyForJob(job.id, currentUser.id)} className="px-6">
                                Apply
                            </Button>
                        </div>
                    ))}
                    {recommendedJobs.length === 0 && (
                        <div className="text-center text-gray-500 py-4">No recommended jobs found. Try updating your skills!</div>
                    )}
                </div>
            </Card>
        </div>
      );
  };

  return (
    <>
      {currentUser.role === Role.ADMIN && <AdminDashboard />}
      {currentUser.role === Role.HR && <HRDashboard />}
      {currentUser.role === Role.STUDENT && <StudentDashboard />}
    </>
  );
};