
export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  STUDENT = 'STUDENT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  status: UserStatus;
  password?: string; // In real app, this is hashed. Storing for mock auth.
  createdAt?: string;
  
  // HR Specific
  companyId?: string; 
  phone?: string;
  companyName?: string;
  companyWebsite?: string;
  
  // Student Specific
  department?: string; // Domain
  yearOfPassing?: string;
  resumeUrl?: string;
  skills?: string[];
  location?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  address: string;
  hrContact: string;
  hrName: string;
  logo: string;
  website?: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string;
  type: string; // Full-time, Internship
  salaryRange?: string;
  requirements: string[];
  postedBy: string; // HR User ID
  postedAt: string;
  isUrgent?: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: ApplicationStatus;
  resumeUrl?: string; // Mock URL
  appliedAt: string;
  feedback?: string;
  matchScore?: number; // AI Score 0-100
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string; // Null if public channel or AI
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  hrId: string;
  studentId: string;
  date: string;
  time: string;
  meetLink: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}
