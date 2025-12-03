import React from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // Helper to get title based on route
  const getTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard';
      case '/day': return 'Day View';
      case '/month': return 'Month View';
      case '/subjects': return 'Subjects';
      case '/jobs': return 'Job Applications';
      case '/stats': return 'Statistics';
      default: return 'Orgniz-it';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#FAFAFA] flex font-sans selection:bg-[#5E6AD2] selection:text-white">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto pb-12">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
