const validateTask = (req, res, next) => {
    const { title } = req.body;

    if (!title || title.trim() === '') {
        res.status(400);
        return next(new Error('Validation Failed: Title is required and cannot be empty.'));
    }

    next();
};

module.exports = { validateTask };