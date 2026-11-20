import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';
import { useUser } from '../../context/UserContext';

const MainLayout = () => {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Protected route check
  const storedUser = localStorage.getItem('userInfo');
  if (!user && !storedUser) {
    return <Navigate to="/login-register" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 lg:pl-64 w-full min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
