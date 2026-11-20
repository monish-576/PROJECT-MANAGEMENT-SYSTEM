import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { useUser } from '../../context/UserContext';

const LandingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Icon name="Zap" size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              TaskFlow <span className="text-blue-500 font-extrabold">Pro</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">Workflow</a>
            <a href="#analytics" className="hover:text-blue-400 transition-colors">Analytics</a>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard-overview')}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-500/50"
              >
                <span>Go to Dashboard</span>
                <Icon name="ArrowRight" size={16} />
              </button>
            ) : (
              <>
                <Link
                  to="/login-register"
                  className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/login-register"
                  className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-500/50"
                >
                  <span>Get Started Free</span>
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 flex-1">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-950/60 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-300 mb-8 backdrop-blur-sm shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Next-Gen Fullstack Project Management</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight sm:leading-tight">
            Orchestrate Projects with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Precision and Speed.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Plan sprints, track deliverables, organize Kanban workflows, and collaborate with your team—all powered by real-time MongoDB database persistence.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/dashboard-overview' : '/login-register'}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
            >
              <span>{user ? 'Open Dashboard' : 'Start Managing Now'}</span>
              <Icon name="ArrowRight" size={18} />
            </Link>
            <Link
              to="/login-register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-[1.02]"
            >
              <Icon name="PlayCircle" size={18} className="text-blue-400" />
              <span>Explore Demo</span>
            </Link>
          </div>

          {/* Interactive Preview Mockup */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-3 text-xs text-slate-500 font-mono">TaskFlow Pro Dashboard v2.0</span>
              </div>
              <span className="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md font-mono">
                MongoDB Connected (127.0.0.1:27017)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Active Projects</div>
                <div className="text-2xl font-bold text-white mt-1">5</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center">
                  <Icon name="TrendingUp" size={12} className="mr-1" /> 100% On Schedule
                </div>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Total Tasks</div>
                <div className="text-2xl font-bold text-white mt-1">75</div>
                <div className="text-xs text-blue-400 mt-1">Across all projects</div>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Completed Tasks</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">14</div>
                <div className="text-xs text-slate-400 mt-1">Verified & Done</div>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Pending Tasks</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">61</div>
                <div className="text-xs text-slate-400 mt-1">In progress & backlog</div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg">
                  <Icon name="CheckCircle2" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Fullstack Architecture Ready</h4>
                  <p className="text-xs text-slate-400">Node.js Express REST API connected to local MongoDB storage.</p>
                </div>
              </div>
              <Link
                to="/login-register"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>Launch Workspace</span>
                <Icon name="ChevronRight" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Core Features</h2>
            <p className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Everything Your Team Needs to Deliver
            </p>
            <p className="mt-4 text-slate-400 text-base">
              Built from the ground up for modern engineering and product teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-5">
                <Icon name="FolderKanban" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Project Lifecycle Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Create, organize, update and track projects from concept to completion with deadline tracking and progress metrics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-5">
                <Icon name="Trello" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Visual Kanban Workflow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Drag, drop, and transition tasks through Backlog, In Progress, Review, and Done stages with priority badges and assignees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-5">
                <Icon name="Database" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Local MongoDB Persistence</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                All projects, user accounts, and tasks are saved directly into your local database instance with zero data loss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">How It Works</h2>
            <p className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              From Idea to Delivery in Three Steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="text-3xl font-extrabold text-blue-500/40 mb-3">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Create Your Project</h3>
              <p className="text-slate-400 text-sm">
                Define your goals, descriptions, target deadlines, and status in the project workspace.
              </p>
            </div>
            <div className="relative p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="text-3xl font-extrabold text-indigo-500/40 mb-3">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Break Down Tasks</h3>
              <p className="text-slate-400 text-sm">
                Add granular tasks, assign team members, configure priority levels, and set clear due dates.
              </p>
            </div>
            <div className="relative p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="text-3xl font-extrabold text-purple-500/40 mb-3">03</div>
              <h3 className="text-lg font-bold text-white mb-2">Track & Ship</h3>
              <p className="text-slate-400 text-sm">
                Monitor live stats on your dashboard, advance tickets on the Kanban board, and celebrate milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Icon name="Zap" size={18} className="text-white" />
            </div>
            <span className="text-base font-bold text-white">TaskFlow Pro</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} TaskFlow Pro. Professional Project Management System.
          </p>
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <Link to="/login-register" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/login-register" className="hover:text-white transition-colors">Register</Link>
            <Link to="/dashboard-overview" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
