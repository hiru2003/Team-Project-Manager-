const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createTask);
router.route('/:workspaceId').get(protect, getTasks);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
