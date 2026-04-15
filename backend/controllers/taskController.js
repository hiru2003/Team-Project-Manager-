const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { workspaceId } = req.params;
    const { projectId } = req.query;
    
    // Base query: Filter by workspace and (optionally) project
    const query = { 
      workspaceId: mongoose.Types.ObjectId.createFromHexString(workspaceId) 
    };

    if (projectId) {
      query.projectId = mongoose.Types.ObjectId.createFromHexString(projectId);
    }

    // Visibility Logic: Members only see their own assigned tasks
    // Admin continues to see everything in the project
    if (req.user.role === 'Member') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
