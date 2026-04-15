const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, getWorkspaceMembers } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createWorkspace).get(protect, getWorkspaces);
router.route('/:workspaceId/members').get(protect, getWorkspaceMembers);

module.exports = router;
