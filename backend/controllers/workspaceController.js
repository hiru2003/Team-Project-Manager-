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
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('members.user', 'name email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(
      (member) => member.user && member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view workspace members' });
    }

    const members = workspace.members
      .filter((member) => member.user)
      .map((member) => ({
        _id: member.user._id,
        name: member.user.name,
        email: member.user.email,
        role: member.role
      }));

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
