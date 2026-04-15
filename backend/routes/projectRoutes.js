const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('Admin', 'Manager'), createProject);

router.route('/:workspaceId')
  .get(protect, getProjects);

router.route('/:id')
  .put(protect, authorize('Admin', 'Manager'), updateProject)
  .delete(protect, authorize('Admin'), deleteProject);

module.exports = router;
