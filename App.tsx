import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { Applications } from './pages/Applications';
import { Companies } from './pages/Companies';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { UsersList } from './pages/Users';
import { Role } from './types';

const AppContent: React.FC = () => {
  const { currentUser } = useStore();
  const [activePage, setActivePage] = useState('companies');

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'jobs': return <Jobs />;
      case 'applications': return <Applications />;
      case 'companies': return <Companies />;
      case 'chat': return <Chat />;
      case 'settings': return <Settings />;
      case 'resume': return <ResumeBuilder />;
      case 'users': return <UsersList />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;