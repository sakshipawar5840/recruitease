import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Job, Application, Company, ChatMessage, ApplicationStatus, Notification, Interview, UserStatus } from '../types';
import { sendEmail } from '../services/emailService';

// Mock Data (Used as initial fallback if LocalStorage is empty)
const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Admin', 
    email: 'sakshipawar5840@gmail.com', 
    password: 'Sakshi@8888', 
    role: Role.ADMIN, 
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff', 
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString()
  },
  { id: 'u2', name: 'Sarah HR', email: 'sarah@techcorp.com', password: '123', role: Role.HR, companyId: 'c1', avatar: 'https://picsum.photos/id/2/100/100', status: UserStatus.ACTIVE, createdAt: new Date().toISOString() },
  { id: 'u3', name: 'John Student', email: 'john@uni.edu', password: '123', role: Role.STUDENT, department: 'Computer Science', avatar: 'https://picsum.photos/id/3/100/100', skills: ['Java', 'React', 'SQL'], status: UserStatus.ACTIVE, createdAt: new Date().toISOString() },
];

const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'TechCorp Solutions', email: 'contact@techcorp.com', address: '123 Tech Park', hrContact: '9876543210', hrName: 'Sarah HR', logo: 'https://picsum.photos/id/4/200/200' },
  { id: 'c2', name: 'InnovateX', email: 'jobs@innovatex.com', address: '456 Startup Ave', hrContact: '1234567890', hrName: 'Mike HR', logo: 'https://picsum.photos/id/5/200/200' },
];

const MOCK_JOBS: Job[] = [
  { id: 'j1', companyId: 'c1', title: 'Junior Java Developer', description: 'Looking for a bright intern...', location: 'Bangalore', type: 'Full-time', requirements: ['Java', 'Spring Boot'], postedBy: 'u2', postedAt: new Date().toISOString(), isUrgent: true },
  { id: 'j2', companyId: 'c2', title: 'React Frontend Engineer', description: 'Join our dynamic team...', location: 'Remote', type: 'Internship', requirements: ['React', 'TypeScript'], postedBy: 'u4', postedAt: new Date().toISOString() },
];

