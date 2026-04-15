const Project = require('../models/Project');
const Workspace = require('../models/Workspace');

const isWorkspaceMember = (workspace, userId) =>
  workspace.members.some((member) => member.user.toString() === userId.toString());

exports.createProject = async (req, res) => {
  try {
    const { workspaceId } = req.body;
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

    const project = await Project.create({
      ...req.body,
      owner: req.user._id
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (!isWorkspaceMember(workspace, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    const projects = await Project.find({ workspaceId: req.params.workspaceId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const workspace = await Workspace.findById(existingProject.workspaceId);
    if (!workspace || !isWorkspaceMember(workspace, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const workspace = await Workspace.findById(existingProject.workspaceId);
    if (!workspace || !isWorkspaceMember(workspace, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
