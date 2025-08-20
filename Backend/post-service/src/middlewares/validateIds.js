const mongoose = require('mongoose')

const validateBodyObjectId = (fieldName = 'user_id') => {
    return (req, res, next) => {
        const id = req.body[fieldName];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid ObjectId in body: ${fieldName}` });
        }

        next();
    };
};

const validateUrlObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid ObjectId: ${paramName}` });
        }

        next();
    };
};

module.exports = {validateUrlObjectId, validateBodyObjectId}
