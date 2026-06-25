const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { validateTask } = require('../middleware/validateMiddleware');

router.route('/')
    .get(getTasks)
    .post(validateTask, createTask);

router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;