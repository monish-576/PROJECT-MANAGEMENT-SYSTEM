require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const Project = require('./models/Project');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL;

// Middleware
const allowedOrigins = [
  'https://project-management-flow-waay.netlify.app',
  'http://localhost:5173',
  'http://localhost:4028',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server) or matched origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app') || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint for Render & monitors
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project_management_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/sprints', require('./routes/sprintRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Direct task lookup route
app.get('/api/tasks/:taskId', async (req, res) => {
  try {
    const project = await Project.findOne({ 'tasks._id': req.params.taskId });
    if (!project) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const task = project.tasks.id(req.params.taskId);
    res.json({
      ...task.toObject(),
      projectId: project._id,
      projectName: project.projectName
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});


// Schedule task to move overdue tasks to backlog
cron.schedule('0 0 * * *', async () => { // Runs every day at midnight
  ('Running daily task check for overdue tasks...');
  try {
    const overdueProjects = await Project.find({ 'tasks.dueDate': { $lt: new Date() }, 'tasks.status': { $ne: 'Backlog' } });

    for (const project of overdueProjects) {
      for (const task of project.tasks) {
        if (task.dueDate && task.dueDate < new Date() && task.status !== 'Backlog') {
          task.status = 'Backlog';
        }
      }
      await project.save();
    }
  } catch (error) {
    console.error('Error checking for overdue tasks:', error);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});