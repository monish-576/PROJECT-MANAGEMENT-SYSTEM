import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { projectsAPI, tasksAPI, authAPI } from '../../services/api';
import { useUser } from '../../context/UserContext';

const TaskCreationModal = ({ isOpen, onClose, onTaskCreated, initialProjectId = '' }) => {
  const { user } = useUser();
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId);
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Backlog');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen, initialProjectId]);

  const loadFormData = async () => {
    setLoadingProjects(true);
    setError('');
    try {
      const [projectsList, membersList] = await Promise.all([
        projectsAPI.getAll().catch(() => []),
        authAPI.getTeamMembers().catch(() => []),
      ]);

      const validProjects = Array.isArray(projectsList) ? projectsList : [];
      setProjects(validProjects);
      setTeamMembers(Array.isArray(membersList) ? membersList : []);

      if (initialProjectId && validProjects.some((p) => p._id === initialProjectId)) {
        setProjectId(initialProjectId);
      } else if (validProjects.length > 0) {
        setProjectId(validProjects[0]._id);
      }
    } catch (err) {
      console.error('Error loading task creation prerequisites:', err);
      setError('Could not fetch existing projects from MongoDB.');
    } finally {
      setLoadingProjects(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!projectId) {
      setError('Please select a project to assign this task to.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const taskPayload = {
        taskName: taskName.trim(),
        taskDescription: taskDescription.trim(),
        priority,
        status,
        dueDate: dueDate || null,
        assignedTo: assignedTo || '',
      };

      const updatedProject = await tasksAPI.create(projectId, taskPayload);

      setSuccess('Task created and saved to MongoDB successfully!');
      
      // Notify parent callbacks and dispatch global event
      if (onTaskCreated) {
        onTaskCreated(updatedProject);
      }
      window.dispatchEvent(new CustomEvent('task-created', { detail: { projectId, task: taskPayload } }));

      // Reset form
      setTaskName('');
      setTaskDescription('');
      setPriority('Medium');
      setStatus('Backlog');
      setDueDate('');
      setAssignedTo('');

      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 600);
    } catch (err) {
      console.error('Task creation error:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.msg;
      setError(serverMsg || 'Failed to create task. Please verify backend connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 transform transition-all animate-scaleUp overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
              <Icon name="CheckSquare" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add New Task</h3>
              <p className="text-xs text-slate-500">Create and assign a deliverable item</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
            <Icon name="AlertCircle" size={16} className="shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
            <Icon name="CheckCircle2" size={16} className="shrink-0 text-emerald-500" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Project Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
              Select Project <span className="text-red-500">*</span>
            </label>
            {loadingProjects ? (
              <div className="flex items-center space-x-2 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                <Icon name="Loader2" size={14} className="animate-spin" />
                <span>Loading available projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl">
                No active projects found. Please create a project first.
              </div>
            ) : (
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={saving}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
              >
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.projectName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Design responsive navbar component"
              disabled={saving}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
              Task Description
            </label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Detailed criteria, checklist, or instructions..."
              disabled={saving}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={saving}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={saving}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
              >
                <option value="Backlog">To Do / Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">In Review</option>
                <option value="Done">Completed / Done</option>
              </select>
            </div>
          </div>

          {/* Assigned Member & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Assignee
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={saving}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member._id || member.email} value={member.email}>
                    {member.fullName || member.username} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={saving}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || projects.length === 0}
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {saving && <Icon name="Loader2" size={14} className="animate-spin" />}
              <span>{saving ? 'Creating Task...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreationModal;
