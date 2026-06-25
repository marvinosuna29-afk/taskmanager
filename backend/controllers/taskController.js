const db = require('../config/db');

const getTasks = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        next(error); 
    }
};

const createTask = async (req, res, next) => {
    const { title, description } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO tasks (title, description) VALUES (?, ?)',
            [title.trim(), description ? description.trim() : null]
        );
        
        res.status(201).json({
            id: result.insertId,
            title,
            description,
            is_completed: false
        });
    } catch (error) {
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, is_completed } = req.body;

    try {
        const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (tasks.length === 0) {
            res.status(404);
            return next(new Error('Task not found'));
        }

        const updatedTitle = title !== undefined ? title : tasks[0].title;
        const updatedDesc = description !== undefined ? description : tasks[0].description;
        const updatedStatus = is_completed !== undefined ? is_completed : tasks[0].is_completed;

        await db.query(
            'UPDATE tasks SET title = ?, description = ?, is_completed = ? WHERE id = ?',
            [updatedTitle, updatedDesc, updatedStatus, id]
        );

        res.status(200).json({ id, title: updatedTitle, description: updatedDesc, is_completed: updatedStatus });
    } catch (error) {
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            res.status(404);
            return next(new Error('Task not found'));
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };