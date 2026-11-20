const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Sprint = require('../models/Sprint');

// Dashboard statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const projects = await Project.find({});
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let pendingTasks = 0;
    let reviewTasks = 0;

    let activeProjects = 0;
    let completedProjects = 0;

    projects.forEach(p => {
      const pStatus = (p.status || 'Active').toLowerCase();
      if (pStatus === 'completed') {
        completedProjects++;
      } else {
        activeProjects++;
      }

      if (Array.isArray(p.tasks)) {
        p.tasks.forEach(t => {
          totalTasks++;
          const status = (t.status || 'Backlog').toLowerCase();
          if (status === 'done' || status === 'completed') {
            completedTasks++;
          } else if (status === 'in progress') {
            inProgressTasks++;
          } else if (status === 'review') {
            reviewTasks++;
          } else {
            pendingTasks++;
          }
        });
      }
    });

    res.json({
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      pendingTasks: pendingTasks + inProgressTasks + reviewTasks,
      inProgressTasks,
      reviewTasks,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// Get all backlog tasks
router.get('/tasks/backlog', async (req, res) => {
  try {
    const projects = await Project.find({});
    let backlogTasks = [];

    projects.forEach(project => {
      if (Array.isArray(project.tasks)) {
        project.tasks.forEach(task => {
          if (task.status === 'Backlog' || task.status === 'To Do') {
            backlogTasks.push({
              ...task.toObject(),
              projectId: project._id,
              projectName: project.projectName
            });
          }
        });
      }
    });

    res.json(backlogTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks from all projects
router.get('/tasks/all', async (req, res) => {
  try {
    const projects = await Project.find({});
    let allTasks = [];

    projects.forEach(project => {
      if (Array.isArray(project.tasks)) {
        project.tasks.forEach(task => {
          allTasks.push({
            ...task.toObject(),
            projectId: project._id,
            projectName: project.projectName
          });
        });
      }
    });

    res.json(allTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { projectName, description, status, deadline, createdBy } = req.body;

    // Basic validation
    if (!projectName || !description) {
      return res.status(400).json({ message: 'Please enter project name and description' });
    }

    // Check if project name already exists
    const existingProject = await Project.findOne({ projectName: projectName.trim() });
    if (existingProject) {
      return res.status(400).json({ message: 'Project name already exists' });
    }

    const newProject = new Project({
      projectName: projectName.trim(),
      description: description.trim(),
      status: status || 'Active',
      deadline: deadline || null,
      createdBy: createdBy || 'User',
      tasks: []
    });

    const project = await newProject.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const { projectName, description, status, deadline } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projectName && projectName.trim() !== project.projectName) {
      const existing = await Project.findOne({ projectName: projectName.trim() });
      if (existing) {
        return res.status(400).json({ message: 'Another project with this name already exists' });
      }
      project.projectName = projectName.trim();
    }

    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (deadline !== undefined) project.deadline = deadline ? new Date(deadline) : null;

    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Clean up sprints associated with this project
    await Sprint.deleteMany({ projectId: req.params.id });

    res.json({ message: 'Project deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

// Add a task to a project
router.post('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { taskName, taskDescription, assignedTo, dueDate, priority, status } = req.body;

    if (!taskName) {
      return res.status(400).json({ message: 'Task name is required' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newTask = {
      taskName: taskName.trim(),
      taskDescription: taskDescription || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || '',
      priority: priority || 'Medium',
      status: status || (assignedTo ? 'In Progress' : 'Backlog'),
    };

    project.tasks.push(newTask);

    // Create notification if task is assigned
    if (assignedTo) {
      const assignedUser = await User.findOne({ email: assignedTo });
      if (assignedUser) {
        const notification = new Notification({
          userId: assignedUser._id,
          type: 'task_assigned',
          message: `You have been assigned a new task: ${taskName} in project ${project.projectName}.`,
          link: `/project-management`,
        });
        await notification.save().catch(e => console.error('Notification error:', e));
      }
    }

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Server error adding task' });
  }
});

// Update a task (status, details, assignment)
router.put('/:projectId/tasks/:taskId', async (req, res) => {
  try {
    const { taskName, taskDescription, status, priority, dueDate, assignedTo } = req.body;
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (taskName !== undefined) task.taskName = taskName.trim();
    if (taskDescription !== undefined) task.taskDescription = taskDescription;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    if (status !== undefined) {
      const oldStatus = task.status;
      task.status = status;

      // If status changed to Done or removed from sprint
      if (oldStatus !== status) {
        try {
          const sprints = await Sprint.find({ tasks: taskId });
          for (const sprint of sprints) {
            if (status === 'Done') {
              // keep or update sprint status
            }
          }
        } catch (error) {
          console.error('Sprint sync error:', error);
        }
      }
    }

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// Delete a task
router.delete('/:projectId/tasks/:taskId', async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.tasks.pull({ _id: taskId });
    await project.save();

    // Also remove from any sprints referencing this task
    await Sprint.updateMany({ tasks: taskId }, { $pull: { tasks: taskId } });

    res.json({ message: 'Task deleted successfully', projectId, taskId });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

// Accept a task
router.put('/:projectId/tasks/:taskId/accept', async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required to accept a task' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.assignedTo = userEmail;
    task.status = 'In Progress';

    const acceptingUser = await User.findOne({ email: userEmail });
    if (acceptingUser) {
      const notification = new Notification({
        userId: acceptingUser._id,
        type: 'task_accepted',
        message: `You have accepted the task: ${task.taskName} in project ${project.projectName}.`,
        link: `/project-management`,
      });
      await notification.save().catch(e => console.error(e));
    }

    await project.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
