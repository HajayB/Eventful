"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.errors ?? error.message,
        });
    }
};
exports.validateRequest = validateRequest;
