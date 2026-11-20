import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useModal } from '../../context/ModalContext';
import { useUser } from '../../context/UserContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { setIsProjectModalOpen, setIsTaskModalOpen, setIsSprintModalOpen } = useModal();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard-overview',
      icon: 'LayoutDashboard',
    },
    {
      label: 'Projects',
      path: '/project-management',
      icon: 'FolderKanban',
    },
    {
      label: 'Kanban Board',
      path: '/kanban-board',
      icon: 'Trello',
    },
    {
      label: 'Sprints',
      path: '/sprint-planning',
      icon: 'Calendar',
    },
    {
      label: 'Analytics',
      path: '/analytics-dashboard',
      icon: 'BarChart3',
    },
    {
      label: 'Team',
      path: '/team-management',
      icon: 'Users',
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: 'UserCircle',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024 && isOpen && toggleSidebar) {
      toggleSidebar();
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login-register');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const active = isActivePath(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      className={active ? 'text-white' : 'text-slate-500'}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-slate-100">
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Actions
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  if (setIsProjectModalOpen) setIsProjectModalOpen(true);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Icon name="FolderPlus" size={14} />
                </div>
                <span>New Project</span>
              </button>

              <button
                onClick={() => {
                  if (setIsTaskModalOpen) setIsTaskModalOpen(true);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Icon name="Plus" size={14} />
                </div>
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleNavigation('/profile')}
              className="cursor-pointer group flex-1 min-w-0 mr-2"
            >
              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                {user?.fullName || user?.username || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || 'Logged in'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <Icon name="LogOut" size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
