const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');

const isWorkspaceMember = (workspace, userId) =>
  workspace.members.some((member) => member.user.toString() === userId.toString());

exports.createTask = async (req, res) => {
  try {
    if (req.user.role === 'Member') {
      return res.status(403).json({ message: 'Members are not allowed to create tasks' });
    }

    const { workspaceId, assignedTo, projectId } = req.body;
    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId is required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (!isWorkspaceMember(workspace, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project || project.workspaceId.toString() !== workspaceId.toString()) {
        return res.status(400).json({ message: 'Invalid project for workspace' });
      }
    }

    if (assignedTo) {
      const assigneeInWorkspace = workspace.members.some(
        (member) => member.user.toString() === assignedTo.toString()
      );
      if (!assigneeInWorkspace) {
        return res.status(400).json({ message: 'Assignee must be a workspace member' });
      }
    }

    const task = await Task.create({
      ...req.body,
      assignedTo: assignedTo || req.user._id
    });
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

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (!isWorkspaceMember(workspace, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
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
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = await Workspace.findById(existingTask.workspaceId);
    if (!workspace || !isWorkspaceMember(workspace, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    if (req.user.role === 'Member' && existingTask.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Members can only update their assigned tasks' });
    }

    if (req.body.assignedTo) {
      const assigneeInWorkspace = workspace.members.some(
        (member) => member.user.toString() === req.body.assignedTo.toString()
      );
      if (!assigneeInWorkspace) {
        return res.status(400).json({ message: 'Assignee must be a workspace member' });
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = await Workspace.findById(existingTask.workspaceId);
    if (!workspace || !isWorkspaceMember(workspace, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    if (req.user.role === 'Member') {
      return res.status(403).json({ message: 'Members are not allowed to delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
