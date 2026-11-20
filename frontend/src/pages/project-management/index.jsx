import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { useUser } from '../../context/UserContext';
import { projectsAPI, tasksAPI, authAPI } from '../../services/api';

const ProjectManagement = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Selected for edit/delete
  const [currentProject, setCurrentProject] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  // Form states
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    description: '',
    status: 'Active',
    deadline: '',
  });

  const [taskForm, setTaskForm] = useState({
    taskName: '',
    taskDescription: '',
    priority: 'Medium',
    status: 'Backlog',
    dueDate: '',
    assignedTo: '',
  });

  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsData, membersData] = await Promise.all([
        projectsAPI.getAll().catch(() => []),
        authAPI.getTeamMembers().catch(() => []),
      ]);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setTeamMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create Project
  const handleOpenCreateModal = () => {
    setProjectForm({
      projectName: '',
      description: '',
      status: 'Active',
      deadline: '',
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.projectName.trim() || !projectForm.description.trim()) {
      setFormError('Please enter project name and description.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const newProj = await projectsAPI.create({
        ...projectForm,
        createdBy: user?.email || user?.username || 'User',
      });
      setProjects([newProj, ...projects]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  // Edit Project
  const handleOpenEditModal = (proj) => {
    setCurrentProject(proj);
    setProjectForm({
      projectName: proj.projectName,
      description: proj.description || '',
      status: proj.status || 'Active',
      deadline: proj.deadline ? proj.deadline.substring(0, 10) : '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!projectForm.projectName.trim()) {
      setFormError('Project name cannot be empty.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const updated = await projectsAPI.update(currentProject._id, projectForm);
      setProjects(projects.map((p) => (p._id === currentProject._id ? updated : p)));
      setIsEditModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Project
  const handleOpenDeleteModal = (proj) => {
    setCurrentProject(proj);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    setSaving(true);
    try {
      await projectsAPI.delete(currentProject._id);
      setProjects(projects.filter((p) => p._id !== currentProject._id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert('Failed to delete project: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Add Task to Project
  const handleOpenAddTask = (proj) => {
    setCurrentProject(proj);
    setTaskForm({
      taskName: '',
      taskDescription: '',
      priority: 'Medium',
      status: 'Backlog',
      dueDate: '',
      assignedTo: user?.email || '',
    });
    setFormError('');
    setIsAddTaskModalOpen(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.taskName.trim()) {
      setFormError('Task name is required.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const updatedProject = await tasksAPI.create(currentProject._id, taskForm);
      setProjects(projects.map((p) => (p._id === currentProject._id ? updatedProject : p)));
      setIsAddTaskModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add task.');
    } finally {
      setSaving(false);
    }
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (projectId, taskId, newStatus) => {
    try {
      const updatedProject = await tasksAPI.update(projectId, taskId, { status: newStatus });
      setProjects(projects.map((p) => (p._id === projectId ? updatedProject : p)));
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (projectId, taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksAPI.delete(projectId, taskId);
      setProjects(
        projects.map((p) => {
          if (p._id === projectId) {
            return { ...p, tasks: p.tasks.filter((t) => t._id !== taskId) };
          }
          return p;
        })
      );
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  // Filtering
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'All' || (p.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getProgress = (proj) => {
    if (!proj.tasks || proj.tasks.length === 0) return 0;
    const done = proj.tasks.filter((t) => (t.status || '').toLowerCase() === 'done').length;
    return Math.round((done / proj.tasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize, track, and manage all your deliverables in one place.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 shrink-0"
        >
          <Icon name="Plus" size={18} />
          <span>Create Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="Search" size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 uppercase">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Planning">Planning</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading projects from MongoDB...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Icon name="FolderPlus" size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'All'
              ? 'No projects match your search or status filter.'
              : 'You have not created any projects yet. Start by creating one.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-5 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <Icon name="Plus" size={14} />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const progress = getProgress(project);
            const totalTasks = project.tasks ? project.tasks.length : 0;
            const doneTasks = project.tasks
              ? project.tasks.filter((t) => (t.status || '').toLowerCase() === 'done').length
              : 0;
            const isExpanded = expandedProjectId === project._id;

            return (
              <div
                key={project._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all"
              >
                {/* Project Header & Details */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          (project.status || 'Active').toLowerCase() === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : (project.status || 'Active').toLowerCase() === 'in progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {project.status || 'Active'}
                      </span>
                      {project.deadline && (
                        <span className="text-xs text-slate-400 flex items-center space-x-1">
                          <Icon name="Calendar" size={13} />
                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {project.projectName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Actions & Progress Summary */}
                  <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                    <div className="w-28 text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-700">{progress}% Done</div>
                      <div className="text-[11px] text-slate-400">{doneTasks}/{totalTasks} tasks</div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAddTask(project)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Add Task"
                    >
                      <Icon name="PlusSquare" size={18} />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(project)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Icon name="Edit2" size={18} />
                    </button>

                    <button
                      onClick={() => handleOpenDeleteModal(project)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>

                    <button
                      onClick={() => setExpandedProjectId(isExpanded ? null : project._id)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title={isExpanded ? 'Collapse Tasks' : 'Expand Tasks'}
                    >
                      <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={18} />
                    </button>
                  </div>
                </div>

                {/* Expanded Tasks List */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Project Tasks ({totalTasks})
                      </h4>
                      <button
                        onClick={() => handleOpenAddTask(project)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <Icon name="Plus" size={13} />
                        <span>Add Task</span>
                      </button>
                    </div>

                    {totalTasks === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        No tasks in this project yet. Click &quot;Add Task&quot; above to create one.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {project.tasks.map((task) => (
                          <div
                            key={task._id}
                            className="py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <select
                                value={task.status || 'Backlog'}
                                onChange={(e) =>
                                  handleUpdateTaskStatus(project._id, task._id, e.target.value)
                                }
                                className={`px-2 py-1 rounded text-[11px] font-semibold border focus:outline-none ${
                                  task.status === 'Done'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : task.status === 'In Progress'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : task.status === 'Review'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <option value="Backlog">Backlog</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Done">Done</option>
                              </select>

                              <span
                                className={`font-medium ${
                                  task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'
                                } truncate`}
                              >
                                {task.taskName}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 text-slate-500 shrink-0">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  task.priority === 'Critical'
                                    ? 'bg-red-50 text-red-600'
                                    : task.priority === 'High'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {task.priority || 'Medium'}
                              </span>

                              <span className="hidden sm:inline text-slate-400 text-[11px]">
                                {task.assignedTo || 'Unassigned'}
                              </span>

                              <button
                                onClick={() => handleDeleteTask(project._id, task._id)}
                                className="text-slate-400 hover:text-red-500 p-1"
                                title="Delete Task"
                              >
                                <Icon name="Trash" size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create New Project</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <Icon name="AlertCircle" size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectForm.projectName}
                  onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Goals and requirements for this project..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Deadline</label>
                  <input
                    type="date"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
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
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROJECT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Project</h3>
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

            <form onSubmit={handleEditProject} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectForm.projectName}
                  onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Deadline</label>
                  <input
                    type="date"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
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

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertTriangle" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Project?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800">&quot;{currentProject?.projectName}&quot;</span>? This will permanently remove the project and all its associated tasks from MongoDB.
            </p>

            <div className="flex justify-center space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-sm disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Add Task to {currentProject?.projectName}
              </h3>
              <button onClick={() => setIsAddTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon name="X" size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <Icon name="AlertCircle" size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddTask} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  value={taskForm.taskName}
                  onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                  placeholder="e.g. Design authentication workflow"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Task Description</label>
                <textarea
                  rows={2}
                  value={taskForm.taskDescription}
                  onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })}
                  placeholder="Detailed instructions..."
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
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Initial Status</label>
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
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
