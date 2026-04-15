const Task = require('../models/Task');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const mongoose = require('mongoose');

exports.getDashboardAnalytics = async (req, res) => {
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
    
    // Define match criteria based on role
    const taskMatch = { workspaceId };
    if (req.user.role === 'Member') {
      // Aggregation requires explicit matching within arrays
      taskMatch.assignedTo = { $in: [new mongoose.Types.ObjectId(req.user._id)] };
    }

    // Aggregates
    const [taskStats, projectStats] = await Promise.all([
      Task.aggregate([
        { $match: taskMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $match: { workspaceId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    const totalTasks = taskStats.reduce((acc, curr) => acc + curr.count, 0);
    const completedTasks = taskStats.find(s => s._id === 'Done')?.count || 0;
    const projectCount = projectStats.reduce((acc, curr) => acc + curr.count, 0);

    // Fetch the actual task list for the dashboard
    const recentTasks = await Task.find(taskMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name');

    res.json({
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      distribution: taskStats,
      projectStats,
      projectCount,
      recentTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
