const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  milestones: [{
    title: { type: String, required: true },
    targetDate: { type: Date },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending'
    }
  }],
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed', 'On Hold'],
    default: 'Planning'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
