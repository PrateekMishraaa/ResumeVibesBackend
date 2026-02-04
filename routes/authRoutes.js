const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation middleware
const validateRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;