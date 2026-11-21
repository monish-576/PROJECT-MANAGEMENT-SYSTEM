import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { useUser } from '../../context/UserContext';
import { useModal } from '../../context/ModalContext';
import { projectsAPI, tasksAPI } from '../../services/api';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { setIsProjectModalOpen, setIsTaskModalOpen } = useModal() || {};

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalTasks: 0,
  });

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();

    const handleDataRefresh = () => {
      loadDashboard();
    };

    window.addEventListener('project-created', handleDataRefresh);
    window.addEventListener('task-created', handleDataRefresh);

    return () => {
      window.removeEventListener('project-created', handleDataRefresh);
      window.removeEventListener('task-created', handleDataRefresh);
    };
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, projectsRes, tasksRes] = await Promise.all([
        projectsAPI.getOverviewStats().catch(() => null),
        projectsAPI.getAll().catch(() => []),
        tasksAPI.getAll().catch(() => []),
      ]);

      if (statsRes) {
        setStats(statsRes);
      } else {
        // Fallback calculation from projectsRes and tasksRes
        const totalP = projectsRes.length;
        const activeP = projectsRes.filter((p) => (p.status || 'Active').toLowerCase() !== 'completed').length;
        const totalT = tasksRes.length;
        const completedT = tasksRes.filter((t) => (t.status || '').toLowerCase() === 'done').length;
        setStats({
          totalProjects: totalP,
          activeProjects: activeP,
          totalTasks: totalT,
          completedTasks: completedT,
          pendingTasks: totalT - completedT,
        });
      }

      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Unable to load dashboard data. Ensure MongoDB and the backend are running.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const done = project.tasks.filter((t) => (t.status || '').toLowerCase() === 'done').length;
    return Math.round((done / project.tasks.length) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-blue-100 mb-3 backdrop-blur-sm">
            <Icon name="Calendar" size={14} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.fullName || user?.username || 'Team Member'}!
          </h1>
          <p className="mt-1 text-blue-100 text-sm max-w-xl">
            Here is your live project portfolio overview. All metrics sync directly with your local MongoDB database.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsProjectModalOpen && setIsProjectModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <Icon name="Plus" size={16} />
            <span>New Project</span>
          </button>
          <button
            onClick={() => setIsTaskModalOpen && setIsTaskModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-500/40 hover:bg-blue-500/60 text-white border border-white/20 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Icon name="CheckSquare" size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={18} className="text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboard}
            className="text-xs font-semibold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Projects</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon name="FolderKanban" size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.totalProjects}
            </span>
            <span className="text-xs text-slate-400 font-medium">in database</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 flex items-center font-medium">
            <Icon name="Check" size={13} className="mr-1" />
            <span>Configured in workspace</span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Icon name="Activity" size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-indigo-600">
              {loading ? '...' : stats.activeProjects}
            </span>
            <span className="text-xs text-slate-400 font-medium">ongoing</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 flex items-center font-medium">
            <Icon name="TrendingUp" size={13} className="mr-1" />
            <span>Currently progressing</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Icon name="CheckCircle2" size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {loading ? '...' : stats.completedTasks}
            </span>
            <span className="text-xs text-slate-400 font-medium">tasks done</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 flex items-center font-medium">
            <Icon name="Award" size={13} className="mr-1" />
            <span>Verified deliverables</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Icon name="Clock" size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {loading ? '...' : stats.pendingTasks}
            </span>
            <span className="text-xs text-slate-400 font-medium">remaining</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 flex items-center font-medium">
            <Icon name="ListTodo" size={13} className="mr-1" />
            <span>In progress or backlog</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Overview & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Overview Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Projects Overview</h2>
              <p className="text-xs text-slate-500">Live projects synced from MongoDB</p>
            </div>
            <button
              onClick={() => navigate('/project-management')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All Projects</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <Icon name="FolderPlus" size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">No projects created yet</h3>
              <p className="text-xs text-slate-400 mt-1">Get started by creating your first project.</p>
              <button
                onClick={() => setIsProjectModalOpen && setIsProjectModalOpen(true)}
                className="mt-4 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                <Icon name="Plus" size={14} />
                <span>Create First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((p) => {
                const progress = calculateProgress(p);
                const taskCount = p.tasks ? p.tasks.length : 0;
                const doneCount = p.tasks ? p.tasks.filter((t) => (t.status || '').toLowerCase() === 'done').length : 0;

                return (
                  <div
                    key={p._id}
                    onClick={() => navigate('/project-management')}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            (p.status || 'Active').toLowerCase() === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {p.status || 'Active'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center space-x-1">
                          <Icon name="CheckSquare" size={13} />
                          <span>{doneCount}/{taskCount} tasks</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{p.projectName}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                        <span>Progress</span>
                        <span className="font-bold text-slate-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {p.deadline && (
                        <div className="mt-2.5 text-[11px] text-slate-400 flex items-center space-x-1">
                          <Icon name="Calendar" size={12} />
                          <span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activities & Quick Navigation */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Tasks</h2>
            <p className="text-xs text-slate-500">Live tasks from across your projects</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading activities...</div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No tasks found</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tasks.slice(0, 6).map((task) => (
                  <div key={task._id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{task.taskName}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {task.projectName} &bull; {task.assignedTo || 'Unassigned'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                        task.status === 'Done'
                          ? 'bg-emerald-50 text-emerald-700'
                          : task.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.status || 'Backlog'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => navigate('/kanban-board')}
                className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1"
              >
                <span>Open Kanban Board</span>
                <Icon name="ArrowRight" size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
