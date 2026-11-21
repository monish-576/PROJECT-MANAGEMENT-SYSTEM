import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_RENDER_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear auth on 401 if token expired
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/api/users/login', { email, password });
    return res.data;
  },
  register: async (username, email, password, fullName) => {
    const res = await api.post('/api/users/register', { username, email, password, fullName });
    return res.data;
  },
  getProfile: async (userId) => {
    const res = await api.get(`/api/users/${userId}`);
    return res.data;
  },
  getByEmail: async (email) => {
    const res = await api.get(`/api/users/email/${email}`);
    return res.data;
  },
  updateProfile: async (userId, data) => {
    const res = await api.put(`/api/users/${userId}`, data);
    return res.data;
  },
  getTeamMembers: async () => {
    const res = await api.get('/api/users/team-members');
    return res.data;
  },
};

export const projectsAPI = {
  getOverviewStats: async () => {
    const res = await api.get('/api/projects/stats/overview');
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/api/projects');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/api/projects/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/api/projects', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/api/projects/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/api/projects/${id}`);
    return res.data;
  },
};

export const tasksAPI = {
  getAll: async () => {
    const res = await api.get('/api/projects/tasks/all');
    return res.data;
  },
  getBacklog: async () => {
    const res = await api.get('/api/projects/tasks/backlog');
    return res.data;
  },
  getById: async (taskId) => {
    const res = await api.get(`/api/tasks/${taskId}`);
    return res.data;
  },
  create: async (projectId, taskData) => {
    const res = await api.post(`/api/projects/${projectId}/tasks`, taskData);
    return res.data;
  },
  update: async (projectId, taskId, taskData) => {
    const res = await api.put(`/api/projects/${projectId}/tasks/${taskId}`, taskData);
    return res.data;
  },
  delete: async (projectId, taskId) => {
    const res = await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
    return res.data;
  },
  accept: async (projectId, taskId, userEmail) => {
    const res = await api.put(`/api/projects/${projectId}/tasks/${taskId}/accept`, { userEmail });
    return res.data;
  },
};

export const sprintsAPI = {
  getAll: async () => {
    const res = await api.get('/api/sprints');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/api/sprints', data);
    return res.data;
  },
  start: async (sprintId) => {
    const res = await api.put(`/api/sprints/${sprintId}/start`);
    return res.data;
  },
  delete: async (sprintId) => {
    const res = await api.delete(`/api/sprints/${sprintId}`);
    return res.data;
  },
};

export default api;
