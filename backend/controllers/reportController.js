const Task = require('../models/Task');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const mongoose = require('mongoose');

exports.generateReport = async (req, res) => {
  try {
    let workspaceId;
    try {
      workspaceId = mongoose.Types.ObjectId.createFromHexString(req.params.workspaceId);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid Workspace ID' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }
    
    // Filter criteria based on role
    const taskQuery = { workspaceId };
    if (req.user.role === 'Member') {
      taskQuery.assignedTo = req.user._id;
    }

    const [tasks, projects] = await Promise.all([
      Task.find(taskQuery).populate('assignedTo', 'name'),
      Project.find({ workspaceId })
    ]);

    // Simple JSON report for now, could be expanded to CSV
    const reportData = {
      generatedAt: new Date(),
      workspaceId,
      summary: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'Done').length
      },
      projects: projects.map(p => ({
        name: p.name,
        status: p.status,
        milestones: p.milestones
      })),
      tasks: tasks.map(t => ({
        title: t.title,
        status: t.status,
        assignee: t.assignedTo?.name || 'Unassigned',
        priority: t.priority,
        dueDate: t.dueDate
      }))
    };

    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
