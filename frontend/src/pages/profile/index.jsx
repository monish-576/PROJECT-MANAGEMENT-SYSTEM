import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { useUser } from '../../context/UserContext';
import { authAPI, tasksAPI } from '../../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useUser();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    title: user?.title || 'Team Member',
    bio: user?.bio || '',
  });

  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.username || '',
        username: user.username || '',
        title: user.title || 'Team Member',
        bio: user.bio || '',
      });
      fetchUserTasks();
    }
  }, [user]);

  const fetchUserTasks = async () => {
    setLoadingTasks(true);
    try {
      const allTasks = await tasksAPI.getAll();
      if (Array.isArray(allTasks)) {
        const myTasks = allTasks.filter(
          (t) =>
            t.assignedTo === user?.email ||
            t.assignedTo === user?.username ||
            t.assignedTo === user?.fullName
        );
        setAssignedTasks(myTasks);
      }
    } catch (err) {
      console.error('Error fetching assigned tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const userId = user?.id || user?._id;
    if (!userId) {
      setMessage({ text: 'Unable to update: missing user ID.', type: 'error' });
      setSaving(false);
      return;
    }

    try {
      const response = await authAPI.updateProfile(userId, formData);
      updateUser(response.user);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      const errText = err.response?.data?.msg || err.message || 'Failed to update profile.';
      setMessage({ text: errText, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login-register');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal details and workspace identity</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center space-x-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Icon name="LogOut" size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <Icon
            name={message.type === 'success' ? 'CheckCircle2' : 'AlertCircle'}
            size={18}
            className={message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}
          />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-full pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">{user?.fullName || user?.username || 'User'}</h2>
            <p className="text-sm text-blue-600 font-medium mt-1">{user?.title || 'Team Member'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Username</span>
              <span className="font-mono font-medium text-slate-800">@{user?.username}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Database Role</span>
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">Active Member</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Assigned Tasks</span>
              <span className="font-bold text-slate-800">{assignedTasks.length}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Icon name="Edit3" size={18} className="text-blue-600" />
            <span>Edit Profile Information</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="Username"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Job Title / Role</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="e.g. Lead Engineer, Product Manager"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Bio / About</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                placeholder="Share a short bio about what you do..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Assigned Tasks Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={18} className="text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">My Assigned Tasks</h3>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            {assignedTasks.length} Assigned
          </span>
        </div>

        {loadingTasks ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading tasks from database...</span>
          </div>
        ) : assignedTasks.length === 0 ? (
          <div className="py-8 text-center">
            <Icon name="Inbox" size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No tasks currently assigned</p>
            <p className="text-xs text-slate-400 mt-1">Assign tasks from the Project Management or Kanban board</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Task Name</th>
                  <th className="py-3 px-4 font-semibold">Project</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{task.taskName}</td>
                    <td className="py-3 px-4 text-slate-500">{task.projectName || 'Project'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          task.priority === 'Critical'
                            ? 'bg-red-50 text-red-600'
                            : task.priority === 'High'
                            ? 'bg-amber-50 text-amber-600'
                            : task.priority === 'Medium'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          task.status === 'Done'
                            ? 'bg-emerald-50 text-emerald-600'
                            : task.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-600'
                            : task.status === 'Review'
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.status || 'Backlog'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
