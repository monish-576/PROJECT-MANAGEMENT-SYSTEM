import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../AppIcon';
import { useUser } from '../../context/UserContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { setIsProjectModalOpen, setIsTaskModalOpen } = useModal() || {};
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id && !user?.id) return;
      const userId = user._id || user.id;
      try {
        const res = await api.get(`/api/notifications/${userId}`);
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch (err) {
        // Silently handle if notifications empty
      }
    };

    fetchNotifications();
  }, [user]);

  const handleSignOut = () => {
    logout();
    navigate('/login-register');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
            title="Toggle Sidebar"
          >
            <Icon name={isSidebarOpen ? 'X' : 'Menu'} size={22} />
          </button>

          <Link to="/dashboard-overview" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Icon name="Zap" size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900 leading-none">
                TaskFlow <span className="text-blue-600">Pro</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Project Workspace</p>
            </div>
          </Link>
        </div>

        {/* Center / Search quick helper */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon name="Search" size={16} />
            </div>
            <input
              type="text"
              readOnly
              onClick={() => navigate('/project-management')}
              placeholder="Search projects, tasks, or sprints..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-100/80 border border-transparent rounded-lg cursor-pointer text-slate-700 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsProjectModalOpen && setIsProjectModalOpen(true)}
            className="hidden sm:inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Icon name="Plus" size={14} />
            <span>New Project</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
              title="Notifications"
            >
              <Icon name="Bell" size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-700">Notifications</span>
                  <span className="text-xs text-slate-500">{unreadCount} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} className="p-3 text-xs hover:bg-slate-50">
                        <p className="text-slate-800 font-medium">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-800">
                {user?.fullName || user?.username || 'User'}
              </span>
              <Icon name="ChevronDown" size={14} className="text-slate-500" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-100"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2.5">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.fullName || user?.username || 'User'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Icon name="User" size={15} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/project-management"
                    className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Icon name="FolderKanban" size={15} />
                    <span>Projects</span>
                  </Link>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                  >
                    <Icon name="LogOut" size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
