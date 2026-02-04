const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = authMiddleware;