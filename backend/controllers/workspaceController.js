const Workspace = require('../models/Workspace');

exports.createWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.create({
      name: req.body.name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ 'members.user': req.user._id });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkspaceMembers = async (req, res) => {
  try {
    const User = require('../models/User');
    // Return all registered members of the platform for easy assignment
    const members = await User.find({}, 'name email');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
