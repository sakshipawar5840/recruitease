import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Role } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Building2, 
  MessageSquare, 
  LogOut, 
  Menu,
  FileText,
  Bell,
  Sun,
  Moon,
  Settings,
  FileOutput,
  ShieldAlert
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { currentUser, logout, notifications, markNotificationRead, toggleTheme, darkMode } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentUser) return <>{children}</>;

  const getMenuItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];
    
    if (currentUser.role === Role.ADMIN) {
      return [
        ...common,
        { id: 'companies', label: 'Companies & HR', icon: Building2 },
        { id: 'users', label: 'User Management', icon: ShieldAlert }, // New
        { id: 'jobs', label: 'Job Openings', icon: Briefcase },
        { id: 'applications', label: 'Reports', icon: FileText },
        { id: 'chat', label: 'Feedback & Chat', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    } else if (currentUser.role === Role.HR) {
      return [
        ...common,
        { id: 'companies', label: 'My Company', icon: Building2 },
        { id: 'jobs', label: 'Job Postings', icon: Briefcase },
        { id: 'applications', label: 'Applicants', icon: Users },
        { id: 'chat', label: 'Messages', icon: MessageSquare },
      ];
    } else {
      // Student
      return [
        ...common, // Added Dashboard for Student
        { id: 'companies', label: 'Top Companies', icon: Building2 }, // Added Companies for Student
        { id: 'jobs', label: 'Find Jobs', icon: Briefcase },
        { id: 'applications', label: 'My Applications', icon: FileText },
        { id: 'resume', label: 'Resume Builder', icon: FileOutput }, // New
        { id: 'chat', label: 'Support Chat', icon: MessageSquare },
      ];
    }
  };

  const menuItems = getMenuItems();
  const myNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl z-20 print:hidden">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            RecruitEase
          </h1>
          <p className="text-xs text-slate-400 mt-1">Campus Hiring Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activePage === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-600" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-30 px-4 py-3 flex items-center justify-between shadow-md print:hidden">
         <h1 className="text-xl font-bold">RecruitEase</h1>
         <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="text-white">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
         </div>
      </div>

      {/* Header for Desktop Notifications & Theme */}
      <div className="hidden md:flex absolute top-0 right-0 p-6 z-30 gap-4 print:hidden">
         <button 
            onClick={toggleTheme}
            className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-gray-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-transform"
         >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
         </button>

         <div className="relative">
            <button 
              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
               <Bell size={20} />
               {unreadCount > 0 && (
                 <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
               )}
            </button>

            {showNotifications && (
               <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                  <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-slate-700 flex justify-between items-center">
                     <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</h3>
                     <span className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} new</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                     {myNotifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400">No new notifications</div>
                     ) : (
                        myNotifications.map(n => (
                           <div 
                              key={n.id} 
                              onClick={() => markNotificationRead(n.id)}
                              className={`p-3 border-b dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${n.isRead ? 'opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/20'}`}
                           >
                              <p className="text-gray-800 dark:text-gray-200">{n.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                 {new Date(n.createdAt).toLocaleTimeString()}
                              </span>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 pt-16 md:pt-0 p-6 overflow-y-auto h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 print:p-0 print:overflow-visible">
        {children}
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden print:hidden" onClick={() => setIsMobileMenuOpen(false)}>
           <div className="bg-slate-900 w-64 h-full p-4" onClick={e => e.stopPropagation()}>
              <nav className="space-y-2 mt-12">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activePage === item.id ? 'bg-indigo-600' : 'text-slate-300'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 mt-4">
                <LogOut size={20} /> Logout
              </button>
              </nav>
           </div>
        </div>
      )}
    </div>
  );
};