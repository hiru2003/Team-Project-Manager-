const Task = require('../models/Task');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    
    // Aggregate tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { workspaceId: require('mongoose').Types.ObjectId.createFromHexString(workspaceId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const totalTasks = tasksByStatus.reduce((acc, curr) => acc + curr.count, 0);

    res.json({
      totalTasks,
      distribution: tasksByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
