import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { useUser } from '../../context/UserContext';
import { tasksAPI, projectsAPI, authAPI } from '../../services/api';

const KanbanBoard = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Forms
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    taskName: '',
    taskDescription: '',
    priority: 'Medium',
    status: 'Backlog',
    dueDate: '',
    assignedTo: '',
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const columns = [
    { id: 'Backlog', title: 'Backlog', icon: 'Inbox', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { id: 'In Progress', title: 'In Progress', icon: 'PlayCircle', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'Review', title: 'In Review', icon: 'Eye', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'Done', title: 'Completed', icon: 'CheckCircle2', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  useEffect(() => {
    fetchBoardData();
  }, []);

  const fetchBoardData = async () => {
    setLoading(true);
    try {
      const [allTasks, allProjects, members] = await Promise.all([
        tasksAPI.getAll().catch(() => []),
        projectsAPI.getAll().catch(() => []),
        authAPI.getTeamMembers().catch(() => []),
      ]);
      setTasks(Array.isArray(allTasks) ? allTasks : []);
      setProjects(Array.isArray(allProjects) ? allProjects : []);
      setTeamMembers(Array.isArray(members) ? members : []);
    } catch (err) {
      console.error('Error loading kanban board:', err);
    } finally {
      setLoading(false);
    }
  };

  // Move task status
  const handleStatusChange = async (task, newStatus) => {
    if (!task.projectId || !task._id) return;
    try {
      await tasksAPI.update(task.projectId, task._id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update task status in database.');
    }
  };

  // Open Create Task Modal
  const handleOpenCreateModal = () => {
    const defaultProj = projects[0]?._id || '';
    setTaskForm({
      projectId: defaultProj,
      taskName: '',
      taskDescription: '',
      priority: 'Medium',
      status: 'Backlog',
      dueDate: '',
      assignedTo: user?.email || '',
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.taskName.trim()) {
      setFormError('Task name is required.');
      return;
    }
    if (!taskForm.projectId) {
      setFormError('Please select a project.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await tasksAPI.create(taskForm.projectId, taskForm);
      setIsCreateModalOpen(false);
      fetchBoardData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Task Modal
  const handleOpenEditModal = (task) => {
    setCurrentTask(task);
    setTaskForm({
      projectId: task.projectId,
      taskName: task.taskName,
      taskDescription: task.taskDescription || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Backlog',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      assignedTo: task.assignedTo || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!taskForm.taskName.trim()) {
      setFormError('Task name is required.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await tasksAPI.update(currentTask.projectId, currentTask._id, taskForm);
      setIsEditModalOpen(false);
      fetchBoardData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.taskName}"?`)) return;
    try {
      await tasksAPI.delete(task.projectId, task._id);
      setTasks(tasks.filter((t) => t._id !== task._id));
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.taskDescription && t.taskDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProject = projectFilter === 'All' || t.projectId === projectFilter;
    const matchesPriority = priorityFilter === 'All' || (t.priority || 'Medium') === priorityFilter;
    return matchesSearch && matchesProject && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kanban Task Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and transition tasks across projects in real-time.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 shrink-0"
        >
          <Icon name="Plus" size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="Search" size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Project:</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Syncing Kanban tasks from MongoDB...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter(
              (t) => (t.status || 'Backlog').toLowerCase() === col.id.toLowerCase()
            );

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Icon name={col.icon} size={16} className="text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-800">{col.title}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Tasks List in Column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        {/* Tags */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded truncate max-w-[120px]">
                            {task.projectName}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${task.priority === 'Critical'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : task.priority === 'High'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : task.priority === 'Medium'
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                          >
                            {task.priority || 'Medium'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {task.taskName}
                        </h4>

                        {task.taskDescription && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {task.taskDescription}
                          </p>
                        )}

                        {/* Footer Details */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center space-x-1 truncate mr-2">
                            <Icon name="User" size={12} />
                            <span className="truncate">{task.assignedTo || 'Unassigned'}</span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center space-x-1 shrink-0">
                              <Icon name="Calendar" size={12} />
                              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions & Status Quick Switch */}
                        <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
                          <select
                            value={task.status || 'Backlog'}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-600 focus:outline-none"
                          >
                            <option value="Backlog">Move: Backlog</option>
                            <option value="In Progress">Move: In Progress</option>
                            <option value="Review">Move: Review</option>
                            <option value="Done">Move: Done</option>
                          </select>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded"
                              title="Edit Task"
                            >
                              <Icon name="Edit2" size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded"
                              title="Delete Task"
                            >
                              <Icon name="Trash2" size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create New Task</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon name="X" size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <Icon name="AlertCircle" size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Project</label>
                <select
                  required
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.taskName}
                  onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                  placeholder="e.g. Implement user authentication"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskForm.taskDescription}
                  onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })}
                  placeholder="Task instructions..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assignee</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="">Unassigned</option>
                    {user?.email && <option value={user.email}>{user.fullName || user.username} (You)</option>}
                    {teamMembers.map((m) => (
                      <option key={m._id} value={m.email}>
                        {m.fullName || m.username} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Column / Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Task</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon name="X" size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <Icon name="AlertCircle" size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditTask} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.taskName}
                  onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskForm.taskDescription}
                  onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assignee</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="">Unassigned</option>
                    {user?.email && <option value={user.email}>{user.fullName || user.username} (You)</option>}
                    {teamMembers.map((m) => (
                      <option key={m._id} value={m.email}>
                        {m.fullName || m.username} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