const MOCK_APPLICATIONS: Application[] = [
  { id: 'a1', jobId: 'j1', studentId: 'u3', status: ApplicationStatus.PENDING, appliedAt: new Date().toISOString(), matchScore: 85 }
];

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  messages: ChatMessage[];
  notifications: Notification[];
  interviews: Interview[];
  darkMode: boolean;
  login: (email: string, pass: string, role: Role) => { success: boolean, message?: string };
  register: (user: Partial<User>) => void;
  logout: () => void;
  toggleTheme: () => void;
  addJob: (job: Job) => void;
  deleteJob: (id: string) => void;
  applyForJob: (jobId: string, studentId: string) => void;
  updateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  addCompany: (company: Company) => void;
  sendMessage: (msg: ChatMessage) => void;
  scheduleInterview: (interview: Interview) => void;
  markNotificationRead: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to load from LocalStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize State from LocalStorage or Fallback Mock Data
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage('recruitEase_currentUser', null));
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('recruitEase_users', MOCK_USERS));
  const [companies, setCompanies] = useState<Company[]>(() => loadFromStorage('recruitEase_companies', MOCK_COMPANIES));
  const [jobs, setJobs] = useState<Job[]>(() => loadFromStorage('recruitEase_jobs', MOCK_JOBS));
  const [applications, setApplications] = useState<Application[]>(() => loadFromStorage('recruitEase_applications', MOCK_APPLICATIONS));
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadFromStorage('recruitEase_messages', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('recruitEase_notifications', []));
  const [interviews, setInterviews] = useState<Interview[]>(() => loadFromStorage('recruitEase_interviews', []));
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('theme') === 'dark' || 
              (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- PERSISTENCE EFFECTS ---
  // Whenever state changes, save to LocalStorage
  useEffect(() => localStorage.setItem('recruitEase_currentUser', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('recruitEase_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('recruitEase_companies', JSON.stringify(companies)), [companies]);
  useEffect(() => localStorage.setItem('recruitEase_jobs', JSON.stringify(jobs)), [jobs]);
  useEffect(() => localStorage.setItem('recruitEase_applications', JSON.stringify(applications)), [applications]);
  useEffect(() => localStorage.setItem('recruitEase_messages', JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem('recruitEase_notifications', JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem('recruitEase_interviews', JSON.stringify(interviews)), [interviews]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const login = (email: string, pass: string, role: Role) => {
    const user = users.find(u => u.email === email && u.role === role);
    
    if (!user) {
      return { success: false, message: "User not found or Role mismatch." };
    }
    
    if (user.password !== pass) {
      return { success: false, message: "Invalid credentials." };
    }

    if (user.status === UserStatus.PENDING) {
      return { success: false, message: "Your account is pending Admin approval." };
    }

    if (user.status === UserStatus.SUSPENDED) {
      return { success: false, message: "Your account has been suspended." };
    }

    setCurrentUser(user);
    // Mock welcome notification
    setNotifications(prev => [
      ...prev,
      { id: Date.now().toString(), userId: user.id, message: `Welcome back, ${user.name}!`, type: 'info', isRead: false, createdAt: new Date().toISOString() }
    ]);
    return { success: true };
  };

  const register = (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name || 'New User',
      email: userData.email || '',
      password: userData.password || '123',
      role: userData.role || Role.STUDENT,
      avatar: 'https://picsum.photos/100', 
      status: userData.role === Role.HR ? UserStatus.PENDING : UserStatus.ACTIVE, 
      createdAt: new Date().toISOString(), // Add creation timestamp
      ...userData
    };

    setUsers(prev => [...prev, newUser]);

    if (newUser.role === Role.HR && newUser.companyName) {
       addCompany({
         id: Math.random().toString(36).substr(2, 9),
         name: newUser.companyName,
         email: newUser.email,
         address: userData.location || '',
         hrContact: userData.phone || '',
         hrName: newUser.name,
         logo: userData.avatar || 'https://picsum.photos/200'
       } as Company);
    }
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser && currentUser.id === id) {
        setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
    setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        userId: id,
        message: 'Profile updated successfully',
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString()
    }]);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('recruitEase_currentUser');
  };

  const addJob = (job: Job) => setJobs(prev => [job, ...prev]);
  const deleteJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id));

  const applyForJob = (jobId: string, studentId: string) => {
    const newApp: Application = {
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      studentId,
      status: ApplicationStatus.PENDING,
      appliedAt: new Date().toISOString(),
      matchScore: Math.floor(Math.random() * 30) + 70 
    };
    setApplications(prev => [...prev, newApp]);
    
    const job = jobs.find(j => j.id === jobId);
    if (job) {
       const hrId = job.postedBy;
       setNotifications(prev => [...prev, {
         id: Date.now().toString(), userId: hrId, message: `New application for ${job.title}`, type: 'success', isRead: false, createdAt: new Date().toISOString()
       }]);

       // Send Email Notification to HR
       const hrUser = users.find(u => u.id === hrId);
       const studentUser = users.find(u => u.id === studentId);
       
       if (hrUser && hrUser.email && studentUser) {
           sendEmail(
               hrUser.email, 
               `New Application: ${job.title}`, 
               `Hello ${hrUser.name},\n\nYou have received a new application for the position of ${job.title} from ${studentUser.name}.\n\nLog in to RecruitEase to view the application.`
           ).catch(err => console.error("Failed to send email notification", err));
       }
    }
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    
    const app = applications.find(a => a.id === appId);
    if (app) {
      setNotifications(prev => [...prev, {
        id: Date.now().toString(), userId: app.studentId, message: `Your application status updated to ${status}`, type: 'info', isRead: false, createdAt: new Date().toISOString()
      }]);
    }
  };

  const addCompany = (company: Company) => setCompanies(prev => [...prev, company]);
  const sendMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  const scheduleInterview = (interview: Interview) => {
    setInterviews(prev => [...prev, interview]);
    updateApplicationStatus(interview.applicationId, ApplicationStatus.INTERVIEW_SCHEDULED);
    
    setNotifications(prev => [...prev, {
       id: Date.now().toString(), userId: interview.studentId, message: `Interview scheduled on ${interview.date} at ${interview.time}`, type: 'warning', isRead: false, createdAt: new Date().toISOString()
    }]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <StoreContext.Provider value={{
      currentUser, users, companies, jobs, applications, messages, notifications, interviews, darkMode,
      login, register, logout, toggleTheme, addJob, deleteJob, applyForJob, updateApplicationStatus, addCompany, sendMessage, scheduleInterview, markNotificationRead, updateUser
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};